"use client";

import { useState, useCallback, useEffect } from "react";
import { HomeInput, isValidYoutubeUrl } from "@/components/home-input";
import { LoadingState } from "@/components/loading-state";
import { SummaryResult } from "@/components/summary-result";
import { UserMenu } from "@/components/auth/user-menu";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type AppState = "home" | "loading" | "result";

interface SummaryData {
  videoTitle: string;
  channelName: string;
  thumbnailUrl: string;
  sections: Array<{
    title: string;
    points: string[];
  }>;
}

interface SummarizerClientProps {
  userEmail: string;
  initialCredits: number;
}

export function SummarizerClient({
  userEmail,
  initialCredits,
}: SummarizerClientProps) {
  const [appState, setAppState] = useState<AppState>("home");
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [credits, setCredits] = useState(initialCredits);

  const supabase = createClient();

  // Subscribe to credit changes
  useEffect(() => {
    const channel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          if (payload.new as { credits: number }) {
            setCredits((payload.new as { credits: number }).credits);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleSubmit = useCallback(
    async (url: string) => {
      if (!isValidYoutubeUrl(url)) {
        setError("Не удалось обработать видео. Проверьте ссылку или настройки доступа.");
        return;
      }

      // Check credits before processing
      if (credits <= 0) {
        setError("У вас недостаточно кредитов. Пополните баланс для продолжения.");
        return;
      }

      setError(null);
      setCurrentUrl(url);
      setAppState("loading");
    },
    [credits]
  );

  const handleLoadingComplete = useCallback(async () => {
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: currentUrl }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate summary");
      }

      // Deduct credit after successful summary
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits: credits - 1 })
        .eq("id", (await supabase.auth.getUser()).data.user?.id);

      if (updateError) {
        console.error("Error updating credits:", updateError);
      } else {
        setCredits((prev) => prev - 1);
      }

      setSummaryData(data.data);
      setAppState("result");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Произошла ошибка при генерации саммари"
      );
      setAppState("home");
    }
  }, [currentUrl, credits, supabase]);

  const handleReset = useCallback(() => {
    setAppState("home");
    setError(null);
    setSummaryData(null);
    setCurrentUrl("");
  }, []);

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
            Summarizer<span className="text-tiffany">.</span>
          </button>
          <div className="flex items-center gap-4">
            {appState === "result" && (
              <button
                onClick={handleReset}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                type="button"
              >
                {"Новое видео"}
              </button>
            )}
            <UserMenu email={userEmail} credits={credits} />
          </div>
        </div>
      </header>

      {/* Low credits warning */}
      {credits <= 1 && credits > 0 && appState === "home" && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Осталось {credits}{" "}
              {credits === 1 ? "кредит" : "кредита"}. Пополните баланс!
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* No credits warning */}
      {credits === 0 && appState === "home" && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              У вас закончились кредиты. Пополните баланс для продолжения
              использования сервиса.
            </AlertDescription>
          </Alert>
        </div>
      )}

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
  );
}
