import { create } from "zustand";
import type { StandingsEntry } from "@/lib/types";
import { useTournamentStore } from "./tournament-store";
import * as standingsAPI from "@/lib/api/standings";

interface StandingsStore {
  standings: StandingsEntry[];
  loading: boolean;
  error: string | null;

  calculateStandings: () => void;
  loadStandings: () => Promise<void>;
}

export const useStandingsStore = create<StandingsStore>((set) => ({
  standings: [],
  loading: false,
  error: null,

  // Calculate standings from local tournament store data
  calculateStandings: () => {
    const { teams, matches } = useTournamentStore.getState();

    const standingsMap = new Map<string, StandingsEntry>();

    teams.forEach((team) => {
      standingsMap.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        matchesPlayed: 0,
        points: 0,
        totalRuns: 0,
        totalDismissals: 0,
        rank: 0,
      });
    });

    matches
      .filter((m) => m.state === "COMPLETED" || m.state === "LOCKED")
      .forEach((match) => {
        match.rankings.forEach((ranking) => {
          const entry = standingsMap.get(ranking.teamId);
          if (entry) {
            entry.matchesPlayed += 1;
            entry.points += ranking.points || 0;
            // Use totalScore (includes bonuses) instead of totalRuns for accurate display
            entry.totalRuns += ranking.totalScore || ranking.totalRuns || 0;
            entry.totalDismissals += ranking.totalDismissals || 0;
          }
        });
      });

    const sorted = Array.from(standingsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.totalRuns !== a.totalRuns) return b.totalRuns - a.totalRuns;
      return a.totalDismissals - b.totalDismissals;
    });

    sorted.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    set({ standings: sorted });
  },

  // Load standings directly from API (calculates from database)
  loadStandings: async () => {
    try {
      set({ loading: true, error: null });
      const { tournament } = useTournamentStore.getState();

      const standings = await standingsAPI.calculateStandings(tournament.id);
      set({ standings, loading: false });
    } catch (err) {
      // Silently ignore abort errors (React Strict Mode unmounting)
      if (err instanceof Error && (err.name === 'AbortError' || err.message?.toLowerCase().includes('abort'))) {
        set({ loading: false });
        return;
      }
      console.error("Error loading standings:", err);
      set({
        error: err instanceof Error ? err.message : "Failed to load standings",
        loading: false
      });
    }
  },
}));
