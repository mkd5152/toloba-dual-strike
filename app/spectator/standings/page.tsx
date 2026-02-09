"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useStandingsStore } from "@/lib/stores/standings-store";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { StandingsTable } from "@/components/spectator/standings-table";

export default function StandingsPage() {
  const { standings, calculateStandings } = useStandingsStore();
  const { teams, initializeDummyData } = useTournamentStore();

  useEffect(() => {
    if (teams.length === 0) {
      initializeDummyData();
    }
    calculateStandings();
  }, [teams.length, initializeDummyData, calculateStandings]);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <div className="inline-block px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] text-xs font-bold uppercase tracking-wide">
          Leaderboard
        </div>
        <h1 className="text-4xl font-black text-white drop-shadow-lg">Tournament Standings</h1>
      </div>

      <Card className="border-2 border-[#0d3944]/10 shadow-lg overflow-hidden">
        <StandingsTable standings={standings} />
      </Card>
    </div>
  );
}
