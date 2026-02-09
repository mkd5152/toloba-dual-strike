import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type UserRole = "organizer" | "umpire" | "spectator"

export default async function AuthCallbackPage() {
  const supabase = await createClient()

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single()

  // Type assertion for role
  const role = profile?.role as UserRole | null

  // Redirect based on role
  if (role === "organizer") {
    redirect("/organizer/dashboard")
  } else if (role === "umpire") {
    redirect("/umpire/matches")
  } else {
    redirect("/spectator/dashboard")
  }
}
