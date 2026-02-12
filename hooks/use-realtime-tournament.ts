/**
 * React hook for real-time tournament-wide updates
 */

import { useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { subscribeToTournamentMatches, subscribeToStandingsUpdates, unsubscribe } from "@/lib/realtime/match-subscriptions";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { useStandingsStore } from "@/lib/stores/standings-store";

interface UseRealtimeTournamentOptions {
  tournamentId: string;
  enabled?: boolean;
  watchMatches?: boolean;
  watchStandings?: boolean;
}

/**
 * Hook to subscribe to real-time updates for all matches in a tournament
 * Use this for dashboard/overview pages
 */
export function useRealtimeTournament({
  tournamentId,
  enabled = true,
  watchMatches = true,
  watchStandings = false,
}: UseRealtimeTournamentOptions) {
  const matchesChannelRef = useRef<RealtimeChannel | null>(null);
  const standingsChannelRef = useRef<RealtimeChannel | null>(null);
  const { loadMatches } = useTournamentStore();
  const { loadStandings } = useStandingsStore();

  useEffect(() => {
    if (!tournamentId || !enabled) {
      return;
    }

    const channels: RealtimeChannel[] = [];

    // Subscribe to match updates
    if (watchMatches) {
      console.log(`Setting up real-time subscription for tournament ${tournamentId} matches`);

      const matchesChannel = subscribeToTournamentMatches(
        tournamentId,
        async (payload) => {
          console.log("Tournament match updated via real-time", payload);

          // Reload all matches when any match changes
          await loadMatches();
        }
      );

      matchesChannelRef.current = matchesChannel;
      channels.push(matchesChannel);
    }

    // Subscribe to standings updates (when matches complete)
    if (watchStandings) {
      console.log(`Setting up real-time subscription for tournament ${tournamentId} standings`);

      const standingsChannel = subscribeToStandingsUpdates(
        tournamentId,
        async () => {
          console.log("Standings need update via real-time");

          // Reload standings when a match completes
          await loadStandings();
        }
      );

      standingsChannelRef.current = standingsChannel;
      channels.push(standingsChannel);
    }

    // Cleanup on unmount
    return () => {
      console.log(`Cleaning up real-time subscriptions for tournament ${tournamentId}`);

      channels.forEach((channel) => {
        unsubscribe(channel);
      });

      matchesChannelRef.current = null;
      standingsChannelRef.current = null;
    };
  }, [tournamentId, enabled, watchMatches, watchStandings, loadMatches, loadStandings]);

  return {
    isMatchesSubscribed: matchesChannelRef.current !== null,
    isStandingsSubscribed: standingsChannelRef.current !== null,
  };
}
