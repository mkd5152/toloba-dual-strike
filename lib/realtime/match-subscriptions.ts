/**
 * Real-time subscriptions for live match updates using Supabase Realtime
 */

import { supabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type MatchUpdateCallback = (payload: any) => void;

/**
 * Subscribe to real-time updates for a specific match
 * Listens for changes to matches, innings, and balls tables
 */
export function subscribeToMatch(
  matchId: string,
  onMatchUpdate: MatchUpdateCallback,
  onInningsUpdate: MatchUpdateCallback,
  onBallUpdate: MatchUpdateCallback
): RealtimeChannel {
  const channel = supabase
    .channel(`match:${matchId}`)
    // Listen for match state changes (COMPLETED, LOCKED, etc.)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "matches",
        filter: `id=eq.${matchId}`,
      },
      (payload) => {
        console.log("Real-time: Match updated", payload);
        onMatchUpdate(payload);
      }
    )
    // Listen for innings updates (totalRuns, totalWickets, state changes)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "innings",
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        console.log("Real-time: Innings updated", payload);
        onInningsUpdate(payload);
      }
    )
    // Listen for new balls being recorded
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "balls",
      },
      (payload) => {
        console.log("Real-time: Ball recorded", payload);
        // Need to check if this ball belongs to our match via innings
        onBallUpdate(payload);
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`Real-time: Subscribed to match ${matchId}`);
      } else if (status === "CHANNEL_ERROR") {
        console.error(`Real-time: Error subscribing to match ${matchId}`);
      } else if (status === "TIMED_OUT") {
        console.error(`Real-time: Timeout subscribing to match ${matchId}`);
      }
    });

  return channel;
}

/**
 * Subscribe to all matches in a tournament (for live dashboard)
 */
export function subscribeToTournamentMatches(
  tournamentId: string,
  onMatchUpdate: MatchUpdateCallback
): RealtimeChannel {
  const channel = supabase
    .channel(`tournament:${tournamentId}:matches`)
    .on(
      "postgres_changes",
      {
        event: "*", // ALL events (INSERT, UPDATE, DELETE)
        schema: "public",
        table: "matches",
        filter: `tournament_id=eq.${tournamentId}`,
      },
      (payload) => {
        console.log("Real-time: Tournament match updated", payload);
        onMatchUpdate(payload);
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`Real-time: Subscribed to tournament ${tournamentId} matches`);
      }
    });

  return channel;
}

/**
 * Subscribe to standings changes (when matches complete)
 */
export function subscribeToStandingsUpdates(
  tournamentId: string,
  onStandingsUpdate: () => void
): RealtimeChannel {
  const channel = supabase
    .channel(`tournament:${tournamentId}:standings`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "matches",
        filter: `tournament_id=eq.${tournamentId}`,
      },
      (payload) => {
        // When a match completes, recalculate standings
        if (payload.new?.state === "COMPLETED" || payload.new?.state === "LOCKED") {
          console.log("Real-time: Match completed, updating standings");
          onStandingsUpdate();
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from a channel and clean up
 */
export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
  await supabase.removeChannel(channel);
  console.log("Real-time: Unsubscribed from channel");
}
