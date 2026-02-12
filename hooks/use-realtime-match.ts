/**
 * React hook for real-time match updates
 */

import { useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { subscribeToMatch, unsubscribe } from "@/lib/realtime/match-subscriptions";
import { useTournamentStore } from "@/lib/stores/tournament-store";

interface UseRealtimeMatchOptions {
  matchId: string | null;
  enabled?: boolean;
  onMatchUpdate?: () => void;
  onScoreUpdate?: () => void;
}

/**
 * Hook to subscribe to real-time updates for a match
 * Automatically syncs changes to the tournament store
 */
export function useRealtimeMatch({
  matchId,
  enabled = true,
  onMatchUpdate,
  onScoreUpdate,
}: UseRealtimeMatchOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { loadMatches } = useTournamentStore();

  useEffect(() => {
    if (!matchId || !enabled) {
      return;
    }

    console.log(`Setting up real-time subscription for match ${matchId}`);

    const channel = subscribeToMatch(
      matchId,
      // Match update handler
      async (payload) => {
        console.log("Match updated via real-time", payload);

        // Reload matches to get fresh data
        await loadMatches();

        // Call custom callback if provided
        onMatchUpdate?.();
      },
      // Innings update handler
      async (payload) => {
        console.log("Innings updated via real-time", payload);

        // Reload matches to get updated innings data
        await loadMatches();

        // Call score update callback
        onScoreUpdate?.();
      },
      // Ball update handler
      async (payload) => {
        console.log("Ball recorded via real-time", payload);

        // Reload matches to get latest ball data
        await loadMatches();

        // Call score update callback
        onScoreUpdate?.();
      }
    );

    channelRef.current = channel;

    // Cleanup on unmount or when matchId changes
    return () => {
      if (channelRef.current) {
        console.log(`Cleaning up real-time subscription for match ${matchId}`);
        unsubscribe(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [matchId, enabled, loadMatches, onMatchUpdate, onScoreUpdate]);

  return {
    isSubscribed: channelRef.current !== null,
  };
}
