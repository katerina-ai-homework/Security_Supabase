# Пошаговая инструкция: Подключение репозитория к Vercel

## Шаг 1: Подготовка репозитория GitHub

### 1.1. Создайте репозиторий на GitHub

1. Перейдите на https://github.com/new
2. Введите название репозитория (например, `youtube-summarizer`)
3. Выберите "Public" или "Private"
4. **НЕ** отмечайте "Add a README file" (у нас уже есть)
5. Нажмите "Create repository"

### 1.2. Запушьте код в GitHub

Откройте терминал в папке проекта и выполните:

```bash
# Инициализация git (если ещё не инициализирован)
git init

# Добавьте все файлы
git add .

# Сделайте первый коммит
git commit -m "Initial commit: YouTube Summarizer backend"

# Добавьте удалённый репозиторий (замените YOUR_USERNAME на ваш логин)
git remote add origin https://github.com/YOUR_USERNAME/youtube-summarizer.git

# Запушьте код
git branch -M main
git push -u origin main
```

---

## Шаг 2: Создание аккаунта Vercel

### 2.1. Регистрация

1. Перейдите на https://vercel.com/signup
2. Нажмите "Continue with GitHub"
3. Авторизуйтесь в GitHub
4. Разрешите Vercel доступ к вашему аккаунту GitHub

### 2.2. Создание команды (опционально)

1. После входа вас спросят создать команду
2. Выберите "Just Me" для личного использования
3. Нажмите "Continue"

---

## Шаг 3: Подключение репозитория к Vercel

### 3.1. Импорт проекта

1. В Vercel Dashboard нажмите **"Add New..."** → **"Project"**
2. Нажмите **"Import Git Repository"**
3. Выберите ваш репозиторий `youtube-summarizer` из списка
4. Нажмите **"Import"**

### 3.2. Настройка проекта

Vercel автоматически определит настройки:

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

Нажмите **"Continue"**

---

## Шаг 4: Настройка переменных окружения

### 4.1. Добавление переменных

1. В разделе "Environment Variables" добавьте переменные:

   **Переменная 1:**
   ```
   Name: SUPADATA_API_KEY
   Value: ваш_supadata_api_key
   Environment: ✓ Production ✓ Preview ✓ Development
   ```

   **Переменная 2:**
   ```
   Name: GOOGLE_API_KEY
   Value: ваш_google_api_key
   Environment: ✓ Production ✓ Preview ✓ Development
   ```

2. Нажмите **"Add"** для каждой переменной

### 4.2. Сохранение

Нажмите **"Continue"**

---

## Шаг 5: Деплой

### 5.1. Запуск деплоя

1. Нажмите **"Deploy"**
2. Vercel начнёт процесс деплоя:
   - Установка зависимостей
   - Сборка проекта
   - Развёртывание

### 5.2. Ожидание завершения

Деплой обычно занимает 1-3 минуты. Вы увидите прогресс:
- Building...
- Deploying...
- Done!

---

## Шаг 6: Получение URL

После успешного деплоя вы получите:

```
✅ Deployment successful!

Preview URL: https://youtube-summarizer-xxx.vercel.app
Production URL: https://youtube-summarizer-xxx.vercel.app
```

- **Preview URL** — для preview деплоев (pull requests)
- **Production URL** — основной URL приложения

---

## Шаг 7: Проверка деплоя

1. Откройте Production URL в браузере
2. Вставьте ссылку на YouTube видео
3. Проверьте, что приложение работает

---

## Шаг 8: Автоматический деплой

После первого деплоя Vercel автоматически будет деплоить при каждом пуше:

- **Push в main** → Production деплой
- **Pull Request** → Preview деплой

---

## Troubleshooting

### Ошибка: "Build failed"

**Решение:**
1. Проверьте логи деплоя в Vercel Dashboard
2. Убедитесь, что `package.json` содержит все зависимости
3. Попробуйте локально: `npm run build`

### Ошибка: "Environment variable not found"

**Решение:**
1. Перейдите в Settings → Environment Variables
2. Убедитесь, что переменные добавлены
3. Перезапустите деплой

### Ошибка: "API key invalid"

**Решение:**
1. Проверьте, что ключи скопированы полностью
2. Убедитесь, что ключи активны
3. Попробуйте создать новые ключи

---

## Дополнительные настройки

### Кастомный домен (опционально)

1. В проекте перейдите в Settings → Domains
2. Нажмите "Add Domain"
3. Введите ваш домен
4. Следуйте инструкциям для настройки DNS

---

## Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Documentation](https://docs.github.com)

---

## Краткая сводка

| Шаг | Действие | Время |
|------|----------|-------|
| 1 | Создать репозиторий GitHub | 2 мин |
| 2 | Запушить код | 3 мин |
| 3 | Создать аккаунт Vercel | 2 мин |
| 4 | Подключить репозиторий | 1 мин |
| 5 | Настроить переменные | 2 мин |
| 6 | Деплой | 2-3 мин |
| **Итого** | | **~12 минут** |
