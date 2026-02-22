"use client"

import { useEffect, useState } from "react"
import { useTournamentStore } from "@/lib/stores/tournament-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Trophy, Users, ChevronRight, CheckCircle2, Circle,
  AlertCircle, Loader2, Sparkles, Zap
} from "lucide-react"
import {
  getPlayoffStatus,
  generateQuarterFinals,
  generateSemiFinals,
  generateFinal,
  getPlayoffBracket
} from "@/lib/api/playoff-automation"

export default function PlayoffManagerPage() {
  const { tournament, teams } = useTournamentStore()
  const [status, setStatus] = useState<any>(null)
  const [bracket, setBracket] = useState<any>(null)
  const [isGeneratingQFs, setIsGeneratingQFs] = useState(false)
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

  const getTeamPlayers = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId)
    return team?.players || []
  }

  const handleGenerateQFs = async () => {
    try {
      setError(null)
      setSuccess(null)
      setIsGeneratingQFs(true)

      const result = await generateQuarterFinals(tournament.id)
      setSuccess(`Quarter-finals created successfully! Matches 26 (QF1) and 27 (QF2) are ready.`)

      // Reload data
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quarter-finals")
    } finally {
      setIsGeneratingQFs(false)
    }
  }

  const handleGenerateSemis = async () => {
    try {
      setError(null)
      setSuccess(null)
      setIsGeneratingSemis(true)

      const result = await generateSemiFinals(tournament.id)
      setSuccess(`Semi-finals created successfully! Matches 28 and 29 are ready.`)

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
      setSuccess(`Final created successfully! Match 30 is ready.`)

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
          Automatically generate quarter-finals, semi-finals, and finals with qualified teams
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              {status.quarterFinalsCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : status.quarterFinalsCreated ? (
                <Circle className="w-5 h-5 text-orange-500" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500" />
              )}
              Quarter-Finals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {status.qfProgress.completed}/{status.qfProgress.total}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Generate Quarter-Finals</CardTitle>
            <CardDescription className="text-slate-300">
              Create matches 26 & 27: QF1 (5,6,11,12) and QF2 (7,8,9,10)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateQFs}
              disabled={!status.canGenerateQFs || isGeneratingQFs}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {isGeneratingQFs ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate QFs
                </>
              )}
            </Button>
            {!status.canGenerateQFs && status.quarterFinalsCreated && (
              <p className="text-sm text-green-400 mt-2">✓ Quarter-finals already created</p>
            )}
            {!status.canGenerateQFs && !status.leagueCompleted && (
              <p className="text-sm text-amber-400 mt-2">
                Complete all 25 league matches first
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-white">Generate Semi-Finals</CardTitle>
            <CardDescription className="text-slate-300">
              Create matches 28 & 29 with QF winners + top 4 overall
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
                  Generate SFs
                </>
              )}
            </Button>
            {!status.canGenerateSemis && status.semiFinalsCreated && (
              <p className="text-sm text-green-400 mt-2">✓ Semi-finals already created</p>
            )}
            {!status.canGenerateSemis && !status.quarterFinalsCompleted && (
              <p className="text-sm text-amber-400 mt-2">
                Complete both quarter-finals first
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white">Generate Final</CardTitle>
            <CardDescription className="text-slate-300">
              Create match 30 with top 2 from each semi-final
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
              <h3 className="text-lg font-semibold text-white mb-4">League Stage - Overall Standings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Top 4 - Direct to Semis */}
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-green-700 text-white mb-2">
                    Top 4 - Direct to Semis
                  </Badge>
                  {bracket.league.topFour.map((team: any) => {
                    const players = getTeamPlayers(team.id)
                    return (
                      <div
                        key={team.id}
                        className="bg-green-900/30 p-3 rounded-lg border border-green-500/50"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {team.rank}
                          </div>
                          <span className="text-white text-sm flex-1 font-semibold">{team.name}</span>
                          <span className="text-green-400 text-xs font-bold">{team.points}pts</span>
                        </div>
                        {players.length > 0 && (
                          <div className="ml-8 text-[10px] text-white/60 truncate">
                            {players.map((p: any) => p.name).join(" • ")}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* QF1 Teams */}
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-purple-700 text-white mb-2">
                    QF1 Teams (5,6,11,12)
                  </Badge>
                  {bracket.league.qf1Teams.map((team: any) => {
                    const players = getTeamPlayers(team.id)
                    return (
                      <div
                        key={team.id}
                        className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/50"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {team.rank}
                          </div>
                          <span className="text-white text-sm flex-1 font-semibold">{team.name}</span>
                          <span className="text-purple-400 text-xs font-bold">{team.points}pts</span>
                        </div>
                        {players.length > 0 && (
                          <div className="ml-8 text-[10px] text-white/60 truncate">
                            {players.map((p: any) => p.name).join(" • ")}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* QF2 Teams */}
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-blue-700 text-white mb-2">
                    QF2 Teams (7,8,9,10)
                  </Badge>
                  {bracket.league.qf2Teams.map((team: any) => {
                    const players = getTeamPlayers(team.id)
                    return (
                      <div
                        key={team.id}
                        className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/50"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {team.rank}
                          </div>
                          <span className="text-white text-sm flex-1 font-semibold">{team.name}</span>
                          <span className="text-blue-400 text-xs font-bold">{team.points}pts</span>
                        </div>
                        {players.length > 0 && (
                          <div className="ml-8 text-[10px] text-white/60 truncate">
                            {players.map((p: any) => p.name).join(" • ")}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <ChevronRight className="w-6 h-6 text-purple-500 mx-auto" />

            {/* Quarter-Finals */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quarter-Finals - Top 2 Advance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["qf1", "qf2"].map((qfKey, qfIdx) => {
                  const qfTeams = bracket.quarterFinals[qfKey as keyof typeof bracket.quarterFinals] || []

                  return (
                    <div key={qfKey} className="space-y-2">
                      <Badge variant="outline" className="bg-purple-600 text-white mb-2">
                        Quarter-Final {qfIdx + 1}
                      </Badge>
                      {qfTeams.map((team: any, idx: number) => {
                        const players = getTeamPlayers(team.id)
                        return (
                          <div
                            key={team.id}
                            className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/50"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {idx + 1}
                              </div>
                              <span className="text-white text-sm font-semibold">{team.name}</span>
                            </div>
                            {players.length > 0 && (
                              <div className="ml-8 text-[10px] text-white/60 truncate">
                                {players.map((p: any) => p.name).join(" • ")}
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {qfTeams.length === 0 && !status.quarterFinalsCreated && (
                        <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50 text-slate-500 text-sm">
                          Generate quarter-finals first
                        </div>
                      )}
                      {qfTeams.length === 0 && status.quarterFinalsCreated && (
                        <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50 text-slate-500 text-sm">
                          TBD - Complete this quarter-final
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
                      {semiTeams.map((team: any, idx: number) => {
                        const players = getTeamPlayers(team.id)
                        return (
                          <div
                            key={team.id}
                            className="bg-orange-900/30 p-3 rounded-lg border border-orange-500/50"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Trophy className="w-4 h-4 text-orange-400 flex-shrink-0" />
                              <span className="text-white text-sm font-semibold">{team.name}</span>
                            </div>
                            {players.length > 0 && (
                              <div className="ml-6 text-[10px] text-white/60 truncate">
                                {players.map((p: any) => p.name).join(" • ")}
                              </div>
                            )}
                          </div>
                        )
                      })}
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
