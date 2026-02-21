"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useTournamentStore } from "@/lib/stores/tournament-store"
import { useStandingsStore } from "@/lib/stores/standings-store"
import { supabase } from "@/lib/supabase/client"
import { fetchMatchesWithDetails } from "@/lib/api/matches"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Trophy, TrendingUp, Zap, Target, Flame, Activity,
  Award, Crosshair, Shield, Sparkles, Radio, Crown
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Match } from "@/lib/types"
import LiveCricketNotifications from "@/components/spectator/live-cricket-notifications"

type NotificationType = "FOUR" | "SIX" | "WICKET"

export default function SpectatorDashboardPage() {
  const { tournament, teams, matches, loadTeams, loadMatches } = useTournamentStore()
  const { standings, loadStandings } = useStandingsStore()
  const [detailedMatches, setDetailedMatches] = useState<Match[]>([])
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)

  // Cricket notifications state
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: NotificationType
    teamName?: string
    message?: string
  }>>([])

  const triggerNotification = useCallback((type: NotificationType, teamName?: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`
    setNotifications(prev => [...prev, { id, type, teamName, message }])

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 4000)
  }, [])

  // Load detailed matches for statistics calculation
  const loadDetailedMatches = useCallback(async () => {
    try {
      console.log("📊 Loading detailed matches...")
      // Small delay to ensure DB transaction has committed
      await new Promise(resolve => setTimeout(resolve, 100))
      const detailed = await fetchMatchesWithDetails(tournament.id)
      console.log("📊 Fetched detailed matches:", detailed.length)

      // Log ball counts for debugging
      let totalBalls = 0
      detailed.forEach(match => {
        match.innings?.forEach(innings => {
          innings.overs?.forEach(over => {
            totalBalls += over.balls?.length || 0
          })
        })
      })
      console.log("📊 Total balls in detailed matches:", totalBalls)

      setDetailedMatches(detailed)
      console.log("📊 State updated with detailed matches")
    } catch (err) {
      console.error("Error loading detailed matches:", err)
    }
  }, [tournament.id])

  // Initial load - fetch data every time component mounts
  useEffect(() => {
    const loadData = async () => {
      await loadTeams()
      await loadMatches()
      await loadStandings()
      await loadDetailedMatches()
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reload detailed matches when regular matches change (real-time updates)
  useEffect(() => {
    if (matches.length > 0) {
      loadDetailedMatches()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches])

  // Enable real-time updates with custom handler
  useEffect(() => {
    if (!tournament.id) return

    const channelMatches = supabase
      .channel(`dashboard:${tournament.id}`)
      // Listen to match changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `tournament_id=eq.${tournament.id}`,
        },
        (payload) => {
          console.log("Dashboard: Match updated via realtime", payload)
          loadMatches()
          loadDetailedMatches()
          // Reload standings when match completes
          const newMatch = payload.new as any
          if (newMatch?.state === "COMPLETED" || newMatch?.state === "LOCKED") {
            loadStandings()
          }
        }
      )
      // Listen to innings updates
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "innings",
        },
        (payload) => {
          console.log("Dashboard: Innings updated via realtime", payload)
          loadDetailedMatches()
        }
      )
      // Listen to ball inserts (scoring)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "balls",
        },
        (payload) => {
          console.log("🏏 Dashboard: Ball INSERT event received!", payload)

          // Trigger cricket notifications for boundaries and wickets
          const ball = payload.new as any
          if (ball) {
            console.log("Ball data:", { runs: ball.runs, isWicket: ball.is_wicket, wicketType: ball.wicket_type })

            if (ball.runs === 6) {
              console.log("Triggering SIX notification")
              triggerNotification("SIX", undefined, "Maximum!")
            } else if (ball.runs === 4) {
              console.log("Triggering FOUR notification")
              triggerNotification("FOUR", undefined, "Boundary!")
            }

            if (ball.is_wicket) {
              const wicketType = ball.wicket_type?.replace(/_/g, ' ') || "Out"
              console.log("Triggering WICKET notification:", wicketType)
              triggerNotification("WICKET", undefined, wicketType)
            }
          }

          // Add delay to ensure innings totals are updated in DB first
          setTimeout(() => {
            loadDetailedMatches()
          }, 300)
        }
      )
      // Listen to ball deletes (undo)
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "balls",
        },
        (payload) => {
          console.log("Dashboard: Ball deleted via realtime", payload)
          // Add delay to ensure innings totals are updated after undo
          setTimeout(() => {
            loadDetailedMatches()
          }, 300)
        }
      )
      .subscribe((status) => {
        console.log("Dashboard: Realtime subscription status:", status)
        if (status === "SUBSCRIBED") {
          setIsRealtimeConnected(true)
          console.log("Dashboard: Real-time updates ACTIVE!")
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setIsRealtimeConnected(false)
          console.error("Dashboard: Real-time connection failed:", status)
        }
      })

    return () => {
      setIsRealtimeConnected(false)
      supabase.removeChannel(channelMatches)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournament.id])

  // Calculate real tournament statistics
  const stats = useMemo(() => {
    console.log("🔢 Stats useMemo recalculating...")
    console.log("🔢 detailedMatches.length:", detailedMatches.length)
    console.log("🔢 matches.length:", matches.length)

    let totalRuns = 0
    let totalWickets = 0
    let totalBalls = 0
    let total4s = 0
    let total6s = 0
    let totalPowerplayRuns = 0
    let totalNormalRuns = 0
    let totalCatches = 0
    let totalRunOuts = 0
    let highestScore = { runs: 0, team: '', match: 0 }
    let lowestScore = { runs: Infinity, team: '', match: 0 }

    // Use detailed matches for statistics (already filtered to COMPLETED/LOCKED/IN_PROGRESS in API)
    // Fall back to regular matches if detailed matches haven't loaded yet
    const completedMatches = detailedMatches.length > 0
      ? detailedMatches
      : matches.filter(m => m.state === "COMPLETED" || m.state === "LOCKED")

    console.log("🔢 Using", completedMatches.length, "matches for stats")

    completedMatches.forEach((match) => {
      // Use rankings for highest/lowest scores (includes bonuses)
      if (match.rankings && match.rankings.length > 0) {
        match.rankings.forEach((ranking) => {
          const teamName = teams.find(t => t.id === ranking.teamId)?.name || 'Unknown'
          const scoreWithBonuses = ranking.totalScore || ranking.totalRuns || 0

          if (scoreWithBonuses > highestScore.runs) {
            highestScore = { runs: scoreWithBonuses, team: teamName, match: match.matchNumber }
          }
          if (scoreWithBonuses < lowestScore.runs && scoreWithBonuses > 0) {
            lowestScore = { runs: scoreWithBonuses, team: teamName, match: match.matchNumber }
          }
        })
      }

      // Calculate stats from innings data
      if (match.innings && match.innings.length > 0) {
        match.innings.forEach((innings) => {
          totalRuns += innings.totalRuns || 0
          totalWickets += innings.totalWickets || 0

          // Calculate other stats from balls
          innings.overs?.forEach((over) => {
            const isPowerplay = over.isPowerplay
            over.balls?.forEach((ball) => {
              totalBalls++
              const ballRuns = ball.effectiveRuns || 0

              if (ball.runs === 4) total4s++
              if (ball.runs === 6) total6s++

              if (isPowerplay) {
                totalPowerplayRuns += ballRuns
              } else {
                totalNormalRuns += ballRuns
              }

              if (ball.isWicket && ball.wicketType === 'CATCH_OUT') totalCatches++
              if (ball.isWicket && ball.wicketType === 'RUN_OUT') totalRunOuts++
            })
          })
        })
      }
    })

    const completedMatchesCount = completedMatches.length
    const liveMatches = matches.filter(m => m.state === "IN_PROGRESS")

    console.log("🔢 Final stats:", {
      total4s,
      total6s,
      totalBalls,
      totalRuns,
      totalWickets,
      completedMatchesCount,
      liveMatchesCount: liveMatches.length
    })

    return {
      totalRuns,
      totalWickets,
      totalBalls,
      total4s,
      total6s,
      totalBoundaries: total4s + total6s,
      boundaryRuns: (total4s * 4) + (total6s * 6),
      totalPowerplayRuns,
      totalNormalRuns,
      totalCatches,
      totalRunOuts,
      highestScore,
      lowestScore: lowestScore.runs === Infinity ? { runs: 0, team: '', match: 0 } : lowestScore,
      completedMatches: completedMatchesCount,
      liveMatches,
      avgRunsPerMatch: completedMatchesCount > 0 ? Math.round(totalRuns / completedMatchesCount) : 0,
      strikeRate: totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(1) : 0,
      wicketsPerMatch: completedMatchesCount > 0 ? (totalWickets / completedMatchesCount).toFixed(1) : 0
    }
  }, [matches, teams, detailedMatches])

  // Top 3 teams for podium
  const podiumTeams = standings.slice(0, 3)

  return (
    <div className="p-4 md:p-8 relative">
      {/* Live Cricket Notifications */}
      <LiveCricketNotifications notifications={notifications} />

      {/* Animated Hero Section with Glassmorphism */}
      <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-8 md:p-12 shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Tournament Logo - Responsive sizing to prevent overlap */}
        <div className="absolute top-0 left-0 bottom-0 z-5 flex items-center pl-2 md:pl-4 lg:pl-6 xl:pl-8">
          <Image
            src="/logos/dual-strike-logo.png"
            alt="Tournament Logo"
            width={400}
            height={400}
            className="object-contain h-12 sm:h-16 md:h-20 lg:h-24 xl:h-40 2xl:h-full w-auto"
            priority
          />
        </div>

        {/* Sponsor Logo - Responsive sizing to prevent overlap */}
        <div className="absolute top-0 right-0 bottom-0 z-5 flex items-center pr-2 md:pr-4 lg:pr-6 xl:pr-8">
          <Image
            src="/logos/sponsor.png"
            alt="Sponsor Logo"
            width={400}
            height={400}
            className="object-contain h-12 sm:h-16 md:h-20 lg:h-24 xl:h-40 2xl:h-full w-auto"
            priority
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Trophy className="w-12 h-12 text-yellow-200 animate-bounce" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
              </div>
            </div>
            {stats.liveMatches.length > 0 && (
              <Badge className="bg-white/20 backdrop-blur-md text-white border-2 border-white/50 font-black text-sm px-4 py-1.5 animate-pulse shadow-lg">
                <Radio className="w-4 h-4 mr-2 inline animate-ping" />
                {stats.liveMatches.length} LIVE NOW
              </Badge>
            )}
            {isRealtimeConnected && (
              <Badge className="bg-green-500/20 backdrop-blur-md text-white border-2 border-green-300/50 font-bold text-xs px-3 py-1.5 shadow-lg">
                <Radio className="w-3 h-3 mr-2 inline" />
                Real-time Updates
              </Badge>
            )}
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-3 drop-shadow-2xl tracking-tight">
            {tournament.name}
          </h1>

          <p className="text-2xl md:text-3xl text-white/95 font-bold italic mb-6 drop-shadow-lg">
            {tournament.tagline}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 px-5 py-3 rounded-2xl shadow-xl">
              <p className="text-white/80 text-xs font-bold mb-1">Tournament Progress</p>
              <p className="text-white font-black text-lg">{stats.completedMatches} / {matches.length} Matches</p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 px-5 py-3 rounded-2xl shadow-xl">
              <p className="text-white/80 text-xs font-bold mb-1">Teams Competing</p>
              <p className="text-white font-black text-lg">{teams.length} Teams</p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 px-5 py-3 rounded-2xl shadow-xl">
              <p className="text-white/80 text-xs font-bold mb-1">Total Runs Scored</p>
              <p className="text-white font-black text-lg">{stats.totalRuns.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Match Alert */}
      {stats.liveMatches.length > 0 && (
        <Link href="/spectator/live">
          <div className="mb-8 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all cursor-pointer group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-white rounded-full animate-ping absolute"></div>
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <div>
                  <h2 className="text-2xl font-black text-white drop-shadow-lg">🔥 LIVE ACTION</h2>
                  <p className="text-white/90 font-bold">{stats.liveMatches.length} match{stats.liveMatches.length > 1 ? 'es' : ''} in progress • Click to watch!</p>
                </div>
              </div>
              <Zap className="w-8 h-8 text-yellow-200 animate-pulse" />
            </div>
          </div>
        </Link>
      )}

      {/* Tournament Statistics Grid - THE MAIN SHOWCASE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Runs */}
        <Card className="border-0 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl hover:shadow-3xl transition-shadow duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Target className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <p className="text-emerald-100 font-bold text-sm mb-2 tracking-wider">TOTAL RUNS</p>
            <p className="text-5xl font-black text-white mb-2 tracking-tight">{stats.totalRuns.toLocaleString()}</p>
            <div className="flex items-center gap-2 text-emerald-100">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-bold">Avg {stats.avgRunsPerMatch}/match</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Wickets */}
        <Card className="border-0 bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl hover:shadow-3xl transition-shadow duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Crosshair className="w-8 h-8 text-white" />
              </div>
              <Flame className="w-5 h-5 text-rose-200" />
            </div>
            <p className="text-rose-100 font-bold text-sm mb-2 tracking-wider">WICKETS TAKEN</p>
            <p className="text-5xl font-black text-white mb-2 tracking-tight">{stats.totalWickets}</p>
            <div className="flex items-center gap-2 text-rose-100">
              <Target className="w-4 h-4" />
              <span className="text-sm font-bold">Avg {stats.wicketsPerMatch}/match</span>
            </div>
          </CardContent>
        </Card>

        {/* Boundaries */}
        <Card className="border-0 bg-gradient-to-br from-purple-500 to-indigo-600 shadow-2xl hover:shadow-3xl transition-shadow duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <Award className="w-5 h-5 text-purple-200" />
            </div>
            <p className="text-purple-100 font-bold text-sm mb-2 tracking-wider">BOUNDARIES</p>
            <p className="text-5xl font-black text-white mb-2 tracking-tight">{stats.totalBoundaries}</p>
            <div className="flex items-center gap-3 text-purple-100">
              <span className="text-sm font-bold">{stats.total4s} Fours</span>
              <span className="text-white/50">•</span>
              <span className="text-sm font-bold">{stats.total6s} Sixes</span>
            </div>
          </CardContent>
        </Card>

        {/* Strike Rate */}
        <Card className="border-0 bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl hover:shadow-3xl transition-shadow duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-amber-200" />
            </div>
            <p className="text-amber-100 font-bold text-sm mb-2 tracking-wider">STRIKE RATE</p>
            <p className="text-5xl font-black text-white mb-2 tracking-tight">{stats.strikeRate}</p>
            <div className="flex items-center gap-2 text-amber-100">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-bold">Runs per 100 balls</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Powerplay & Boundary Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Powerplay Dominance */}
        <Card className="border-0 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600">
            <CardTitle className="text-white font-black text-xl flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              POWERPLAY IMPACT
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-slate-400 font-bold text-sm mb-2">Powerplay Runs</p>
                <p className="text-4xl font-black text-cyan-400 mb-1">{stats.totalPowerplayRuns}</p>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                    style={{ width: `${stats.totalRuns > 0 ? (stats.totalPowerplayRuns / stats.totalRuns) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <p className="text-slate-400 font-bold text-sm mb-2">Normal Overs</p>
                <p className="text-4xl font-black text-emerald-400 mb-1">{stats.totalNormalRuns}</p>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                    style={{ width: `${stats.totalRuns > 0 ? (stats.totalNormalRuns / stats.totalRuns) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
              <p className="text-slate-300 font-bold text-sm">
                ⚡ Powerplay contributed <span className="text-cyan-400 text-lg font-black">{stats.totalRuns > 0 ? ((stats.totalPowerplayRuns / stats.totalRuns) * 100).toFixed(1) : '0'}%</span> of total runs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Boundary Bash */}
        <Card className="border-0 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600">
            <CardTitle className="text-white font-black text-xl flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Zap className="w-6 h-6" />
              </div>
              BOUNDARY BASH
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl border border-blue-500/20">
                <p className="text-blue-400 font-bold text-sm mb-2">FOURS</p>
                <p className="text-5xl font-black text-blue-300 mb-1">{stats.total4s}</p>
                <p className="text-blue-400/70 font-bold text-xs">{stats.total4s * 4} runs</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl border border-red-500/20">
                <p className="text-red-400 font-bold text-sm mb-2">SIXES</p>
                <p className="text-5xl font-black text-red-300 mb-1">{stats.total6s}</p>
                <p className="text-red-400/70 font-bold text-xs">{stats.total6s * 6} runs</p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20">
              <p className="text-slate-300 font-bold text-sm">
                🏏 Boundaries scored <span className="text-orange-400 text-lg font-black">{stats.boundaryRuns}</span> runs (<span className="text-orange-400 font-black">{stats.totalRuns > 0 ? ((stats.boundaryRuns / stats.totalRuns) * 100).toFixed(1) : '0'}%</span> of total)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fielding Excellence & Score Records */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Fielding Stats */}
        <Card className="border-0 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600">
            <CardTitle className="text-white font-black text-xl flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Award className="w-6 h-6" />
              </div>
              FIELDING EXCELLENCE
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl border border-emerald-500/20">
                <div>
                  <p className="text-emerald-400 font-bold text-sm mb-1">CATCHES</p>
                  <p className="text-emerald-300 font-bold text-xs">Brilliant grabs!</p>
                </div>
                <p className="text-5xl font-black text-emerald-300">{stats.totalCatches}</p>
              </div>
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-2xl border border-orange-500/20">
                <div>
                  <p className="text-orange-400 font-bold text-sm mb-1">RUN OUTS</p>
                  <p className="text-orange-300 font-bold text-xs">Direct hits!</p>
                </div>
                <p className="text-5xl font-black text-orange-300">{stats.totalRunOuts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Records */}
        <Card className="border-0 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600">
            <CardTitle className="text-white font-black text-xl flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Trophy className="w-6 h-6" />
              </div>
              SCORING RECORDS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-2xl border-2 border-yellow-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-400 font-black text-sm">HIGHEST SCORE</p>
                </div>
                <p className="text-4xl font-black text-yellow-300 mb-2">{stats.highestScore.runs}</p>
                <p className="text-yellow-400/80 font-bold text-sm">{stats.highestScore.team}</p>
                <p className="text-yellow-400/60 font-bold text-xs">Match {stats.highestScore.match}</p>
              </div>
              <div className="p-5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20">
                <p className="text-blue-400 font-bold text-sm mb-2">LOWEST SCORE</p>
                <p className="text-3xl font-black text-blue-300 mb-2">{stats.lowestScore.runs}</p>
                <p className="text-blue-400/80 font-bold text-sm">{stats.lowestScore.team}</p>
                <p className="text-blue-400/60 font-bold text-xs">Match {stats.lowestScore.match}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Championship Podium */}
      {podiumTeams.length > 0 && (
        <Card className="border-0 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl overflow-hidden mb-8">
          <CardHeader className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500">
            <CardTitle className="text-white font-black text-2xl flex items-center gap-3 justify-center">
              <Crown className="w-8 h-8 text-yellow-200 animate-bounce" />
              CHAMPIONSHIP PODIUM
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row items-end justify-center gap-3 md:gap-4 mb-4 md:mb-8">
              {/* 1st Place - Show first on mobile, center on desktop */}
              {podiumTeams[0] && (
                <div className="w-full md:flex-1 md:max-w-xs md:order-2">
                  <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-t-3xl p-6 md:p-8 text-center border-4 border-yellow-300 relative shadow-2xl">
                    <div className="absolute -top-6 md:-top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-2xl animate-pulse">
                      <Crown className="w-6 h-6 md:w-8 md:h-8 text-yellow-800" />
                    </div>
                    <p className="text-2xl md:text-4xl font-black text-yellow-900 mt-4 md:mt-6 mb-2">{podiumTeams[0].teamName}</p>
                    <p className="text-4xl md:text-6xl font-black text-yellow-900 mb-1">{podiumTeams[0].points}</p>
                    <p className="text-yellow-800 font-bold text-sm md:text-base">POINTS</p>
                  </div>
                  <div className="h-24 md:h-48 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-b-2xl border-4 border-t-0 border-yellow-300"></div>
                </div>
              )}

              {/* 2nd Place */}
              {podiumTeams[1] && (
                <div className="w-full md:flex-1 md:max-w-xs md:order-1">
                  <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-t-3xl p-4 md:p-6 text-center border-4 border-slate-400 relative">
                    <div className="absolute -top-4 md:-top-6 left-1/2 transform -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                      <span className="text-xl md:text-2xl font-black text-slate-700">2</span>
                    </div>
                    <p className="text-xl md:text-3xl font-black text-white mt-3 md:mt-4 mb-2">{podiumTeams[1].teamName}</p>
                    <p className="text-3xl md:text-5xl font-black text-slate-300 mb-1">{podiumTeams[1].points}</p>
                    <p className="text-slate-400 font-bold text-xs md:text-sm">POINTS</p>
                  </div>
                  <div className="h-16 md:h-32 bg-gradient-to-b from-slate-600 to-slate-700 rounded-b-2xl border-4 border-t-0 border-slate-400"></div>
                </div>
              )}

              {/* 3rd Place */}
              {podiumTeams[2] && (
                <div className="w-full md:flex-1 md:max-w-xs md:order-3">
                  <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-t-3xl p-4 md:p-6 text-center border-4 border-orange-400 relative">
                    <div className="absolute -top-4 md:-top-6 left-1/2 transform -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                      <span className="text-xl md:text-2xl font-black text-orange-900">3</span>
                    </div>
                    <p className="text-xl md:text-3xl font-black text-white mt-3 md:mt-4 mb-2">{podiumTeams[2].teamName}</p>
                    <p className="text-3xl md:text-5xl font-black text-orange-200 mb-1">{podiumTeams[2].points}</p>
                    <p className="text-orange-300 font-bold text-xs md:text-sm">POINTS</p>
                  </div>
                  <div className="h-12 md:h-24 bg-gradient-to-b from-orange-600 to-orange-700 rounded-b-2xl border-4 border-t-0 border-orange-400"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Navigation */}
      <div className="grid md:grid-cols-3 gap-6 relative z-10">
        <Link href="/spectator/live" className="block transform hover:scale-105 transition-transform duration-300">
          <Card className="border-0 bg-gradient-to-br from-red-500 to-rose-600 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer group h-full">
            <CardContent className="p-6 text-center">
              <Radio className="w-12 h-12 text-white mx-auto mb-3" />
              <p className="text-white font-black text-xl">LIVE MATCHES</p>
              <p className="text-white/80 font-bold text-sm">Watch the action now!</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/spectator/standings" className="block transform hover:scale-105 transition-transform duration-300">
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer group h-full">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-white mx-auto mb-3" />
              <p className="text-white font-black text-xl">STANDINGS</p>
              <p className="text-white/80 font-bold text-sm">Full leaderboard</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/spectator/groups" className="block transform hover:scale-105 transition-transform duration-300">
          <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer group h-full">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-white mx-auto mb-3" />
              <p className="text-white font-black text-xl">GROUPS</p>
              <p className="text-white/80 font-bold text-sm">Group standings</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(40px, 40px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
