"use client"

import { useEffect, useState } from "react"
import { useTournamentStore } from "@/lib/stores/tournament-store"
import { useStandingsStore } from "@/lib/stores/standings-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Trophy, Flame, CheckCircle, Clock, Zap
} from "lucide-react"
import Link from "next/link"

export default function TournamentBracketPage() {
  const { tournament, teams, matches, initializeDummyData } = useTournamentStore()
  const { standings, calculateStandings } = useStandingsStore()

  useEffect(() => {
    if (teams.length === 0) {
      initializeDummyData()
    }
    calculateStandings()
  }, [teams.length, initializeDummyData, calculateStandings])

  // Group matches by round/stage (simplified for demo)
  const totalMatches = matches.length
  const matchesPerRound = 4 // Assuming 4 matches per round for visualization

  const rounds = []
  for (let i = 0; i < totalMatches; i += matchesPerRound) {
    rounds.push(matches.slice(i, i + matchesPerRound))
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case "COMPLETED":
      case "LOCKED":
        return "bg-green-100 border-green-400 text-green-800"
      case "IN_PROGRESS":
        return "bg-orange-100 border-orange-400 text-orange-800 animate-pulse"
      default:
        return "bg-gray-100 border-gray-300 text-gray-600"
    }
  }

  const getStateIcon = (state: string) => {
    switch (state) {
      case "COMPLETED":
      case "LOCKED":
        return <CheckCircle className="w-4 h-4" />
      case "IN_PROGRESS":
        return <Flame className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getTeamById = (teamId: string) => {
    return teams.find((t) => t.id === teamId)
  }

  const getWinningTeam = (match: any) => {
    if (match.state !== "COMPLETED" && match.state !== "LOCKED") return null
    if (match.rankings.length === 0) return null
    const topTeam = match.rankings[0]
    return getTeamById(topTeam.teamId)
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Hero Section */}
      <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d3944] via-[#1a4a57] to-[#b71c1c] p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="w-full h-full bg-[url('/patterns/cricket.svg')] bg-repeat"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-yellow-300 animate-bounce" />
            <Badge className="bg-yellow-300 text-[#b71c1c] font-black text-sm px-4 py-1">
              TOURNAMENT BRACKET
            </Badge>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-3 drop-shadow-lg">
            {tournament.name}
          </h1>

          <p className="text-2xl text-white/90 font-bold italic">
            Complete Tournament Structure
          </p>
        </div>
      </div>

      {/* Top 3 Podium */}
      {standings.length >= 3 && (
        <Card className="mb-8 border-2 border-yellow-400 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
            <CardTitle className="flex items-center gap-2 text-2xl font-black">
              <Trophy className="w-6 h-6" />
              Current Top 3
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              <div className="order-2 md:order-1">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-xl">
                    <span className="text-4xl font-black text-gray-700">2</span>
                  </div>
                  <h3 className="text-xl font-black text-[#0d3944] mb-2">
                    {standings[1].teamName}
                  </h3>
                  <p className="text-3xl font-black text-[#b71c1c]">
                    {standings[1].points} pts
                  </p>
                  <p className="text-gray-600 font-bold">
                    {standings[1].totalRuns} runs • {standings[1].matchesPlayed} matches
                  </p>
                </div>
              </div>

              {/* 1st Place */}
              <div className="order-1 md:order-2">
                <div className="text-center relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Zap className="w-8 h-8 text-yellow-500 animate-bounce" />
                  </div>
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl ring-4 ring-yellow-300">
                    <Trophy className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-[#0d3944] mb-2">
                    {standings[0].teamName}
                  </h3>
                  <p className="text-4xl font-black text-[#b71c1c]">
                    {standings[0].points} pts
                  </p>
                  <p className="text-gray-600 font-bold">
                    {standings[0].totalRuns} runs • {standings[0].matchesPlayed} matches
                  </p>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="order-3">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl">
                    <span className="text-4xl font-black text-white">3</span>
                  </div>
                  <h3 className="text-xl font-black text-[#0d3944] mb-2">
                    {standings[2].teamName}
                  </h3>
                  <p className="text-3xl font-black text-[#b71c1c]">
                    {standings[2].points} pts
                  </p>
                  <p className="text-gray-600 font-bold">
                    {standings[2].totalRuns} runs • {standings[2].matchesPlayed} matches
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tournament Rounds */}
      <div className="space-y-8">
        {rounds.map((roundMatches, roundIndex) => (
          <Card key={roundIndex} className="border-2 border-[#0d3944]/10 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#0d3944] to-[#1a4a57] text-white">
              <CardTitle className="text-xl font-black">
                Round {roundIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {roundMatches.map((match) => {
                  const winningTeam = getWinningTeam(match)
                  const matchTeams = match.teamIds.map(getTeamById).filter(Boolean)

                  return (
                    <Link key={match.id} href="/spectator/live">
                      <div
                        className={`p-6 border-2 rounded-xl transition-all hover:shadow-xl cursor-pointer ${getStateColor(match.state)}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            {getStateIcon(match.state)}
                            <span className="font-black text-lg">Match {match.matchNumber}</span>
                          </div>
                          <Badge variant="outline" className="font-bold">
                            {match.court}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {matchTeams.map((team) => {
                            const teamRanking = match.rankings.find((r) => r.teamId === team?.id)
                            const isWinner = winningTeam?.id === team?.id

                            return (
                              <div
                                key={team?.id}
                                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                                  isWinner
                                    ? "bg-yellow-100 border-2 border-yellow-400"
                                    : "bg-white/50"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isWinner && (
                                    <Trophy className="w-4 h-4 text-yellow-600" />
                                  )}
                                  <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: team?.color }}
                                  />
                                  <span className={`font-bold ${isWinner ? "text-yellow-900" : ""}`}>
                                    {team?.name}
                                  </span>
                                </div>

                                {teamRanking && (
                                  <div className="text-right">
                                    <p className="font-black text-lg">
                                      {teamRanking.totalRuns} runs
                                    </p>
                                    <p className="text-xs font-bold opacity-70">
                                      {teamRanking.points} pts
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {match.state === "IN_PROGRESS" && (
                          <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-center font-bold animate-pulse">
                              🔴 LIVE NOW
                            </p>
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
