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
        event = "No ball (+2)";
      } else if (ball.isWide) {
        event = "Wide (+2)";
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
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Ball-by-Ball</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No balls recorded yet.</p>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className={`p-2 rounded ${log.isPowerplay ? "bg-orange-50 dark:bg-orange-950/30" : "bg-muted/50"}`}
            >
              <span className="font-mono font-medium">{log.over}.{log.ball}</span>
              <span className="ml-3 text-muted-foreground">{log.text}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
