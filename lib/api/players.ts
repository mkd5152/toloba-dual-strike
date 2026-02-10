/**
 * Players API - CRUD operations for players
 */

import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/types/database"
import type { Player } from "@/lib/types"

type PlayerRow = Database["public"]["Tables"]["players"]["Row"]
type PlayerInsert = Database["public"]["Tables"]["players"]["Insert"]
type PlayerUpdate = Database["public"]["Tables"]["players"]["Update"]

/**
 * Fetch all players for a team
 */
export async function fetchPlayersByTeam(teamId: string): Promise<Player[]> {
  try {
    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", teamId)
      .order("name")

    if (error) throw error

    return (data || []).map(transformPlayerRow)
  } catch (err) {
    console.error("Error fetching players:", err)
    throw new Error(`Failed to fetch players: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Fetch players for multiple teams
 */
export async function fetchPlayersByTeams(teamIds: string[]): Promise<Record<string, Player[]>> {
  try {
    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .in("team_id", teamIds)
      .order("name")

    if (error) throw error

    // Group players by team ID
    const playersByTeam: Record<string, Player[]> = {}
    teamIds.forEach(id => { playersByTeam[id] = [] })

    data?.forEach((row: any) => {
      const player = transformPlayerRow(row)
      if (!playersByTeam[player.teamId]) {
        playersByTeam[player.teamId] = []
      }
      playersByTeam[player.teamId].push(player)
    })

    return playersByTeam
  } catch (err) {
    console.error("Error fetching players by teams:", err)
    throw new Error(`Failed to fetch players: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Create a new player
 */
export async function createPlayer(player: Omit<Player, "id" | "createdAt" | "updatedAt">): Promise<Player> {
  try {
    const playerData: PlayerInsert = {
      id: crypto.randomUUID(),
      team_id: player.teamId,
      name: player.name,
      role: player.role,
      is_late_arrival: player.isLateArrival || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase
      .from("players")
      .insert(playerData)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error("No data returned from insert")

    return transformPlayerRow(data)
  } catch (err) {
    console.error("Error creating player:", err)
    throw new Error(`Failed to create player: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Create multiple players in bulk
 */
export async function createPlayers(players: Omit<Player, "id" | "createdAt" | "updatedAt">[]): Promise<Player[]> {
  try {
    const playersData: PlayerInsert[] = players.map(player => ({
      id: crypto.randomUUID(),
      team_id: player.teamId,
      name: player.name,
      role: player.role,
      is_late_arrival: player.isLateArrival || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase
      .from("players")
      .insert(playersData)
      .select()

    if (error) throw error
    if (!data) throw new Error("No data returned from insert")

    return data.map(transformPlayerRow)
  } catch (err) {
    console.error("Error creating players:", err)
    throw new Error(`Failed to create players: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Update a player
 */
export async function updatePlayer(playerId: string, updates: Partial<Omit<Player, "id" | "teamId" | "createdAt" | "updatedAt">>): Promise<Player> {
  try {
    const playerData: PlayerUpdate = {
      ...(updates.name && { name: updates.name }),
      ...(updates.role && { role: updates.role }),
      updated_at: new Date().toISOString(),
    }

    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase
      .from("players")
      .update(playerData)
      .eq("id", playerId)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error("No data returned from update")

    return transformPlayerRow(data)
  } catch (err) {
    console.error("Error updating player:", err)
    throw new Error(`Failed to update player: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Delete a player
 */
export async function deletePlayer(playerId: string): Promise<void> {
  try {
    // @ts-ignore - Supabase browser client type inference limitation
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", playerId)

    if (error) throw error
  } catch (err) {
    console.error("Error deleting player:", err)
    throw new Error(`Failed to delete player: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Delete all players for a team
 */
export async function deletePlayersByTeam(teamId: string): Promise<void> {
  try {
    // @ts-ignore - Supabase browser client type inference limitation
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("team_id", teamId)

    if (error) throw error
  } catch (err) {
    console.error("Error deleting players:", err)
    throw new Error(`Failed to delete players: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Transform database row to Player type
 */
function transformPlayerRow(row: any): Player {
  return {
    id: row.id,
    teamId: row.team_id,
    name: row.name,
    role: row.role,
    isLateArrival: row.is_late_arrival || false,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}
