"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/types/database"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Match = Database["public"]["Tables"]["matches"]["Row"]

interface AssignUmpireDialogProps {
  match: Match
  onAssigned?: () => void
}

export function AssignUmpireDialog({ match, onAssigned }: AssignUmpireDialogProps) {
  const [open, setOpen] = useState(false)
  const [umpires, setUmpires] = useState<Profile[]>([])
  const [selectedUmpireId, setSelectedUmpireId] = useState<string>(match.umpire_id || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      fetchUmpires()
    }
  }, [open])

  const fetchUmpires = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "umpire")
        .order("full_name")

      if (error) throw error
      setUmpires(data || [])
    } catch (err: any) {
      console.error("Error fetching umpires:", err)
      setError("Failed to load umpires")
    }
  }

  const handleAssign = async () => {
    if (!selectedUmpireId) {
      setError("Please select an umpire")
      return
    }

    setLoading(true)
    setError("")

    try {
      // @ts-ignore - Supabase browser client type inference limitation
      const { error: updateError } = await supabase.from("matches").update({ umpire_id: selectedUmpireId }).eq("id", match.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        onAssigned?.()
      }, 1500)
    } catch (err: any) {
      console.error("Error assigning umpire:", err)
      setError(err.message || "Failed to assign umpire")
    } finally {
      setLoading(false)
    }
  }

  const currentUmpire = umpires.find((u) => u.id === match.umpire_id)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-[#ff9800] text-[#ff9800] hover:bg-[#ff9800] hover:text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {match.umpire_id ? "Reassign" : "Assign"} Umpire
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#0d3944]">
            Assign Umpire
          </DialogTitle>
          <DialogDescription>
            Assign an umpire to Match {match.match_number} at {match.court}
          </DialogDescription>
        </DialogHeader>

        {!success ? (
          <div className="space-y-4 py-4">
            {currentUmpire && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800 text-sm">
                  Currently assigned: <strong>{currentUmpire.full_name}</strong>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="umpire" className="text-[#0d3944] font-bold">
                Select Umpire
              </Label>
              <Select value={selectedUmpireId} onValueChange={setSelectedUmpireId}>
                <SelectTrigger className="border-2 border-[#0d3944]/20">
                  <SelectValue placeholder="Choose an umpire" />
                </SelectTrigger>
                <SelectContent>
                  {umpires.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No umpires available. Create umpires first.
                    </div>
                  ) : (
                    umpires.map((umpire) => (
                      <SelectItem key={umpire.id} value={umpire.id}>
                        {umpire.full_name || umpire.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAssign}
                disabled={loading || !selectedUmpireId}
                className="flex-1 bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold hover:opacity-90"
              >
                {loading ? "Assigning..." : "Assign Umpire"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-bold text-green-600">
              Umpire assigned successfully!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
