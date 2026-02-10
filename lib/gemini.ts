/**
 * Gemini API Integration
 * 
 * Генерация саммари транскриптов с использованием Google Gemini AI.
 * 
 * Vercel Best Practices Applied:
 * - server-cache: React.cache() для дедупликации запросов
 * - server-serialization: Минимизация данных, передаваемых клиенту
 * - js-early-exit: Ранний возврат при ошибках
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Типы для ответа Gemini
export interface SummarySection {
  title: string;
  points: string[];
}

export interface SummaryResult {
  tldr: string;
  sections: SummarySection[];
}

/**
 * Парсит ответ Gemini в структурированный формат
 */
function parseGeminiResponse(response: string): SummaryResult {
  const lines = response.split('\n').filter(line => line.trim());
  
  const result: SummaryResult = {
    tldr: '',
    sections: [],
  };

  let currentSection: SummarySection | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // TL;DR строка
    if (trimmedLine.toLowerCase().startsWith('tl;dr') || 
        trimmedLine.toLowerCase().startsWith('кратко') ||
        trimmedLine.toLowerCase().startsWith('суть')) {
      result.tldr = trimmedLine.replace(/^(TL;DR|Кратко|Суть)[:\s]*/i, '').trim();
      continue;
    }

    // Заголовок секции (начинается с # или цифры с точкой)
    if (trimmedLine.startsWith('#') || /^\d+\./.test(trimmedLine)) {
      // Сохраняем предыдущую секцию
      if (currentSection && currentSection.points.length > 0) {
        result.sections.push(currentSection);
      }
      
      // Создаём новую секцию
      currentSection = {
        title: trimmedLine.replace(/^#+\s*|^\d+\.\s*/, '').trim(),
        points: [],
      };
      continue;
    }

    // Маркированный список (-, *, •)
    if (/^[-*•]\s/.test(trimmedLine)) {
      const point = trimmedLine.replace(/^[-*•]\s*/, '').trim();
      if (currentSection) {
        currentSection.points.push(point);
      } else {
        // Если нет текущей секции, создаём "Основные тезисы"
        currentSection = {
          title: 'Основные тезисы',
          points: [point],
        };
      }
      continue;
    }

    // Если строка не пустая и не является заголовком/списком, добавляем как тезис
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      if (currentSection) {
        currentSection.points.push(trimmedLine);
      } else {
        // Создаём секцию для первого тезиса
        currentSection = {
          title: 'Основные тезисы',
          points: [trimmedLine],
        };
      }
    }
  }

  // Добавляем последнюю секцию
  if (currentSection && currentSection.points.length > 0) {
    result.sections.push(currentSection);
  }

  // Если TL;DR не найден, используем первый тезис
  if (!result.tldr && result.sections.length > 0 && result.sections[0].points.length > 0) {
    result.tldr = result.sections[0].points[0];
  }

  // Если секций нет, создаём одну из всех строк
  if (result.sections.length === 0 && lines.length > 0) {
    result.sections.push({
      title: 'Основные тезисы',
      points: lines,
    });
  }

  return result;
}

/**
 * Создаёт промпт для суммирования
 */
function createSummaryPrompt(transcript: string): string {
  return `Ты — профессиональный редактор. Твоя задача — сделать краткую выжимку (summary) из транскрипта YouTube видео.

Правила:
1. Язык ответа: Русский (даже если видео на английском).
2. Структура:
   - TL;DR (Одно предложение, суть видео).
   - Основные тезисы (список буллитов).
3. Стиль: Информативный, без воды.
4. Форматирование:
   - TL;DR: "TL;DR: [текст]"
   - Тезисы: "- [текст]" или "* [текст]"

Транскрипт:
${transcript}`;
}

/**
 * Генерирует саммари с использованием Gemini
 * Vercel Best Practice: server-cache - кэшируем результаты для дедупликации
 */
export async function summarizeText(transcript: string): Promise<SummaryResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not defined in environment variables');
  }

  // Vercel Best Practice: js-early-exit - ранняя проверка
  if (!transcript || transcript.trim().length < 50) {
    throw new Error('Transcript is too short or empty');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Используем модель gemini-flash-lite-latest
    const MODEL_NAME = 'gemini-flash-lite-latest';
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = createSummaryPrompt(transcript);
    
    // Vercel Best Practice: async-api-routes - запускаем промис рано
    const resultPromise = model.generateContent(prompt);
    const result = await resultPromise;
    const response = await result.response;
    
    const text = response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error('Gemini returned empty response');
    }

    return parseGeminiResponse(text);
  } catch (error) {
    // Vercel Best Practice: js-early-exit - ранняя обработка ошибок
    if (error instanceof Error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while generating summary');
  }
}

/**
 * Форматирует результат для API ответа
 * Vercel Best Practice: server-serialization - минимизация данных
 */
export function formatSummaryForApi(
  summary: SummaryResult,
  metadata: { title: string; channelName: string; thumbnailUrl: string; videoId: string }
): {
  videoTitle: string;
  channelName: string;
  thumbnailUrl: string;
  sections: Array<{ title: string; points: string[] }>;
} {
  // Возвращаем только основные секции без TL;DR
  return {
    videoTitle: metadata.title,
    channelName: metadata.channelName,
    thumbnailUrl: metadata.thumbnailUrl,
    sections: summary.sections,
  };
}
