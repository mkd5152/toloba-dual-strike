"use client"

import { useEffect, useRef } from "react"
import { useTournamentStore } from "@/lib/stores/tournament-store"
import { useStandingsStore } from "@/lib/stores/standings-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Trophy, TrendingUp, Zap, Users, Target, Flame,
  Calendar, Clock, ChevronRight
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import Link from "next/link"

export default function SpectatorDashboardPage() {
  const { tournament, teams, matches, loadTeams, loadMatches, loading } = useTournamentStore()
  const { standings, loadStandings } = useStandingsStore()
  const hasLoaded = useRef(false)

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true
      const loadData = async () => {
        await loadTeams()
        await loadMatches()
        await loadStandings()
      }
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Calculate statistics
  const totalMatches = matches.length
  const completedMatches = matches.filter(m => m.state === "COMPLETED" || m.state === "LOCKED").length
  const liveMatches = matches.filter(m => m.state === "IN_PROGRESS")
  const upcomingMatches = matches.filter(m => m.state === "CREATED" || m.state === "READY" || m.state === "TOSS")

  // Top 5 teams for chart
  const top5Teams = standings.slice(0, 5).map(s => ({
    name: s.teamName.split(' ')[0], // First word only for chart
    points: s.points,
    runs: s.totalRuns,
    matches: s.matchesPlayed
  }))

  // Match completion progress
  const progressData = [
    { name: 'Completed', value: completedMatches, color: '#4ade80' },
    { name: 'Live', value: liveMatches.length, color: '#f59e0b' },
    { name: 'Upcoming', value: upcomingMatches.length, color: '#60a5fa' },
  ]

  // Tournament momentum (matches per day simulation)
  const momentumData = [
    { day: 'Day 1', matches: 8 },
    { day: 'Day 2', matches: 10 },
    { day: 'Day 3', matches: 7 },
    { day: 'Today', matches: liveMatches.length + 3 },
  ]

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Hero Section */}
      <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#b71c1c] via-[#c62828] to-[#ff9800] p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="cricket-pattern w-full h-full"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-yellow-300 animate-bounce" />
            <Badge className="bg-yellow-300 text-[#b71c1c] font-black text-sm px-4 py-1 animate-pulse">
              LIVE TOURNAMENT
            </Badge>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-3 drop-shadow-lg">
            {tournament.name}
          </h1>

          <p className="text-2xl text-white/90 font-bold italic mb-6">
            {tournament.tagline}
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl">
              <Users className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-bold">{teams.length} Teams</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl">
              <Flame className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-bold">{liveMatches.length} Live Now</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl">
              <Calendar className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-bold">{completedMatches}/{totalMatches} Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Matches Ticker */}
      {liveMatches.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-[#ff9800] to-[#ffb300] rounded-2xl p-6 shadow-lg animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            <h2 className="text-2xl font-black text-[#0d3944]">LIVE MATCHES</h2>
          </div>

          <div className="grid gap-4">
            {liveMatches.slice(0, 2).map((match) => (
              <Link key={match.id} href={`/spectator/live`}>
                <div className="bg-white rounded-xl p-4 hover:shadow-xl transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-[#0d3944] text-lg">Match {match.matchNumber}</p>
                      <p className="text-gray-600 font-bold">{match.court}</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#ff9800] group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-12 h-12 text-green-600" />
              <div className="text-right">
                <p className="text-4xl font-black text-green-600">{teams.length}</p>
                <p className="text-sm font-bold text-gray-600">Teams</p>
              </div>
            </div>
            <div className="h-2 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 w-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-12 h-12 text-blue-600" />
              <div className="text-right">
                <p className="text-4xl font-black text-blue-600">{totalMatches}</p>
                <p className="text-sm font-bold text-gray-600">Total Matches</p>
              </div>
            </div>
            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 animate-pulse" style={{ width: `${(completedMatches / totalMatches) * 100}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-12 h-12 text-orange-600 animate-pulse" />
              <div className="text-right">
                <p className="text-4xl font-black text-orange-600">{liveMatches.length}</p>
                <p className="text-sm font-bold text-gray-600">Live Now</p>
              </div>
            </div>
            <div className="h-2 bg-orange-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-600 w-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-12 h-12 text-purple-600" />
              <div className="text-right">
                <p className="text-4xl font-black text-purple-600">{upcomingMatches.length}</p>
                <p className="text-sm font-bold text-gray-600">Upcoming</p>
              </div>
            </div>
            <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Top Teams Performance */}
        <Card className="border-2 border-[#0d3944]/10 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#0d3944] to-[#1a4a57] text-white">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#ffb300]" />
              Top 5 Teams Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={top5Teams}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="points" fill="#b71c1c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Match Distribution */}
        <Card className="border-2 border-[#0d3944]/10 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944]">
            <CardTitle className="flex items-center gap-2 font-black">
              <Zap className="w-5 h-5" />
              Tournament Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard & Momentum */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top 10 Leaderboard */}
        <Card className="border-2 border-[#0d3944]/10 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-300" />
              Tournament Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {standings.slice(0, 10).map((team, index) => (
                <div
                  key={team.teamId}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400' : 'bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {team.rank}
                  </div>

                  <div className="flex-1">
                    <p className="font-black text-[#0d3944]">{team.teamName}</p>
                    <p className="text-xs text-gray-600 font-bold">
                      {team.matchesPlayed} matches • {team.totalRuns} runs
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-[#b71c1c]">{team.points}</p>
                    <p className="text-xs text-gray-600 font-bold">points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tournament Momentum */}
        <Card className="border-2 border-[#0d3944]/10 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#0d3944] to-[#1a4a57] text-white">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#ffb300]" />
              Tournament Momentum
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={momentumData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="matches"
                  stroke="#ff9800"
                  strokeWidth={3}
                  dot={{ fill: '#b71c1c', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 p-4 bg-gradient-to-r from-[#ff9800]/10 to-[#ffb300]/10 rounded-lg border-2 border-[#ff9800]/20">
              <p className="text-sm font-bold text-gray-700">
                🔥 Tournament heating up! {liveMatches.length} matches in progress right now!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
