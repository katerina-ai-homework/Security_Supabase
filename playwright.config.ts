import { defineConfig, devices } from '@playwright/test';

/**
 * Конфигурация Playwright для end-to-end тестирования
 * YouTube Summarizer приложения
 */
export default defineConfig({
  // Директория для тестов
  testDir: './e2e',
  
  // Параллельное выполнение тестов
  fullyParallel: true,
  
  // Запрет на прохождение тестов с ошибками
  forbidOnly: !!process.env.CI,
  
  // Повторы при падении в CI
  retries: process.env.CI ? 2 : 0,
  
  // Количество воркеров
  workers: process.env.CI ? 1 : undefined,
  
  // Репортер
  reporter: 'html',
  
  // Общие настройки для всех тестов
  use: {
    // Базовый URL
    baseURL: 'http://localhost:3000',
    
    // Следить за трассировкой при падении
    trace: 'on-first-retry',
    
    // Скриншоты при падении
    screenshot: 'only-on-failure',
    
    // Видео при падении
    video: 'retain-on-failure',
  },

  // Конфигурация проектов для разных браузеров
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Запуск dev сервера перед тестами
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
