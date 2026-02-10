"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Copy, Check } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export function CreateUmpireDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("tdst2026")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const generateEmail = () => {
    const timestamp = Date.now().toString().slice(-6)
    return `umpire${timestamp}@tdst.local`
  }

  const handleQuickCreate = async () => {
    const autoEmail = generateEmail()
    setEmail(autoEmail)
    await createUmpire(name || "Umpire", autoEmail, password)
  }

  const createUmpire = async (fullName: string, umpireEmail: string, umpirePassword: string) => {
    setLoading(true)
    setError("")
    setSuccess(null)

    try {
      // Create user account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: umpireEmail,
        password: umpirePassword,
        options: {
          data: {
            role: 'umpire',
            full_name: fullName,
          },
        },
      })

      if (signUpError) throw signUpError

      // Create profile
      if (data.user) {
        // @ts-ignore - Supabase browser client type inference limitation
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: umpireEmail,
          role: 'umpire',
          full_name: fullName,
        })

        if (profileError) throw profileError
      }

      setSuccess({ email: umpireEmail, password: umpirePassword })
      setName("")
      setEmail("")
    } catch (err: any) {
      console.error('Error creating umpire:', err)
      setError(err.message || "Failed to create umpire account")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createUmpire(name || "Umpire", email, password)
  }

  const copyCredentials = () => {
    if (!success) return
    const text = `TDST Umpire Login:\nEmail: ${success.email}\nPassword: ${success.password}\n\nLogin at: https://your-app-url.com/auth/login`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetAndClose = () => {
    setSuccess(null)
    setError("")
    setName("")
    setEmail("")
    setPassword("tdst2026")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold hover:opacity-90">
          <UserPlus className="w-4 h-4 mr-2" />
          Quick Create Umpire
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#0d3944]">
            Create Umpire Account
          </DialogTitle>
        </DialogHeader>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-[#0d3944] font-bold">
                Umpire Name (Optional)
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Doe"
                className="border-2 border-[#0d3944]/20"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-[#0d3944] font-bold">
                Email (Optional - auto-generated if empty)
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Will auto-generate"
                className="border-2 border-[#0d3944]/20"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-[#0d3944] font-bold">
                Password
              </Label>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 border-[#0d3944]/20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default: tdst2026 (share this with umpires)
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleQuickCreate}
                disabled={loading}
                className="bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white font-bold"
              >
                {loading ? "Creating..." : "Quick Create"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                ✅ Umpire account created successfully!
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg border-2 border-[#0d3944]/20 space-y-2">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Email</p>
                <p className="text-sm font-bold text-[#0d3944]">{success.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Password</p>
                <p className="text-sm font-bold text-[#0d3944]">{success.password}</p>
              </div>
            </div>

            <Button
              onClick={copyCredentials}
              className="w-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Credentials (for WhatsApp)
                </>
              )}
            </Button>

            <DialogFooter>
              <Button
                onClick={resetAndClose}
                className="w-full"
                variant="outline"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
