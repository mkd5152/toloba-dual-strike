import { Ball, Over, Innings } from "@/lib/types";
import { SCORING_RULES, POINTS_SYSTEM } from "@/lib/constants";

export function calculateBallRuns(ball: Ball, isPowerplay: boolean): number {
  let runs: number = ball.runs;

  // Wicket penalties
  if (ball.isWicket) {
    if (ball.wicketType === "NORMAL") {
      runs = isPowerplay
        ? SCORING_RULES.POWERPLAY_WICKET_PENALTY
        : SCORING_RULES.NORMAL_WICKET_PENALTY;
    } else if (ball.wicketType === "BOWLING_ONLY") {
      runs = SCORING_RULES.BOWLING_WICKET_BONUS;
    }
  }

  // Powerplay multiplier (only for normal runs, not wickets)
  if (isPowerplay && !ball.isWicket) {
    runs *= SCORING_RULES.POWERPLAY_MULTIPLIER;
  }

  // Extras
  if (ball.isNoball) runs += SCORING_RULES.NOBALL_RUNS;
  if (ball.isWide) runs += SCORING_RULES.WIDE_RUNS;

  // Penalties
  if (ball.misconduct) runs += SCORING_RULES.MISCONDUCT_PENALTY;

  return runs;
}

export function checkThirdBallViolation(
  over: Over,
  ballIndex: number
): boolean {
  if (ballIndex !== 2) return false; // Only check on 3rd ball (index 2)

  const runsSoFar = over.balls
    .slice(0, 2)
    .reduce((sum, b) => sum + b.runs, 0);
  return runsSoFar < 3;
}

export function calculateInningsFinalScore(innings: Innings): number {
  let score = innings.totalRuns;

  // No-wicket bonus
  if (innings.totalWickets === 0) {
    score += SCORING_RULES.NO_WICKET_BONUS;
  }

  return score;
}

export function canBowlerBowlNextOver(
  prevBowlerId: string,
  newBowlerId: string
): boolean {
  return prevBowlerId !== newBowlerId;
}

export function rankTeamsInMatch(
  innings: Innings[]
): { teamId: string; rank: number; points: number }[] {
  const sorted = innings
    .map((i) => ({ teamId: i.teamId, score: i.finalScore }))
    .sort((a, b) => b.score - a.score);

  const pointsMap = [
    POINTS_SYSTEM.FIRST,
    POINTS_SYSTEM.SECOND,
    POINTS_SYSTEM.THIRD,
    POINTS_SYSTEM.FOURTH,
  ];

  return sorted.map((team, index) => ({
    teamId: team.teamId,
    rank: index + 1,
    points: pointsMap[index],
  }));
}
