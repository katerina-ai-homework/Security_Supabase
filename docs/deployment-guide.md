# Руководство по деплою на Vercel

## Обзор

Это руководство описывает процесс деплоя приложения YouTube Summarizer на Vercel через GitHub.

## Предварительные требования

1. **Аккаунт Vercel** — бесплатный аккаунт на https://vercel.com
2. **Аккаунт GitHub** — для хранения кода и CI/CD
3. **API ключи:**
   - Supadata API Key
   - Google Gemini API Key

## Шаг 1: Настройка локального окружения

### 1.1. Клонирование репозитория

```bash
git clone <your-repo-url>
cd Youtube_Summary
```

### 1.2. Установка зависимостей

```bash
npm install --legacy-peer-deps
```

### 1.3. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
# Supadata API Key
SUPADATA_API_KEY=your_supadata_api_key_here

# Google Gemini API Key
GOOGLE_API_KEY=your_google_api_key_here
```

### 1.4. Локальный тест

```bash
npm run dev
```

Откройте http://localhost:3000 в браузере.

## Шаг 2: Подготовка к деплою

### 2.1. Запуск тестов

```bash
npm test
```

Убедитесь, что все тесты проходят.

### 2.2. Сборка проекта

```bash
npm run build
```

Убедитесь, что сборка прошла успешно.

## Шаг 3: Деплой на Vercel

### 3.1. Подключение GitHub к Vercel

1. Войдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите **"Add New..."** → **"Project"**
3. Нажмите **"Import Git Repository"**
4. Выберите ваш репозиторий GitHub

### 3.2. Настройка переменных окружения в Vercel

1. В настройках проекта перейдите в **Settings** → **Environment Variables**
2. Добавьте следующие переменные:

   ```
   Name: SUPADATA_API_KEY
   Value: ваш_supadata_api_key
   Environment: Production, Preview, Development
   ```

   ```
   Name: GOOGLE_API_KEY
   Value: ваш_google_api_key
   Environment: Production, Preview, Development
   ```

3. Нажмите **Save**

### 3.3. Деплой

1. Нажмите **"Deploy"**
2. Vercel автоматически:
   - Определит фреймворк (Next.js)
   - Запустит `npm install`
   - Запустит `npm run build`
   - Развернёт приложение

3. После завершения деплоя вы получите:
   - **Preview URL** — для просмотра приложения
   - **Production URL** — основной URL приложения

## Шаг 4: Проверка деплоя

### 4.1. Проверка работоспособности

1. Откройте Production URL
2. Вставьте ссылку на YouTube видео
3. Проверьте, что саммари генерируется корректно

### 4.2. Проверка логов

1. В Vercel Dashboard перейдите в **Deployments**
2. Нажмите на последний деплой
3. Проверьте логи на наличие ошибок

## Шаг 5: Автоматический деплой

После первого деплоя Vercel автоматически будет деплоить приложение при каждом пуше в GitHub:

- **Push в main/master** → Production деплой
- **Pull Request** → Preview деплой

## Troubleshooting

### Ошибка: "SUPADATA_API_KEY is not defined"

**Решение:**
1. Проверьте, что переменная добавлена в Vercel
2. Проверьте, что переменная добавлена во все окружения (Production, Preview, Development)
3. Перезапустите деплой

### Ошибка: "GOOGLE_API_KEY is not defined"

**Решение:**
1. Проверьте, что переменная добавлена в Vercel
2. Проверьте, что переменная добавлена во все окружения (Production, Preview, Development)
3. Перезапустите деплой

### Ошибка: "Build failed"

**Решение:**
1. Проверьте логи деплоя
2. Убедитесь, что все зависимости установлены
3. Попробуйте локально: `npm run build`

### Ошибка: "Invalid API key"

**Решение:**
1. Проверьте, что ключи скопированы полностью
2. Проверьте, что ключи активны в настройках провайдеров
3. Попробуйте создать новые ключи

## Дополнительные ресурсы

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Структура проекта после деплоя

```
Youtube_Summary/
├── .env.local              # Локальные переменные (не в git)
├── .gitignore              # Исключения git
├── package.json            # Зависимости
├── next.config.mjs         # Конфигурация Next.js
├── tsconfig.json           # Конфигурация TypeScript
├── jest.config.js          # Конфигурация Jest
├── jest.setup.js           # Настройка Jest
├── README.md               # Документация
├── plans/
│   └── backend-architecture.md  # План архитектуры
├── docs/
│   ├── vercel-setup.md     # Настройка Vercel
│   └── deployment-guide.md # Это руководство
├── app/
│   ├── api/
│   │   └── summarize/
│   │       └── route.ts    # API endpoint
│   ├── layout.tsx          # Корневой layout
│   ├── page.tsx            # Главная страница
│   └── globals.css         # Глобальные стили
├── components/
│   ├── home-input.tsx      # Компонент ввода URL
│   ├── loading-state.tsx   # Компонент загрузки
│   ├── summary-result.tsx  # Компонент результата
│   └── ui/                 # shadcn/ui компоненты
├── lib/
│   ├── supadata.ts         # Интеграция с Supadata
│   ├── gemini.ts           # Интеграция с Gemini
│   └── utils.ts            # Утилиты
└── tests/
    └── backend.test.ts     # Юнит-тесты
```

## Поддержка

Если у вас есть вопросы или проблемы, создайте issue в репозитории GitHub.
