"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"

export default function SetupAdminPage() {
  const router = useRouter()
  const { signUp } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      // Create admin account
      await signUp(email, password, "organizer", fullName)
      setSuccess(true)
      setTimeout(() => {
        router.push("/organizer/dashboard")
      }, 2000)
    } catch (err: any) {
      console.error('Admin setup error:', err)
      setError(err.message || "Failed to create admin account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center tournament-bg-pattern p-4">
      <Card className="w-full max-w-md border-2 border-[#b71c1c] shadow-xl">
        <CardHeader className="text-center bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white rounded-t-lg">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-[#b71c1c]" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black">
            Admin Setup
          </CardTitle>
          <CardDescription className="text-white/90">
            Create your tournament administrator account
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Alert className="bg-orange-50 border-orange-200">
                <AlertDescription className="text-orange-800 text-sm">
                  ⚠️ This is a ONE-TIME setup. You're creating the main admin account for TDST Season 1.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="fullName" className="text-[#0d3944] font-bold">
                  Your Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Tournament Organizer"
                  required
                  className="border-2 border-[#0d3944]/20 focus:border-[#b71c1c]"
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
                  placeholder="admin@tdst.com"
                  required
                  className="border-2 border-[#0d3944]/20 focus:border-[#b71c1c]"
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
                  className="border-2 border-[#0d3944]/20 focus:border-[#b71c1c]"
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
                  className="border-2 border-[#0d3944]/20 focus:border-[#b71c1c]"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white font-black text-lg py-6 hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Creating Admin Account..." : "Create Admin Account"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <Alert className="bg-green-50 border-green-200 mb-4">
                <AlertDescription className="text-green-800 font-bold">
                  ✅ Admin account created successfully!
                </AlertDescription>
              </Alert>
              <p className="text-gray-600">Redirecting to admin dashboard...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
