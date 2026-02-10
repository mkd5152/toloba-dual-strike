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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit3, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { Match } from "@/lib/types"
import { useTournamentStore } from "@/lib/stores/tournament-store"

interface ScoreOverrideDialogProps {
  match: Match
  onUpdated?: () => void
}

interface TeamScore {
  teamId: string
  teamName: string
  runs: number
  wickets: number
  points: number
}

export function ScoreOverrideDialog({ match, onUpdated }: ScoreOverrideDialogProps) {
  const [open, setOpen] = useState(false)
  const { getTeam } = useTournamentStore()
  const [scores, setScores] = useState<TeamScore[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      initializeScores()
    }
  }, [open])

  const initializeScores = () => {
    const initialScores: TeamScore[] = match.rankings.map((ranking) => {
      const team = getTeam(ranking.teamId)
      return {
        teamId: ranking.teamId,
        teamName: team?.name || "Unknown Team",
        runs: ranking.totalRuns,
        wickets: 0, // Wickets not stored in MatchRanking
        points: ranking.points,
      }
    })
    setScores(initialScores)
  }

  const updateScore = (teamId: string, field: "runs" | "wickets" | "points", value: string) => {
    const numValue = parseInt(value) || 0
    setScores((prev) =>
      prev.map((score) =>
        score.teamId === teamId ? { ...score, [field]: numValue } : score
      )
    )
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")

    try {
      // Update the match rankings in the local store
      const updatedRankings = scores
        .map((score) => ({
          teamId: score.teamId,
          totalRuns: score.runs,
          points: score.points as 5 | 3 | 1 | 0,
          rank: 0 as 1 | 2 | 3 | 4, // Will be recalculated
        }))
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points
          return b.totalRuns - a.totalRuns
        })
        .map((ranking, index) => ({ ...ranking, rank: (index + 1) as 1 | 2 | 3 | 4 }))

      // Update the match in the tournament store
      const { updateMatch } = useTournamentStore.getState()
      updateMatch(match.id, { rankings: updatedRankings })

      // TODO: When match persistence is implemented, update database here
      // For now, we're just updating the in-memory store

      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        onUpdated?.()
      }, 1500)
    } catch (err: any) {
      console.error("Error updating scores:", err)
      setError(err.message || "Failed to update scores")
    } finally {
      setLoading(false)
    }
  }

  const canOverride = match.state === "COMPLETED" || match.state === "LOCKED"

  if (!canOverride) {
    return (
      <Button variant="outline" size="sm" disabled className="opacity-50">
        <Edit3 className="w-4 h-4 mr-2" />
        Override Scores
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Override Scores
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#0d3944]">
            Override Match Scores
          </DialogTitle>
          <DialogDescription>
            Manually adjust scores for Match {match.matchNumber} at {match.court}
          </DialogDescription>
        </DialogHeader>

        {!success ? (
          <div className="space-y-4 py-4">
            <Alert className="bg-orange-50 border-orange-200">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <AlertDescription className="text-orange-800 text-sm">
                <strong>Admin Override:</strong> Use this carefully to correct scoring errors.
                Changes will recalculate team rankings.
              </AlertDescription>
            </Alert>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {scores.map((score) => (
                <div
                  key={score.teamId}
                  className="p-4 border-2 border-gray-200 rounded-lg space-y-3"
                >
                  <h3 className="font-black text-[#0d3944] text-lg">{score.teamName}</h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`runs-${score.teamId}`} className="text-sm font-bold">
                        Runs
                      </Label>
                      <Input
                        id={`runs-${score.teamId}`}
                        type="number"
                        min="0"
                        value={score.runs}
                        onChange={(e) => updateScore(score.teamId, "runs", e.target.value)}
                        className="border-2 border-gray-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`wickets-${score.teamId}`} className="text-sm font-bold">
                        Wickets
                      </Label>
                      <Input
                        id={`wickets-${score.teamId}`}
                        type="number"
                        min="0"
                        value={score.wickets}
                        onChange={(e) => updateScore(score.teamId, "wickets", e.target.value)}
                        className="border-2 border-gray-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`points-${score.teamId}`} className="text-sm font-bold">
                        Points
                      </Label>
                      <Input
                        id={`points-${score.teamId}`}
                        type="number"
                        min="0"
                        value={score.points}
                        onChange={(e) => updateScore(score.teamId, "points", e.target.value)}
                        className="border-2 border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold hover:opacity-90"
              >
                {loading ? "Saving..." : "Save Changes"}
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
              Scores updated successfully!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
