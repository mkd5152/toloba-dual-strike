"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { useStandingsStore } from "@/lib/stores/standings-store";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { StandingsTable } from "@/components/spectator/standings-table";
import { useRealtimeTournament } from "@/hooks/use-realtime-tournament";
import { Radio } from "lucide-react";

export default function StandingsPage() {
  const { standings, loadStandings, loading } = useStandingsStore();
  const { loadTeams, loadMatches, tournament } = useTournamentStore();
  const hasLoaded = useRef(false);

  // Enable real-time standings updates when matches complete
  const { isStandingsSubscribed } = useRealtimeTournament({
    tournamentId: tournament.id,
    enabled: true,
    watchMatches: false,
    watchStandings: true,
  });

  useEffect(() => {
    // Always reload standings when navigating to this page
    const loadData = async () => {
      if (!hasLoaded.current) {
        hasLoaded.current = true;
        await loadTeams();
        await loadMatches();
      }
      // Always reload standings to get latest updates
      await loadStandings();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <div className="inline-block px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] text-xs font-bold uppercase tracking-wide">
          Leaderboard
        </div>
        <div className="flex items-baseline gap-4 flex-wrap">
          <h1 className="text-4xl font-black text-white drop-shadow-lg">Tournament Standings</h1>
          {!loading && standings.length > 0 && (
            <span className="text-xl font-bold text-white/70">
              {standings.length} {standings.length === 1 ? 'Team' : 'Teams'}
            </span>
          )}
          {isStandingsSubscribed && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold animate-pulse">
              <Radio className="w-3 h-3" />
              Live Updates
            </div>
          )}
        </div>
      </div>

      {standings.length === 0 ? (
        loading ? (
          <div className="text-center text-white/70 py-12">Loading standings...</div>
        ) : (
          <div className="text-center text-white/70 py-12">
            No teams found. Please add teams to the tournament!
          </div>
        )
      ) : (
        <Card className="border-2 border-[#0d3944]/10 shadow-lg">
          <div className="overflow-x-auto">
            <StandingsTable standings={standings} />
            {loading && (
              <div className="text-center text-white/70 py-2 text-sm opacity-70">
                Updating...
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
