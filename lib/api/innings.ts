/**
 * Innings API - CRUD operations for innings and overs
 */

import { supabase } from "@/lib/supabase/client";
import type { Innings, Over, InningsState } from "@/lib/types";
import type { Database } from "@/lib/types/database";
import { calculateBowlingTeamsForInnings } from "@/lib/utils/bowling-rotation";

/**
 * Initialize innings for a match after toss
 *
 * Creates 4 innings with proper bowling rotation:
 * - Each team bats for 3 overs
 * - Each of the other 3 teams bowls 1 over during the innings
 */
export async function initializeMatchInnings(
  matchId: string,
  battingOrder: [string, string, string, string],
  teamPlayers: Record<string, { id: string; name: string }[]>
): Promise<Innings[]> {
  try {
    // IMPORTANT: Delete any existing innings for this match first
    // (in case of React Strict Mode double-mounting or user retry)
    const { data: existingInnings, error: fetchError } = await (supabase as any)
      .from("innings")
      .select("id")
      .eq("match_id", matchId);

    if (fetchError) {
      console.warn('Error checking existing innings:', fetchError);
    }

    if (existingInnings && existingInnings.length > 0) {
      const { error: deleteError } = await (supabase as any)
        .from("innings")
        .delete()
        .eq("match_id", matchId);

      if (deleteError) {
        console.error('Error deleting existing innings:', deleteError);
        throw deleteError;
      }
    }

    const innings: Innings[] = [];

    // Create 4 innings (one for each team)
    for (let inningsIdx = 0; inningsIdx < 4; inningsIdx++) {
      const battingTeamId = battingOrder[inningsIdx];
      const battingTeamPlayers = teamPlayers[battingTeamId] || [];

      if (battingTeamPlayers.length < 2) {
        throw new Error(`Team ${battingTeamId} must have at least 2 players`);
      }

      // Calculate which 3 teams bowl during this innings
      const bowlingTeams = calculateBowlingTeamsForInnings(battingOrder, inningsIdx);

      const inningsId = `${matchId}-innings-${inningsIdx + 1}`;

      // Create innings in database
      const inningsData: Database['public']['Tables']['innings']['Insert'] = {
        id: inningsId,
        match_id: matchId,
        team_id: battingTeamId,
        batting_pair: [battingTeamPlayers[0].id, battingTeamPlayers[1].id],
        bowling_team_id: bowlingTeams[0], // First bowling team
        state: inningsIdx === 0 ? "IN_PROGRESS" : "NOT_STARTED",
        powerplay_over: null,
        total_runs: 0,
        total_wickets: 0,
        no_wicket_bonus: false,
        final_score: 0,
      };
      const { error: inningsError } = await (supabase as any).from("innings").insert(inningsData as any);

      if (inningsError) throw inningsError;

      // Create 3 overs for this innings, each bowled by a different team
      const overs: Over[] = [];
      for (let overIdx = 0; overIdx < 3; overIdx++) {
        const bowlingTeamId = bowlingTeams[overIdx];
        const bowlingTeamPlayers = teamPlayers[bowlingTeamId] || [];

        if (bowlingTeamPlayers.length < 2) {
          throw new Error(`Bowling team ${bowlingTeamId} must have at least 2 players`);
        }

        const { data: overData, error: overError } = await (supabase as any)
          .from("overs")
          .insert({
            innings_id: inningsId,
            over_number: overIdx,
            bowler_id: bowlingTeamPlayers[0].id, // Default, can be changed by umpire
            keeper_id: bowlingTeamPlayers[1].id, // Default, can be changed by umpire
            is_powerplay: false,
          } as any)
          .select()
          .single();

        if (overError) throw overError;

        overs.push({
          overNumber: overIdx,
          bowlingTeamId: bowlingTeamId,
          bowlerId: bowlingTeamPlayers[0].id,
          keeperId: bowlingTeamPlayers[1].id,
          balls: [],
          isPowerplay: false,
        } as any);
      }

      innings.push({
        id: inningsId,
        teamId: battingTeamId,
        battingPair: [battingTeamPlayers[0].id, battingTeamPlayers[1].id],
        state: inningsIdx === 0 ? "IN_PROGRESS" : "NOT_STARTED",
        overs,
        powerplayOver: null,
        totalRuns: 0,
        totalWickets: 0,
        noWicketBonus: false,
        finalScore: 0,
      } as any);
    }

    return innings;
  } catch (err) {
    console.error("Error initializing match innings:", err);
    throw new Error(
      `Failed to initialize match innings: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}

/**
 * Update batting pair for an innings
 */
export async function updateBattingPair(
  inningsId: string,
  battingPair: [string, string]
): Promise<void> {
  try {
    const { error } = await (supabase as any)
      .from("innings")
      .update({ batting_pair: battingPair } as any)
      .eq("id", inningsId);

    if (error) throw error;
  } catch (err) {
    console.error("Error updating batting pair:", err);
    throw new Error(
      `Failed to update batting pair: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}

/**
 * Update bowler and keeper for an over
 */
export async function updateOverBowlerKeeper(
  overId: string,
  bowlerId: string,
  keeperId: string
): Promise<void> {
  try {
    const { error } = await (supabase as any)
      .from("overs")
      .update({
        bowler_id: bowlerId,
        keeper_id: keeperId,
      } as any)
      .eq("id", overId);

    if (error) throw error;
  } catch (err) {
    console.error("Error updating over bowler/keeper:", err);
    throw new Error(
      `Failed to update over bowler/keeper: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}

/**
 * Update innings state
 */
export async function updateInningsState(
  inningsId: string,
  state: InningsState
): Promise<void> {
  try {
    const { error } = await (supabase as any).from("innings").update({ state } as any).eq("id", inningsId);

    if (error) throw error;
  } catch (err) {
    console.error("Error updating innings state:", err);
    throw new Error(
      `Failed to update innings state: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}

/**
 * Set powerplay over for an innings
 */
export async function setPowerplayOver(inningsId: string, overNumber: 0 | 1 | 2): Promise<void> {
  try {
    // Update innings powerplay_over field
    const { error: inningsError } = await (supabase as any)
      .from("innings")
      .update({ powerplay_over: overNumber } as any)
      .eq("id", inningsId);

    if (inningsError) throw inningsError;

    // Mark the specific over as powerplay
    const { error: overError } = await (supabase as any)
      .from("overs")
      .update({ is_powerplay: true } as any)
      .eq("innings_id", inningsId)
      .eq("over_number", overNumber);

    if (overError) throw overError;
  } catch (err) {
    console.error("Error setting powerplay over:", err);
    throw new Error(
      `Failed to set powerplay over: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}

/**
 * Fetch innings for a match
 */
export async function fetchMatchInnings(matchId: string): Promise<Innings[]> {
  try {
    // Fetch innings
    const { data: inningsData, error: inningsError } = await (supabase as any)
      .from("innings")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at");

    if (inningsError) throw inningsError;

    // Fetch overs and balls for all innings
    const innings: Innings[] = [];
    for (const inningsRow of inningsData || []) {
      const { data: oversData, error: oversError } = await (supabase as any)
        .from("overs")
        .select("*")
        .eq("innings_id", inningsRow.id)
        .order("over_number");

      if (oversError) throw oversError;

      // Fetch balls for each over
      const overs: Over[] = [];
      for (const overRow of oversData || []) {
        const { data: ballsData, error: ballsError } = await (supabase as any)
          .from("balls")
          .select("*")
          .eq("over_id", overRow.id)
          .order("ball_number");

        if (ballsError) throw ballsError;

        overs.push({
          id: overRow.id, // Include database ID for recording balls
          overNumber: overRow.over_number,
          bowlingTeamId: inningsRow.bowling_team_id,
          bowlerId: overRow.bowler_id || '',
          keeperId: overRow.keeper_id || '',
          balls: (ballsData || []).map((ballRow: any) => ({
            ballNumber: ballRow.ball_number,
            runs: ballRow.runs,
            isWicket: ballRow.is_wicket,
            wicketType: ballRow.wicket_type,
            isNoball: ballRow.is_noball,
            isWide: ballRow.is_wide,
            isFreeHit: ballRow.is_free_hit,
            misconduct: ballRow.misconduct,
            effectiveRuns: ballRow.effective_runs,
            timestamp: new Date(ballRow.timestamp),
          })),
          isPowerplay: overRow.is_powerplay,
        } as any);
      }

      innings.push({
        id: inningsRow.id,
        teamId: inningsRow.team_id,
        battingPair: inningsRow.batting_pair as [string, string],
        state: inningsRow.state as InningsState,
        overs,
        powerplayOver: inningsRow.powerplay_over,
        totalRuns: inningsRow.total_runs,
        totalWickets: inningsRow.total_wickets,
        noWicketBonus: inningsRow.no_wicket_bonus,
        finalScore: inningsRow.final_score,
      } as any);
    }

    return innings;
  } catch (err) {
    // Silently ignore abort errors (React Strict Mode unmounting)
    if (err instanceof Error && (err.name === "AbortError" || err.message.toLowerCase().includes("abort"))) {
      return [];
    }
    console.error("Error fetching match innings:", err);
    throw new Error(
      `Failed to fetch match innings: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}

/**
 * Update innings totals (runs, wickets, score) in the database
 */
export async function updateInningsTotals(
  inningsId: string,
  updates: {
    totalRuns: number;
    totalWickets: number;
    noWicketBonus: boolean;
    finalScore: number;
  }
): Promise<void> {
  try {
    const { error } = await (supabase as any)
      .from("innings")
      .update({
        total_runs: updates.totalRuns,
        total_wickets: updates.totalWickets,
        no_wicket_bonus: updates.noWicketBonus,
        final_score: updates.finalScore,
      } as any)
      .eq("id", inningsId);

    if (error) throw error;
  } catch (err) {
    console.error("Error updating innings totals:", err);
    throw new Error(
      `Failed to update innings totals: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}

/**
 * Complete an innings (set state to COMPLETED and update final score)
 */
export async function completeInnings(inningsId: string, finalScore: number): Promise<void> {
  try {
    const { error } = await (supabase as any)
      .from("innings")
      .update({
        state: "COMPLETED",
        final_score: finalScore,
      } as any)
      .eq("id", inningsId);

    if (error) throw error;
  } catch (err) {
    console.error("Error completing innings:", err);
    throw new Error(
      `Failed to complete innings: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}
