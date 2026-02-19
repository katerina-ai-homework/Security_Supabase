import { test, expect, Page } from '@playwright/test';

/**
 * End-to-End тесты для YouTube Summarizer приложения
 * 
 * Тестируемые сценарии:
 * 1. Загрузка главной страницы
 * 2. Валидация URL
 * 3. Полный flow суммаризации (с мокированием API)
 * 4. Навигация и сброс
 */

test.describe('YouTube Summarizer Application', () => {
  
  test.beforeEach(async ({ page }) => {
    // Переходим на главную страницу перед каждым тестом
    await page.goto('/');
  });

  test('should load home page with correct elements', async ({ page }) => {
    // Проверяем заголовок страницы
    await expect(page).toHaveTitle(/Summarizer/);
    
    // Проверяем наличие основного заголовка
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toContainText('Краткий пересказ любого видео');
    
    // Проверяем наличие поля ввода
    const urlInput = page.locator('input[type="url"]');
    await expect(urlInput).toBeVisible();
    await expect(urlInput).toHaveAttribute('placeholder', /Вставьте ссылку на YouTube/);
    
    // Проверяем наличие кнопки отправки
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled(); // Кнопка должна быть отключена при пустом поле
  });

  test('should show header with logo', async ({ page }) => {
    // Проверяем наличие логотипа в хедере
    const logo = page.locator('header button').filter({ hasText: 'Summarizer' });
    await expect(logo).toBeVisible();
  });

  test('should enable submit button when URL is entered', async ({ page }) => {
    const urlInput = page.locator('input[type="url"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Вводим текст
    await urlInput.fill('https://www.youtube.com/watch?v=test');
    
    // Кнопка должна стать активной
    await expect(submitButton).toBeEnabled();
  });

  test('should show error for invalid URL', async ({ page }) => {
    const urlInput = page.locator('input[type="url"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Вводим невалидный URL
    await urlInput.fill('https://invalid-url.com/video');
    await submitButton.click();
    
    // Проверяем появление ошибки
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Не удалось обработать видео');
  });

  test('should clear error when user starts typing', async ({ page }) => {
    const urlInput = page.locator('input[type="url"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Вводим невалидный URL и отправляем
    await urlInput.fill('https://invalid-url.com/video');
    await submitButton.click();
    
    // Проверяем появление ошибки
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible();
    
    // Начинаем печатать - ошибка должна исчезнуть
    await urlInput.fill('https://www.youtube.com/watch?v=test');
    await expect(errorMessage).not.toBeVisible();
  });

  test('should accept various YouTube URL formats', async ({ page }) => {
    const urlInput = page.locator('input[type="url"]');
    const submitButton = page.locator('button[type="submit"]');
    
    const validUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/shorts/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ];
    
    for (const url of validUrls) {
      await urlInput.fill(url);
      await expect(submitButton).toBeEnabled();
      await urlInput.clear();
    }
  });
});

test.describe('Summarization Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show loading state after submitting valid URL', async ({ page }) => {
    // Мокируем API ответ
    await page.route('**/api/summarize', async (route) => {
      // Задержка для проверки состояния загрузки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            videoTitle: 'Test Video Title',
            channelName: 'Test Channel',
            thumbnailUrl: 'https://example.com/thumb.jpg',
            sections: [
              {
                title: 'Основные мысли',
                points: ['Точка 1', 'Точка 2']
              }
            ]
          }
        })
      });
    });
    
    const urlInput = page.locator('input[type="url"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Вводим валидный URL и отправляем
    await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await submitButton.click();
    
    // Проверяем состояние загрузки
    const loadingText = page.locator('text=Загрузка видео');
    await expect(loadingText).toBeVisible();
    
    // Проверяем прогресс-ринг
    const progressRing = page.locator('svg[class*="progress"]');
    await expect(progressRing).toBeVisible();
  });

  test('should show result after successful summarization', async ({ page }) => {
    // Мокируем успешный ответ API
    await page.route('**/api/summarize', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            videoTitle: 'Тестовое видео',
            channelName: 'Тестовый канал',
            thumbnailUrl: 'https://example.com/thumb.jpg',
            sections: [
              {
                title: 'Основные мысли',
                points: ['Первая важная мысль', 'Вторая важная мысль']
              },
              {
                title: 'Выводы',
                points: ['Главный вывод']
              }
            ]
          }
        })
      });
    });
    
    const urlInput = page.locator('input[type="url"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Вводим URL и отправляем
    await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await submitButton.click();
    
    // Ждем появления результата (с таймаутом)
    const videoTitle = page.locator('text=Тестовое видео');
    await expect(videoTitle).toBeVisible({ timeout: 10000 });
    
    // Проверяем отображение секций
    const sectionTitle = page.locator('h3', { hasText: 'Основные мысли' });
    await expect(sectionTitle).toBeVisible();
    
    // Проверяем отображение пунктов
    const point = page.locator('text=Первая важная мысль');
    await expect(point).toBeVisible();
  });

  test('should show error when API returns error', async ({ page }) => {
    // Мокируем ошибку API
    await page.route('**/api/summarize', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Ошибка сервера'
        })
      });
    });
    
    const urlInput = page.locator('input[type="url"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Вводим URL и отправляем
    await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await submitButton.click();
    
    // Ждем возврата на главную с ошибкой
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('should reset to home when clicking logo', async ({ page }) => {
    // Мокируем успешный ответ
    await page.route('**/api/summarize', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            videoTitle: 'Тестовое видео',
            channelName: 'Тестовый канал',
            thumbnailUrl: 'https://example.com/thumb.jpg',
            sections: [{ title: 'Тест', points: ['Тест'] }]
          }
        })
      });
    });
    
    const urlInput = page.locator('input[type="url"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Выполняем суммаризацию
    await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await submitButton.click();
    
    // Ждем результата
    await expect(page.locator('text=Тестовое видео')).toBeVisible({ timeout: 10000 });
    
    // Кликаем на логотип
    const logo = page.locator('header button').filter({ hasText: 'Summarizer' });
    await logo.click();
    
    // Проверяем возврат на главную
    await expect(urlInput).toBeVisible();
    await expect(urlInput).toHaveValue('');
  });
});

test.describe('Result Page Features', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Мокируем API для всех тестов в этой группе
    await page.route('**/api/summarize', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            videoTitle: 'Тестовое видео для копирования',
            channelName: 'Тестовый канал',
            thumbnailUrl: 'https://example.com/thumb.jpg',
            sections: [
              {
                title: 'Основные мысли',
                points: ['Первая мысль', 'Вторая мысль']
              }
            ]
          }
        })
      });
    });
  });

  test('should copy text to clipboard', async ({ page, context }) => {
    // Предоставляем разрешения на чтение буфера обмена
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    const urlInput = page.locator('input[type="url"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Выполняем суммаризацию
    await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await submitButton.click();
    
    // Ждем результата
    await expect(page.locator('text=Тестовое видео для копирования')).toBeVisible({ timeout: 10000 });
    
    // Кликаем кнопку копирования
    const copyButton = page.locator('button', { hasText: 'Копировать текст' });
    await copyButton.click();
    
    // Проверяем, что текст кнопки изменился
    await expect(page.locator('button', { hasText: 'Скопировано' })).toBeVisible();
  });

  test('should show funny cat image', async ({ page }) => {
    const urlInput = page.locator('input[type="url"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Выполняем суммаризацию
    await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await submitButton.click();
    
    // Ждем результата
    await expect(page.locator('text=Тестовое видео')).toBeVisible({ timeout: 10000 });
    
    // Проверяем наличие кота
    const catImage = page.locator('img[alt="Смешной кот"]');
    await expect(catImage).toBeVisible();
    
    // Проверяем текст под котом
    const catText = page.locator('text=Ура! Я сделал домашку!');
    await expect(catText).toBeVisible();
  });

  test('should show "Новое видео" button on result page', async ({ page }) => {
    const urlInput = page.locator('input[type="url"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Выполняем суммаризацию
    await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await submitButton.click();
    
    // Ждем результата
    await expect(page.locator('text=Тестовое видео')).toBeVisible({ timeout: 10000 });
    
    // Проверяем наличие кнопки "Новое видео"
    const newVideoButton = page.locator('button', { hasText: 'Новое видео' });
    await expect(newVideoButton).toBeVisible();
    
    // Кликаем и проверяем возврат
    await newVideoButton.click();
    await expect(urlInput).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const urlInput = page.locator('input[type="url"]');
    
    // Проверяем атрибуты доступности
    await expect(urlInput).toHaveAttribute('type', 'url');
    
    // Проверяем aria-invalid при ошибке
    await urlInput.fill('invalid-url');
    await page.locator('button[type="submit"]').click();
    
    await expect(urlInput).toHaveAttribute('aria-invalid', 'true');
    await expect(urlInput).toHaveAttribute('aria-describedby', 'url-error');
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Проверяем навигацию по Tab
    await page.keyboard.press('Tab');
    
    // Фокус должен быть на поле ввода
    const urlInput = page.locator('input[type="url"]');
    await expect(urlInput).toBeFocused();
    
    // Заполняем поле
    await urlInput.fill('https://www.youtube.com/watch?v=test');
    
    // Tab к кнопке
    await page.keyboard.press('Tab');
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeFocused();
  });
});

test.describe('Responsive Design', () => {
  
  test('should display correctly on mobile', async ({ page }) => {
    // Устанавливаем размер экрана мобильного устройства
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Проверяем основные элементы
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    
    const urlInput = page.locator('input[type="url"]');
    await expect(urlInput).toBeVisible();
    
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    // Устанавливаем размер экрана планшета
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Проверяем основные элементы
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    
    const urlInput = page.locator('input[type="url"]');
    await expect(urlInput).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    // Устанавливаем размер экрана десктопа
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Проверяем основные элементы
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    
    const urlInput = page.locator('input[type="url"]');
    await expect(urlInput).toBeVisible();
  });
});
