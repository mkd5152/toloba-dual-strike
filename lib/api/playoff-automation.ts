/**
 * Playoff Automation API - Automatically create and populate playoff matches
 */

import { supabase } from "@/lib/supabase/client"
import { getQualifiedTeamsForSemis, getQualifiedTeamsForFinal } from "./qualification"
import { createMatch } from "./matches"
import type { Match } from "@/lib/types"

interface PlayoffStatus {
  leagueCompleted: boolean
  leagueProgress: { completed: number; total: number }
  semiFinalsCreated: boolean
  semiFinalsCompleted: boolean
  semiProgress: { completed: number; total: number }
  finalCreated: boolean
  finalCompleted: boolean
  canGenerateSemis: boolean
  canGenerateFinal: boolean
}

/**
 * Get current playoff status for a tournament
 */
export async function getPlayoffStatus(tournamentId: string): Promise<PlayoffStatus> {
  try {
    // Fetch all matches
    const { data: matchesData, error } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("match_number")

    if (error) throw error

    const matches = (matchesData || []) as any[]

    // League matches (1-25)
    const leagueMatches = matches.filter(m => m.stage === "LEAGUE")
    const leagueCompleted = leagueMatches.filter(m =>
      m.state === "COMPLETED" || m.state === "LOCKED"
    )

    // Semi-final matches (26-27)
    const semiMatches = matches.filter(m => m.stage === "SEMI")
    const semiCompleted = semiMatches.filter(m =>
      m.state === "COMPLETED" || m.state === "LOCKED"
    )

    // Final match (28)
    const finalMatches = matches.filter(m => m.stage === "FINAL")
    const finalCompleted = finalMatches.filter(m =>
      m.state === "COMPLETED" || m.state === "LOCKED"
    )

    const leagueAllCompleted = leagueCompleted.length === 25
    const semiAllCompleted = semiCompleted.length === 2

    return {
      leagueCompleted: leagueAllCompleted,
      leagueProgress: {
        completed: leagueCompleted.length,
        total: 25
      },
      semiFinalsCreated: semiMatches.length > 0,
      semiFinalsCompleted: semiAllCompleted,
      semiProgress: {
        completed: semiCompleted.length,
        total: 2
      },
      finalCreated: finalMatches.length > 0,
      finalCompleted: finalCompleted.length > 0,
      canGenerateSemis: leagueAllCompleted && semiMatches.length === 0,
      canGenerateFinal: semiAllCompleted && finalMatches.length === 0
    }
  } catch (err) {
    console.error("Error getting playoff status:", err)
    throw new Error(`Failed to get playoff status: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Automatically generate semi-final matches with qualified teams
 * Semi 1: G1-1st, G2-2nd, G3-1st, G4-2nd
 * Semi 2: G1-2nd, G2-1st, G3-2nd, G4-1st
 */
export async function generateSemiFinals(tournamentId: string): Promise<{ semi1: Match; semi2: Match }> {
  try {
    // Check if semis already exist
    const { data: existingSemis, error: checkError } = await supabase
      .from("matches")
      .select("id")
      .eq("tournament_id", tournamentId)
      .eq("stage", "SEMI")

    if (checkError) throw checkError

    if (existingSemis && existingSemis.length > 0) {
      throw new Error("Semi-finals already exist. Cannot generate duplicates.")
    }

    // Get qualified teams from each group
    const qualified = await getQualifiedTeamsForSemis(tournamentId)

    // Validate we have enough teams
    if (qualified.group1.length < 2 || qualified.group2.length < 2 ||
        qualified.group3.length < 2 || qualified.group4.length < 2) {
      throw new Error("Not enough teams qualified from each group. Ensure all league matches are completed.")
    }

    // Get tournament details for court/umpire defaults
    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", tournamentId)
      .single()

    if (tournamentError) throw tournamentError

    const now = new Date()
    const defaultCourt = "Court 1"

    // Semi-Final 1: G1-1st, G2-2nd, G3-1st, G4-2nd
    const semi1Teams = [
      qualified.group1[0].teamId,  // G1-1st
      qualified.group2[1].teamId,  // G2-2nd
      qualified.group3[0].teamId,  // G3-1st
      qualified.group4[1].teamId,  // G4-2nd
    ]

    const semi1 = await createMatch({
      tournamentId,
      matchNumber: 26,
      court: defaultCourt,
      startTime: now,
      umpireId: null,
      umpireName: null,
      teamIds: semi1Teams as [string, string, string, string],
      state: "CREATED",
      stage: "SEMI",
      battingOrder: [],
      rankings: [],
    })

    // Semi-Final 2: G1-2nd, G2-1st, G3-2nd, G4-1st
    const semi2Teams = [
      qualified.group1[1].teamId,  // G1-2nd
      qualified.group2[0].teamId,  // G2-1st
      qualified.group3[1].teamId,  // G3-2nd
      qualified.group4[0].teamId,  // G4-1st
    ]

    const semi2 = await createMatch({
      tournamentId,
      matchNumber: 27,
      court: defaultCourt,
      startTime: now,
      umpireId: null,
      umpireName: null,
      teamIds: semi2Teams as [string, string, string, string],
      state: "CREATED",
      stage: "SEMI",
      battingOrder: [],
      rankings: [],
    })

    // Refresh matches to get updated stage
    const { data: updatedSemi1, error: refresh1Error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", semi1.id)
      .single()

    const { data: updatedSemi2, error: refresh2Error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", semi2.id)
      .single()

    if (refresh1Error || refresh2Error) {
      throw new Error("Failed to refresh semi-final matches after creation")
    }

    return {
      semi1: { ...semi1, stage: "SEMI" } as any,
      semi2: { ...semi2, stage: "SEMI" } as any
    }
  } catch (err) {
    console.error("Error generating semi-finals:", err)
    throw new Error(`Failed to generate semi-finals: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Automatically generate final match with qualified teams
 * Final: Top 2 from Semi 1 + Top 2 from Semi 2
 */
export async function generateFinal(tournamentId: string): Promise<Match> {
  try {
    // Check if final already exists
    const { data: existingFinal, error: checkError } = await supabase
      .from("matches")
      .select("id")
      .eq("tournament_id", tournamentId)
      .eq("stage", "FINAL")

    if (checkError) throw checkError

    if (existingFinal && existingFinal.length > 0) {
      throw new Error("Final already exists. Cannot generate duplicate.")
    }

    // Get qualified teams from semis
    const finalists = await getQualifiedTeamsForFinal(tournamentId)

    // Validate we have enough teams
    if (finalists.semi1.length < 2 || finalists.semi2.length < 2) {
      throw new Error("Not enough teams qualified from semi-finals. Ensure both semi-finals are completed.")
    }

    const now = new Date()
    const defaultCourt = "Court 1"

    // Final: Semi1-1st, Semi1-2nd, Semi2-1st, Semi2-2nd
    const finalTeams = [
      finalists.semi1[0].teamId,  // Semi1-1st
      finalists.semi1[1].teamId,  // Semi1-2nd
      finalists.semi2[0].teamId,  // Semi2-1st
      finalists.semi2[1].teamId,  // Semi2-2nd
    ]

    const final = await createMatch({
      tournamentId,
      matchNumber: 28,
      court: defaultCourt,
      startTime: now,
      umpireId: null,
      umpireName: null,
      teamIds: finalTeams as [string, string, string, string],
      state: "CREATED",
      stage: "FINAL",
      battingOrder: [],
      rankings: [],
    })

    return final
  } catch (err) {
    console.error("Error generating final:", err)
    throw new Error(`Failed to generate final: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Get bracket visualization data
 */
export async function getPlayoffBracket(tournamentId: string) {
  try {
    const qualified = await getQualifiedTeamsForSemis(tournamentId)
    const finalists = await getQualifiedTeamsForFinal(tournamentId)
    const status = await getPlayoffStatus(tournamentId)

    // Fetch team names
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("id, name")
      .eq("tournament_id", tournamentId)

    if (teamsError) throw teamsError

    const teams = (teamsData || []) as any[]
    const getTeamName = (teamId: string) => {
      return teams.find((t: any) => t.id === teamId)?.name || teamId
    }

    return {
      league: {
        group1: qualified.group1.slice(0, 2).map(t => ({ id: t.teamId, name: getTeamName(t.teamId), rank: t.rank })),
        group2: qualified.group2.slice(0, 2).map(t => ({ id: t.teamId, name: getTeamName(t.teamId), rank: t.rank })),
        group3: qualified.group3.slice(0, 2).map(t => ({ id: t.teamId, name: getTeamName(t.teamId), rank: t.rank })),
        group4: qualified.group4.slice(0, 2).map(t => ({ id: t.teamId, name: getTeamName(t.teamId), rank: t.rank })),
      },
      semis: {
        semi1: finalists.semi1.map(t => ({ id: t.teamId, name: getTeamName(t.teamId), rank: t.rank })),
        semi2: finalists.semi2.map(t => ({ id: t.teamId, name: getTeamName(t.teamId), rank: t.rank })),
      },
      status,
    }
  } catch (err) {
    console.error("Error getting playoff bracket:", err)
    throw new Error(`Failed to get playoff bracket: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}
