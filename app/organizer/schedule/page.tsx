"use client";

import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { MatchScheduleTable } from "@/components/organizer/match-schedule-table";
import { GenerateMatchesDialog } from "@/components/organizer/generate-matches-dialog";

export default function SchedulePage() {
  const { matches, loadTeams, loadMatches, loadingMatches } = useTournamentStore();

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
    <div className="p-4 md:p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="inline-block px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] text-xs font-bold uppercase tracking-wide">
            Tournament Calendar
          </div>
          <h1 className="text-4xl font-black text-white drop-shadow-lg">Match Schedule</h1>
        </div>
        <GenerateMatchesDialog />
      </div>

      {matches.length === 0 ? (
        loadingMatches ? (
          <div className="text-center text-white/70 py-12">Loading matches...</div>
        ) : (
          <div className="text-center text-white/70 py-12">
            No matches scheduled yet. Create some teams first, then generate the match schedule!
          </div>
        )
      ) : (
        <Card className="border-2 border-[#0d3944]/10 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#0d3944] to-[#1a4a57] text-white">
            <CardTitle className="text-xl font-black">
              All matches {loadingMatches && <span className="text-sm font-normal opacity-70">(updating...)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <MatchScheduleTable matches={matches} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
