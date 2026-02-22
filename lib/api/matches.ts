/**
 * Matches API - CRUD operations for matches and ball recording
 */

import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/types/database"
import type { Match, MatchState, MatchStage, MatchRanking } from "@/lib/types"

type MatchRow = Database["public"]["Tables"]["matches"]["Row"]
type MatchInsert = Database["public"]["Tables"]["matches"]["Insert"]
type MatchUpdate = Database["public"]["Tables"]["matches"]["Update"]

/**
 * Retry helper for handling transient errors like timeouts
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      // Check if this is a retryable error (timeout/abort)
      const isRetryable =
        lastError.name === 'AbortError' ||
        lastError.message.toLowerCase().includes('abort') ||
        lastError.message.toLowerCase().includes('timeout')

      if (!isRetryable || attempt === maxRetries) {
        throw lastError
      }

      // Exponential backoff: wait longer between each retry
      const waitTime = delayMs * Math.pow(2, attempt)
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${waitTime}ms...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  throw lastError || new Error('Operation failed after retries')
}

/**
 * Fetch all matches for a tournament with innings data
 */
export async function fetchMatches(tournamentId: string): Promise<Match[]> {
  try {
    // Fetch matches
    // @ts-ignore - Supabase browser client type inference limitation
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("match_number")

    if (matchesError) throw matchesError
    if (!matchesData) return []

    // Fetch all innings for these matches
    const matchIds = matchesData.map((m: any) => m.id)
    const { data: inningsData, error: inningsError } = await supabase
      .from("innings")
      .select("*")
      .in("match_id", matchIds) as any

    if (inningsError) {
      console.warn("Error fetching innings:", inningsError)
    }

    // Transform matches and attach innings
    const matches = matchesData.map((matchRow: any) => {
      const match = transformMatchRow(matchRow)

      // Find innings for this match
      if (inningsData) {
        match.innings = inningsData
          .filter((i: any) => i.match_id === match.id)
          .map((i: any) => ({
            id: i.id,
            matchId: i.match_id,
            teamId: i.team_id,
            battingPair: i.batting_pair || [],
            bowlingTeamId: i.bowling_team_id,
            state: i.state,
            powerplayOver: i.powerplay_over,
            totalRuns: i.total_runs || 0,
            totalWickets: i.total_wickets || 0,
            noWicketBonus: i.no_wicket_bonus || false,
            finalScore: i.final_score || 0,
            overs: [], // Overs can be loaded on-demand if needed
          }))
      }

      return match
    })

    return matches
  } catch (err) {
    // Silently ignore abort errors (React Strict Mode unmounting)
    if (err instanceof Error && err.name === 'AbortError') {
      return []
    }
    // Silently ignore errors with "aborted" message
    if (err instanceof Error && err.message.toLowerCase().includes('abort')) {
      return []
    }
    console.error("Error fetching matches:", err)
    throw new Error(`Failed to fetch matches: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Fetch all matches with full details (innings, overs, balls) for dashboard statistics
 * This is more expensive than fetchMatches() but necessary for boundary/powerplay stats
 */
export async function fetchMatchesWithDetails(tournamentId: string): Promise<Match[]> {
  try {
    // Fetch matches (including IN_PROGRESS for live stats)
    // @ts-ignore - Supabase browser client type inference limitation
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .in("state", ["COMPLETED", "LOCKED", "IN_PROGRESS"]) // Include live matches for real-time stats
      .order("match_number")

    if (matchesError) throw matchesError
    if (!matchesData) return []

    // Fetch all innings for these matches
    const matchIds = matchesData.map((m: any) => m.id)
    const { data: inningsData, error: inningsError } = await supabase
      .from("innings")
      .select("*")
      .in("match_id", matchIds) as any

    if (inningsError) {
      console.warn("Error fetching innings:", inningsError)
    }

    // Fetch all overs for these innings
    const inningsIds = inningsData?.map((i: any) => i.id) || []
    const { data: oversData, error: oversError } = await supabase
      .from("overs")
      .select("*")
      .in("innings_id", inningsIds)
      .order("over_number") as any

    if (oversError) {
      console.warn("Error fetching overs:", oversError)
    }

    // Fetch all balls for these overs
    const overIds = oversData?.map((o: any) => o.id) || []
    const { data: ballsData, error: ballsError } = await supabase
      .from("balls")
      .select("*")
      .in("over_id", overIds)
      .order("ball_number") as any

    if (ballsError) {
      console.warn("Error fetching balls:", ballsError)
    }

    // Transform and nest the data
    const matches = matchesData.map((matchRow: any) => {
      const match = transformMatchRow(matchRow)

      // Find innings for this match
      if (inningsData) {
        match.innings = inningsData
          .filter((i: any) => i.match_id === match.id)
          .map((i: any) => {
            const innings = {
              id: i.id,
              matchId: i.match_id,
              teamId: i.team_id,
              battingPair: i.batting_pair || [],
              bowlingTeamId: i.bowling_team_id,
              state: i.state,
              powerplayOver: i.powerplay_over,
              totalRuns: i.total_runs || 0,
              totalWickets: i.total_wickets || 0,
              noWicketBonus: i.no_wicket_bonus || false,
              finalScore: i.final_score || 0,
              overs: [] as any[],
            }

            // Find overs for this innings
            if (oversData) {
              innings.overs = oversData
                .filter((o: any) => o.innings_id === innings.id)
                .map((o: any) => {
                  const over = {
                    id: o.id,
                    overNumber: o.over_number,
                    bowlingTeamId: o.bowling_team_id,
                    bowlerId: o.bowler_id,
                    keeperId: o.keeper_id,
                    isPowerplay: o.is_powerplay || false,
                    balls: [] as any[],
                  }

                  // Find balls for this over
                  if (ballsData) {
                    over.balls = ballsData
                      .filter((b: any) => b.over_id === over.id)
                      .map((b: any) => ({
                        ballNumber: b.ball_number,
                        runs: b.runs,
                        isWicket: b.is_wicket || false,
                        wicketType: b.wicket_type,
                        fieldingTeamId: b.fielding_team_id,
                        isNoball: b.is_noball || false,
                        isWide: b.is_wide || false,
                        isFreeHit: b.is_free_hit || false,
                        misconduct: b.misconduct || false,
                        effectiveRuns: b.effective_runs || 0,
                        timestamp: new Date(b.timestamp),
                      }))
                  }

                  return over
                })
            }

            return innings
          })
      }

      return match
    })

    return matches
  } catch (err) {
    // Silently ignore abort errors (React Strict Mode unmounting)
    if (err instanceof Error && err.name === 'AbortError') {
      return []
    }
    if (err instanceof Error && err.message.toLowerCase().includes('abort')) {
      return []
    }
    console.error("Error fetching matches with details:", err)
    throw new Error(`Failed to fetch matches with details: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Fetch a single match by ID
 */
export async function fetchMatch(matchId: string): Promise<Match | null> {
  try {
    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      throw error
    }

    return data ? transformMatchRow(data) : null
  } catch (err) {
    // Silently ignore abort errors (React Strict Mode unmounting)
    if (err instanceof Error && (err.name === 'AbortError' || err.message.toLowerCase().includes('abort'))) {
      return null
    }
    console.error("Error fetching match:", err)
    throw new Error(`Failed to fetch match: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Fetch matches assigned to an umpire
 */
export async function fetchUmpireMatches(umpireId: string): Promise<Match[]> {
  try {
    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("umpire_id", umpireId)
      .order("match_number")

    if (error) throw error

    return (data || []).map(transformMatchRow)
  } catch (err) {
    // Silently ignore abort errors (React Strict Mode unmounting)
    if (err instanceof Error && (err.name === 'AbortError' || err.message.toLowerCase().includes('abort'))) {
      return []
    }
    console.error("Error fetching umpire matches:", err)
    throw new Error(`Failed to fetch umpire matches: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Create a new match
 */
export async function createMatch(match: Omit<Match, "id" | "innings" | "lockedAt" | "createdAt" | "updatedAt"> & { tournamentId: string }): Promise<Match> {
  try {
    const matchData: MatchInsert = {
      id: crypto.randomUUID(),
      tournament_id: match.tournamentId,
      match_number: match.matchNumber,
      court: match.court,
      start_time: match.startTime.toISOString(),
      umpire_id: match.umpireId,
      umpire_name: match.umpireName,
      team_ids: match.teamIds,
      state: match.state,
      stage: match.stage || 'LEAGUE', // Include stage parameter
      batting_order: match.battingOrder,
      rankings: match.rankings as any,
      locked_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase.from("matches").insert(matchData).select().single()

    if (error) throw error
    if (!data) throw new Error("No data returned from insert")

    return transformMatchRow(data)
  } catch (err) {
    console.error("Error creating match:", err)
    throw new Error(`Failed to create match: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Bulk create matches
 */
export async function bulkCreateMatches(matches: Omit<Match, "id" | "createdAt" | "updatedAt">[]): Promise<Match[]> {
  try {
    if (matches.length === 0) {
      return []
    }

    const matchesData: MatchInsert[] = matches.map(match => ({
      id: crypto.randomUUID(),
      tournament_id: match.tournamentId,
      match_number: match.matchNumber,
      court: match.court,
      start_time: match.startTime.toISOString(),
      umpire_id: match.umpireId,
      umpire_name: match.umpireName,
      team_ids: match.teamIds,
      state: match.state,
      batting_order: match.battingOrder,
      rankings: match.rankings as any,
      locked_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase.from("matches").insert(matchesData).select()

    if (error) throw error
    if (!data) throw new Error("No data returned from bulk insert")

    return data.map(transformMatchRow)
  } catch (err) {
    console.error("Error bulk creating matches:", err)
    throw new Error(`Failed to bulk create matches: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Update match state
 */
export async function updateMatch(matchId: string, updates: Partial<{
  state: MatchState
  umpireId: string | null
  umpireName: string | null
  battingOrder: string[]
  rankings: MatchRanking[]
  lockedAt: Date | null
}>): Promise<Match> {
  return retryOperation(async () => {
    try {
      const matchData: MatchUpdate = {
        ...(updates.state && { state: updates.state }),
        ...(updates.umpireId !== undefined && { umpire_id: updates.umpireId }),
        ...(updates.umpireName !== undefined && { umpire_name: updates.umpireName }),
        ...(updates.battingOrder && { batting_order: updates.battingOrder }),
        ...(updates.rankings && { rankings: updates.rankings as any }),
        ...(updates.lockedAt !== undefined && { locked_at: updates.lockedAt?.toISOString() || null }),
        updated_at: new Date().toISOString(),
      }

      // @ts-ignore - Supabase browser client type inference limitation
      const { data, error } = await supabase.from("matches").update(matchData).eq("id", matchId).select().single()

      if (error) throw error
      if (!data) throw new Error("No data returned from update")

      return transformMatchRow(data)
    } catch (err) {
      console.error("Error updating match:", err)
      throw new Error(`Failed to update match: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }, 3, 500) // Retry up to 3 times with 500ms initial delay
}

/**
 * Assign umpire to match
 */
export async function assignUmpire(matchId: string, umpireId: string, umpireName: string): Promise<Match> {
  return updateMatch(matchId, {
    umpireId,
    umpireName,
  })
}

/**
 * Update match rankings
 */
export async function updateMatchRankings(matchId: string, rankings: MatchRanking[]): Promise<Match> {
  return updateMatch(matchId, { rankings })
}

/**
 * Lock a match
 */
export async function lockMatch(matchId: string): Promise<Match> {
  return updateMatch(matchId, {
    state: "LOCKED",
    lockedAt: new Date(),
  })
}

/**
 * Delete a match
 */
export async function deleteMatch(matchId: string): Promise<void> {
  try {
    // @ts-ignore - Supabase browser client type inference limitation
    const { error } = await supabase.from("matches").delete().eq("id", matchId)

    if (error) throw error
  } catch (err) {
    console.error("Error deleting match:", err)
    throw new Error(`Failed to delete match: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Transform database row to Match type
 */
function transformMatchRow(row: any): Match {
  // Ensure timestamp is parsed as UTC by appending 'Z' if no timezone info
  const startTimeStr = row.start_time
  const startTime = startTimeStr.endsWith('Z') || startTimeStr.includes('+') || startTimeStr.includes('-')
    ? new Date(startTimeStr)
    : new Date(startTimeStr + 'Z') // Append Z to treat as UTC

  return {
    id: row.id,
    tournamentId: row.tournament_id,
    matchNumber: row.match_number,
    court: row.court,
    startTime,
    umpireId: row.umpire_id,
    umpireName: row.umpire_name,
    teamIds: row.team_ids as [string, string, string, string],
    state: row.state as MatchState,
    stage: (row.stage as MatchStage) || "LEAGUE",
    battingOrder: row.batting_order || [],
    innings: [], // Innings will be loaded separately
    rankings: (row.rankings as any) || [],
    lockedAt: row.locked_at ? new Date(row.locked_at) : null,
  }
}
