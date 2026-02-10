"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { MatchScheduleTable } from "@/components/organizer/match-schedule-table";

export default function OrganizerMatchesPage() {
  const { matches, teams, loadTeams, loadMatches, loading } = useTournamentStore();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      const loadData = async () => {
        await loadTeams();
        await loadMatches();
        setInitialLoadComplete(true);
      };
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  if (!initialLoadComplete || loading) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">All Matches</h1>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#ff9800] border-t-transparent rounded-full"></div>
              <p className="ml-4 text-gray-600">Loading matches...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">All Matches</h1>

      <Card>
        <CardHeader>
          <CardTitle>Match list</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchScheduleTable matches={matches} />
        </CardContent>
      </Card>
    </div>
  );
}
