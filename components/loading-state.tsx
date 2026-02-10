"use client"

import { useEffect, useState } from "react"
import { ProgressRing } from "@/components/progress-ring"

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

  useEffect(() => {
    const duration = 4000
    const intervalMs = 40
    const steps = duration / intervalMs
    const increment = 100 / steps
    let current = 0

    const interval = setInterval(() => {
      current += increment
      if (current >= 100) {
        current = 100
        clearInterval(interval)
        setTimeout(onComplete, 300)
      }
      setProgress(current)
    }, intervalMs)

    return () => clearInterval(interval)
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
    </div>
  )
}
