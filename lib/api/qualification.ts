// @ts-nocheck
/**
 * Qualification API - Handle playoff qualification logic
 */

import { supabase } from "@/lib/supabase/client"
import type { StandingsEntry } from "@/lib/types"

/**
 * Get overall standings for all teams (ignoring groups)
 * Used for new playoff qualification system
 */
export async function getOverallStandingsForPlayoffs(tournamentId: string): Promise<StandingsEntry[]> {
  try {
    // Fetch all completed league matches
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .eq("stage", "LEAGUE")
      .in("state", ["COMPLETED", "LOCKED"])

    if (matchesError) throw matchesError

    // Fetch all teams
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("id, name")
      .eq("tournament_id", tournamentId)

    if (teamsError) throw teamsError

    const standingsMap = new Map<string, StandingsEntry>()

    // Initialize standings for all teams
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

    // Process league matches to calculate standings
    matchesData?.forEach((match: any) => {
      const rankings = match.rankings as any[] || []

      rankings.forEach((ranking: any) => {
        const standing = standingsMap.get(ranking.teamId)
        if (standing) {
          const runsToAdd = ranking.totalScore || ranking.totalRuns || 0
          console.log(`📊 Match ${match.match_number}: ${standing.teamName} +${runsToAdd} runs (totalScore: ${ranking.totalScore}, totalRuns: ${ranking.totalRuns})`)
          standing.matchesPlayed++
          standing.points += ranking.points || 0
          standing.totalRuns += runsToAdd
          standing.totalDismissals += ranking.totalDismissals || 0
        }
      })
    })

    // Log final standings before sorting
    console.log("📊 Final Standings (before sorting):")
    Array.from(standingsMap.values()).forEach(s => {
      console.log(`  ${s.teamName}: ${s.totalRuns} runs, ${s.points} points, ${s.matchesPlayed} matches`)
    })

    // Sort all teams by points, then runs, then name
    return Array.from(standingsMap.values())
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.totalRuns !== a.totalRuns) return b.totalRuns - a.totalRuns
        return a.teamName.localeCompare(b.teamName)
      })
      .map((standing, index) => ({
        ...standing,
        rank: index + 1,
      }))
  } catch (err) {
    // Silently ignore abort errors
    if (err instanceof Error && (err.name === 'AbortError' || err.message?.toLowerCase().includes('abort'))) {
      return []
    }
    console.error("Error calculating overall standings:", err)
    throw new Error(`Failed to get overall standings: ${err instanceof Error ? err.message : String(err)}`)
  }
}

/**
 * Get top 2 teams from each group for semifinals
 * @deprecated Use getOverallStandingsForPlayoffs instead
 */
export async function getQualifiedTeamsForSemis(tournamentId: string): Promise<{
  group1: StandingsEntry[]
  group2: StandingsEntry[]
  group3: StandingsEntry[]
  group4: StandingsEntry[]
}> {
  try {
    // Fetch all completed league matches
    // @ts-ignore - Supabase browser client type inference limitation
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .eq("stage", "LEAGUE")
      .in("state", ["COMPLETED", "LOCKED"])

    if (matchesError) throw matchesError

    // Fetch all teams with their groups
    // @ts-ignore - Supabase browser client type inference limitation
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("id, name, group")
      .eq("tournament_id", tournamentId)

    if (teamsError) throw teamsError


    // Calculate standings per group
    const standingsByGroup: Record<number, Map<string, StandingsEntry>> = {
      1: new Map(),
      2: new Map(),
      3: new Map(),
      4: new Map(),
    }

    // Initialize standings for all teams
    teamsData?.forEach((team: any) => {
      const group = team.group as number

      // Skip teams without a group assigned
      if (!group || !standingsByGroup[group]) {
        console.warn(`Team ${team.id} (${team.name}) has no valid group assigned: ${team.group}`)
        return
      }

      standingsByGroup[group].set(team.id, {
        teamId: team.id,
        teamName: team.name,
        matchesPlayed: 0,
        points: 0,
        totalRuns: 0,
        totalDismissals: 0,
        rank: 0,
      })
    })

    // Process league matches to calculate standings
    matchesData?.forEach((match: any) => {
      const rankings = match.rankings as any[] || []

      rankings.forEach((ranking: any) => {
        const team = teamsData?.find((t: any) => t.id === ranking.teamId)
        if (!team) return

        const group = team.group as number
        const standing = standingsByGroup[group]?.get(ranking.teamId)

        if (standing) {
          standing.matchesPlayed++
          standing.points += ranking.points || 0
          standing.totalRuns += ranking.totalScore || ranking.totalRuns || 0
          standing.totalDismissals += ranking.totalDismissals || 0
        }
      })
    })

    // Sort each group and return all teams (not just top 2)
    const getAllTeamsSorted = (groupMap: Map<string, StandingsEntry>): StandingsEntry[] => {
      return Array.from(groupMap.values())
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points
          if (b.totalRuns !== a.totalRuns) return b.totalRuns - a.totalRuns
          return a.teamName.localeCompare(b.teamName)
        })
        .map((standing, index) => ({
          ...standing,
          rank: index + 1,
        }))
    }

    return {
      group1: getAllTeamsSorted(standingsByGroup[1]),
      group2: getAllTeamsSorted(standingsByGroup[2]),
      group3: getAllTeamsSorted(standingsByGroup[3]),
      group4: getAllTeamsSorted(standingsByGroup[4]),
    }
  } catch (err) {
    // Silently ignore abort errors (React Strict Mode unmounting)
    if (err instanceof Error && (err.name === 'AbortError' || err.message?.toLowerCase().includes('abort'))) {
      return {
        group1: [],
        group2: [],
        group3: [],
        group4: [],
      }
    }
    console.error("Error calculating qualified teams:", err)
    throw new Error(`Failed to get qualified teams: ${err instanceof Error ? err.message : String(err)}`)
  }
}

/**
 * Get top 2 teams from each semifinal for finals
 */
export async function getQualifiedTeamsForFinal(tournamentId: string): Promise<{
  semi1: StandingsEntry[]
  semi2: StandingsEntry[]
}> {
  try {
    // Fetch completed semi-final matches
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .eq("stage", "SEMI")
      .in("state", ["COMPLETED", "LOCKED"])
      .order("match_number")

    if (matchesError) throw matchesError

    if (!matchesData || matchesData.length < 2) {
      return { semi1: [], semi2: [] }
    }

    // Fetch team names
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("id, name")
      .eq("tournament_id", tournamentId)

    if (teamsError) throw teamsError

    const getTopTwoFromMatch = (match: any): StandingsEntry[] => {
      const rankings = match.rankings as any[] || []

      return rankings
        .slice(0, 2) // Top 2 teams
        .map((ranking: any, index: number) => {
          const team = teamsData?.find((t: any) => t.id === ranking.teamId)
          return {
            teamId: ranking.teamId,
            teamName: team?.name || ranking.teamId,
            matchesPlayed: 1,
            points: ranking.points || 0,
            totalRuns: ranking.totalScore || ranking.totalRuns || 0,
            totalDismissals: 0,
            rank: index + 1,
          }
        })
    }

    return {
      semi1: getTopTwoFromMatch(matchesData[0]),
      semi2: getTopTwoFromMatch(matchesData[1]),
    }
  } catch (err) {
    console.error("Error getting finalists:", err)
    throw new Error(`Failed to get finalists: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Calculate standings for a specific stage
 */
export async function getStandingsByStage(
  tournamentId: string,
  stage: "LEAGUE" | "SEMI" | "FINAL"
): Promise<StandingsEntry[]> {
  try {
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .eq("stage", stage)
      .in("state", ["COMPLETED", "LOCKED"])

    if (matchesError) throw matchesError

    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("id, name")
      .eq("tournament_id", tournamentId)

    if (teamsError) throw teamsError

    const standingsMap = new Map<string, StandingsEntry>()

    // Process matches
    matchesData?.forEach((match: any) => {
      const rankings = match.rankings as any[] || []

      rankings.forEach((ranking: any) => {
        const team = teamsData?.find((t: any) => t.id === ranking.teamId)
        if (!team) return

        if (!standingsMap.has(ranking.teamId)) {
          standingsMap.set(ranking.teamId, {
            teamId: ranking.teamId,
            teamName: team.name,
            matchesPlayed: 0,
            points: 0,
            totalRuns: 0,
            totalDismissals: 0,
            rank: 0,
          })
        }

        const standing = standingsMap.get(ranking.teamId)!
        standing.matchesPlayed++
        standing.points += ranking.points || 0
        standing.totalRuns += ranking.totalRuns || 0
        standing.totalDismissals += ranking.totalDismissals || 0
      })
    })

    return Array.from(standingsMap.values())
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.totalRuns !== a.totalRuns) return b.totalRuns - a.totalRuns
        return a.teamName.localeCompare(b.teamName)
      })
      .map((standing, index) => ({
        ...standing,
        rank: index + 1,
      }))
  } catch (err) {
    console.error("Error calculating stage standings:", err)
    throw new Error(`Failed to calculate standings: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}
