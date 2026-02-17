/**
 * Standings API - Calculate and fetch tournament standings
 */

import { supabase } from "@/lib/supabase/client"
import type { StandingsEntry, Match } from "@/lib/types"

/**
 * Calculate standings from matches
 */
export async function calculateStandings(tournamentId: string): Promise<StandingsEntry[]> {
  try {
    // Fetch all completed and locked matches
    // @ts-ignore - Supabase browser client type inference limitation
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .in("state", ["COMPLETED", "LOCKED"])

    if (matchesError) throw matchesError

    // Fetch all teams
    // @ts-ignore - Supabase browser client type inference limitation
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("id, name")
      .eq("tournament_id", tournamentId)

    if (teamsError) throw teamsError

    // Initialize standings map
    const standingsMap = new Map<string, StandingsEntry>()

    teamsData?.forEach((team: any) => {
      standingsMap.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        matchesPlayed: 0,
        points: 0,
        totalRuns: 0,
        totalDismissals: 0,
        rank: 0,
      })
    })

    // Process each match's rankings
    matchesData?.forEach((match: any) => {
      const rankings = match.rankings as any[] || []

      rankings.forEach((ranking: any) => {
        const standing = standingsMap.get(ranking.teamId)
        if (standing) {
          standing.matchesPlayed++
          standing.points += ranking.points || 0
          // Use totalScore (includes bonuses) instead of totalRuns for accurate display
          standing.totalRuns += ranking.totalScore || ranking.totalRuns || 0
          // totalDismissals would come from innings data if available
        }
      })
    })

    // Convert to array and sort
    const standings = Array.from(standingsMap.values())
      .sort((a, b) => {
        // Sort by points (descending), then total runs (descending)
        if (b.points !== a.points) return b.points - a.points
        if (b.totalRuns !== a.totalRuns) return b.totalRuns - a.totalRuns
        return a.teamName.localeCompare(b.teamName)
      })
      .map((standing, index) => ({
        ...standing,
        rank: index + 1,
      }))

    return standings
  } catch (err) {
    // Silently ignore abort errors (React Strict Mode unmounting)
    if (err instanceof Error && (err.name === 'AbortError' || err.message.toLowerCase().includes('abort'))) {
      return []
    }
    console.error("Error calculating standings:", err)
    throw new Error(`Failed to calculate standings: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Get top N teams
 */
export async function getTopTeams(tournamentId: string, limit: number = 3): Promise<StandingsEntry[]> {
  const standings = await calculateStandings(tournamentId)
  return standings.slice(0, limit)
}

/**
 * Get team's current rank
 */
export async function getTeamRank(tournamentId: string, teamId: string): Promise<number | null> {
  const standings = await calculateStandings(tournamentId)
  const team = standings.find(s => s.teamId === teamId)
  return team?.rank || null
}
