"use client";

import { Card } from "@/components/ui/card";
import { useMatchStore } from "@/lib/stores/match-store";

export function BallLog() {
  const { currentMatch } = useMatchStore();

  const currentInnings = currentMatch?.innings?.find(
    (i) => i.state === "IN_PROGRESS"
  );
  const innings = currentInnings ?? currentMatch?.innings?.[0];

  const logs: { over: number; ball: number; text: string; isPowerplay: boolean }[] = [];
  for (const over of innings?.overs ?? []) {
    for (const ball of over.balls) {
      const overBall = `${over.overNumber}.${ball.ballNumber}`;
      let event = "";
      if (ball.isWicket) {
        event = `Wicket (${ball.effectiveRuns} runs)`;
      } else if (ball.isNoball) {
        event = ball.runs > 0
          ? `${ball.runs} + 2 (No ball)`
          : "No ball (+2)";
      } else if (ball.isWide) {
        event = ball.runs > 0
          ? `${ball.runs} + 2 (Wide)`
          : "Wide (+2)";
      } else if (ball.misconduct) {
        event = "Misconduct (-5)";
      } else if (ball.effectiveRuns !== ball.runs && over.isPowerplay) {
        event = `${ball.runs} runs (Powerplay = ${ball.effectiveRuns})`;
      } else {
        event = `${ball.effectiveRuns} run${ball.effectiveRuns !== 1 ? "s" : ""}`;
      }
      logs.push({
        over: over.overNumber,
        ball: ball.ballNumber,
        text: `${overBall} – ${event}`,
        isPowerplay: over.isPowerplay,
      });
    }
  }
  logs.reverse();

  return (
    <Card className="p-3 sm:p-4 md:p-6">
      <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Ball-by-Ball</h3>
      <div className="space-y-2 max-h-64 sm:max-h-72 md:max-h-80 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground">No balls recorded yet.</p>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className={`p-2 sm:p-3 rounded ${log.isPowerplay ? "bg-orange-50 dark:bg-orange-950/30" : "bg-muted/50"}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-mono font-medium text-sm sm:text-base text-[#0d3944]">
                  {log.over}.{log.ball}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground break-words">
                  {log.text}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
