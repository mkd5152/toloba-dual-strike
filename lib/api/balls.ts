/**
 * Balls API - CRUD operations for ball-by-ball scoring
 */

import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";
import type { Ball } from "@/lib/types";

type BallInsert = Database["public"]["Tables"]["balls"]["Insert"];

/**
 * Record a ball to the database
 */
export async function recordBall(
  overId: string,
  ball: Ball
): Promise<void> {
  try {
    const ballData: any = {
      id: crypto.randomUUID(),
      over_id: overId,
      ball_number: ball.ballNumber,
      runs: ball.runs,
      is_wicket: ball.isWicket,
      wicket_type: ball.wicketType,
      fielding_team_id: ball.fieldingTeamId || null,
      is_noball: ball.isNoball,
      is_wide: ball.isWide,
      is_free_hit: ball.isFreeHit,
      misconduct: ball.misconduct,
      effective_runs: ball.effectiveRuns,
      timestamp: ball.timestamp.toISOString(),
    };

    // @ts-ignore - Supabase browser client type inference limitation
    const { error } = await supabase.from("balls").insert(ballData);

    if (error) throw error;
  } catch (err) {
    console.error("Error recording ball:", err);
    throw new Error(
      `Failed to record ball: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}

/**
 * Fetch balls for an over
 */
export async function fetchBallsForOver(overId: string): Promise<Ball[]> {
  try {
    // @ts-ignore - Supabase browser client type inference limitation
    const { data, error } = await supabase
      .from("balls")
      .select("*")
      .eq("over_id", overId)
      .order("ball_number");

    if (error) throw error;

    return (data || []).map((row: any) => ({
      ballNumber: row.ball_number,
      runs: row.runs,
      isWicket: row.is_wicket,
      wicketType: row.wicket_type,
      fieldingTeamId: row.fielding_team_id || undefined,
      isNoball: row.is_noball,
      isWide: row.is_wide,
      isFreeHit: row.is_free_hit,
      misconduct: row.misconduct,
      effectiveRuns: row.effective_runs,
      timestamp: new Date(row.timestamp),
    }));
  } catch (err) {
    console.error("Error fetching balls for over:", err);
    throw new Error(
      `Failed to fetch balls: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}

/**
 * Delete the last ball from an over (for undo functionality)
 */
export async function deleteLastBall(overId: string): Promise<void> {
  try {
    // Get the last ball
    // @ts-ignore
    const { data: balls, error: fetchError } = await supabase
      .from("balls")
      .select("*")
      .eq("over_id", overId)
      .order("ball_number", { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;
    if (!balls || balls.length === 0) return; // No balls to delete

    const lastBall = balls[0] as any;

    // Delete it
    // @ts-ignore
    const { error: deleteError } = await supabase
      .from("balls")
      .delete()
      .eq("id", lastBall.id);

    if (deleteError) throw deleteError;
  } catch (err) {
    console.error("Error deleting last ball:", err);
    throw new Error(
      `Failed to delete last ball: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}
