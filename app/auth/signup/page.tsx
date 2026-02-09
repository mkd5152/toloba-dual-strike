"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignupPage() {
  const router = useRouter()
  const { signUp, user, profile, error, clearError } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState("")

  useEffect(() => {
    // Redirect if already logged in
    if (user && profile) {
      router.push("/spectator/dashboard")
    }
  }, [user, profile, router])

  useEffect(() => {
    // Clear error when component unmounts
    return () => clearError()
  }, [clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError("")

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      // All public signups are spectators by default
      await signUp(email, password, "spectator", fullName)
      router.push("/spectator/dashboard")
    } catch (err: any) {
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center tournament-bg-pattern p-4">
      <Card className="w-full max-w-md border-2 border-[#0d3944]/20 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black text-[#0d3944]">
            Sign Up
          </CardTitle>
          <CardDescription>
            Create your TDST tournament account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-[#0d3944] font-bold">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="border-2 border-[#0d3944]/20 focus:border-[#ff9800]"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-[#0d3944] font-bold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="border-2 border-[#0d3944]/20 focus:border-[#ff9800]"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-[#0d3944] font-bold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-2 border-[#0d3944]/20 focus:border-[#ff9800]"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-[#0d3944] font-bold">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-2 border-[#0d3944]/20 focus:border-[#ff9800]"
              />
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800 text-sm">
                ℹ️ You're signing up as a <strong>Spectator</strong>. Contact the organizer to become an Umpire.
              </AlertDescription>
            </Alert>

            {(error || validationError) && (
              <Alert variant="destructive">
                <AlertDescription>{error || validationError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                href="/auth/login"
                className="text-[#ff9800] font-bold hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
