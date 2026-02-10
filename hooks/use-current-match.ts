"use client";

import { useEffect, useState } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { useMatchStore } from "@/lib/stores/match-store";
import * as matchesAPI from "@/lib/api/matches";

export function useCurrentMatch(matchId: string | null) {
  const getMatch = useTournamentStore((s) => s.getMatch);
  const setCurrentMatch = useMatchStore((s) => s.setCurrentMatch);
  const currentMatch = useMatchStore((s) => s.currentMatch);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;

    const loadMatch = async () => {
      try {
        // First try to get from store
        let match = getMatch(matchId);

        // If not in store, fetch from database
        if (!match) {
          match = await matchesAPI.fetchMatch(matchId);
        }

        if (match) {
          setCurrentMatch(match);
        }
      } catch (error) {
        console.error("Error loading match:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [matchId, getMatch, setCurrentMatch]);

  return loading ? null : currentMatch;
}
