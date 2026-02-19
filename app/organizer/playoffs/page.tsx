"use client"

import { useEffect, useState } from "react"
import { useTournamentStore } from "@/lib/stores/tournament-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Trophy, Users, ChevronRight, CheckCircle2, Circle,
  AlertCircle, Loader2, Sparkles
} from "lucide-react"
import {
  getPlayoffStatus,
  generateSemiFinals,
  generateFinal,
  getPlayoffBracket
} from "@/lib/api/playoff-automation"

export default function PlayoffManagerPage() {
  const { tournament, teams } = useTournamentStore()
  const [status, setStatus] = useState<any>(null)
  const [bracket, setBracket] = useState<any>(null)
  const [isGeneratingSemis, setIsGeneratingSemis] = useState(false)
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [tournament.id])

  const loadData = async () => {
    try {
      const [statusData, bracketData] = await Promise.all([
        getPlayoffStatus(tournament.id),
        getPlayoffBracket(tournament.id)
      ])
      setStatus(statusData)
      setBracket(bracketData)
    } catch (err) {
      console.error("Error loading playoff data:", err)
      setError(err instanceof Error ? err.message : "Failed to load playoff data")
    }
  }

  const handleGenerateSemis = async () => {
    try {
      setError(null)
      setSuccess(null)
      setIsGeneratingSemis(true)

      const result = await generateSemiFinals(tournament.id)
      setSuccess(`Semi-finals created successfully! Matches 26 and 27 are ready.`)

      // Reload data
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate semi-finals")
    } finally {
      setIsGeneratingSemis(false)
    }
  }

  const handleGenerateFinal = async () => {
    try {
      setError(null)
      setSuccess(null)
      setIsGeneratingFinal(true)

      const result = await generateFinal(tournament.id)
      setSuccess(`Final created successfully! Match 28 is ready.`)

      // Reload data
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate final")
    } finally {
      setIsGeneratingFinal(false)
    }
  }

  if (!status || !bracket) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-amber-400" />
          <h1 className="text-4xl font-bold text-white">Playoff Manager</h1>
        </div>
        <p className="text-slate-400">
          Automatically generate semi-finals and finals with qualified teams
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">{success}</AlertDescription>
        </Alert>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {status.leagueCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500" />
              )}
              League Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {status.leagueProgress.completed}/{status.leagueProgress.total}
            </div>
            <p className="text-sm text-slate-400">Matches Completed</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {status.semiFinalsCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : status.semiFinalsCreated ? (
                <Circle className="w-5 h-5 text-orange-500" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500" />
              )}
              Semi-Finals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {status.semiProgress.completed}/{status.semiProgress.total}
            </div>
            <p className="text-sm text-slate-400">Matches Completed</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {status.finalCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : status.finalCreated ? (
                <Circle className="w-5 h-5 text-orange-500" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500" />
              )}
              Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {status.finalCompleted ? "1/1" : status.finalCreated ? "0/1" : "0/1"}
            </div>
            <p className="text-sm text-slate-400">Match Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-white">Generate Semi-Finals</CardTitle>
            <CardDescription className="text-slate-300">
              Create matches 26 & 27 with top 2 teams from each group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateSemis}
              disabled={!status.canGenerateSemis || isGeneratingSemis}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {isGeneratingSemis ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Semi-Finals
                </>
              )}
            </Button>
            {!status.canGenerateSemis && status.semiFinalsCreated && (
              <p className="text-sm text-green-400 mt-2">✓ Semi-finals already created</p>
            )}
            {!status.canGenerateSemis && !status.leagueCompleted && (
              <p className="text-sm text-amber-400 mt-2">
                Complete all 25 league matches first
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Generate Final</CardTitle>
            <CardDescription className="text-slate-300">
              Create match 28 with top 2 teams from each semi-final
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateFinal}
              disabled={!status.canGenerateFinal || isGeneratingFinal}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
            >
              {isGeneratingFinal ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4 mr-2" />
                  Generate Final
                </>
              )}
            </Button>
            {!status.canGenerateFinal && status.finalCreated && (
              <p className="text-sm text-green-400 mt-2">✓ Final already created</p>
            )}
            {!status.canGenerateFinal && !status.semiFinalsCompleted && (
              <p className="text-sm text-amber-400 mt-2">
                Complete both semi-finals first
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bracket Visualization */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Tournament Bracket
          </CardTitle>
          <CardDescription className="text-slate-300">
            Visual representation of playoff progression
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* League Stage */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">League Stage - Top 2 Qualified</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(groupNum => {
                  const groupKey = `group${groupNum}` as keyof typeof bracket.league
                  const groupTeams = bracket.league[groupKey] || []

                  return (
                    <div key={groupNum} className="space-y-2">
                      <Badge variant="outline" className="bg-slate-700 text-white mb-2">
                        Group {groupNum}
                      </Badge>
                      {groupTeams.map((team: any, idx: number) => (
                        <div
                          key={team.id}
                          className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <span className="text-white text-sm">{team.name}</span>
                        </div>
                      ))}
                      {groupTeams.length === 0 && (
                        <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50 text-slate-500 text-sm">
                          TBD - Complete league matches
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <ChevronRight className="w-6 h-6 text-orange-500 mx-auto" />

            {/* Semi-Finals */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Semi-Finals - Top 2 Advance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["semi1", "semi2"].map((semiKey, semiIdx) => {
                  const semiTeams = bracket.semis[semiKey as keyof typeof bracket.semis] || []

                  return (
                    <div key={semiKey} className="space-y-2">
                      <Badge variant="outline" className="bg-orange-600 text-white mb-2">
                        Semi-Final {semiIdx + 1}
                      </Badge>
                      {semiTeams.map((team: any, idx: number) => (
                        <div
                          key={team.id}
                          className="bg-orange-900/30 p-3 rounded-lg border border-orange-500/50 flex items-center gap-2"
                        >
                          <Trophy className="w-4 h-4 text-orange-400" />
                          <span className="text-white text-sm">{team.name}</span>
                        </div>
                      ))}
                      {semiTeams.length === 0 && !status.semiFinalsCreated && (
                        <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50 text-slate-500 text-sm">
                          Generate semi-finals first
                        </div>
                      )}
                      {semiTeams.length === 0 && status.semiFinalsCreated && (
                        <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50 text-slate-500 text-sm">
                          TBD - Complete this semi-final
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <ChevronRight className="w-6 h-6 text-amber-500 mx-auto" />

            {/* Final */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Final - Champion</h3>
              <div className="max-w-md mx-auto">
                <Badge variant="outline" className="bg-amber-600 text-white mb-2">
                  Grand Final
                </Badge>
                {status.finalCreated ? (
                  <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-500/50">
                    <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-white text-center">
                      {status.finalCompleted ? "Champion Crowned! 🏆" : "Final match in progress..."}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 text-slate-500 text-center">
                    Generate final after completing semi-finals
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
