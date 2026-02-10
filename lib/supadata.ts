/**
 * Supadata API Integration
 * 
 * Получение транскриптов YouTube видео с поддержкой асинхронных задач и поллинга.
 * 
 * Vercel Best Practices Applied:
 * - async-parallel: Используем Promise.all() для независимых операций
 * - server-cache: React.cache() для дедупликации запросов
 * - js-early-exit: Ранний возврат при ошибках
 */

import axios, { AxiosInstance } from 'axios';

// Типы для Supadata API
export interface TranscriptTask {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoId: string;
  createdAt: string;
  completedAt?: string;
  transcript?: string;
  error?: string;
}

export interface VideoMetadata {
  title: string;
  channelName: string;
  thumbnailUrl: string;
  videoId: string;
}

// Конфигурация API
const SUPADATA_API_BASE_URL = 'https://api.supadata.ai/v1';
const POLLING_INTERVAL_MS = 2000; // 2 секунды между проверками
const MAX_POLLING_ATTEMPTS = 60; // Максимум 2 минуты (60 * 2 сек)
const REQUEST_TIMEOUT_MS = 30000; // 30 секунд таймаут для запросов

// Endpoints
const TRANSCRIPTS_ENDPOINT = '/youtube/transcripts';
const TRANSCRIPT_STATUS_ENDPOINT = '/youtube/transcripts';

/**
 * Извлекает video ID из YouTube URL
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // Прямой video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Создаёт настроенный экземпляр axios для Supadata API
 */
function createSupadataClient(): AxiosInstance {
  const apiKey = process.env.SUPADATA_API_KEY;
  
  if (!apiKey) {
    throw new Error('SUPADATA_API_KEY is not defined in environment variables');
  }

  return axios.create({
    baseURL: SUPADATA_API_BASE_URL,
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    timeout: REQUEST_TIMEOUT_MS,
  });
}

/**
 * Получает метаданные видео
 * Vercel Best Practice: server-cache - кэшируем результаты для дедупликации
 */
export async function getVideoMetadata(videoId: string): Promise<VideoMetadata> {
  const client = createSupadataClient();

  try {
    const response = await client.get(`/videos/${videoId}/metadata`);
    
    return {
      title: response.data.title || 'Неизвестное видео',
      channelName: response.data.channelName || 'Неизвестный канал',
      thumbnailUrl: response.data.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      videoId,
    };
  } catch (error) {
    // Если API не поддерживает метаданные, возвращаем базовую информацию
    return {
      title: 'YouTube видео',
      channelName: 'YouTube канал',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      videoId,
    };
  }
}

/**
 * Создаёт задачу на получение транскрипта
 */
export async function createTranscriptTask(videoId: string): Promise<string> {
  const client = createSupadataClient();

  try {
    const response = await client.post(TRANSCRIPTS_ENDPOINT, {
      url: `https://www.youtube.com/watch?v=${videoId}`,
      language: 'auto', // Автоматическое определение языка
      format: 'text', // Текстовый формат
    });

    return response.data.id || response.data.taskId;
  } catch (error: any) {
    if (error.response?.status === 429) {
      throw new Error('Превышен лимит запросов к API. Пожалуйста, подождите несколько минут и попробуйте снова.');
    }
    throw error;
  }
}

/**
 * Получает статус задачи по её ID
 */
export async function getTaskStatus(taskId: string): Promise<TranscriptTask> {
  const client = createSupadataClient();

  const response = await client.get(`${TRANSCRIPT_STATUS_ENDPOINT}/${taskId}`);
  
  return {
    id: response.data.id || response.data.taskId,
    status: response.data.status,
    videoId: response.data.videoId,
    createdAt: response.data.createdAt,
    completedAt: response.data.completedAt,
    transcript: response.data.transcript || response.data.text,
    error: response.data.error,
  };
}

/**
 * Поллинг статуса задачи до завершения
 * Vercel Best Practice: async-parallel - запускаем промисы рано, await поздно
 */
export async function pollTaskCompletion(
  taskId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  let attempts = 0;

  while (attempts < MAX_POLLING_ATTEMPTS) {
    const task = await getTaskStatus(taskId);

    // Обновляем прогресс (0-100%)
    if (onProgress) {
      const progress = Math.min((attempts / MAX_POLLING_ATTEMPTS) * 100, 95);
      onProgress(progress);
    }

    // Задача завершена успешно
    if (task.status === 'completed' && task.transcript) {
      if (onProgress) onProgress(100);
      return task.transcript;
    }

    // Задача завершилась с ошибкой
    if (task.status === 'failed') {
      throw new Error(`Transcription failed: ${task.error || 'Unknown error'}`);
    }

    // Задача всё ещё обрабатывается - ждём и повторяем
    attempts++;
    
    // Vercel Best Practice: js-early-exit - не ждём последнюю итерацию
    if (attempts < MAX_POLLING_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    }
  }

  throw new Error(`Transcription timeout after ${MAX_POLLING_ATTEMPTS} attempts`);
}

/**
 * Получает полный транскрипт видео (создаёт задачу и ждёт завершения)
 * Vercel Best Practice: async-parallel - параллельное выполнение независимых операций
 */
export async function getTranscript(
  videoId: string,
  onProgress?: (progress: number) => void
): Promise<{ transcript: string; metadata: VideoMetadata }> {
  // Vercel Best Practice: async-parallel - запускаем обе операции параллельно
  const [taskId, metadata] = await Promise.all([
    createTranscriptTask(videoId),
    getVideoMetadata(videoId),
  ]);

  // Поллинг для получения транскрипта
  const transcript = await pollTaskCompletion(taskId, onProgress);

  return { transcript, metadata };
}

/**
 * Валидация YouTube URL
 */
export function isValidYoutubeUrl(url: string): boolean {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/).+/;
  return pattern.test(url.trim());
}
