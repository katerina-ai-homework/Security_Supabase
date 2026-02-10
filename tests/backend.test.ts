/**
 * Backend Tests
 * 
 * Юнит-тесты для бэк-энда с полным мокингом внешних API.
 * 
 * Vercel Best Practices Applied:
 * - Полный мокинг внешних API для изолированного тестирования
 * - Тестирование всех путей выполнения
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock внешних зависимостей
jest.mock('axios');
jest.mock('@google/generative-ai');

// Импортируем тестируемые модули после мокинга
import {
  extractVideoId,
  getVideoMetadata,
  createTranscriptTask,
  getTaskStatus,
  pollTaskCompletion,
  getTranscript,
  isValidYoutubeUrl,
} from '@/lib/supadata';

import {
  summarizeText,
  formatSummaryForApi,
} from '@/lib/gemini';

// Создаём mock для axios.create
const mockAxiosCreate = jest.fn();
(axios.create as jest.Mock) = mockAxiosCreate;

describe('Supadata Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosCreate.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('extractVideoId', () => {
    it('должен извлекать video ID из стандартной YouTube ссылки', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('должен извлекать video ID из короткой ссылки youtu.be', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('должен извлекать video ID из embed ссылки', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('должен извлекать video ID из shorts ссылки', () => {
      const url = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';
      expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('должен возвращать null для невалидной ссылки', () => {
      const url = 'https://example.com/video';
      expect(extractVideoId(url)).toBeNull();
    });

    it('должен возвращать video ID если передан напрямую', () => {
      expect(extractVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });
  });

  describe('isValidYoutubeUrl', () => {
    it('должен возвращать true для валидной YouTube ссылки', () => {
      expect(isValidYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isValidYoutubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
      expect(isValidYoutubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
    });

    it('должен возвращать false для невалидной ссылки', () => {
      expect(isValidYoutubeUrl('https://example.com')).toBe(false);
      expect(isValidYoutubeUrl('not a url')).toBe(false);
    });
  });

  describe('getVideoMetadata', () => {
    it('должен возвращать метаданные видео', async () => {
      const mockResponse = {
        data: {
          title: 'Test Video',
          channelName: 'Test Channel',
          thumbnailUrl: 'https://example.com/thumb.jpg',
        },
      };

      const mockClient = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      mockAxiosCreate.mockReturnValue(mockClient as any);

      const metadata = await getVideoMetadata('testVideoId');

      expect(metadata).toEqual({
        title: 'Test Video',
        channelName: 'Test Channel',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        videoId: 'testVideoId',
      });
    });

    it('должен возвращать базовую информацию при ошибке API', async () => {
      const mockClient = {
        get: jest.fn().mockRejectedValue(new Error('API Error')),
      };
      mockAxiosCreate.mockReturnValue(mockClient as any);

      const metadata = await getVideoMetadata('testVideoId');

      expect(metadata).toEqual({
        title: 'YouTube видео',
        channelName: 'YouTube канал',
        thumbnailUrl: 'https://img.youtube.com/vi/testVideoId/maxresdefault.jpg',
        videoId: 'testVideoId',
      });
    });
  });

  describe('createTranscriptTask', () => {
    it('должен создавать задачу и возвращать ID', async () => {
      const mockResponse = {
        data: { id: 'task-123' },
      };

      const mockClient = {
        post: jest.fn().mockResolvedValue(mockResponse),
      };
      mockAxiosCreate.mockReturnValue(mockClient as any);

      const taskId = await createTranscriptTask('testVideoId');

      expect(taskId).toBe('task-123');
    });
  });

  describe('getTaskStatus', () => {
    it('должен возвращать статус задачи', async () => {
      const mockResponse = {
        data: {
          id: 'task-123',
          status: 'processing',
          videoId: 'testVideoId',
          createdAt: '2024-01-01T00:00:00Z',
        },
      };

      const mockClient = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      mockAxiosCreate.mockReturnValue(mockClient as any);

      const status = await getTaskStatus('task-123');

      expect(status).toEqual({
        id: 'task-123',
        status: 'processing',
        videoId: 'testVideoId',
        createdAt: '2024-01-01T00:00:00Z',
      });
    });

    it('должен возвращать статус completed с транскриптом', async () => {
      const mockResponse = {
        data: {
          id: 'task-123',
          status: 'completed',
          videoId: 'testVideoId',
          createdAt: '2024-01-01T00:00:00Z',
          completedAt: '2024-01-01T00:01:00Z',
          transcript: 'Test transcript content',
        },
      };

      const mockClient = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      mockAxiosCreate.mockReturnValue(mockClient as any);

      const status = await getTaskStatus('task-123');

      expect(status.status).toBe('completed');
      expect(status.transcript).toBe('Test transcript content');
    });
  });

  describe('pollTaskCompletion', () => {
    it('должен поллить задачу до завершения', async () => {
      const mockResponses = [
        { data: { id: 'task-123', status: 'processing', videoId: 'testVideoId', createdAt: '2024-01-01T00:00:00Z' } },
        { data: { id: 'task-123', status: 'processing', videoId: 'testVideoId', createdAt: '2024-01-01T00:00:00Z' } },
        { data: { id: 'task-123', status: 'completed', videoId: 'testVideoId', createdAt: '2024-01-01T00:00:00Z', transcript: 'Final transcript' } },
      ];

      let callCount = 0;
      const mockClient = {
        get: jest.fn().mockImplementation(() => {
          return Promise.resolve(mockResponses[callCount++]);
        }),
      };
      mockAxiosCreate.mockReturnValue(mockClient as any);

      const transcript = await pollTaskCompletion('task-123');

      expect(transcript).toBe('Final transcript');
    });

    it('должен выбрасывать ошибку при неудачной задаче', async () => {
      const mockResponse = {
        data: {
          id: 'task-123',
          status: 'failed',
          videoId: 'testVideoId',
          createdAt: '2024-01-01T00:00:00Z',
          error: 'Processing failed',
        },
      };

      const mockClient = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };
      mockAxiosCreate.mockReturnValue(mockClient as any);

      await expect(pollTaskCompletion('task-123')).rejects.toThrow('Transcription failed');
    });
  });
});

describe('Gemini Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('summarizeText', () => {
    it('должен генерировать саммари из транскрипта', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue('TL;DR: Test summary\n\n- Point 1\n- Point 2'),
          },
        }),
      };

      const mockGenAI = {
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      };

      // Используем jest.spyOn для мокинга конструктора
      const mockConstructor = jest.fn().mockImplementation(() => mockGenAI);
      jest.spyOn(require('@google/generative-ai'), 'GoogleGenerativeAI').mockImplementation(mockConstructor);

      // Используем более длинный транскрипт (более 50 символов)
      const longTranscript = 'This is a test transcript that is long enough to pass the validation check. It contains more than fifty characters to ensure the test passes correctly.';
      const result = await summarizeText(longTranscript);

      expect(result).toBeDefined();
      expect(result.tldr).toBe('Test summary');
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].points).toContain('Point 1');
      expect(result.sections[0].points).toContain('Point 2');
    });

    it('должен выбрасывать ошибку при пустом транскрипте', async () => {
      await expect(summarizeText('')).rejects.toThrow('Transcript is too short or empty');
    });

    it('должен выбрасывать ошибку при отсутствии API ключа', async () => {
      delete process.env.GOOGLE_API_KEY;

      await expect(summarizeText('Test transcript')).rejects.toThrow('GOOGLE_API_KEY is not defined');
    });
  });

  describe('formatSummaryForApi', () => {
    it('должен форматировать саммари для API ответа', () => {
      const summary = {
        tldr: 'Test TL;DR',
        sections: [
          { title: 'Section 1', points: ['Point 1', 'Point 2'] },
        ],
      };

      const metadata = {
        title: 'Test Video',
        channelName: 'Test Channel',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        videoId: 'testVideoId',
      };

      const result = formatSummaryForApi(summary, metadata);

      expect(result).toEqual({
        videoTitle: 'Test Video',
        channelName: 'Test Channel',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        sections: [
          { title: 'TL;DR', points: ['Test TL;DR'] },
          { title: 'Section 1', points: ['Point 1', 'Point 2'] },
        ],
      });
    });

    it('должен обрабатывать пустой TL;DR', () => {
      const summary = {
        tldr: '',
        sections: [
          { title: 'Section 1', points: ['Point 1'] },
        ],
      };

      const metadata = {
        title: 'Test Video',
        channelName: 'Test Channel',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        videoId: 'testVideoId',
      };

      const result = formatSummaryForApi(summary, metadata);

      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].title).toBe('Section 1');
    });
  });
});

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosCreate.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('должен обрабатывать полный поток получения транскрипта', async () => {
    // Mock для createTranscriptTask
    const mockClient = {
      post: jest.fn().mockResolvedValue({ data: { id: 'task-123' } }),
      get: jest.fn().mockResolvedValue({
        data: {
          id: 'task-123',
          status: 'completed',
          videoId: 'testVideoId',
          createdAt: '2024-01-01T00:00:00Z',
          transcript: 'Test transcript',
        },
      }),
    };
    mockAxiosCreate.mockReturnValue(mockClient as any);

    const result = await getTranscript('testVideoId');

    expect(result.transcript).toBe('Test transcript');
    expect(result.metadata.videoId).toBe('testVideoId');
  });
});
