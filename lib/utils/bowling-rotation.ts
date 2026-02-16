/**
 * Bowling Rotation Calculator
 *
 * In Dual Strike format:
 * - 4 teams play together in one match
 * - Each team bats for 3 overs (total 12 overs per match)
 * - During each team's 3-over innings, the OTHER 3 teams each bowl 1 over
 * - Rotation ensures fair distribution of bowling across all teams
 */

/**
 * Calculate which 3 teams bowl during a specific innings
 *
 * Uses "bottom-to-top" rotation pattern:
 * - When Team A (index 0) bats: Bowl with teams at indices [3,2,1] (D,C,B)
 * - When Team B (index 1) bats: Bowl with teams at indices [2,0,3] (C,A,D)
 * - When Team C (index 2) bats: Bowl with teams at indices [1,0,3] (B,A,D)
 * - When Team D (index 3) bats: Bowl with teams at indices [2,1,0] (C,B,A)
 *
 * @param battingOrder - Array of 4 team IDs in batting order (from toss)
 * @param inningsIndex - Innings number (0-3)
 * @returns Array of 3 team IDs that will bowl (one over each)
 *
 * Example:
 * battingOrder = ['team-a', 'team-b', 'team-c', 'team-d']
 * inningsIndex = 0 (Team A batting at index 0)
 * Returns: ['team-d', 'team-c', 'team-b'] - bottom-to-top rotation
 */
export function calculateBowlingTeamsForInnings(
  battingOrder: string[],
  inningsIndex: number
): [string, string, string] {
  if (battingOrder.length !== 4) {
    throw new Error("Batting order must have exactly 4 teams");
  }
  if (inningsIndex < 0 || inningsIndex > 3) {
    throw new Error("Innings index must be between 0 and 3");
  }

  // Bottom-to-top rotation pattern based on batting position
  const bowlingPatterns = [
    [3, 2, 1], // When index 0 bats: bowl with indices 3,2,1 (bottom to top)
    [2, 0, 3], // When index 1 bats: bowl with indices 2,0,3
    [1, 0, 3], // When index 2 bats: bowl with indices 1,0,3
    [2, 1, 0], // When index 3 bats: bowl with indices 2,1,0
  ];

  const bowlingIndices = bowlingPatterns[inningsIndex];

  return [
    battingOrder[bowlingIndices[0]],
    battingOrder[bowlingIndices[1]],
    battingOrder[bowlingIndices[2]],
  ];
}

/**
 * Calculate complete bowling rotation for entire match
 *
 * @param battingOrder - Array of 4 team IDs in batting order (from toss)
 * @returns Object mapping innings index to array of 3 bowling team IDs
 *
 * Example output:
 * {
 *   0: ['team-a', 'team-c', 'team-d'], // Innings 1: Team B bats
 *   1: ['team-b', 'team-a', 'team-c'], // Innings 2: Team D bats
 *   2: ['team-b', 'team-c', 'team-d'], // Innings 3: Team A bats
 *   3: ['team-b', 'team-d', 'team-a']  // Innings 4: Team C bats
 * }
 */
export function calculateFullMatchBowlingRotation(
  battingOrder: string[]
): Record<number, [string, string, string]> {
  const rotation: Record<number, [string, string, string]> = {};

  for (let inningsIndex = 0; inningsIndex < 4; inningsIndex++) {
    rotation[inningsIndex] = calculateBowlingTeamsForInnings(
      battingOrder,
      inningsIndex
    );
  }

  return rotation;
}

/**
 * Get bowling team for a specific over
 *
 * @param battingOrder - Array of 4 team IDs in batting order
 * @param inningsIndex - Innings number (0-3)
 * @param overNumber - Over number (1, 2, or 3)
 * @returns Team ID that bowls this over
 */
export function getBowlingTeamForOver(
  battingOrder: string[],
  inningsIndex: number,
  overNumber: number
): string {
  if (overNumber < 1 || overNumber > 3) {
    throw new Error("Over number must be 1, 2, or 3");
  }

  const bowlingTeams = calculateBowlingTeamsForInnings(battingOrder, inningsIndex);
  return bowlingTeams[overNumber - 1]; // overNumber is 1-indexed
}

/**
 * Validate that bowler and keeper are from the correct bowling team
 *
 * @param bowlerId - Player ID of bowler
 * @param keeperId - Player ID of keeper
 * @param expectedBowlingTeamId - Team ID that should bowl this over
 * @param playersMap - Map of player IDs to player objects (with teamId)
 * @returns Object with validation result and error message if any
 */
export function validateBowlerKeeper(
  bowlerId: string,
  keeperId: string,
  expectedBowlingTeamId: string,
  playersMap: Record<string, { teamId: string; name: string }>
): { valid: boolean; error?: string } {
  const bowler = playersMap[bowlerId];
  const keeper = playersMap[keeperId];

  if (!bowler) {
    return { valid: false, error: "Bowler not found" };
  }

  if (!keeper) {
    return { valid: false, error: "Keeper not found" };
  }

  if (bowlerId === keeperId) {
    return { valid: false, error: "Bowler and keeper cannot be the same player" };
  }

  if (bowler.teamId !== expectedBowlingTeamId) {
    return {
      valid: false,
      error: `Bowler must be from ${expectedBowlingTeamId}, but is from ${bowler.teamId}`,
    };
  }

  if (keeper.teamId !== expectedBowlingTeamId) {
    return {
      valid: false,
      error: `Keeper must be from ${expectedBowlingTeamId}, but is from ${keeper.teamId}`,
    };
  }

  return { valid: true };
}
