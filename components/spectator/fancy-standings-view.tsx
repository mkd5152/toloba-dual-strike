"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, Target, Award, Zap } from "lucide-react"
import { getOverallStandingsForPlayoffs } from "@/lib/api/qualification"
import { supabase } from "@/lib/supabase/client"
import type { StandingsEntry, Match } from "@/lib/types"

type TabType = "league" | "quarters" | "semis" | "finals"

interface FancyStandingsViewProps {
  tournamentId: string
}

export function FancyStandingsView({ tournamentId }: FancyStandingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("league")
  const [leagueStandings, setLeagueStandings] = useState<StandingsEntry[]>([])
  const [qfMatches, setQfMatches] = useState<Match[]>([])
  const [semiMatches, setSemiMatches] = useState<Match[]>([])
  const [finalMatch, setFinalMatch] = useState<Match | null>(null)
  const [teams, setTeams] = useState<any[]>([])
  const [leagueMatchesCompleted, setLeagueMatchesCompleted] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load overall standings
      const standings = await getOverallStandingsForPlayoffs(tournamentId)
      setLeagueStandings(standings)

      // Load teams with players
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*, players(*)")
        .eq("tournament_id", tournamentId)

      if (teamsError) throw teamsError
      setTeams(teamsData || [])

      // Count completed league matches
      const { data: leagueMatchesData, error: leagueError } = await supabase
        .from("matches")
        .select("id, state")
        .eq("tournament_id", tournamentId)
        .eq("stage", "LEAGUE")
        .in("state", ["COMPLETED", "LOCKED"])

      if (leagueError) throw leagueError
      setLeagueMatchesCompleted(leagueMatchesData?.length || 0)

      // Load QF matches
      const { data: qfData, error: qfError } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", tournamentId)
        .eq("stage", "QF")
        .order("match_number")

      if (qfError) throw qfError
      setQfMatches(qfData || [])

      // Load semi matches
      const { data: semiData, error: semiError } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", tournamentId)
        .eq("stage", "SEMI")
        .order("match_number")

      if (semiError) throw semiError
      setSemiMatches(semiData || [])

      // Load final match
      const { data: finalData, error: finalError } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", tournamentId)
        .eq("stage", "FINAL")
        .single()

      if (!finalError && finalData) {
        setFinalMatch(finalData)
      }
    } catch (err) {
      console.error("Error loading standings data:", err)
      setError(err instanceof Error ? err.message : "Failed to load standings")
    } finally {
      setLoading(false)
    }
  }

  if (loading && leagueStandings.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-[#ff9800] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-bold">Loading standings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-white/70 py-12">
        <p className="mb-4">Unable to load standings</p>
        <button
          onClick={loadAllData}
          className="text-sm text-[#ff9800] hover:text-[#ffb300] underline"
        >
          Try again
        </button>
      </div>
    )
  }

  const getTeamName = (teamId: string) => {
    return teams.find((t) => t.id === teamId)?.name || "Unknown Team"
  }

  const getTeamPlayers = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId)
    return team?.players || []
  }

  const renderMatchRankings = (match: Match, matchLabel: string) => {
    if (!match.rankings || match.rankings.length === 0) {
      // Show participating teams if match is created but not completed
      // Handle both camelCase and snake_case from database
      const teamIds = (match.teamIds || (match as any).team_ids) as string[] | undefined
      if (teamIds && teamIds.length > 0) {
        return (
          <div className="space-y-2">
            {teamIds.map((teamId: string, idx: number) => {
              const teamName = getTeamName(teamId)
              const players = getTeamPlayers(teamId)

              return (
                <div
                  key={teamId}
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg border bg-white/5 border-white/10 gap-2 sm:gap-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 bg-white/20 text-white/70">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="text-white font-bold text-sm sm:text-base truncate">{teamName}</span>
                      </div>
                      {players.length > 0 && (
                        <p className="text-[10px] sm:text-xs text-white/60 font-medium mt-0.5 truncate">
                          {players.map((p: any) => p.name).join(" • ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-xs sm:text-sm text-white/50 font-semibold">
                      {match.state === "IN_PROGRESS" ? "Playing..." : "Not started"}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      }

      return (
        <div className="text-center py-4 text-sm sm:text-base text-white/60">
          {match.state === "COMPLETED" || match.state === "LOCKED"
            ? "No rankings available"
            : "Match not created yet"}
        </div>
      )
    }

    const sortedRankings = [...match.rankings].sort((a: any, b: any) => a.rank - b.rank)

    return (
      <div className="space-y-2">
        {sortedRankings.map((ranking: any, idx: number) => {
          const teamName = getTeamName(ranking.teamId)
          const players = getTeamPlayers(ranking.teamId)
          const isWinner = idx === 0
          const isTopTwo = idx < 2

          return (
            <div
              key={ranking.teamId}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border-2 gap-2 sm:gap-3 ${
                isWinner
                  ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500"
                  : isTopTwo
                  ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 ${
                    isWinner
                      ? "bg-amber-500 text-white"
                      : isTopTwo
                      ? "bg-green-500 text-white"
                      : "bg-white/20 text-white/70"
                  }`}
                >
                  {ranking.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-white font-bold text-sm sm:text-base truncate">{teamName}</span>
                    {isWinner && <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />}
                    {isTopTwo && !isWinner && (
                      <Badge className="bg-green-600 text-white text-[10px] sm:text-xs flex-shrink-0 px-1.5">Q</Badge>
                    )}
                  </div>
                  {players.length > 0 && (
                    <p className="text-[10px] sm:text-xs text-white/60 font-medium mt-0.5 truncate">
                      {players.map((p: any) => p.name).join(" • ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-black text-white leading-none mb-0.5 sm:mb-1">{ranking.points}</div>
                  <div className="text-[10px] sm:text-xs text-white/60 font-semibold whitespace-nowrap">
                    {ranking.totalRuns || ranking.totalScore || 0}r | {ranking.totalDismissals || 0}w
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Check if all 25 league matches are completed
  const allLeagueMatchesCompleted = leagueMatchesCompleted >= 25

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-lg border border-white/10 w-full sm:w-fit">
        <button
          onClick={() => setActiveTab("league")}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-bold text-sm sm:text-base transition-all flex-1 sm:flex-initial justify-center ${
            activeTab === "league"
              ? "bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] shadow-lg"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">League</span>
          <span className="sm:hidden">L</span>
          <Badge className="bg-white/20 text-white text-xs ml-1">{leagueMatchesCompleted}/25</Badge>
        </button>
        <button
          onClick={() => setActiveTab("quarters")}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-bold text-sm sm:text-base transition-all flex-1 sm:flex-initial justify-center ${
            activeTab === "quarters"
              ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">Quarters</span>
          <span className="sm:hidden">Q</span>
          {qfMatches.length > 0 && (
            <Badge className="bg-white/20 text-white text-xs ml-1">{qfMatches.length}</Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab("semis")}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-bold text-sm sm:text-base transition-all flex-1 sm:flex-initial justify-center ${
            activeTab === "semis"
              ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <Target className="w-4 h-4" />
          <span className="hidden sm:inline">Semis</span>
          <span className="sm:hidden">S</span>
          {semiMatches.length > 0 && (
            <Badge className="bg-white/20 text-white text-xs ml-1">{semiMatches.length}</Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab("finals")}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-bold text-sm sm:text-base transition-all flex-1 sm:flex-initial justify-center ${
            activeTab === "finals"
              ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <Award className="w-4 h-4" />
          <span className="hidden sm:inline">Finals</span>
          <span className="sm:hidden">F</span>
          {finalMatch && <Badge className="bg-white/20 text-white text-xs ml-1">1</Badge>}
        </button>
      </div>

      {/* League Tab */}
      {activeTab === "league" && (
        <>
          {leagueStandings.length === 0 ? (
            <div className="text-center text-white/70 py-12">
              No standings available yet. Complete some matches to see the leaderboard!
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-[#ff9800]/10 to-[#ffb300]/10 border-2 border-[#ff9800]/30">
              <CardHeader className="p-3 sm:p-4 pb-2">
                <CardTitle className="text-white flex items-center gap-2 text-base sm:text-xl">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff9800] flex-shrink-0" />
                  <span className="flex-1">Overall Standings</span>
                  <Badge className="bg-[#ff9800] text-white text-xs sm:text-sm flex-shrink-0">
                    {leagueStandings.length} teams
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-2">
                <div className="space-y-2">
                  {leagueStandings.map((team, idx) => {
                    // Only highlight top 4 if all 25 league matches are complete
                    const isTopFour = idx < 4 && allLeagueMatchesCompleted
                    const isQFTeam = idx >= 4 && idx < 12 && allLeagueMatchesCompleted
                    const players = getTeamPlayers(team.teamId)

                    return (
                      <div
                        key={team.teamId}
                        className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border-2 gap-2 sm:gap-3 transition-all ${
                          isTopFour
                            ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500 ring-2 ring-green-500/50"
                            : isQFTeam
                            ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/50"
                            : "bg-white/5 border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0 ${
                              isTopFour
                                ? "bg-green-500 text-white shadow-lg"
                                : isQFTeam
                                ? "bg-purple-500 text-white"
                                : "bg-white/20 text-white/70"
                            }`}
                          >
                            {team.rank}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span className="text-white font-bold text-sm sm:text-lg truncate">{team.teamName}</span>
                              {isTopFour && (
                                <Badge className="bg-green-600 text-white text-[10px] sm:text-xs flex-shrink-0 px-1.5 sm:px-2">
                                  Direct to Semis
                                </Badge>
                              )}
                              {isQFTeam && (
                                <Badge className="bg-purple-600 text-white text-[10px] sm:text-xs flex-shrink-0 px-1.5 sm:px-2">
                                  Quarter-Finals
                                </Badge>
                              )}
                            </div>
                            {players.length > 0 && (
                              <p className="text-[10px] sm:text-xs text-white/60 font-medium mt-0.5 sm:mt-1 truncate">
                                {players.map((p: any) => p.name).join(" • ")}
                              </p>
                            )}
                            <div className="text-[10px] sm:text-xs text-white/50 font-semibold mt-0.5 sm:mt-1">
                              {team.matchesPlayed} matches
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-xl sm:text-3xl font-black text-white leading-none mb-0.5 sm:mb-1">
                              {team.points}
                            </div>
                            <div className="text-[10px] sm:text-sm text-white/60 font-semibold whitespace-nowrap">
                              {team.totalRuns}r | {team.totalDismissals}w
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {allLeagueMatchesCompleted && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-5 bg-gradient-to-r from-[#0d3944] to-[#1a4a57] rounded-lg border-2 border-[#ff9800]">
              <div className="flex items-start gap-2 sm:gap-3">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff9800] mt-0.5 sm:mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-xl font-black text-white mb-2">Playoff Format</h3>
                  <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-base text-white/90 font-medium">
                    <p className="break-words">⚡ <strong className="text-[#ff9800]">Quarter-Final 1:</strong> Teams 5, 6, 11, 12</p>
                    <p className="break-words">⚡ <strong className="text-[#ff9800]">Quarter-Final 2:</strong> Teams 7, 8, 9, 10</p>
                    <p className="break-words">⚔️ <strong className="text-[#ff9800]">Semi-Final 1:</strong> QF2 Top 2 + Overall 1, 2</p>
                    <p className="break-words">⚔️ <strong className="text-[#ff9800]">Semi-Final 2:</strong> QF1 Top 2 + Overall 3, 4</p>
                    <p className="break-words">🏆 <strong className="text-[#ff9800]">Final:</strong> Top 2 from each Semi (4 teams)</p>
                  </div>
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-white/70">
                    ⚡ Scoring resets fresh at each playoff stage!
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quarters Tab */}
      {activeTab === "quarters" && (
        <>
          {qfMatches.length === 0 ? (
            <div className="text-center text-white/70 py-12">
              No quarter-finals available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {qfMatches.map((match, idx) => (
                <Card
                  key={match.id}
                  className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30"
                >
                  <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                      <span className="flex-1 truncate">Quarter-Final {idx + 1}</span>
                      <Badge className="bg-purple-500 text-white text-[10px] sm:text-xs flex-shrink-0">
                        Match {match.matchNumber}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    {renderMatchRankings(match, `QF${idx + 1}`)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Semis Tab */}
      {activeTab === "semis" && (
        <>
          {semiMatches.length === 0 ? (
            <div className="text-center text-white/70 py-12">
              No semi-finals available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {semiMatches.map((match, idx) => (
                <Card
                  key={match.id}
                  className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30"
                >
                  <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                      <span className="flex-1 truncate">Semi-Final {idx + 1}</span>
                      <Badge className="bg-orange-500 text-white text-[10px] sm:text-xs flex-shrink-0">
                        Match {match.matchNumber}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    {renderMatchRankings(match, `SF${idx + 1}`)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Finals Tab */}
      {activeTab === "finals" && (
        <>
          {!finalMatch ? (
            <div className="text-center text-white/70 py-12">
              No final available yet.
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/50">
                <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                  <CardTitle className="text-white flex items-center gap-2 sm:gap-3 justify-center text-lg sm:text-2xl flex-wrap">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 flex-shrink-0 animate-pulse" />
                    <span>Grand Finale</span>
                    <Badge className="bg-amber-500 text-white text-xs sm:text-sm flex-shrink-0">
                      Match {finalMatch.matchNumber}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  {renderMatchRankings(finalMatch, "Final")}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
