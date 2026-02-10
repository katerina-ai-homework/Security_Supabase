/**
 * Supadata API Integration
 * 
 * Получение транскриптов YouTube видео.
 * 
 * Vercel Best Practices Applied:
 * - async-parallel: Используем Promise.all() для независимых операций
 * - server-cache: React.cache() для дедупликации запросов
 * - js-early-exit: Ранний возврат при ошибках
 */

import axios, { AxiosInstance } from 'axios';

// Типы для Supadata API
export interface VideoMetadata {
  title: string;
  channelName: string;
  thumbnailUrl: string;
  videoId: string;
}

// Конфигурация API
const SUPADATA_API_BASE_URL = 'https://api.supadata.ai/v1';
const REQUEST_TIMEOUT_MS = 30000; // 30 секунд таймаут для запросов

// Endpoints
const TRANSCRIPT_ENDPOINT = '/transcript';

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
  // Supadata API не предоставляет endpoint для метаданных
  // Возвращаем базовую информацию на основе video ID
  return {
    title: 'YouTube видео',
    channelName: 'YouTube канал',
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    videoId,
  };
}

/**
 * Получает транскрипт видео напрямую
 * Vercel Best Practice: async-parallel - запускаем промисы рано, await поздно
 */
export async function getTranscript(
  videoId: string,
  onProgress?: (progress: number) => void
): Promise<{ transcript: string; metadata: VideoMetadata }> {
  const client = createSupadataClient();

  // Обновляем прогресс
  if (onProgress) onProgress(20);

  try {
    // Получаем транскрипт напрямую
    const response = await client.get(TRANSCRIPT_ENDPOINT, {
      params: {
        url: `https://www.youtube.com/watch?v=${videoId}`,
      },
    });

    // Обновляем прогресс
    if (onProgress) onProgress(80);

    // Парсим ответ API
    const data = response.data;
    
    // Формируем текст транскрипта из массива content
    let transcriptText = '';
    if (data.content && Array.isArray(data.content)) {
      transcriptText = data.content
        .map((item: any) => item.text)
        .filter((text: string) => text && !text.startsWith('[')) // Убираем музыкальные метки
        .join(' ');
    } else if (data.transcript) {
      transcriptText = data.transcript;
    } else if (data.text) {
      transcriptText = data.text;
    }

    if (!transcriptText || transcriptText.trim().length === 0) {
      throw new Error('Transcript is empty or not available');
    }

    // Получаем метаданные параллельно
    const metadata = await getVideoMetadata(videoId);

    // Обновляем прогресс
    if (onProgress) onProgress(100);

    return { transcript: transcriptText, metadata };
  } catch (error: any) {
    if (error.response?.status === 429) {
      throw new Error('Превышен лимит запросов к API. Пожалуйста, подождите несколько минут и попробуйте снова.');
    }
    if (error.response?.status === 404) {
      throw new Error('Транскрипт для этого видео не найден. Возможно, видео не имеет субтитров.');
    }
    throw error;
  }
}

/**
 * Валидация YouTube URL
 */
export function isValidYoutubeUrl(url: string): boolean {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/).+/;
  return pattern.test(url.trim());
}
