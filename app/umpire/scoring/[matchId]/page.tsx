"use client";

import { useParams } from "next/navigation";
import { ScoringPanel } from "@/components/umpire/scoring-panel";
import { InningsHeader } from "@/components/umpire/innings-header";
import { BallLog } from "@/components/umpire/ball-log";
import { useCurrentMatch } from "@/hooks/use-current-match";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ScoringPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const currentMatch = useCurrentMatch(matchId);

  if (!currentMatch) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading match…</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/umpire/matches">Back to matches</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Match {currentMatch.matchNumber}
            </h1>
            <p className="text-muted-foreground">{currentMatch.court}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-lg px-4 py-2">
              LIVE
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link href="/umpire/matches">Back</Link>
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
  );
}
