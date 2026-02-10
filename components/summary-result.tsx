"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

interface SummarySection {
  title: string
  points: string[]
}

interface SummaryResultProps {
  videoTitle: string
  channelName: string
  thumbnailUrl: string
  sections: SummarySection[]
  onReset: () => void
}

export function SummaryResult({
  videoTitle,
  channelName,
  thumbnailUrl,
  sections,
  onReset,
}: SummaryResultProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = sections
      .map((s) => `${s.title}\n${s.points.map((p) => `— ${p}`).join("\n")}`)
      .join("\n\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Video Preview - large & prominent */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative aspect-video w-full">
          <img
            src={thumbnailUrl || "/placeholder.svg"}
            alt={`Превью видео: ${videoTitle}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Summary Body */}
      <article className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h3 className="mb-4 text-xl font-semibold text-tiffany-dark">
              {section.title}
            </h3>
            <ul className="space-y-3" role="list">
              {section.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-base leading-relaxed text-foreground"
                >
                  <span
                    className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-tiffany"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </article>

      {/* Funny Cat with Philactor */}
      <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-tiffany/30 bg-gradient-to-br from-tiffany-light/10 to-transparent p-8">
        <div className="relative">
          <img
            src="https://placekitten.com/200/200"
            alt="Смешной кот"
            className="h-48 w-48 rounded-full border-4 border-tiffany shadow-lg"
          />
          <div className="absolute -bottom-2 -right-2 rounded-full bg-tiffany px-4 py-2 text-sm font-bold text-white shadow-lg">
            🎉
          </div>
        </div>
        <div className="rounded-xl bg-white px-6 py-3 shadow-md">
          <p className="text-center text-lg font-bold text-tiffany-dark">
            Ура! Я сделал домашку!
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-10 flex items-center gap-3 border-t border-border pt-6">
        <Button
          variant="outline"
          onClick={handleCopy}
          className="gap-2 rounded-xl border-tiffany/30 bg-transparent text-tiffany-dark hover:bg-tiffany-light hover:text-tiffany-dark"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Скопировано" : "Копировать текст"}
        </Button>
      </div>
    </div>
  )
}
