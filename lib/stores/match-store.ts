import { create } from "zustand";
import type { Match, Ball, Innings, Over } from "@/lib/types";
import {
  calculateBallRuns,
  checkThirdBallViolation,
  calculateInningsFinalScore,
  rankTeamsInMatch,
} from "@/lib/utils/scoring-engine";
import { POINTS_SYSTEM } from "@/lib/constants";
import { useTournamentStore } from "./tournament-store";

interface MatchStore {
  currentMatch: Match | null;
  currentInningsIndex: number;
  currentOverIndex: number;

  // Actions
  setCurrentMatch: (match: Match) => void;
  recordBall: (ballData: Omit<Ball, "effectiveRuns" | "timestamp">) => void;
  selectPowerplay: (overNumber: number) => void;
  completeInnings: () => void;
  completeMatch: () => void;
  undoLastBall: () => void;
}

function recalcInningsFromBalls(innings: Innings): Innings {
  let totalRuns = 0;
  let totalWickets = 0;
  for (const over of innings.overs) {
    for (const ball of over.balls) {
      totalRuns += ball.effectiveRuns;
      if (ball.isWicket) totalWickets++;
    }
  }
  const noWicketBonus = totalWickets === 0;
  const finalScore =
    totalRuns + (noWicketBonus ? 10 : 0);
  return {
    ...innings,
    totalRuns,
    totalWickets,
    noWicketBonus,
    finalScore,
  };
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  currentMatch: null,
  currentInningsIndex: 0,
  currentOverIndex: 0,

  setCurrentMatch: (match) =>
    set({
      currentMatch: match,
      currentInningsIndex: 0,
      currentOverIndex: 0,
    }),

  recordBall: (ballData) => {
    const { currentMatch, currentInningsIndex, currentOverIndex } = get();
    if (!currentMatch || currentMatch.innings.length === 0) return;

    const innings = currentMatch.innings[currentInningsIndex];
    if (!innings) return;
    const over = innings.overs[currentOverIndex];
    if (!over) return;

    const isPowerplay = over.isPowerplay;
    const ballWithEffective: Ball = {
      ...ballData,
      ballNumber: over.balls.length + 1,
      effectiveRuns: 0,
      timestamp: new Date(),
    };
    ballWithEffective.effectiveRuns = calculateBallRuns(
      ballWithEffective,
      isPowerplay
    );

    // Check third ball violation (before adding ball)
    if (
      over.balls.length === 2 &&
      checkThirdBallViolation(over, over.balls.length)
    ) {
      ballWithEffective.thirdBallViolation = true;
      ballWithEffective.isWicket = true;
      ballWithEffective.wicketType = "NORMAL";
      ballWithEffective.effectiveRuns = isPowerplay ? -10 : -5;
    }

    const updatedOver: Over = {
      ...over,
      balls: [...over.balls, ballWithEffective],
    };

    let nextOverIndex = currentOverIndex;
    let nextInningsIndex = currentInningsIndex;
    let updatedOvers = innings.overs.map((o, i) =>
      i === currentOverIndex ? updatedOver : o
    );

    // Calculate innings with updated balls
    let updatedInnings: Innings = recalcInningsFromBalls({
      ...innings,
      overs: innings.overs.map((o, i) =>
        i === currentOverIndex ? updatedOver : o
      ),
      state: "IN_PROGRESS",
    });

    // If over complete (6 balls), move to next over or next innings
    if (updatedOver.balls.length >= 6) {
      if (currentOverIndex < innings.overs.length - 1) {
        nextOverIndex = currentOverIndex + 1;
      } else {
        // Innings over - mark as completed
        updatedInnings = {
          ...updatedInnings,
          state: "COMPLETED",
        };

        nextOverIndex = 0;
        nextInningsIndex = currentInningsIndex + 1;

        // Check if this was the last innings (4th innings complete)
        if (nextInningsIndex >= currentMatch.innings.length) {
          // Match complete! Calculate rankings and update state

          const completedInnings = currentMatch.innings.map((inn, i) =>
            i === currentInningsIndex ? updatedInnings : inn
          );

          const rankings = rankTeamsInMatch(completedInnings).map((r) => ({
            teamId: r.teamId,
            rank: r.rank,
            points: r.points, // Use calculated points (handles ties)
            totalRuns: completedInnings.find((i) => i.teamId === r.teamId)?.totalRuns ?? 0,
          }));

          const completedMatch: Match = {
            ...currentMatch,
            innings: completedInnings,
            state: "COMPLETED",
            rankings,
            lockedAt: new Date(),
          };

          set({
            currentMatch: completedMatch,
            currentInningsIndex: nextInningsIndex,
            currentOverIndex: 0,
          });

          useTournamentStore.getState().updateMatch(currentMatch.id, {
            state: "COMPLETED",
            innings: completedMatch.innings,
            rankings,
            lockedAt: completedMatch.lockedAt,
          });

          return; // Exit early, match is complete
        }

        if (nextInningsIndex < currentMatch.innings.length) {
          updatedOvers = currentMatch.innings[nextInningsIndex].overs;
        }
      }
    }

    const updatedMatch: Match = {
      ...currentMatch,
      innings: currentMatch.innings.map((inn, i) =>
        i === currentInningsIndex ? updatedInnings : inn
      ),
    };

    set({
      currentMatch: updatedMatch,
      currentInningsIndex: nextInningsIndex,
      currentOverIndex: nextOverIndex,
    });
    useTournamentStore.getState().updateMatch(currentMatch.id, {
      innings: updatedMatch.innings,
    });
  },

  selectPowerplay: (overNumber) => {
    const { currentMatch, currentInningsIndex } = get();
    if (!currentMatch) return;

    const innings = currentMatch.innings[currentInningsIndex];
    if (!innings) return;

    const updatedInnings: Innings = {
      ...innings,
      powerplayOver: overNumber,
      overs: innings.overs.map((o) => ({
        ...o,
        isPowerplay: o.overNumber === overNumber,
      })),
    };

    const updatedMatch: Match = {
      ...currentMatch,
      innings: currentMatch.innings.map((inn, i) =>
        i === currentInningsIndex ? updatedInnings : inn
      ),
    };

    set({ currentMatch: updatedMatch });
    useTournamentStore.getState().updateMatch(currentMatch.id, {
      innings: updatedMatch.innings,
    });
  },

  completeInnings: () => {
    const { currentMatch, currentInningsIndex } = get();
    if (!currentMatch) return;

    const innings = currentMatch.innings[currentInningsIndex];
    if (!innings) return;

    const finalScore = calculateInningsFinalScore(innings);
    const updatedInnings: Innings = {
      ...innings,
      state: "COMPLETED",
      finalScore,
    };

    const updatedMatch: Match = {
      ...currentMatch,
      innings: currentMatch.innings.map((inn, i) =>
        i === currentInningsIndex ? updatedInnings : inn
      ),
    };

    set((state) => ({
      currentMatch: updatedMatch,
      currentInningsIndex: state.currentInningsIndex + 1,
      currentOverIndex: 0,
    }));
    useTournamentStore.getState().updateMatch(currentMatch.id, {
      innings: updatedMatch.innings,
    });
  },

  completeMatch: () => {
    const { currentMatch } = get();
    if (!currentMatch) return;

    const completedInnings = currentMatch.innings.filter(
      (i) => i.state === "COMPLETED"
    );
    const rankings = rankTeamsInMatch(completedInnings).map((r) => ({
      teamId: r.teamId,
      rank: r.rank as 1 | 2 | 3 | 4,
      points: (r.rank === 1
        ? POINTS_SYSTEM.FIRST
        : r.rank === 2
          ? POINTS_SYSTEM.SECOND
          : r.rank === 3
            ? POINTS_SYSTEM.THIRD
            : POINTS_SYSTEM.FOURTH) as 5 | 3 | 1 | 0,
      totalRuns:
        completedInnings.find((i) => i.teamId === r.teamId)?.totalRuns ?? 0,
    }));

    const completed = {
      ...currentMatch,
      state: "COMPLETED" as const,
      rankings,
      lockedAt: new Date(),
    };
    set({ currentMatch: completed });
    useTournamentStore.getState().updateMatch(currentMatch.id, {
      state: "COMPLETED",
      rankings,
      lockedAt: completed.lockedAt,
    });
  },

  undoLastBall: () => {
    const { currentMatch, currentInningsIndex, currentOverIndex } = get();
    if (!currentMatch) return;

    const innings = currentMatch.innings[currentInningsIndex];
    if (!innings) return;
    const over = innings.overs[currentOverIndex];
    if (!over || over.balls.length === 0) return;

    const updatedOver: Over = {
      ...over,
      balls: over.balls.slice(0, -1),
    };

    const updatedInnings = recalcInningsFromBalls({
      ...innings,
      overs: innings.overs.map((o, i) =>
        i === currentOverIndex ? updatedOver : o
      ),
    });

    const updatedMatch: Match = {
      ...currentMatch,
      innings: currentMatch.innings.map((inn, i) =>
        i === currentInningsIndex ? updatedInnings : inn
      ),
    };

    set({ currentMatch: updatedMatch });
    useTournamentStore.getState().updateMatch(currentMatch.id, {
      innings: updatedMatch.innings,
    });
  },
}));
