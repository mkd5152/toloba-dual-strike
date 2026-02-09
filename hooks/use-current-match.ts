"use client";

import { useEffect } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { useMatchStore } from "@/lib/stores/match-store";

export function useCurrentMatch(matchId: string | null) {
  const getMatch = useTournamentStore((s) => s.getMatch);
  const setCurrentMatch = useMatchStore((s) => s.setCurrentMatch);
  const currentMatch = useMatchStore((s) => s.currentMatch);

  useEffect(() => {
    if (!matchId) return;
    const match = getMatch(matchId);
    if (match) setCurrentMatch(match);
  }, [matchId, getMatch, setCurrentMatch]);

  return currentMatch;
}
