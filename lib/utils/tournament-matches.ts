// @ts-nocheck
import type { Team, Tournament, Match } from "@/lib/types";
import { COURTS, TOURNAMENT_RULES } from "@/lib/constants";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Generates tournament matches ensuring fair distribution of teams
 * @param teams - All teams in the tournament
 * @param tournament - Tournament configuration
 * @param matchCount - Number of matches to generate
 * @returns Array of match objects ready to be saved to database
 */
export function generateMatches(
  teams: Team[],
  tournament: Tournament,
  matchCount: number = 25
): Omit<Match, "id" | "createdAt" | "updatedAt">[] {
  if (teams.length < 4) {
    throw new Error("At least 4 teams are required to generate matches");
  }

  const matches: Omit<Match, "id" | "createdAt" | "updatedAt">[] = [];
  const teamAppearances = new Map(teams.map((t) => [t.id, 0]));
  let matchNumber = 1;

  // Calculate tournament start time
  const tournamentStart = new Date(
    `${tournament.startDate.toISOString().split("T")[0]}T${tournament.startTime}:00`
  );

  while (matches.length < matchCount) {
    // Find teams that haven't reached their match limit yet
    const maxAppearances = Math.max(...Array.from(teamAppearances.values()));
    const availableTeams = teams.filter(
      (t) => (teamAppearances.get(t.id) ?? 0) <= maxAppearances
    );

    if (availableTeams.length >= 4) {
      // Randomly select 4 teams for this match
      const selectedTeams = shuffle(availableTeams).slice(0, 4);
      const teamIds = selectedTeams.map((t) => t.id) as [
        string,
        string,
        string,
        string,
      ];

      // Calculate match start time
      // Distribute matches across tournament days, starting at tournament start time
      const matchesPerDay = 5; // Approximate matches per day
      const dayOffset = Math.floor((matchNumber - 1) / matchesPerDay);
      const matchOfDay = (matchNumber - 1) % matchesPerDay;
      const matchStartTime = new Date(tournamentStart);
      matchStartTime.setDate(matchStartTime.getDate() + dayOffset);

      // Parse tournament start time
      const [hours, minutes] = tournament.startTime.split(":").map(Number);
      matchStartTime.setHours(hours, minutes + matchOfDay * 40, 0, 0); // Stagger by 40 mins

      matches.push({
        tournamentId: tournament.id,
        matchNumber,
        court: COURTS[(matchNumber - 1) % COURTS.length],
        startTime: matchStartTime,
        umpireId: null, // Will be assigned later by organizer
        umpireName: null,
        teamIds,
        state: "CREATED",
        battingOrder: [...teamIds], // Initial batting order same as team order
        innings: [], // Will be created when match starts
        rankings: [],
        lockedAt: null,
      });

      // Update team appearances
      selectedTeams.forEach((t) => {
        teamAppearances.set(t.id, (teamAppearances.get(t.id) ?? 0) + 1);
      });

      matchNumber++;
    } else {
      // Not enough teams available, stop generation
      break;
    }
  }

  return matches;
}

/**
 * Validates if match generation is possible
 */
export function canGenerateMatches(teams: Team[]): {
  canGenerate: boolean;
  reason?: string;
} {
  if (teams.length < 4) {
    return {
      canGenerate: false,
      reason: "At least 4 teams are required",
    };
  }

  return { canGenerate: true };
}
