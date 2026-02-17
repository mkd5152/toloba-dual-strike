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

  const generateEmailFromName = (fullName: string) => {
    // Convert "John Doe" to "johndoe@tdst.com"
    const sanitized = fullName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, '') // Remove spaces
    return `${sanitized}@tdst.com`
  }

  const handleNameChange = (newName: string) => {
    setName(newName)
    // Auto-generate email from name
    if (newName.trim()) {
      setEmail(generateEmailFromName(newName))
    }
  }

  const handleQuickCreate = async () => {
    if (!name.trim()) {
      setError("Scorer name is required")
      return
    }
    const autoEmail = email || generateEmailFromName(name)
    setEmail(autoEmail)
    await createUmpire(name, autoEmail, password)
  }

  const createUmpire = async (fullName: string, umpireEmail: string, umpirePassword: string) => {
    setLoading(true)
    setError("")
    setSuccess(null)

    try {
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("You must be logged in to create scorers")
      }

      // Check if umpire with same email already exists
      // @ts-ignore - Supabase browser client type inference limitation
      const { data: existingUmpire, error: checkError } = await supabase.from('profiles').select('email, full_name').eq('email', umpireEmail).maybeSingle()

      if (existingUmpire && !checkError) {
        throw new Error(`Scorer "${(existingUmpire as any).full_name || umpireEmail}" already exists with this name`)
      }

      // Call server API to create umpire using admin client
      // This won't affect the current user's session
      const response = await fetch('/api/admin/create-umpire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: umpireEmail,
          password: umpirePassword,
          fullName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create scorer')
      }

      setSuccess({ email: umpireEmail, password: umpirePassword })
      setName("")
      setEmail("")
    } catch (err: any) {
      console.error('Error creating umpire:', err)
      setError(err.message || "Failed to create scorer account")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Scorer name is required")
      return
    }
    const finalEmail = email || generateEmailFromName(name)
    await createUmpire(name, finalEmail, password)
  }

  const copyCredentials = () => {
    if (!success) return
    const text = `TDST Scorer Login:\nEmail: ${success.email}\nPassword: ${success.password}\n\nLogin at: https://your-app-url.com/auth/login`
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
          Quick Create Scorer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#0d3944]">
            Create Scorer Account
          </DialogTitle>
        </DialogHeader>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-[#0d3944] font-bold">
                Scorer Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., John Doe"
                className="border-2 border-[#0d3944]/20"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Email will be auto-generated: {name.trim() ? generateEmailFromName(name) : 'name@tdst.com'}
              </p>
            </div>

            <div>
              <Label htmlFor="email" className="text-[#0d3944] font-bold">
                Email (Auto-generated)
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Auto-filled from name"
                className="border-2 border-[#0d3944]/20 bg-gray-50"
                readOnly
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
                Default: tdst2026 (share this with scorers)
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
                ✅ Scorer account created successfully!
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
