"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Mail, Lock, Loader2 } from "lucide-react";

// Функция для перевода ошибок Supabase на русский язык
function translateError(errorMessage: string): string {
  const errorMap: Record<string, string> = {
    "Invalid login credentials": "Неверный email или пароль",
    "Email not confirmed": "Email не подтверждён. Проверьте почту.",
    "User already registered": "Пользователь с таким email уже существует",
    "Password should be at least 6 characters": "Пароль должен содержать минимум 6 символов",
    "Unable to validate email address: invalid format": "Некорректный формат email",
    "Signups not allowed": "Регистрация запрещена",
    "User not found": "Пользователь не найден",
    "Invalid password": "Неверный пароль",
    "JWT expired": "Сессия истекла. Войдите заново.",
    "refresh token not found": "Сессия не найдена. Войдите заново.",
  };

  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return errorMessage;
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        // After signup, user is automatically logged in (email confirmation disabled)
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      const originalError = err instanceof Error ? err.message : "Произошла ошибка";
      setError(translateError(originalError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-md border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-tiffany to-tiffany/60 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              Summarizer<span className="text-tiffany">.</span>
            </CardTitle>
            <CardDescription className="mt-2">
              {isLogin
                ? "Войдите в свой аккаунт"
                : "Зарегистрируйтесь и получите 5 бесплатных кредитов"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={passwordFocused ? "" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="pl-10"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Минимум 6 символов
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-tiffany hover:bg-tiffany/90 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  {isLogin ? "Вход..." : "Регистрация..."}
                </>
              ) : isLogin ? (
                "Войти"
              ) : (
                "Зарегистрироваться"
              )}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                {isLogin ? (
                  <>
                    Нет аккаунта?{" "}
                    <span className="text-tiffany font-medium">
                      Зарегистрироваться
                    </span>
                  </>
                ) : (
                  <>
                    Уже есть аккаунт?{" "}
                    <span className="text-tiffany font-medium">Войти</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
