import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SummarizerClient } from "./summarizer-client";

export default async function SummarizerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  // Get user profile with credits
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, email")
    .eq("id", user.id)
    .single();

  return (
    <SummarizerClient
      userEmail={user.email || ""}
      initialCredits={profile?.credits ?? 0}
    />
  );
}
