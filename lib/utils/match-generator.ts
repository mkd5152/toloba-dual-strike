import { Match, Innings, Over } from "@/lib/types";
import { TOURNAMENT_RULES } from "@/lib/constants";

/**
 * Creates empty innings structure for a match (4 teams = 4 innings, 3 overs each).
 * Used when starting a match for scoring.
 */
export function createEmptyInningsForMatch(
  battingOrder: string[],
  getBattingPair: (teamId: string) => [string, string],
  getBowlingTeamId: (battingTeamIndex: number) => string
): Innings[] {
  return battingOrder.map((teamId, index) => {
    const overs: Over[] = Array.from(
      { length: TOURNAMENT_RULES.OVERS_PER_INNINGS },
      (_, i) => ({
        overNumber: i + 1,
        bowlerId: "",
        keeperId: "",
        balls: [],
        isPowerplay: false,
      })
    );
    const battingPair = getBattingPair(teamId);
    const bowlingTeamId = getBowlingTeamId(index);
    return {
      id: `innings-${teamId}-${Date.now()}`,
      teamId,
      battingPair,
      bowlingTeamId,
      state: "NOT_STARTED" as const,
      overs,
      powerplayOver: null,
      totalRuns: 0,
      totalWickets: 0,
      noWicketBonus: false,
      finalScore: 0,
    };
  });
}

/**
 * Ensures a match has innings structure. If innings is empty, creates 4 placeholder
 * innings (one per team in batting order). Call when starting scoring.
 */
export function ensureMatchInnings(match: Match): Match {
  if (match.innings.length > 0) return match;

  const battingOrder =
    match.battingOrder.length === 4
      ? match.battingOrder
      : [...match.teamIds].slice(0, 4);
  const getBattingPair = (_teamId: string): [string, string] => [
    "player-1",
    "player-2",
  ];
  const getBowlingTeamId = (battingIndex: number): string => {
    const others = battingOrder.filter((_, i) => i !== battingIndex);
    return others[0] ?? match.teamIds[0];
  };

  const innings = createEmptyInningsForMatch(
    battingOrder,
    getBattingPair,
    getBowlingTeamId
  );
  return { ...match, innings };
}
