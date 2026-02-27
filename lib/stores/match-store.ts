import { create } from "zustand";
import type { Match, Ball, Innings, Over } from "@/lib/types";
import {
  calculateBallRuns,
  checkConsecutiveDotBallViolation,
  calculateInningsFinalScore,
  rankTeamsInMatch,
} from "@/lib/utils/scoring-engine";
import { POINTS_SYSTEM } from "@/lib/constants";
import { useTournamentStore } from "./tournament-store";
import { recordBall as recordBallAPI, deleteLastBall } from "@/lib/api/balls";
import { updateInningsTotals, setPowerplayOver } from "@/lib/api/innings";

interface MatchStore {
  currentMatch: Match | null;
  currentInningsIndex: number;
  currentOverIndex: number;
  isSelectingPowerplay: boolean; // NEW: Loading state for powerplay selection

  // Actions
  setCurrentMatch: (match: Match) => void;
  recordBall: (ballData: Omit<Ball, "effectiveRuns" | "timestamp">) => void;
  selectPowerplay: (overNumber: number) => Promise<void>;
  setBowlingTeamsForInnings: (bowlingTeamIds: [string, string, string]) => void;
  completeInnings: () => void;
  completeMatch: () => void;
  undoLastBall: () => void;
  useReball: () => void;
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
  // Add reball bonus runs (from balls that were reballed)
  totalRuns += innings.reballBonusRuns || 0;

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
  isSelectingPowerplay: false,

  setCurrentMatch: (match) => {
    console.log('🔄 setCurrentMatch called with', match.innings.length, 'innings');

    // CRITICAL FIX: Find the currently active (IN_PROGRESS) innings instead of always defaulting to 0
    const activeInningsIndex = match.innings.findIndex(
      (inn) => inn.state === "IN_PROGRESS"
    );

    // If no IN_PROGRESS innings found, default to 0 (new match or all innings completed)
    const inningsIndex = activeInningsIndex >= 0 ? activeInningsIndex : 0;

    console.log('📍 Active innings detected:', inningsIndex, 'of', match.innings.length);

    // CRITICAL FIX: Find the current over (first incomplete over in active innings)
    let overIndex = 0;
    if (match.innings[inningsIndex]) {
      const activeInnings = match.innings[inningsIndex];

      // Find the first over that has less than 6 LEGAL balls
      const incompleteOverIndex = activeInnings.overs.findIndex((over) => {
        // Count legal balls only (in powerplay, wides/noballs don't count)
        const legalBalls = over.balls.filter(
          (b) => !b.isWide && !b.isNoball
        ).length;
        return legalBalls < 6;
      });

      overIndex = incompleteOverIndex >= 0 ? incompleteOverIndex : 0;

      console.log('📍 Active over detected:', overIndex, 'of', activeInnings.overs.length);
    }

    // Validate: Ensure only ONE innings is IN_PROGRESS
    const inProgressCount = match.innings.filter(inn => inn.state === "IN_PROGRESS").length;
    if (inProgressCount > 1) {
      console.error('⚠️ WARNING: Multiple innings marked as IN_PROGRESS!', inProgressCount);
    }

    set({
      currentMatch: match,
      currentInningsIndex: inningsIndex,
      currentOverIndex: overIndex,
    });

    console.log('✅ Match state set: innings', inningsIndex, 'over', overIndex);
  },

  recordBall: (ballData) => {
    const { currentMatch, currentInningsIndex, currentOverIndex } = get();
    if (!currentMatch || currentMatch.innings.length === 0) return;

    const innings = currentMatch.innings[currentInningsIndex];
    if (!innings) return;
    const over = innings.overs[currentOverIndex];
    if (!over) return;

    const isPowerplay = over.isPowerplay;

    // Calculate ball number based on legal balls
    // In powerplay: wide/noball doesn't increment ball number (repeats same number)
    // In normal over: all deliveries count
    let ballNumber: number;

    if (isPowerplay) {
      // Count legal balls delivered before this one
      const legalBallsBefore = over.balls.filter(b => !b.isWide && !b.isNoball).length;

      if (ballData.isWide || ballData.isNoball) {
        // Wide/noball in powerplay: DON'T increment ball number (retry same ball)
        // Use the last legal ball's number (or 1 if no legal balls yet)
        // Example: After legal ball 0.1, a wide should also show 0.1, then next legal shows 0.2
        ballNumber = Math.max(1, legalBallsBefore);
      } else {
        // Legal ball in powerplay: increment from legal balls count
        ballNumber = legalBallsBefore + 1;
      }
    } else {
      // Normal over: all balls count (including wides/noballs)
      ballNumber = over.balls.length + 1;
    }

    const ballWithEffective: Ball = {
      ...ballData,
      ballNumber: ballNumber,
      effectiveRuns: 0,
      timestamp: new Date(),
    };

    // Check for 3 consecutive dot balls violation
    // Get previous overs from current innings (all overs before the current one)
    const previousOvers = innings.overs.slice(0, currentOverIndex);

    if (
      checkConsecutiveDotBallViolation(
        over,
        ballWithEffective.runs,
        ballWithEffective.isNoball,
        ballWithEffective.isWide,
        previousOvers
      )
    ) {
      // This is the 3rd consecutive dot ball - make it a wicket
      // This is a bowling achievement, so bowling team gets +5 credit
      ballWithEffective.isWicket = true;
      ballWithEffective.wicketType = "BOWLING_TEAM";
    }

    // Calculate effective runs (applies wicket penalties if isWicket is true)
    ballWithEffective.effectiveRuns = calculateBallRuns(
      ballWithEffective,
      isPowerplay
    );

    console.log('🏏 Ball recorded:', {
      runs: ballWithEffective.runs,
      isWicket: ballWithEffective.isWicket,
      wicketType: ballWithEffective.wicketType,
      effectiveRuns: ballWithEffective.effectiveRuns,
      isPowerplay,
    });

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

    // Count legal balls in this over
    // In powerplay: wide/no ball doesn't count towards the 6-ball limit
    // In normal over: all balls count
    const legalBallCount = updatedOver.balls.filter(ball => {
      if (isPowerplay) {
        // In powerplay, only count balls that are NOT wide or no ball
        return !ball.isWide && !ball.isNoball;
      } else {
        // In normal overs, all balls count
        return true;
      }
    }).length;

    // If over complete (6 legal balls), move to next over or next innings
    if (legalBallCount >= 6) {
      if (currentOverIndex < innings.overs.length - 1) {
        nextOverIndex = currentOverIndex + 1;

        // Auto-powerplay: If moving to 3rd over (index 2) and no powerplay selected yet, set it automatically
        if (nextOverIndex === 2 && innings.powerplayOver === null) {
          console.log('⚡ Auto-selecting powerplay for 3rd over (no powerplay selected in first 2 overs)');
          updatedInnings = {
            ...updatedInnings,
            powerplayOver: 2,
            overs: updatedInnings.overs.map((o, i) => ({
              ...o,
              isPowerplay: i === 2,
            })),
          };

          // Also update in database
          setPowerplayOver(innings.id, 2).catch((err) => {
            console.error("Failed to auto-set powerplay in database:", err);
          });
        }
      } else {
        // Innings over - mark as completed
        updatedInnings = {
          ...updatedInnings,
          state: "COMPLETED",
        };

        // CRITICAL FIX: Save completed innings state to database
        console.log(`✅ Innings ${currentInningsIndex + 1} completed, saving to database...`);
        import("@/lib/api/innings").then(({ completeInnings }) => {
          completeInnings(innings.id, updatedInnings.finalScore)
            .then(() => console.log(`✅ Innings ${currentInningsIndex + 1} marked as COMPLETED in database`))
            .catch((err) => {
              console.error("❌ Failed to mark innings as COMPLETED in database:", err);
              alert("Warning: Innings completion may not have been saved. Please check match status.");
            });
        });

        nextOverIndex = 0;
        nextInningsIndex = currentInningsIndex + 1;

        // Check if this was the last innings (4th innings complete)
        if (nextInningsIndex >= currentMatch.innings.length) {
          // Match complete! Calculate rankings and update state

          // CRITICAL: Recalculate ALL innings to ensure finalScore is correct
          const completedInnings = currentMatch.innings.map((inn, i) => {
            if (i === currentInningsIndex) {
              return updatedInnings; // Already recalculated
            }
            // Recalculate other innings to ensure finalScore is set
            return recalcInningsFromBalls(inn);
          });

          console.log("=== MATCH COMPLETION DEBUG ===");
          completedInnings.forEach((inn) => {
            console.log(`Innings ${inn.teamId}: totalRuns=${inn.totalRuns}, finalScore=${inn.finalScore}, state=${inn.state}`);
          });

          const rankings = rankTeamsInMatch(completedInnings).map((r) => ({
            teamId: r.teamId,
            rank: r.rank,
            points: r.points, // Use calculated points (handles ties)
            totalRuns: completedInnings.find((i) => i.teamId === r.teamId)?.totalRuns ?? 0,
            totalScore: r.totalScore, // Total score used for ranking (includes bonuses)
            totalDismissals: completedInnings.find((i) => i.teamId === r.teamId)?.totalWickets ?? 0,
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

          // CRITICAL FIX: Save match completion to database
          console.log("=== SAVING MATCH COMPLETION TO DATABASE ===");
          useTournamentStore.getState().updateMatch(currentMatch.id, {
            state: "COMPLETED",
            rankings,
            lockedAt: completedMatch.lockedAt,
          })
            .then(() => {
              console.log("✅ Match marked as COMPLETED in database successfully");
            })
            .catch((err) => {
              console.error("❌ CRITICAL: Failed to save match completion to database:", err);
              alert("CRITICAL ERROR: Match completion may not have been saved to database. Please contact administrator immediately and do not reload the page!");
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
      innings: currentMatch.innings.map((inn, i) => {
        if (i === currentInningsIndex) {
          return updatedInnings;
        }
        // Set next innings to IN_PROGRESS when transitioning to it
        if (i === nextInningsIndex && nextInningsIndex !== currentInningsIndex) {
          return { ...inn, state: "IN_PROGRESS" };
        }
        return inn;
      }),
    };

    set({
      currentMatch: updatedMatch,
      currentInningsIndex: nextInningsIndex,
      currentOverIndex: nextOverIndex,
    });

    // Persist ball to database
    if (over.id) {
      recordBallAPI(over.id, ballWithEffective).catch((err) => {
        console.error("Failed to record ball to database:", err);
      });
    }

    // Update innings totals in database
    console.log('🔄 Updating innings totals in DB:', {
      inningsId: innings.id,
      totalRuns: updatedInnings.totalRuns,
      totalWickets: updatedInnings.totalWickets,
      finalScore: updatedInnings.finalScore,
    });
    updateInningsTotals(innings.id, {
      totalRuns: updatedInnings.totalRuns,
      totalWickets: updatedInnings.totalWickets,
      noWicketBonus: updatedInnings.noWicketBonus,
      finalScore: updatedInnings.finalScore,
    })
      .then(() => {
        console.log('✅ Innings totals updated successfully');
      })
      .catch((err) => {
        console.error("❌ Failed to update innings totals:", err);
      });

    // Note: Match completion is handled above with early return, so this code is never reached for completed matches

    // If we transitioned to a new innings, update its state in the database
    if (nextInningsIndex !== currentInningsIndex && nextInningsIndex < currentMatch.innings.length) {
      const nextInnings = updatedMatch.innings[nextInningsIndex];
      if (nextInnings) {
        // Update the next innings state to IN_PROGRESS in the database
        import("@/lib/api/innings").then(({ updateInningsState }) => {
          updateInningsState(nextInnings.id, "IN_PROGRESS").catch((err) => {
            console.error("Failed to update innings state:", err);
          });
        });
      }
    }
  },

  selectPowerplay: async (overNumber) => {
    const { currentMatch, currentInningsIndex, isSelectingPowerplay } = get();

    // Prevent double-clicks
    if (isSelectingPowerplay) {
      console.log('⏸️ Powerplay selection already in progress, ignoring click');
      return;
    }

    if (!currentMatch) {
      alert("No match loaded. Please refresh the page.");
      return;
    }

    const innings = currentMatch.innings[currentInningsIndex];
    if (!innings) {
      alert("No innings found. Please refresh the page.");
      return;
    }

    // Check if powerplay already set
    if (innings.powerplayOver !== null) {
      alert(`Powerplay already set to Over ${innings.powerplayOver}. Cannot change it.`);
      return;
    }

    // Set loading state immediately
    set({ isSelectingPowerplay: true });
    console.log(`⚡ Setting powerplay to Over ${overNumber}...`);

    try {
      // CRITICAL: Save powerplay selection to database (already imported at top!)
      await setPowerplayOver(innings.id, overNumber as 0 | 1 | 2);

      console.log(`✅ Powerplay saved to database successfully`);

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

      set({
        currentMatch: updatedMatch,
        isSelectingPowerplay: false
      });

      // Note: Powerplay is already saved to database via setPowerplayOver above
      console.log(`✅ Powerplay set to Over ${overNumber}`);

      // Show success feedback
      if (typeof window !== 'undefined') {
        // Vibrate on mobile if supported
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
      }
    } catch (err) {
      console.error("❌ Error setting powerplay:", err);
      set({ isSelectingPowerplay: false });
      alert(`Failed to set powerplay: ${err instanceof Error ? err.message : "Unknown error"}. Please try again or refresh the page.`);
    }
  },

  setBowlingTeamsForInnings: (bowlingTeamIds) => {
    const { currentMatch, currentInningsIndex } = get();
    if (!currentMatch) return;

    const innings = currentMatch.innings[currentInningsIndex];
    if (!innings || innings.overs.length !== 3) return;

    // Update each over with the selected bowling team
    const updatedInnings: Innings = {
      ...innings,
      overs: innings.overs.map((over, i) => ({
        ...over,
        bowlingTeamId: bowlingTeamIds[i],
      })),
    };

    const updatedMatch: Match = {
      ...currentMatch,
      innings: currentMatch.innings.map((inn, i) =>
        i === currentInningsIndex ? updatedInnings : inn
      ),
    };

    set({ currentMatch: updatedMatch });

    // Persist bowling team selections to database
    import("@/lib/api/innings").then(({ updateBowlingTeamsForInnings }) => {
      updateBowlingTeamsForInnings(innings.id, bowlingTeamIds).catch((err) => {
        console.error("Failed to update bowling teams in database:", err);
      });
    });

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

    const nextInningsIndex = currentInningsIndex + 1;

    const updatedMatch: Match = {
      ...currentMatch,
      innings: currentMatch.innings.map((inn, i) => {
        if (i === currentInningsIndex) {
          return updatedInnings;
        }
        // Set next innings to IN_PROGRESS when transitioning to it
        if (i === nextInningsIndex && nextInningsIndex < currentMatch.innings.length) {
          return { ...inn, state: "IN_PROGRESS" };
        }
        return inn;
      }),
    };

    set({
      currentMatch: updatedMatch,
      currentInningsIndex: nextInningsIndex,
      currentOverIndex: 0,
    });

    useTournamentStore.getState().updateMatch(currentMatch.id, {
      innings: updatedMatch.innings,
    });

    // Update next innings state in database
    if (nextInningsIndex < currentMatch.innings.length) {
      const nextInnings = updatedMatch.innings[nextInningsIndex];
      if (nextInnings) {
        import("@/lib/api/innings").then(({ updateInningsState }) => {
          updateInningsState(nextInnings.id, "IN_PROGRESS").catch((err) => {
            console.error("Failed to update innings state:", err);
          });
        });
      }
    }
  },

  completeMatch: () => {
    const { currentMatch } = get();
    if (!currentMatch) return;

    // Recalculate all completed innings to ensure finalScore is correct
    const completedInnings = currentMatch.innings
      .filter((i) => i.state === "COMPLETED")
      .map((i) => recalcInningsFromBalls(i));

    console.log("=== MANUAL MATCH COMPLETION DEBUG ===");
    completedInnings.forEach((inn) => {
      console.log(`Innings ${inn.teamId}: totalRuns=${inn.totalRuns}, finalScore=${inn.finalScore}, state=${inn.state}`);
    });

    const rankings = rankTeamsInMatch(completedInnings).map((r) => ({
      teamId: r.teamId,
      rank: r.rank as 1 | 2 | 3 | 4,
      points: r.points as 5 | 3 | 1 | 0, // FIXED: Use calculated points (handles ties)
      totalRuns:
        completedInnings.find((i) => i.teamId === r.teamId)?.totalRuns ?? 0,
      totalScore: r.totalScore, // Total score used for ranking (includes bonuses)
      totalDismissals:
        completedInnings.find((i) => i.teamId === r.teamId)?.totalWickets ?? 0,
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

    // Find the last ball in the entire match (works across overs/innings)
    let targetInningsIndex = currentInningsIndex;
    let targetOverIndex = currentOverIndex;
    let targetInnings = currentMatch.innings[targetInningsIndex];
    let targetOver = targetInnings?.overs[targetOverIndex];

    // If current over is empty, search backwards for the last ball
    if (!targetOver || targetOver.balls.length === 0) {
      // Search backwards through overs in current innings
      for (let overIdx = currentOverIndex - 1; overIdx >= 0; overIdx--) {
        const over = targetInnings.overs[overIdx];
        if (over && over.balls.length > 0) {
          targetOverIndex = overIdx;
          targetOver = over;
          break;
        }
      }

      // If still no ball found, search in previous innings
      if (!targetOver || targetOver.balls.length === 0) {
        for (let inningsIdx = currentInningsIndex - 1; inningsIdx >= 0; inningsIdx--) {
          const innings = currentMatch.innings[inningsIdx];
          if (innings) {
            // Search from last over backwards
            for (let overIdx = innings.overs.length - 1; overIdx >= 0; overIdx--) {
              const over = innings.overs[overIdx];
              if (over && over.balls.length > 0) {
                targetInningsIndex = inningsIdx;
                targetOverIndex = overIdx;
                targetInnings = innings;
                targetOver = over;
                break;
              }
            }
            if (targetOver && targetOver.balls.length > 0) break;
          }
        }
      }
    }

    // No ball to undo
    if (!targetInnings || !targetOver || targetOver.balls.length === 0) {
      console.warn("No ball to undo");
      return;
    }

    console.log(`Undoing ball from innings ${targetInningsIndex}, over ${targetOverIndex}`);

    // Remove the last ball from the target over
    const updatedOver: Over = {
      ...targetOver,
      balls: targetOver.balls.slice(0, -1),
    };

    // Recalculate innings totals
    const updatedInnings = recalcInningsFromBalls({
      ...targetInnings,
      overs: targetInnings.overs.map((o, i) =>
        i === targetOverIndex ? updatedOver : o
      ),
      state: "IN_PROGRESS", // Mark as in progress again if it was completed
    });

    // Update all innings in the match
    const updatedMatch: Match = {
      ...currentMatch,
      innings: currentMatch.innings.map((inn, i) =>
        i === targetInningsIndex ? updatedInnings : inn
      ),
      state: "IN_PROGRESS", // Mark match as in progress if it was completed
    };

    // Update indices to point to the over we just undid
    set({
      currentMatch: updatedMatch,
      currentInningsIndex: targetInningsIndex,
      currentOverIndex: targetOverIndex,
    });

    // Delete ball from database
    if (targetOver.id) {
      deleteLastBall(targetOver.id).catch((err) => {
        console.error("Failed to delete ball from database:", err);
      });
    }

    // Update innings state and totals in database
    import("@/lib/api/innings").then(({ updateInningsState }) => {
      updateInningsState(targetInnings.id, "IN_PROGRESS").catch((err) => {
        console.error("Failed to update innings state after undo:", err);
      });
    });

    updateInningsTotals(targetInnings.id, {
      totalRuns: updatedInnings.totalRuns,
      totalWickets: updatedInnings.totalWickets,
      noWicketBonus: updatedInnings.noWicketBonus,
      finalScore: updatedInnings.finalScore,
    }).catch((err) => {
      console.error("Failed to update innings totals after undo:", err);
    });

    // If match was completed, revert it back to IN_PROGRESS
    if (currentMatch.state === "COMPLETED") {
      useTournamentStore.getState().updateMatch(currentMatch.id, {
        state: "IN_PROGRESS",
        rankings: [],
        lockedAt: null,
      });
    }

    // Reset reballsUsed count when undo is used
    if (updatedInnings.reballsUsed > 0) {
      const resetInnings = { ...updatedInnings, reballsUsed: Math.max(0, updatedInnings.reballsUsed - 1) };
      set({
        currentMatch: {
          ...updatedMatch,
          innings: updatedMatch.innings.map((inn, i) =>
            i === targetInningsIndex ? resetInnings : inn
          ),
        },
      });
    }
  },

  useReball: () => {
    const { currentMatch, currentInningsIndex, currentOverIndex } = get();
    if (!currentMatch) return;

    const innings = currentMatch.innings[currentInningsIndex];
    if (!innings) return;

    // Only allow reball in last over (over 2, which is the 3rd over)
    if (currentOverIndex !== 2) {
      console.warn("Reball can only be used in the last over");
      return;
    }

    const over = innings.overs[currentOverIndex];
    if (!over || over.balls.length === 0) {
      console.warn("No balls to reball");
      return;
    }

    // Check if max reballs reached
    if (innings.reballsUsed >= 3) {
      console.warn("Maximum 3 reballs already used");
      return;
    }

    // Cannot use reball in powerplay
    if (over.isPowerplay) {
      console.warn("Reball cannot be used in powerplay over");
      return;
    }

    console.log(`Using reball ${innings.reballsUsed + 1}/3 in over ${currentOverIndex}`);

    // Get the last ball and its runs
    const lastBall = over.balls[over.balls.length - 1];
    const reballRuns = lastBall.effectiveRuns;

    // Remove the last ball from the over
    const updatedOver: Over = {
      ...over,
      balls: over.balls.slice(0, -1),
    };

    // Update innings with reball bonus and increment reball counter
    const updatedInnings: Innings = {
      ...innings,
      reballsUsed: innings.reballsUsed + 1,
      reballBonusRuns: (innings.reballBonusRuns || 0) + reballRuns,
      overs: innings.overs.map((o, i) =>
        i === currentOverIndex ? updatedOver : o
      ),
    };

    // Recalculate totals (will include reballBonusRuns)
    const recalcedInnings = recalcInningsFromBalls(updatedInnings);

    const updatedMatch: Match = {
      ...currentMatch,
      innings: currentMatch.innings.map((inn, i) =>
        i === currentInningsIndex ? recalcedInnings : inn
      ),
    };

    set({ currentMatch: updatedMatch });

    // Delete ball from database
    if (over.id) {
      deleteLastBall(over.id).catch((err) => {
        console.error("Failed to delete ball from database:", err);
      });
    }

    // Update innings in database with new reball count and bonus runs
    updateInningsTotals(innings.id, {
      totalRuns: recalcedInnings.totalRuns,
      totalWickets: recalcedInnings.totalWickets,
      noWicketBonus: recalcedInnings.noWicketBonus,
      finalScore: recalcedInnings.finalScore,
    }).catch((err) => {
      console.error("Failed to update innings totals after reball:", err);
    });
  },
}));
