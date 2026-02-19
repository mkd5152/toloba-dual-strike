"use client"

import { useEffect, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, AlertCircle, Target, Award } from "lucide-react"
import { getQualifiedTeamsForSemis } from "@/lib/api/qualification"
import { supabase } from "@/lib/supabase/client"
import type { StandingsEntry, Match } from "@/lib/types"

type TabType = "league" | "semis" | "finals"

interface BrandingColors {
  primary: string // e.g., "#b71c1c" or "#ff9800"
  secondary: string // e.g., "#c62828" or "#ffb300"
  primaryLight: string // e.g., "from-[#b71c1c]/10 to-[#c62828]/10"
  primaryBorder: string // e.g., "border-[#b71c1c]/30"
  textColor: string // e.g., "text-white" or "text-[#0d3944]"
}

interface GroupsPlayoffsViewProps {
  branding: BrandingColors
  showPlayoffLink?: boolean // Show "Go to Playoffs page" link in organizer view
}

export function GroupsPlayoffsView({ branding, showPlayoffLink = false }: GroupsPlayoffsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("league")
  const [groupStandings, setGroupStandings] = useState<{
    group1: StandingsEntry[]
    group2: StandingsEntry[]
    group3: StandingsEntry[]
    group4: StandingsEntry[]
  } | null>(null)
  const [semiMatches, setSemiMatches] = useState<Match[]>([])
  const [finalMatch, setFinalMatch] = useState<Match | null>(null)
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasLoaded = useRef(false)

  useEffect(() => {
    loadAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      const standings = await getQualifiedTeamsForSemis("tdst-season-1")
      setGroupStandings(standings)

      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .eq("tournament_id", "tdst-season-1")

      if (teamsError) throw teamsError
      setTeams(teamsData || [])

      const { data: semiData, error: semiError } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", "tdst-season-1")
        .eq("stage", "SEMI")
        .order("match_number")

      if (semiError) throw semiError
      setSemiMatches(semiData || [])

      const { data: finalData, error: finalError } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", "tdst-season-1")
        .eq("stage", "FINAL")
        .single()

      if (!finalError && finalData) {
        setFinalMatch(finalData)
      }
    } catch (err) {
      console.error("Error loading data:", err)
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !groupStandings) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center py-12">
          <div className={`animate-spin w-12 h-12 border-4 border-[${branding.primary}] border-t-transparent rounded-full mx-auto mb-4`}></div>
          <p className="text-white font-bold">Loading group standings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error:</strong> {error}
            <br />
            <button
              onClick={loadAllData}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const getTeamName = (teamId: string) => {
    return teams.find((t) => t.id === teamId)?.name || "Unknown Team"
  }

  const renderMatchRankings = (match: Match) => {
    if (!match.rankings || match.rankings.length === 0) {
      return (
        <div className="text-center py-4 text-base text-white/60">
          {match.state === "COMPLETED" || match.state === "LOCKED"
            ? "No rankings available"
            : "Match not completed yet"}
        </div>
      )
    }

    const sortedRankings = [...match.rankings].sort((a: any, b: any) => a.rank - b.rank)

    return (
      <div className="space-y-2">
        {sortedRankings.map((ranking: any, idx: number) => {
          const teamName = getTeamName(ranking.teamId)
          const isWinner = idx === 0

          return (
            <div
              key={ranking.teamId}
              className={`flex items-center justify-between p-3 rounded-lg border-2 gap-3 ${
                isWinner
                  ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 ${
                    isWinner
                      ? "bg-amber-500 text-white"
                      : "bg-white/20 text-white/70"
                  }`}
                >
                  {ranking.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-base truncate">{teamName}</span>
                    {isWinner && <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-black text-white leading-none mb-1">{ranking.points}</div>
                  <div className="text-xs text-white/60 font-semibold">
                    {ranking.totalRuns}r | {ranking.totalDismissals}w
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <div className={`inline-block px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-[${branding.primary}] to-[${branding.secondary}] ${branding.textColor} text-xs font-bold uppercase tracking-wide`}>
          Tournament Structure
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">Groups & Playoffs</h1>
        <p className="text-base text-white/80 font-medium mt-2">
          View league groups, semi-finals, and finals
        </p>
      </div>

      {/* Tab Navigation - Fully Responsive */}
      <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-lg border border-white/10 w-full sm:w-fit">
        <button
          onClick={() => setActiveTab("league")}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-bold text-sm sm:text-base transition-all flex-1 sm:flex-initial justify-center ${
            activeTab === "league"
              ? `bg-gradient-to-r from-[${branding.primary}] to-[${branding.secondary}] ${branding.textColor} shadow-lg`
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">League</span>
          <span className="sm:hidden">L</span>
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
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>Qualification:</strong> The top 2 teams from each group will advance to the semifinals. <Badge className="bg-green-600 text-white text-xs ml-1">Q</Badge> indicates qualified teams.
            </AlertDescription>
          </Alert>

          {groupStandings && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { groupNum: 1, standings: groupStandings.group1 },
                { groupNum: 2, standings: groupStandings.group2 },
                { groupNum: 3, standings: groupStandings.group3 },
                { groupNum: 4, standings: groupStandings.group4 },
              ].map(({ groupNum, standings }) => (
                <Card key={groupNum} className={`bg-gradient-to-br ${branding.primaryLight} border-2 ${branding.primaryBorder}`}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Users className={`w-5 h-5 text-[${branding.primary}] flex-shrink-0`} />
                      <span className="flex-1">Group {groupNum}</span>
                      <Badge className={`bg-[${branding.primary}] ${branding.textColor} text-xs flex-shrink-0`}>
                        {standings.length} teams
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="space-y-2">
                      {standings.map((team, idx) => {
                        const isQualified = idx < 2

                        return (
                          <div
                            key={team.teamId}
                            className={`flex items-center justify-between p-3 rounded-lg border-2 gap-3 ${
                              isQualified
                                ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500"
                                : "bg-white/5 border-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 ${
                                  isQualified
                                    ? "bg-green-500 text-white"
                                    : "bg-white/20 text-white/70"
                                }`}
                              >
                                {team.rank}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-bold text-base truncate">{team.teamName}</span>
                                  {isQualified && (
                                    <Badge className="bg-green-600 text-white text-xs flex-shrink-0">Q</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <div className="text-right">
                                <div className="text-2xl font-black text-white leading-none mb-1">{team.points}</div>
                                <div className="text-xs text-white/60 font-semibold">
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
              ))}
            </div>
          )}

          {groupStandings && (
            <div className={`mt-6 p-5 bg-gradient-to-r from-[#0d3944] to-[#1a4a57] rounded-lg border-2 border-[${branding.primary}]`}>
              <div className="flex items-start gap-3">
                <Trophy className={`w-6 h-6 text-[${branding.primary}] mt-1 flex-shrink-0`} />
                <div className="min-w-0">
                  <h3 className="text-xl font-black text-white mb-2">Playoff Format</h3>
                  <div className="space-y-1.5 text-base text-white/90 font-medium">
                    <p className="break-words">⚔️ <strong className={`text-[${branding.primary}]`}>Semi-Final 1:</strong> G1-1st, G2-2nd, G3-1st, G4-2nd</p>
                    <p className="break-words">⚔️ <strong className={`text-[${branding.primary}]`}>Semi-Final 2:</strong> G1-2nd, G2-1st, G3-2nd, G4-1st</p>
                    <p className="break-words">🏆 <strong className={`text-[${branding.primary}]`}>Final:</strong> Top 2 from each semi (4 teams)</p>
                  </div>
                  <p className="mt-3 text-sm text-white/70">
                    ⚡ Scoring resets fresh at each stage - League points don't carry over!
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Semis Tab */}
      {activeTab === "semis" && (
        <>
          {semiMatches.length === 0 ? (
            <Alert className="bg-orange-50 border-orange-200">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <AlertDescription className="text-orange-800 text-sm">
                <strong>No Semi-Finals Yet</strong> — Semi-finals will be created once all 25 league matches are completed.
                {showPlayoffLink && (
                  <>
                    {" "}Go to the <strong>Playoffs</strong> page to generate them automatically.
                  </>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {semiMatches.map((match, idx) => (
                <Card key={match.id} className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30">
                  <CardHeader className="p-4 pb-3">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Target className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="flex-1">Semi-Final {idx + 1}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {renderMatchRankings(match)}
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
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <AlertDescription className="text-amber-800 text-sm">
                <strong>No Final Yet</strong> — The final will be created once both semi-finals are completed.
                {showPlayoffLink && (
                  <>
                    {" "}Go to the <strong>Playoffs</strong> page to generate it automatically.
                  </>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="max-w-3xl mx-auto">
              <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/50">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-white flex items-center gap-3 justify-center text-2xl">
                    <Trophy className="w-8 h-8 text-amber-500 flex-shrink-0" />
                    <span>Grand Final</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {renderMatchRankings(finalMatch)}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
