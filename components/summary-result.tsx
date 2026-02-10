"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, Play } from "lucide-react"

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
      {/* Video Preview - large & prominent with enhanced styling */}
      <div className="mb-8 group relative overflow-hidden rounded-2xl border-2 border-tiffany/20 bg-gradient-to-br from-tiffany/5 via-transparent to-tiffany/5 shadow-xl shadow-tiffany/10 transition-all duration-300 hover:shadow-2xl hover:shadow-tiffany/20 hover:border-tiffany/30">
        <div className="relative aspect-video w-full">
          <img
            src={thumbnailUrl || "/placeholder.svg"}
            alt={`Превью видео: ${videoTitle}`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-1 h-6 w-6 fill-tiffany text-tiffany" />
            </div>
          </div>
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        {/* Decorative corner accents */}
        <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-tiffany/40 rounded-tl-2xl" />
        <div className="absolute right-0 bottom-0 h-8 w-8 border-r-2 border-b-2 border-tiffany/40 rounded-br-2xl" />
      </div>

      {/* Summary Body */}
      <article className="space-y-8">
        {sections.map((section, index) => (
          <section 
            key={section.title}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h3 className="mb-4 text-xl font-semibold text-tiffany-dark">
              {section.title}
            </h3>
            <ul className="space-y-3" role="list">
              {section.points.map((point, pointIndex) => (
                <li
                  key={`${point}-${pointIndex}`}
                  className="flex items-start gap-3 text-base leading-relaxed text-foreground transition-all duration-200 hover:translate-x-1"
                >
                  <span
                    className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-tiffany shadow-sm shadow-tiffany/50"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </article>

      {/* Funny Cat with Philactor - enhanced styling */}
      <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-tiffany/30 bg-gradient-to-br from-tiffany-light/10 via-white/50 to-tiffany-light/10 p-8 shadow-lg shadow-tiffany/5 transition-all duration-300 hover:shadow-xl hover:shadow-tiffany/10">
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-tiffany/20 to-tiffany/40 blur-xl opacity-50 transition-opacity duration-300 group-hover:opacity-75" />
          <img
            src="/Simon-Cat.jpg"
            alt="Смешной кот"
            className="relative h-48 w-48 rounded-full border-4 border-tiffany shadow-xl shadow-tiffany/20 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-tiffany to-tiffany-dark px-3 py-2 text-sm font-bold text-white shadow-lg shadow-tiffany/30 transition-transform duration-300 group-hover:scale-110">
            🎉
          </div>
        </div>
        <div className="rounded-xl bg-white px-6 py-3 shadow-md shadow-tiffany/10 transition-all duration-300 hover:shadow-lg hover:shadow-tiffany/20">
          <p className="text-center text-lg font-bold text-tiffany-dark">
            Ура! Я сделал домашку!
          </p>
        </div>
      </div>

      {/* Footer Actions - enhanced styling */}
      <div className="mt-10 flex items-center gap-3 border-t border-border pt-6">
        <Button
          variant="outline"
          onClick={handleCopy}
          className="gap-2 rounded-xl border-tiffany/30 bg-transparent text-tiffany-dark hover:bg-tiffany-light hover:text-tiffany-dark hover:border-tiffany/50 transition-all duration-200 hover:scale-105"
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
