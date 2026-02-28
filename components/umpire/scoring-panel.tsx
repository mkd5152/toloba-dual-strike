"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMatchStore } from "@/lib/stores/match-store";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import type { WicketType } from "@/lib/types";
import { ExtrasRunSelector } from "./extras-run-selector";
import { WicketTypeSelector } from "./wicket-type-selector";
import { useState } from "react";
import { SCORING_RULES } from "@/lib/constants";

export function ScoringPanel() {
  const { currentMatch, recordBall, selectPowerplay, undoLastBall, useReball, currentOverIndex, isSelectingPowerplay, dbSaveStatus } =
    useMatchStore();
  const { getTeam } = useTournamentStore();

  const [showExtrasDialog, setShowExtrasDialog] = useState(false);
  const [extrasType, setExtrasType] = useState<"noball" | "wide">("noball");
  const [showWicketDialog, setShowWicketDialog] = useState(false);

  const innings = currentMatch?.innings?.[0];
  const currentInnings = currentMatch?.innings?.find(
    (i) => i.state === "IN_PROGRESS"
  ) ?? innings;

  // CRITICAL FIX: Find incomplete over using SAME logic as innings header
  // NO FALLBACK - if find() returns undefined, currentOver is undefined (safer than using stale index)
  const currentOver = currentInnings?.overs?.find((o) => {
    const isPowerplayOver = o.isPowerplay;
    if (isPowerplayOver) {
      // In powerplay, count only legal balls
      const legalBallCount = o.balls.filter(b => !b.isWide && !b.isNoball).length;
      return legalBallCount < 6;
    } else {
      // In normal over, all balls count
      return o.balls.length < 6;
    }
  });

  const ballNumber = currentOver ? currentOver.balls.length + 1 : 1;

  const handleRunScore = (runs: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
    recordBall({
      ballNumber: 1,
      runs,
      isWicket: false,
      wicketType: null,
      isNoball: false,
      isWide: false,
      isFreeHit: false,
      misconduct: false,
    });
  };

  const handleWicket = () => {
    // Safety check: Ensure we have valid team assignments
    if (!bowlingTeamId || !battingTeamId) {
      alert("Error: Team assignments not properly set for this over. Cannot record wicket.");
      return;
    }
    if (fieldingTeams.length !== 2) {
      alert(`Error: Expected 2 fielding teams, found ${fieldingTeams.length}. Cannot record wicket.`);
      return;
    }
    setShowWicketDialog(true);
  };

  const handleWicketTypeSelected = (wicketType: WicketType, fieldingTeamId?: string) => {
    recordBall({
      ballNumber: 1,
      runs: 0,
      isWicket: true,
      wicketType,
      fieldingTeamId,
      isNoball: false,
      isWide: false,
      isFreeHit: false,
      misconduct: false,
    });
  };

  const handleNoball = () => {
    setExtrasType("noball");
    setShowExtrasDialog(true);
  };

  const handleWide = () => {
    setExtrasType("wide");
    setShowExtrasDialog(true);
  };

  const handleExtrasRunsSelected = (runs: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
    recordBall({
      ballNumber: 1,
      runs,
      isWicket: false,
      wicketType: null,
      isNoball: extrasType === "noball",
      isWide: extrasType === "wide",
      isFreeHit: false,
      misconduct: false,
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
    });
  };

  const powerplayNotSet = currentInnings?.powerplayOver == null;

  // Get bowling team and fielding teams for wicket selector
  const bowlingTeamId = currentOver?.bowlingTeamId;
  const bowlingTeam = bowlingTeamId ? getTeam(bowlingTeamId) : null;
  const battingTeamId = currentInnings?.teamId;

  // Get the 2 fielding teams (exclude batting and bowling teams)
  // CRITICAL: Only filter if we have valid batting and bowling team IDs
  const fieldingTeams = (currentMatch?.teamIds && battingTeamId && bowlingTeamId)
    ? currentMatch.teamIds
        .filter((teamId) => teamId !== battingTeamId && teamId !== bowlingTeamId)
        .map((teamId) => {
          const team = getTeam(teamId);
          return team ? { id: team.id, name: team.name, color: team.color } : null;
        })
        .filter((team): team is { id: string; name: string; color: string } => team !== null)
    : [];

  return (
    <>
      <ExtrasRunSelector
        open={showExtrasDialog}
        onClose={() => setShowExtrasDialog(false)}
        onSelectRuns={handleExtrasRunsSelected}
        extrasType={extrasType}
        baseRuns={extrasType === "noball" ? SCORING_RULES.NOBALL_RUNS : SCORING_RULES.WIDE_RUNS}
      />

      <WicketTypeSelector
        open={showWicketDialog}
        onClose={() => setShowWicketDialog(false)}
        onSelectWicket={handleWicketTypeSelected}
        bowlingTeamId={bowlingTeamId || ""}
        bowlingTeamName={bowlingTeam?.name || "Bowling Team"}
        fieldingTeams={fieldingTeams}
      />

      <Card className="p-3 sm:p-4 md:p-6">
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
        <div>
          <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
            Score Runs
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-2 md:gap-3">
            {([0, 1, 2, 3, 4, 5, 6] as const).map((runs) => (
              <Button
                key={runs}
                size="lg"
                variant="outline"
                className="h-14 sm:h-16 md:h-20 text-xl sm:text-2xl md:text-3xl font-bold touch-manipulation active:scale-95 transition-transform"
                onClick={() => handleRunScore(runs)}
              >
                {runs}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">Events</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button
              variant="destructive"
              className="h-12 sm:h-14 md:h-16 text-sm sm:text-base font-semibold touch-manipulation active:scale-95 transition-transform"
              onClick={handleWicket}
            >
              Wicket
            </Button>
            <Button
              variant="outline"
              className="h-12 sm:h-14 md:h-16 text-sm sm:text-base font-semibold touch-manipulation active:scale-95 transition-transform"
              onClick={handleNoball}
            >
              No Ball
            </Button>
            <Button
              variant="outline"
              className="h-12 sm:h-14 md:h-16 text-sm sm:text-base font-semibold touch-manipulation active:scale-95 transition-transform"
              onClick={handleWide}
            >
              Wide
            </Button>
            <Button
              variant="outline"
              className="h-12 sm:h-14 md:h-16 text-sm sm:text-base font-semibold touch-manipulation active:scale-95 transition-transform"
              onClick={handleMisconduct}
            >
              Misconduct
            </Button>
          </div>
        </div>

        {powerplayNotSet && (
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-sm sm:text-base font-medium text-gray-700">
                Powerplay (Select Once)
              </h3>
              {(dbSaveStatus?.status === "saving" || isSelectingPowerplay) && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-600 font-semibold">
                  <div className="animate-spin w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                  {dbSaveStatus?.status === "saving" ? "Wait..." : "Saving..."}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[0, 1, 2].map((over) => {
                const isSaving = dbSaveStatus?.status === "saving" || isSelectingPowerplay;
                return (
                  <Button
                    key={over}
                    variant="outline"
                    disabled={isSaving}
                    className={`h-12 sm:h-14 md:h-16 text-sm sm:text-base font-semibold touch-manipulation transition-all ${
                      isSaving
                        ? 'opacity-50 cursor-not-allowed'
                        : 'active:scale-95'
                    }`}
                    onClick={() => selectPowerplay(over)}
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full"></div>
                        Over {over}
                      </span>
                    ) : (
                      `Over ${over}`
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={undoLastBall}
            className="h-11 sm:h-12 md:h-14 text-sm sm:text-base font-semibold touch-manipulation active:scale-95 transition-transform"
          >
            Undo last ball
          </Button>

          {/* Reball button - only shown in last over (over 2) */}
          {/* CRITICAL FIX: Use detected currentOver, not stale currentOverIndex from store */}
          {currentOver?.overNumber === 2 && (
            <Button
              variant="outline"
              onClick={useReball}
              disabled={
                (currentInnings?.reballsUsed || 0) >= 3 ||
                currentOver?.isPowerplay === true ||
                !currentOver?.balls.length
              }
              className="h-11 sm:h-12 md:h-14 text-sm sm:text-base font-semibold touch-manipulation active:scale-95 transition-transform disabled:opacity-50"
            >
              Reball ({(currentInnings?.reballsUsed || 0)}/3)
            </Button>
          )}
        </div>
      </div>
    </Card>
    </>
  );
}
