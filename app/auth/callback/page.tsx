import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

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

  // Redirect based on role
  if (profile?.role === "organizer") {
    redirect("/organizer/dashboard")
  } else if (profile?.role === "umpire") {
    redirect("/umpire/matches")
  } else {
    redirect("/spectator/dashboard")
  }
}
