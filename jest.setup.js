/**
 * Jest Setup File
 * 
 * Глобальные настройки и моки для тестов.
 */

// Mock environment variables
process.env.SUPADATA_API_KEY = 'test_supadata_key';
process.env.GOOGLE_API_KEY = 'test_google_key';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};
