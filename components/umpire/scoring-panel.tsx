"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMatchStore } from "@/lib/stores/match-store";
import type { Ball } from "@/lib/types";

export function ScoringPanel() {
  const { currentMatch, recordBall, selectPowerplay, undoLastBall } =
    useMatchStore();

  const innings = currentMatch?.innings?.[0];
  const currentInnings = currentMatch?.innings?.find(
    (i) => i.state === "IN_PROGRESS"
  ) ?? innings;
  const currentOver =
    currentInnings?.overs?.find((o) => o.balls.length < 6) ??
    currentInnings?.overs?.[0];
  const ballNumber = currentOver ? currentOver.balls.length + 1 : 1;

  const handleRunScore = (runs: 0 | 1 | 2 | 3 | 4 | 6) => {
    recordBall({
      ballNumber: 1,
      runs,
      isWicket: false,
      wicketType: null,
      isNoball: false,
      isWide: false,
      isFreeHit: false,
      misconduct: false,
      thirdBallViolation: false,
    });
  };

  const handleWicket = () => {
    recordBall({
      ballNumber: 1,
      runs: 0,
      isWicket: true,
      wicketType: "NORMAL",
      isNoball: false,
      isWide: false,
      isFreeHit: false,
      misconduct: false,
      thirdBallViolation: false,
    });
  };

  const handleNoball = () => {
    recordBall({
      ballNumber: 1,
      runs: 0,
      isWicket: false,
      wicketType: null,
      isNoball: true,
      isWide: false,
      isFreeHit: false,
      misconduct: false,
      thirdBallViolation: false,
    });
  };

  const handleWide = () => {
    recordBall({
      ballNumber: 1,
      runs: 0,
      isWicket: false,
      wicketType: null,
      isNoball: false,
      isWide: true,
      isFreeHit: false,
      misconduct: false,
      thirdBallViolation: false,
    });
  };

  const handleMisconduct = () => {
    recordBall({
      ballNumber: 1,
      runs: 0,
      isWicket: false,
      wicketType: null,
      isNoball: false,
      isWide: false,
      isFreeHit: false,
      misconduct: true,
      thirdBallViolation: false,
    });
  };

  const powerplayNotSet =
    currentInnings?.powerplayOver == null &&
    (currentInnings?.overs?.some((o) => o.balls.length > 0) ?? false);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Score Runs
          </h3>
          <div className="grid grid-cols-6 gap-2">
            {([0, 1, 2, 3, 4, 6] as const).map((runs) => (
              <Button
                key={runs}
                size="lg"
                variant="outline"
                className="h-16 text-2xl font-bold"
                onClick={() => handleRunScore(runs)}
              >
                {runs}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Events</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="destructive"
              className="h-12"
              onClick={handleWicket}
            >
              Wicket
            </Button>
            <Button variant="outline" className="h-12" onClick={handleNoball}>
              No Ball
            </Button>
            <Button variant="outline" className="h-12" onClick={handleWide}>
              Wide
            </Button>
            <Button
              variant="outline"
              className="h-12"
              onClick={handleMisconduct}
            >
              Misconduct
            </Button>
          </div>
        </div>

        {powerplayNotSet && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Powerplay (Select Once)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((over) => (
                <Button
                  key={over}
                  variant="outline"
                  className="h-12"
                  onClick={() => selectPowerplay(over)}
                >
                  Over {over}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Button variant="secondary" onClick={undoLastBall} className="w-full">
          Undo last ball
        </Button>
      </div>
    </Card>
  );
}
