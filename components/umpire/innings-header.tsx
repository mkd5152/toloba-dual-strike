"use client";

import { Card } from "@/components/ui/card";
import { useMatchStore } from "@/lib/stores/match-store";
import { useTournamentStore } from "@/lib/stores/tournament-store";

export function InningsHeader() {
  const { currentMatch } = useMatchStore();
  const { getTeam } = useTournamentStore();

  const currentInnings = currentMatch?.innings?.find(
    (i) => i.state === "IN_PROGRESS"
  ) ?? currentMatch?.innings?.[0];

  const battingTeam = currentInnings ? getTeam(currentInnings.teamId) : null;
  const overIndex = currentInnings?.overs?.findIndex((o) => o.balls.length < 6) ?? -1;
  const currentOver =
    overIndex >= 0 ? currentInnings?.overs?.[overIndex] : currentInnings?.overs?.[2];
  const overNum =
    overIndex >= 0 ? overIndex + 1 : (currentInnings?.overs?.length ?? 0);
  const ballInOver = currentOver?.balls?.length ?? 0;
  const overStr = `${overNum}.${ballInOver}`;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Batting Team</p>
          <p className="text-xl font-bold">{battingTeam?.name ?? "—"}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-3xl font-bold">
            {currentInnings?.totalRuns ?? 0}/{currentInnings?.totalWickets ?? 0}
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-4 text-sm">
        <span>Over: {overStr}</span>
        <span>•</span>
        {(currentInnings?.powerplayOver ?? null) != null && (
          <span className="text-orange-600 font-medium">Powerplay Active</span>
        )}
      </div>
    </Card>
  );
}
