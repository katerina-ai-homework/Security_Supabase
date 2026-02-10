"use client"

import { useState, useCallback } from "react"
import { HomeInput, isValidYoutubeUrl } from "@/components/home-input"
import { LoadingState } from "@/components/loading-state"
import { SummaryResult } from "@/components/summary-result"

type AppState = "home" | "loading" | "result"

interface SummaryData {
  videoTitle: string
  channelName: string
  thumbnailUrl: string
  sections: Array<{
    title: string
    points: string[]
  }>
}

export default function SummarizerPage() {
  const [appState, setAppState] = useState<AppState>("home")
  const [error, setError] = useState<string | null>(null)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string>("")

  const handleSubmit = useCallback(async (url: string) => {
    if (!isValidYoutubeUrl(url)) {
      setError(
        "Не удалось обработать видео. Проверьте ссылку или настройки доступа.",
      )
      return
    }
    setError(null)
    setCurrentUrl(url)
    setAppState("loading")
  }, [])

  const handleLoadingComplete = useCallback(async () => {
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: currentUrl }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate summary')
      }

      setSummaryData(data.data)
      setAppState("result")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при генерации саммари')
      setAppState("home")
    }
  }, [currentUrl])

  const handleReset = useCallback(() => {
    setAppState("home")
    setError(null)
    setSummaryData(null)
    setCurrentUrl("")
  }, [])

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 md:px-8">
          <button
            onClick={handleReset}
            className="text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-70"
            type="button"
          >
            Summarizer<span className="text-tiffany">{"."}</span>
          </button>
          {appState === "result" && (
            <button
              onClick={handleReset}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              type="button"
            >
              {"Новое видео"}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex min-h-screen items-center justify-center px-5 pt-16 pb-16 md:px-8">
        {appState === "home" && (
          <HomeInput
            onSubmit={handleSubmit}
            error={error}
            onClearError={() => setError(null)}
          />
        )}

        {appState === "loading" && (
          <LoadingState onComplete={handleLoadingComplete} />
        )}

        {appState === "result" && summaryData && (
          <div className="w-full py-12">
            <SummaryResult
              videoTitle={summaryData.videoTitle}
              channelName={summaryData.channelName}
              thumbnailUrl={summaryData.thumbnailUrl}
              sections={summaryData.sections}
              onReset={handleReset}
            />
          </div>
        )}
      </main>
    </div>
  )
}
