"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Mail, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  email: string;
  created_at: string;
  credits: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("email, credits")
          .eq("id", user.id)
          .single();

        setProfile({
          email: user.email || "",
          created_at: user.created_at,
          credits: profileData?.credits ?? 0,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <Loader2 className="w-8 h-8 animate-spin text-tiffany" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const initials = profile.email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-md border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="absolute top-4 left-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
          <Avatar className="w-20 h-20 mx-auto border-4 border-tiffany/20">
            <AvatarFallback className="bg-tiffany/10 text-tiffany text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold">
              Профиль
            </CardTitle>
            <CardDescription className="mt-2">
              Информация о вашем аккаунте
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="w-5 h-5 text-tiffany" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="w-5 h-5 text-tiffany" />
              <div>
                <p className="text-xs text-muted-foreground">Дата регистрации</p>
                <p className="font-medium">{formatDate(profile.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <svg
                className="w-5 h-5 text-tiffany"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3h12l4 6-10 13L2 9Z" />
                <path d="M11 3 8 9l4 13 4-13-3-6" />
                <path d="M2 9h20" />
              </svg>
              <div>
                <p className="text-xs text-muted-foreground">Кредиты</p>
                <p className="font-medium">{profile.credits}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Для изменения данных аккаунта обратитесь в поддержку
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
