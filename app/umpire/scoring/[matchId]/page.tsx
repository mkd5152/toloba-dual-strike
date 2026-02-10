"use client";

import { useEffect } from "react";
import { ScoringPanel } from "@/components/umpire/scoring-panel";
import { InningsHeader } from "@/components/umpire/innings-header";
import { BallLog } from "@/components/umpire/ball-log";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { useMatchStore } from "@/lib/stores/match-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ScoringPage() {
  const { initializeDummyData, matches } = useTournamentStore();
  const { setCurrentMatch, currentMatch } = useMatchStore();

  // Initialize dummy data and set IN_PROGRESS match as current
  useEffect(() => {
    initializeDummyData();
    setTimeout(() => {
      const matches = useTournamentStore.getState().matches;
      // Find the IN_PROGRESS match (match 4) which has innings
      const inProgressMatch = matches.find(m => m.state === "IN_PROGRESS") || matches[0];
      if (inProgressMatch) {
        console.log("Setting match:", inProgressMatch);
        setCurrentMatch(inProgressMatch);
      }
    }, 100);
  }, [initializeDummyData, setCurrentMatch]);

  return (
    <div className="min-h-screen tournament-bg-pattern">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <Card className="p-6 mb-6 border-2 border-[#0d3944]/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-[#0d3944]">
                Match {currentMatch?.matchNumber ?? 1}
              </h1>
              <p className="text-gray-600 font-medium">{currentMatch?.court ?? "Court A"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white font-bold animate-pulse">
                LIVE
              </Badge>
              <Button asChild variant="outline" size="sm">
                <Link href="/organizer/matches">Back</Link>
              </Button>
            </div>
          </div>
        </Card>

        <div className="mb-6">
          <InningsHeader />
        </div>

        <ScoringPanel />

        <div className="mt-6">
          <BallLog />
        </div>
      </div>
    </div>
  );
}
