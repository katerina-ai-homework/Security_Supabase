"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HomeInputProps {
  onSubmit: (url: string) => void
  error: string | null
  onClearError: () => void
}

function isValidYoutubeUrl(url: string): boolean {
  const pattern =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/).+/
  return pattern.test(url.trim())
}

export function HomeInput({ onSubmit, error, onClearError }: HomeInputProps) {
  const [url, setUrl] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    onSubmit(url.trim())
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Heading */}
      <div className="flex flex-col items-center gap-5 text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-tiffany-deeper md:text-5xl lg:text-6xl">
          Краткий пересказ любого видео
        </h1>
        <p className="max-w-md text-pretty text-base text-muted-foreground md:text-lg">
          Сэкономьте время: получите{" "}
          <span className="font-medium text-tiffany-dark">
            выжимку главных мыслей
          </span>{" "}
          за секунды.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative w-full">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (error) onClearError()
            }}
            placeholder="Вставьте ссылку на YouTube..."
            className={`h-14 w-full rounded-2xl border bg-card pl-5 pr-14 text-base text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 md:h-16 md:text-lg ${
              error
                ? "border-destructive ring-1 ring-destructive/30"
                : "border-border focus:ring-primary/40"
            }`}
            aria-invalid={!!error}
            aria-describedby={error ? "url-error" : undefined}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!url.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl h-10 w-10 md:h-12 md:w-12"
            aria-label="Суммировать"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <p
            id="url-error"
            className="mt-3 text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
            role="alert"
          >
            {error}
          </p>
        )}
      </form>
    </div>
  )
}

export { isValidYoutubeUrl }
