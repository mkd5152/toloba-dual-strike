"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { useStandingsStore } from "@/lib/stores/standings-store";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { StandingsTable } from "@/components/spectator/standings-table";

export default function OrganizerStandingsPage() {
  const { standings, loadStandings, loading } = useStandingsStore();
  const { loadTeams, loadMatches } = useTournamentStore();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      const loadData = async () => {
        await loadTeams();
        await loadMatches();
        await loadStandings();
      };
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <div className="inline-block px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white text-xs font-bold uppercase tracking-wide">
          Leaderboard
        </div>
        <div className="flex items-baseline gap-4">
          <h1 className="text-4xl font-black text-white drop-shadow-lg">Tournament Standings</h1>
          {!loading && standings.length > 0 && (
            <span className="text-xl font-bold text-white/70">
              {standings.length} {standings.length === 1 ? 'Team' : 'Teams'}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white/70 py-12">Loading standings...</div>
      ) : standings.length === 0 ? (
        <div className="text-center text-white/70 py-12">
          No teams found. Please add teams to the tournament!
        </div>
      ) : (
        <Card className="border-2 border-[#0d3944]/10 shadow-lg">
          <div className="overflow-x-auto">
            <StandingsTable standings={standings} />
          </div>
        </Card>
      )}
    </div>
  );
}
