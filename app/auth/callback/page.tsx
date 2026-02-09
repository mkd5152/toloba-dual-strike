import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type ProfileRole = {
  role: "organizer" | "umpire" | "spectator"
}

export default async function AuthCallbackPage() {
  const supabase = await createClient()

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch user profile with explicit type
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single<ProfileRole>()

  // Handle error or missing profile
  if (error || !profile) {
    console.error("Error fetching profile:", error)
    redirect("/spectator/dashboard")
  }

  // Redirect based on role
  if (profile.role === "organizer") {
    redirect("/organizer/dashboard")
  } else if (profile.role === "umpire") {
    redirect("/umpire/matches")
  } else {
    redirect("/spectator/dashboard")
  }
}
