"use client";

import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { MatchScheduleTable } from "@/components/organizer/match-schedule-table";

export default function OrganizerMatchesPage() {
  const { matches, teams, initializeDummyData } = useTournamentStore();

  useEffect(() => {
    if (teams.length === 0) {
      initializeDummyData();
    }
  }, [teams.length, initializeDummyData]);

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
