"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Match } from "@/lib/types";
import { useTournamentStore } from "@/lib/stores/tournament-store";

interface LiveMatchCardProps {
  match: Match;
}

export function LiveMatchCard({ match }: LiveMatchCardProps) {
  const { getTeam } = useTournamentStore();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">Match {match.matchNumber}</h3>
          <p className="text-sm text-muted-foreground">{match.court}</p>
        </div>
        <Badge
          variant={match.state === "IN_PROGRESS" ? "default" : "secondary"}
        >
          {match.state === "IN_PROGRESS" ? "LIVE" : match.state}
        </Badge>
      </div>

      <div className="space-y-3">
        {match.teamIds.map((teamId) => {
          const team = getTeam(teamId);
          const innings = match.innings.find((i) => i.teamId === teamId);

          return (
            <div
              key={teamId}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: team?.color }}
                />
                <span className="font-medium">{team?.name ?? "—"}</span>
              </div>
              <div className="text-right">
                {innings ? (
                  <div className="text-xl font-bold">
                    {innings.finalScore}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({innings.totalWickets}W)
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Waiting…</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
