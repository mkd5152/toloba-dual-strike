import { Ball, Over, Innings } from "@/lib/types";
import { SCORING_RULES, POINTS_SYSTEM } from "@/lib/constants";

export function calculateBallRuns(ball: Ball, isPowerplay: boolean): number {
  let runs: number = ball.runs;

  // Wicket penalties for BATTING team
  if (ball.isWicket) {
    if (ball.wicketType === "NORMAL") {
      // 3 consecutive dot balls = normal wicket penalty
      runs = isPowerplay
        ? SCORING_RULES.POWERPLAY_WICKET_PENALTY
        : SCORING_RULES.NORMAL_WICKET_PENALTY;
    } else if (ball.wicketType === "BOWLING_TEAM" || ball.wicketType === "CATCH_OUT" || ball.wicketType === "RUN_OUT") {
      // These wickets give penalty to batting team
      // Fielding credit (+5 runs) is handled separately in match-store
      runs = isPowerplay
        ? SCORING_RULES.POWERPLAY_WICKET_PENALTY
        : SCORING_RULES.NORMAL_WICKET_PENALTY;
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

/**
 * Check if the current ball is the 3rd consecutive dot ball (0 runs)
 * A dot ball is a legal delivery where the batting team scores 0 runs.
 * Extras (noballs, wides) do NOT count as dot balls.
 * If this is the 3rd consecutive dot ball, it should be considered a wicket.
 */
export function checkConsecutiveDotBallViolation(
  over: Over,
  currentBallRuns: number,
  currentBallIsNoball: boolean,
  currentBallIsWide: boolean,
  previousOvers?: Over[]
): boolean {
  // Only apply if current ball is a legal dot ball (0 runs, no extras)
  if (currentBallRuns !== 0 || currentBallIsNoball || currentBallIsWide) {
    return false;
  }

  const allPreviousBalls: Ball[] = [];

  // Add balls from current over FIRST (most recent)
  for (let i = over.balls.length - 1; i >= 0; i--) {
    allPreviousBalls.push(over.balls[i]);
  }

  // Then collect balls from previous overs (in reverse order, most recent first)
  if (previousOvers && previousOvers.length > 0) {
    for (let i = previousOvers.length - 1; i >= 0; i--) {
      const prevOver = previousOvers[i];
      for (let j = prevOver.balls.length - 1; j >= 0; j--) {
        allPreviousBalls.push(prevOver.balls[j]);
      }
    }
  }

  // Find the last 2 LEGAL dot balls (excluding noballs and wides)
  let dotBallCount = 0;

  for (const ball of allPreviousBalls) {
    // Only count legal dot balls (0 runs, not noball, not wide)
    if (ball.runs === 0 && !ball.isNoball && !ball.isWide) {
      dotBallCount++;
      if (dotBallCount === 2) {
        // Found 2 consecutive legal dot balls before current ball
        return true;
      }
    } else {
      // Not a dot ball - reset counter
      break;
    }
  }

  return false;
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

/**
 * Calculate fielding credits for all teams in the match
 * Returns a map of teamId -> total fielding bonus runs
 */
export function calculateFieldingCredits(innings: Innings[]): Record<string, number> {
  const credits: Record<string, number> = {};

  for (const inning of innings) {
    for (const over of inning.overs) {
      for (const ball of over.balls) {
        if (ball.isWicket && ball.fieldingTeamId) {
          // CATCH_OUT or RUN_OUT: Credit the fielding team
          credits[ball.fieldingTeamId] = (credits[ball.fieldingTeamId] || 0) + SCORING_RULES.BOWLING_WICKET_BONUS;
        } else if (ball.isWicket && ball.wicketType === "BOWLING_TEAM") {
          // BOWLING_TEAM wicket: Credit the bowling team (current over's bowling team)
          const bowlingTeamId = over.bowlingTeamId;
          credits[bowlingTeamId] = (credits[bowlingTeamId] || 0) + SCORING_RULES.BOWLING_WICKET_BONUS;
        }
      }
    }
  }

  return credits;
}

export function rankTeamsInMatch(
  innings: Innings[]
): { teamId: string; rank: number; points: number; totalScore: number }[] {
  // Calculate fielding credits for all teams
  const fieldingCredits = calculateFieldingCredits(innings);

  // Debug log to check finalScore values
  console.log("=== RANKING DEBUG ===");
  innings.forEach((i) => {
    console.log(`Team ${i.teamId}: totalRuns=${i.totalRuns}, finalScore=${i.finalScore}, state=${i.state}, fielding=${fieldingCredits[i.teamId] || 0}`);
  });

  // Apply fielding credits to final scores
  const sorted = innings
    .map((i) => {
      // SAFETY CHECK: Ensure finalScore exists and is a number
      const finalScore = (typeof i.finalScore === 'number' && !isNaN(i.finalScore))
        ? i.finalScore
        : (i.totalRuns + (i.totalWickets === 0 ? 10 : 0)); // Recalculate if missing

      const fieldingBonus = fieldingCredits[i.teamId] || 0;
      const totalScore = finalScore + fieldingBonus;

      console.log(`Team ${i.teamId}: finalScore=${finalScore}, fielding=${fieldingBonus}, total=${totalScore}`);

      return {
        teamId: i.teamId,
        score: totalScore,
      };
    })
    .sort((a, b) => b.score - a.score);

  const pointsMap = [
    POINTS_SYSTEM.FIRST,   // 5
    POINTS_SYSTEM.SECOND,  // 3
    POINTS_SYSTEM.THIRD,   // 1
    POINTS_SYSTEM.FOURTH,  // 0
  ];

  const results: { teamId: string; rank: number; points: number; totalScore: number }[] = [];
  let i = 0;

  while (i < sorted.length) {
    // Find all teams tied with current team
    const currentScore = sorted[i].score;
    const tiedTeams: typeof sorted = [];
    let j = i;

    while (j < sorted.length && sorted[j].score === currentScore) {
      tiedTeams.push(sorted[j]);
      j++;
    }

    // Calculate average points for tied teams
    // If 2 teams tie for 2nd place, they get average of positions 2 and 3: (3+1)/2 = 2
    let totalPoints = 0;
    for (let k = 0; k < tiedTeams.length; k++) {
      totalPoints += pointsMap[i + k];
    }
    const avgPoints = totalPoints / tiedTeams.length;

    // Assign same rank and points to all tied teams
    const rank = i + 1;
    for (const team of tiedTeams) {
      results.push({
        teamId: team.teamId,
        rank: rank,
        points: avgPoints,
        totalScore: team.score, // Include the total score (finalScore + fielding)
      });
    }

    // Move to next group of teams
    i = j;
  }

  console.log("=== FINAL RANKINGS ===");
  results.forEach((r) => {
    console.log(`Team ${r.teamId}: rank=${r.rank}, points=${r.points}, totalScore=${r.totalScore}`);
  });

  return results;
}
