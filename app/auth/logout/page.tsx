"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export default function LogoutPage() {
  const [status, setStatus] = useState("Logging out...")

  useEffect(() => {
    const forceLogout = async () => {
      try {
        // Clear everything
        await supabase.auth.signOut({ scope: 'global' })

        // Clear local storage
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }

        setStatus("Logged out successfully! Redirecting...")

        // Wait a moment then redirect
        setTimeout(() => {
          window.location.href = "/auth/login"
        }, 1000)
      } catch (error) {
        console.error("Logout error:", error)
        setStatus("Error logging out, but clearing session anyway...")

        // Force clear and redirect anyway
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }

        setTimeout(() => {
          window.location.href = "/auth/login"
        }, 1000)
      }
    }

    forceLogout()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center tournament-bg-pattern">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#ff9800] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-[#0d3944] font-bold text-lg">{status}</p>
      </div>
    </div>
  )
}
