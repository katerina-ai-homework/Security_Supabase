# Настройка переменных окружения в Vercel

## Обзор

Этот документ описывает, как настроить переменные окружения для деплоя приложения на Vercel.

## Переменные окружения

Приложение требует следующие переменные окружения:

| Переменная | Описание | Где получить |
|------------|----------|--------------|
| `SUPADATA_API_KEY` | API ключ для Supadata (получение транскриптов) | https://supadata.ai/ |
| `GOOGLE_API_KEY` | API ключ для Google Gemini (генерация саммари) | https://makersuite.google.com/app/apikey |

## Получение API ключей

### 1. Supadata API Key

1. Перейдите на https://supadata.ai/
2. Зарегистрируйтесь или войдите в аккаунт
3. Перейдите в раздел API Keys
4. Создайте новый API ключ
5. Скопируйте ключ

### 2. Google Gemini API Key

1. Перейдите на https://makersuite.google.com/app/apikey
2. Войдите в свой Google аккаунт
3. Нажмите "Create API key"
4. Выберите существующий проект или создайте новый
5. Скопируйте сгенерированный ключ

## Настройка в Vercel

### Через веб-интерфейс Vercel

1. Откройте ваш проект в Vercel Dashboard
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте переменные:

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

4. Нажмите **Save**

### Через Vercel CLI

```bash
# Установите Vercel CLI (если ещё не установлен)
npm i -g vercel

# Войдите в Vercel
vercel login

# Добавьте переменные окружения
vercel env add SUPADATA_API_KEY
vercel env add GOOGLE_API_KEY

# Выберите окружения: Production, Preview, Development
```

### Через vercel.json (не рекомендуется для секретов)

⚠️ **Важно:** Не добавляйте API ключи в `vercel.json` или другие файлы конфигурации, которые попадают в git. Используйте переменные окружения Vercel.

## Локальная разработка

Для локальной разработки создайте файл `.env.local` в корне проекта:

```env
# Supadata API Key
SUPADATA_API_KEY=your_supadata_api_key_here

# Google Gemini API Key
GOOGLE_API_KEY=your_google_api_key_here
```

⚠️ **Важно:** Файл `.env.local` уже добавлен в `.gitignore`, поэтому ваши ключи не попадут в репозиторий.

## Проверка переменных окружения

### В локальной разработке

```bash
# Запустите dev сервер
npm run dev

# Проверьте, что переменные загружены
# В браузере откройте http://localhost:3000/api/summarize
# Должен вернуться JSON с информацией о доступности API
```

### В Vercel

1. Откройте ваш проект в Vercel Dashboard
2. Перейдите в **Settings** → **Environment Variables**
3. Убедитесь, что все переменные добавлены
4. Проверьте логи деплоя на наличие ошибок

## Безопасность

### Правила безопасности

1. **Никогда не коммитьте** `.env.local` в git
2. **Используйте разные ключи** для разных окружений (production, preview, development)
3. **Регулярно обновляйте** API ключи
4. **Ограничивайте доступ** к API ключам в настройках провайдеров

### Проверка безопасности

```bash
# Проверьте, что .env.local в .gitignore
cat .gitignore | grep .env.local

# Проверьте, что нет ключей в коде
grep -r "SUPADATA_API_KEY" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .
grep -r "GOOGLE_API_KEY" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .
```

## Troubleshooting

### Ошибка: "SUPADATA_API_KEY is not defined"

**Причина:** Переменная окружения не настроена

**Решение:**
1. Проверьте, что переменная добавлена в Vercel
2. Проверьте, что переменная добавлена в `.env.local` для локальной разработки
3. Перезапустите dev сервер

### Ошибка: "GOOGLE_API_KEY is not defined"

**Причина:** Переменная окружения не настроена

**Решение:**
1. Проверьте, что переменная добавлена в Vercel
2. Проверьте, что переменная добавлена в `.env.local` для локальной разработки
3. Перезапустите dev сервер

### Ошибка: "Invalid API key"

**Причина:** Неверный API ключ

**Решение:**
1. Проверьте, что ключ скопирован полностью
2. Проверьте, что ключ активен в настройках провайдера
3. Попробуйте создать новый ключ

### Ошибка: "API quota exceeded"

**Причина:** Превышен лимит запросов

**Решение:**
1. Проверьте лимиты в настройках провайдера
2. Подключите платный тариф или подождите сброса лимитов
3. Оптимизируйте количество запросов

## Деплой

После настройки переменных окружения:

1. **Закоммитьте изменения** в git
2. **Запушьте** в GitHub
3. **Vercel автоматически** задеплоит приложение
4. **Проверьте логи** деплоя на наличие ошибок

## Дополнительные ресурсы

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supadata Documentation](https://docs.supadata.ai/)
- [Google AI Documentation](https://ai.google.dev/docs)
