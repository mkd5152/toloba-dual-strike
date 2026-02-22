/**
 * Playoff Automation API - Automatically create and populate playoff matches
 * NEW STRUCTURE: League (25) → QF (2) → SF (2) → Final (1)
 */

import { supabase } from "@/lib/supabase/client"
import { getOverallStandingsForPlayoffs, getQualifiedTeamsForFinal } from "./qualification"
import { createMatch } from "./matches"
import type { Match } from "@/lib/types"

interface PlayoffStatus {
  leagueCompleted: boolean
  leagueProgress: { completed: number; total: number }
  quarterFinalsCreated: boolean
  quarterFinalsCompleted: boolean
  qfProgress: { completed: number; total: number }
  semiFinalsCreated: boolean
  semiFinalsCompleted: boolean
  semiProgress: { completed: number; total: number }
  finalCreated: boolean
  finalCompleted: boolean
  canGenerateQFs: boolean
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

    // Quarter-final matches (26-27)
    const qfMatches = matches.filter(m => m.stage === "QF")
    const qfCompleted = qfMatches.filter(m =>
      m.state === "COMPLETED" || m.state === "LOCKED"
    )

    // Semi-final matches (28-29)
    const semiMatches = matches.filter(m => m.stage === "SEMI")
    const semiCompleted = semiMatches.filter(m =>
      m.state === "COMPLETED" || m.state === "LOCKED"
    )

    // Final match (30)
    const finalMatches = matches.filter(m => m.stage === "FINAL")
    const finalCompleted = finalMatches.filter(m =>
      m.state === "COMPLETED" || m.state === "LOCKED"
    )

    const leagueAllCompleted = leagueCompleted.length === 25
    const qfAllCompleted = qfCompleted.length === 2
    const semiAllCompleted = semiCompleted.length === 2

    return {
      leagueCompleted: leagueAllCompleted,
      leagueProgress: {
        completed: leagueCompleted.length,
        total: 25
      },
      quarterFinalsCreated: qfMatches.length > 0,
      quarterFinalsCompleted: qfAllCompleted,
      qfProgress: {
        completed: qfCompleted.length,
        total: 2
      },
      semiFinalsCreated: semiMatches.length > 0,
      semiFinalsCompleted: semiAllCompleted,
      semiProgress: {
        completed: semiCompleted.length,
        total: 2
      },
      finalCreated: finalMatches.length > 0,
      finalCompleted: finalCompleted.length > 0,
      canGenerateQFs: leagueAllCompleted && qfMatches.length === 0,
      canGenerateSemis: qfAllCompleted && semiMatches.length === 0,
      canGenerateFinal: semiAllCompleted && finalMatches.length === 0
    }
  } catch (err) {
    console.error("Error getting playoff status:", err)
    throw new Error(`Failed to get playoff status: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Generate Quarter Finals (QF1 and QF2)
 * QF1: Teams ranked 5, 6, 11, 12
 * QF2: Teams ranked 7, 8, 9, 10
 */
export async function generateQuarterFinals(tournamentId: string): Promise<{ qf1: Match; qf2: Match }> {
  try {
    // Check if QFs already exist
    const { data: existingQFs, error: checkError } = await supabase
      .from("matches")
      .select("id")
      .eq("tournament_id", tournamentId)
      .eq("stage", "QF")

    if (checkError) throw checkError

    if (existingQFs && existingQFs.length > 0) {
      throw new Error("Quarter-finals already exist. Cannot generate duplicates.")
    }

    // Get overall standings
    const standings = await getOverallStandingsForPlayoffs(tournamentId)

    // Validate we have at least 12 teams
    if (standings.length < 12) {
      throw new Error(`Not enough teams in standings. Need 12 teams, found ${standings.length}. Ensure all league matches are completed.`)
    }

    // Get the last league match to calculate QF start times
    const { data: lastLeagueMatch, error: leagueError } = await supabase
      .from("matches")
      .select("start_time")
      .eq("tournament_id", tournamentId)
      .eq("stage", "LEAGUE")
      .order("match_number", { ascending: false })
      .limit(1)
      .single()

    if (leagueError) throw leagueError

    if (!lastLeagueMatch) {
      throw new Error("No league matches found. Cannot determine QF start time.")
    }

    // Schedule BOTH QFs at the same time, 40 minutes after the last league match
    const lastMatchTime = new Date((lastLeagueMatch as any).start_time)
    const qfStartTime = new Date(lastMatchTime.getTime() + 40 * 60 * 1000) // +40 minutes

    // QF1: Teams 5, 6, 11, 12 (ranks 5, 6, 11, 12)
    const qf1Teams = [
      standings[4].teamId,  // Rank 5
      standings[5].teamId,  // Rank 6
      standings[10].teamId, // Rank 11
      standings[11].teamId, // Rank 12
    ]

    const qf1 = await createMatch({
      tournamentId,
      matchNumber: 26,
      court: "Court 1",
      startTime: qfStartTime,
      umpireId: null,
      umpireName: null,
      teamIds: qf1Teams as [string, string, string, string],
      state: "CREATED",
      stage: "QF",
      battingOrder: [],
      rankings: [],
    })

    // QF2: Teams 7, 8, 9, 10 (ranks 7, 8, 9, 10)
    const qf2Teams = [
      standings[6].teamId,  // Rank 7
      standings[7].teamId,  // Rank 8
      standings[8].teamId,  // Rank 9
      standings[9].teamId,  // Rank 10
    ]

    const qf2 = await createMatch({
      tournamentId,
      matchNumber: 27,
      court: "Court 2",
      startTime: qfStartTime,
      umpireId: null,
      umpireName: null,
      teamIds: qf2Teams as [string, string, string, string],
      state: "CREATED",
      stage: "QF",
      battingOrder: [],
      rankings: [],
    })

    return {
      qf1: { ...qf1, stage: "QF" } as any,
      qf2: { ...qf2, stage: "QF" } as any
    }
  } catch (err) {
    console.error("Error generating quarter-finals:", err)
    throw new Error(`Failed to generate quarter-finals: ${err instanceof Error ? err.message : "Unknown error"}`)
  }
}

/**
 * Generate Semi-Finals (SF1 and SF2)
 * SF1: Top 2 from QF2 + Overall ranks 1, 2
 * SF2: Top 2 from QF1 + Overall ranks 3, 4
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

    // Fetch completed QF matches
    const { data: qfMatchesData, error: qfError } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .eq("stage", "QF")
      .in("state", ["COMPLETED", "LOCKED"])
      .order("match_number")

    if (qfError) throw qfError

    const qfMatches = (qfMatchesData || []) as any[]

    if (qfMatches.length < 2) {
      throw new Error("Both quarter-finals must be completed before generating semi-finals.")
    }

    // Get QF results
    const qf1Rankings = qfMatches[0]?.rankings as any[] || [] // Match 26
    const qf2Rankings = qfMatches[1]?.rankings as any[] || [] // Match 27

    if (qf1Rankings.length < 2 || qf2Rankings.length < 2) {
      throw new Error("Quarter-finals must have at least 2 teams ranked.")
    }

    // Get overall league standings for top 4
    const overallStandings = await getOverallStandingsForPlayoffs(tournamentId)

    if (overallStandings.length < 4) {
      throw new Error("Need at least 4 teams in overall standings for semi-finals.")
    }

    // Get any QF match to calculate semi start times (both QFs start at same time)
    const anyQFMatch = qfMatches[0] // Use first QF
    const qfTime = new Date(anyQFMatch.start_time)

    // Schedule BOTH SFs at the same time, 40 minutes after the QFs
    const semiStartTime = new Date(qfTime.getTime() + 40 * 60 * 1000) // +40 minutes

    // SF1: QF2 top 2 + Overall 1, 2
    const semi1Teams = [
      qf2Rankings[0].teamId,      // QF2 winner
      qf2Rankings[1].teamId,      // QF2 runner-up
      overallStandings[0].teamId, // Overall rank 1
      overallStandings[1].teamId, // Overall rank 2
    ]

    const semi1 = await createMatch({
      tournamentId,
      matchNumber: 28,
      court: "Court 1",
      startTime: semiStartTime,
      umpireId: null,
      umpireName: null,
      teamIds: semi1Teams as [string, string, string, string],
      state: "CREATED",
      stage: "SEMI",
      battingOrder: [],
      rankings: [],
    })

    // SF2: QF1 top 2 + Overall 3, 4
    const semi2Teams = [
      qf1Rankings[0].teamId,      // QF1 winner
      qf1Rankings[1].teamId,      // QF1 runner-up
      overallStandings[2].teamId, // Overall rank 3
      overallStandings[3].teamId, // Overall rank 4
    ]

    const semi2 = await createMatch({
      tournamentId,
      matchNumber: 29,
      court: "Court 2",
      startTime: semiStartTime,
      umpireId: null,
      umpireName: null,
      teamIds: semi2Teams as [string, string, string, string],
      state: "CREATED",
      stage: "SEMI",
      battingOrder: [],
      rankings: [],
    })

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
 * Generate Final match
 * Final: Top 2 from SF1 + Top 2 from SF2
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

    // Get any semi match to calculate final start time (both semis start at same time)
    const { data: semiMatches, error: semiError } = await supabase
      .from("matches")
      .select("start_time")
      .eq("tournament_id", tournamentId)
      .eq("stage", "SEMI")
      .limit(1)
      .single()

    if (semiError) throw semiError

    if (!semiMatches) {
      throw new Error("No semi-finals found. Cannot determine final start time.")
    }

    // Schedule final 40 minutes after the semis
    const semiTime = new Date((semiMatches as any).start_time)
    const finalStartTime = new Date(semiTime.getTime() + 40 * 60 * 1000) // +40 minutes

    // Final: Semi1-1st, Semi1-2nd, Semi2-1st, Semi2-2nd
    const finalTeams = [
      finalists.semi1[0].teamId,  // SF1 winner
      finalists.semi1[1].teamId,  // SF1 runner-up
      finalists.semi2[0].teamId,  // SF2 winner
      finalists.semi2[1].teamId,  // SF2 runner-up
    ]

    const final = await createMatch({
      tournamentId,
      matchNumber: 30,
      court: "Court 1",
      startTime: finalStartTime,
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
    const overallStandings = await getOverallStandingsForPlayoffs(tournamentId)
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

    // Get QF results if available
    const { data: qfMatchesData, error: qfError } = await supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .eq("stage", "QF")
      .order("match_number")

    const qfMatches = (qfMatchesData || []) as any[]

    const qf1Results = qfMatches[0]?.rankings?.slice(0, 2).map((r: any) => ({
      id: r.teamId,
      name: getTeamName(r.teamId),
      rank: r.rank || 0
    })) || []

    const qf2Results = qfMatches[1]?.rankings?.slice(0, 2).map((r: any) => ({
      id: r.teamId,
      name: getTeamName(r.teamId),
      rank: r.rank || 0
    })) || []

    return {
      league: {
        topFour: overallStandings.slice(0, 4).map(t => ({
          id: t.teamId,
          name: getTeamName(t.teamId),
          rank: t.rank,
          points: t.points
        })),
        qf1Teams: overallStandings.length >= 12 ? [
          overallStandings[4], overallStandings[5], overallStandings[10], overallStandings[11]
        ].map(t => ({ id: t.teamId, name: getTeamName(t.teamId), rank: t.rank, points: t.points })) : [],
        qf2Teams: overallStandings.length >= 10 ? [
          overallStandings[6], overallStandings[7], overallStandings[8], overallStandings[9]
        ].map(t => ({ id: t.teamId, name: getTeamName(t.teamId), rank: t.rank, points: t.points })) : [],
      },
      quarterFinals: {
        qf1: qf1Results,
        qf2: qf2Results,
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
