import { create } from "zustand";
import type { StandingsEntry } from "@/lib/types";
import { useTournamentStore } from "./tournament-store";

interface StandingsStore {
  standings: StandingsEntry[];
  calculateStandings: () => void;
}

export const useStandingsStore = create<StandingsStore>((set) => ({
  standings: [],

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
            entry.points += ranking.points;
            entry.totalRuns += ranking.totalRuns;
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
}));
