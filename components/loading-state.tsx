"use client"

import { useEffect, useState } from "react"
import { ProgressRing } from "@/components/progress-ring"

// Массив фраз, которые будут меняться во время загрузки
const LOADING_PHRASES = [
  "Подождите еще минуточку...",
  "Еще буквально секундочку...",
  "Еще чуть-чуть...",
  "Почти готово...",
  "Осталось совсем немного...",
  "Собираем все воедино...",
  "Финальные штрихи...",
  "Уже совсем скоро...",
]

function getStatusText(progress: number): string {
  if (progress < 20) return "Загрузка видео..."
  if (progress < 50) return "Анализ аудиодорожки..."
  if (progress < 80) return "Выделение ключевых смыслов..."
  return "Форматирование текста..."
}

interface LoadingStateProps {
  onComplete: () => void
}

export function LoadingState({ onComplete }: LoadingStateProps) {
  const [progress, setProgress] = useState(0)
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const duration = 4000
    const intervalMs = 40
    const steps = duration / intervalMs
    const increment = 100 / steps
    let current = 0

    // Интервал для обновления прогресса
    const progressInterval = setInterval(() => {
      current += increment
      if (current >= 100) {
        current = 100
        clearInterval(progressInterval)
        setTimeout(onComplete, 300)
      }
      setProgress(current)
    }, intervalMs)

    // Интервал для смены фраз (каждые 500 мс)
    const phraseInterval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length)
    }, 500)

    return () => {
      clearInterval(progressInterval)
      clearInterval(phraseInterval)
    }
  }, [onComplete])

  return (
    <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
      <ProgressRing progress={progress} />
      <p
        className="text-tiffany-dark text-base font-medium transition-all duration-300"
        aria-live="polite"
      >
        {getStatusText(progress)}
      </p>
      {/* Меняющаяся фраза */}
      <p
        className="text-muted-foreground text-sm transition-all duration-300"
        aria-live="polite"
      >
        {LOADING_PHRASES[phraseIndex]}
      </p>
    </div>
  )
}
