/**
 * Matches API - CRUD operations for matches and ball recording
 */

import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/types/database"
import type { Match, MatchState, MatchRanking } from "@/lib/types"

type MatchRow = Database["public"]["Tables"]["matches"]["Row"]
type MatchInsert = Database["public"]["Tables"]["matches"]["Insert"]
type MatchUpdate = Database["public"]["Tables"]["matches"]["Update"]

/**
 * Fetch all matches for a tournament
 */
export async function fetchMatches(tournamentId: string): Promise<Match[]> {
  try {
    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("match_number")

    if (error) throw error

    return (data || []).map(transformMatchRow)
  } catch (err) {
    console.error("Error fetching matches:", err)
    throw new Error(`Failed to fetch matches: ${err instanceof Error ? err.message : "Unknown error"}`)
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
    console.error("Error fetching umpire matches:", err)
    throw new Error(`Failed to fetch umpire matches: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Create a new match
 */
export async function createMatch(match: Omit<Match, "id" | "innings" | "lockedAt">): Promise<Match> {
  try {
    const matchData: MatchInsert = {
      id: crypto.randomUUID(),
      tournament_id: match.matchNumber.toString(), // Will be replaced with actual tournament ID
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
  return {
    id: row.id,
    matchNumber: row.match_number,
    court: row.court,
    startTime: new Date(row.start_time),
    umpireId: row.umpire_id,
    umpireName: row.umpire_name,
    teamIds: row.team_ids as [string, string, string, string],
    state: row.state as MatchState,
    battingOrder: row.batting_order || [],
    innings: [], // Innings will be loaded separately
    rankings: (row.rankings as any) || [],
    lockedAt: row.locked_at ? new Date(row.locked_at) : null,
  }
}
