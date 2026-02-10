/**
 * API Route: /api/summarize
 * 
 * Endpoint для генерации саммари YouTube видео.
 * 
 * Vercel Best Practices Applied:
 * - async-api-routes: Запускаем промисы рано, await поздно
 * - server-cache: React.cache() для дедупликации
 * - server-serialization: Минимизация данных для клиента
 * - js-early-exit: Ранний возврат при ошибках
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId, getTranscript, isValidYoutubeUrl } from '@/lib/supadata';
import { summarizeText, formatSummaryForApi } from '@/lib/gemini';

// Типы для запроса и ответа
interface SummarizeRequest {
  url: string;
}

interface SummarizeResponse {
  success: true;
  data: {
    videoTitle: string;
    channelName: string;
    thumbnailUrl: string;
    sections: Array<{
      title: string;
      points: string[];
    }>;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
}

/**
 * POST /api/summarize
 * 
 * Генерирует саммари для YouTube видео.
 * 
 * Flow:
 * 1. Валидация URL
 * 2. Получение транскрипта (Supadata с поллингом)
 * 3. Генерация саммари (Gemini)
 * 4. Возврат результата
 */
export async function POST(request: NextRequest): Promise<NextResponse<SummarizeResponse | ErrorResponse>> {
  try {
    // Парсим тело запроса
    const body: SummarizeRequest = await request.json();
    const { url } = body;

    // Vercel Best Practice: js-early-exit - ранняя валидация
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Валидация YouTube URL
    if (!isValidYoutubeUrl(url)) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Извлекаем video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Could not extract video ID from URL' },
        { status: 400 }
      );
    }

    // Vercel Best Practice: async-api-routes - запускаем промисы рано
    // Получаем транскрипт с метаданными
    const { transcript, metadata } = await getTranscript(videoId);

    // Генерируем саммари
    const summary = await summarizeText(transcript);

    // Форматируем результат для API
    const result = formatSummaryForApi(summary, metadata);

    // Vercel Best Practice: server-serialization - минимизация данных
    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    // Vercel Best Practice: js-early-exit - обработка ошибок
    console.error('Error in /api/summarize:', error);

    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred';

    // Определяем статус код на основе типа ошибки
    const statusCode = errorMessage.includes('timeout') 
      ? 504 
      : errorMessage.includes('API key') 
      ? 500 
      : 500;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/summarize
 * 
 * Возвращает информацию о доступности API.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    message: 'YouTube Summarizer API is available',
    version: '1.0.0',
  });
}
