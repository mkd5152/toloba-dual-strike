/**
 * Teams API - CRUD operations for teams
 */

import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/types/database"
import type { Team } from "@/lib/types"

type TeamRow = Database["public"]["Tables"]["teams"]["Row"]
type TeamInsert = Database["public"]["Tables"]["teams"]["Insert"]
type TeamUpdate = Database["public"]["Tables"]["teams"]["Update"]

/**
 * Fetch all teams for a tournament
 */
export async function fetchTeams(tournamentId: string): Promise<Team[]> {
  try {
    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("name")

    if (error) throw error

    // Transform database rows to Team type
    return (data || []).map(transformTeamRow)
  } catch (err) {
    console.error("Error fetching teams:", err)
    throw new Error(`Failed to fetch teams: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Fetch a single team by ID
 */
export async function fetchTeam(teamId: string): Promise<Team | null> {
  try {
    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      throw error
    }

    return data ? transformTeamRow(data) : null
  } catch (err) {
    console.error("Error fetching team:", err)
    throw new Error(`Failed to fetch team: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Create a new team
 */
export async function createTeam(team: Omit<Team, "id" | "createdAt" | "updatedAt">): Promise<Team> {
  try {
    const teamData: TeamInsert = {
      id: crypto.randomUUID(),
      tournament_id: team.tournamentId,
      name: team.name,
      color: team.color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase
      .from("teams")
      .insert(teamData)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error("No data returned from insert")

    return transformTeamRow(data)
  } catch (err) {
    console.error("Error creating team:", err)
    throw new Error(`Failed to create team: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Update a team
 */
export async function updateTeam(teamId: string, updates: Partial<Omit<Team, "id" | "createdAt" | "updatedAt">>): Promise<Team> {
  try {
    const teamData: TeamUpdate = {
      ...(updates.name && { name: updates.name }),
      ...(updates.color && { color: updates.color }),
      updated_at: new Date().toISOString(),
    }

    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase
      .from("teams")
      .update(teamData)
      .eq("id", teamId)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error("No data returned from update")

    return transformTeamRow(data)
  } catch (err) {
    console.error("Error updating team:", err)
    throw new Error(`Failed to update team: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Delete a team
 */
export async function deleteTeam(teamId: string): Promise<void> {
  try {
    // @ts-ignore - Supabase browser client type inference limitation
    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", teamId)

    if (error) throw error
  } catch (err) {
    console.error("Error deleting team:", err)
    throw new Error(`Failed to delete team: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Transform database row to Team type
 */
function transformTeamRow(row: any): Team {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    name: row.name,
    color: row.color,
    players: [], // Players will be loaded separately
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}
