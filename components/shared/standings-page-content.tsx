"use client";

import { useEffect } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { FancyStandingsView } from "@/components/spectator/fancy-standings-view";
import { useRealtimeTournament } from "@/hooks/use-realtime-tournament";
import { Radio } from "lucide-react";

interface StandingsPageContentProps {
  badgeColorFrom: string;
  badgeColorTo: string;
  badgeTextColor: string;
}

export function StandingsPageContent({
  badgeColorFrom,
  badgeColorTo,
  badgeTextColor,
}: StandingsPageContentProps) {
  const { loadTeams, loadMatches, tournament } = useTournamentStore();

  // Enable real-time standings updates when matches complete
  const { isStandingsSubscribed } = useRealtimeTournament({
    tournamentId: tournament.id,
    enabled: true,
    watchMatches: false,
    watchStandings: true,
  });

  // Fetch data every time component mounts
  useEffect(() => {
    const loadData = async () => {
      await loadTeams();
      await loadMatches();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      <div className="p-4 md:p-8">
        <div className="mb-8 max-w-full">
          <div
            className="inline-block px-3 py-1 mb-2 rounded-full text-xs font-bold uppercase tracking-wide max-w-full"
            style={{
              background: `linear-gradient(to right, ${badgeColorFrom}, ${badgeColorTo})`,
              color: badgeTextColor,
            }}
          >
            <span className="truncate block">Tournament Progress</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap max-w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-lg break-words min-w-0">
              Standings & Playoffs
            </h1>
            {isStandingsSubscribed && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold animate-pulse flex-shrink-0">
                <Radio className="w-3 h-3 flex-shrink-0" />
                <span className="whitespace-nowrap">Live Updates</span>
              </div>
            )}
          </div>
          <p className="text-sm sm:text-base text-white/80 font-medium mt-2 break-words">
            View league standings, quarter-finals, semi-finals, and finals
          </p>
        </div>

        <FancyStandingsView tournamentId={tournament.id} />
      </div>
    </div>
  );
}
