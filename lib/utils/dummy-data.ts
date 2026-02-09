import {
  Team,
  Player,
  Match,
  Innings,
  Over,
  Ball,
} from "@/lib/types";
import { TEAM_COLORS, COURTS, UMPIRE_NAMES, TOURNAMENT_INFO } from "@/lib/constants";
import { TOURNAMENT_RULES, POINTS_SYSTEM } from "@/lib/constants";
import type { MatchRanking } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function generateDummyTeams(count: number = 20): Team[] {
  const teamNames = [
    "Chennai Kings",
    "Mumbai Warriors",
    "Delhi Daredevils",
    "Bangalore Royals",
    "Kolkata Knights",
    "Hyderabad Tigers",
    "Punjab Lions",
    "Rajasthan Rangers",
    "Gujarat Giants",
    "Lucknow Legends",
    "Ahmedabad Aces",
    "Jaipur Jaguars",
    "Pune Panthers",
    "Kochi Kings",
    "Indore Indians",
    "Nagpur Ninjas",
    "Surat Strikers",
    "Bhopal Blazers",
    "Patna Patriots",
    "Ranchi Riders",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `team-${i + 1}`,
    name: teamNames[i],
    color: TEAM_COLORS[i],
    players: [
      {
        id: `player-${i * 2 + 1}`,
        name: `Player ${i * 2 + 1}A`,
        teamId: `team-${i + 1}`,
        isLateArrival: false,
      },
      {
        id: `player-${i * 2 + 2}`,
        name: `Player ${i * 2 + 1}B`,
        teamId: `team-${i + 1}`,
        isLateArrival: false,
      },
    ],
  }));
}

export function generateDummyMatches(teams: Team[]): Match[] {
  const matches: Match[] = [];
  let matchNumber = 1;
  const teamAppearances = new Map(teams.map((t) => [t.id, 0]));

  while (matches.length < 25) {
    const availableTeams = teams.filter(
      (t) => (teamAppearances.get(t.id) ?? 0) < 5
    );

    if (availableTeams.length >= 4) {
      const selectedTeams = shuffle(availableTeams).slice(0, 4);
      const teamIds = selectedTeams.map((t) => t.id) as [
        string,
        string,
        string,
        string,
      ];
      const battingOrder = [...teamIds];
      const isInProgress = matchNumber === 4;
      const emptyInnings: Innings[] = isInProgress
        ? teamIds.map((teamId, idx) => ({
            id: `innings-${matchNumber}-${teamId}`,
            teamId,
            battingPair: [
              selectedTeams[idx].players[0].id,
              selectedTeams[idx].players[1].id,
            ],
            bowlingTeamId: teamIds[(idx + 1) % 4],
            state: idx === 0 ? ("IN_PROGRESS" as const) : ("NOT_STARTED" as const),
            overs: Array.from(
              { length: TOURNAMENT_RULES.OVERS_PER_INNINGS },
              (_, i) => ({
                overNumber: i + 1,
                bowlerId: selectedTeams[(idx + 1) % 4].players[0].id,
                keeperId: selectedTeams[(idx + 1) % 4].players[1].id,
                balls: [],
                isPowerplay: false,
              })
            ),
            powerplayOver: null,
            totalRuns: 0,
            totalWickets: 0,
            noWicketBonus: false,
            finalScore: 0,
          }))
        : [];

      // Calculate match start time during tournament period (Feb 26 - Mar 1, 2026)
      // Starting at 8:30 PM (20:30) and spacing matches throughout the days
      const tournamentStart = new Date(TOURNAMENT_INFO.START_DATE + "T" + TOURNAMENT_INFO.START_TIME + ":00");
      const matchStartTime = new Date(tournamentStart);
      const matchesPerDay = 5; // Approximate matches per day
      const dayOffset = Math.floor((matchNumber - 1) / matchesPerDay);
      const matchOfDay = (matchNumber - 1) % matchesPerDay;
      matchStartTime.setDate(matchStartTime.getDate() + dayOffset);
      matchStartTime.setHours(20, 30 + (matchOfDay * 40), 0, 0); // Stagger by 40 mins

      matches.push({
        id: `match-${matchNumber}`,
        matchNumber,
        court: COURTS[(matchNumber - 1) % COURTS.length],
        startTime: matchStartTime,
        umpireId: `umpire-${(matchNumber % 8) + 1}`,
        umpireName: UMPIRE_NAMES[matchNumber % UMPIRE_NAMES.length],
        teamIds,
        state:
          matchNumber <= 3
            ? "COMPLETED"
            : isInProgress
              ? "IN_PROGRESS"
              : "CREATED",
        battingOrder,
        innings: emptyInnings,
        rankings:
          matchNumber <= 3
            ? ([[5, 45], [3, 38], [1, 32], [0, 28]] as [number, number][]).map(
                ([points, totalRuns], i) =>
                  ({
                    teamId: teamIds[i],
                    rank: (i + 1) as 1 | 2 | 3 | 4,
                    points: points as 5 | 3 | 1 | 0,
                    totalRuns,
                  }) satisfies MatchRanking
              )
            : [],
        lockedAt: matchNumber <= 2 ? new Date() : null,
      });

      selectedTeams.forEach((t) => {
        teamAppearances.set(t.id, (teamAppearances.get(t.id) ?? 0) + 1);
      });

      matchNumber++;
    } else {
      break;
    }
  }

  return matches;
}

export function generateCompletedInnings(
  teamId: string,
  players: Player[]
): Innings {
  const totalRuns = Math.floor(Math.random() * 40) + 20; // 20-60 runs
  const totalWickets = Math.floor(Math.random() * 3); // 0-2 wickets

  return {
    id: `innings-${Date.now()}-${Math.random()}`,
    teamId,
    battingPair: [players[0].id, players[1].id],
    bowlingTeamId: "team-opponent",
    state: "COMPLETED",
    overs: generateCompletedOvers(),
    powerplayOver: Math.random() > 0.5 ? 2 : null,
    totalRuns,
    totalWickets,
    noWicketBonus: totalWickets === 0,
    finalScore: totalWickets === 0 ? totalRuns + 10 : totalRuns,
  };
}

function generateCompletedOvers(): Over[] {
  return [1, 2, 3].map((overNum) => ({
    overNumber: overNum,
    bowlerId: `bowler-${overNum}`,
    keeperId: `keeper-${overNum}`,
    balls: generateCompletedBalls(overNum === 2),
    isPowerplay: overNum === 2,
  }));
}

function generateCompletedBalls(isPowerplay: boolean): Ball[] {
  return Array.from({ length: 6 }, (_, i) => {
    const runs = [0, 1, 2, 4, 6][
      Math.floor(Math.random() * 5)
    ] as 0 | 1 | 2 | 4 | 6;
    const isWicket = Math.random() < 0.1;

    return {
      ballNumber: i + 1,
      runs: isWicket ? 0 : runs,
      isWicket,
      wicketType: isWicket ? "NORMAL" : null,
      isNoball: false,
      isWide: false,
      isFreeHit: false,
      misconduct: false,
      thirdBallViolation: false,
      effectiveRuns: isPowerplay && !isWicket ? runs * 2 : runs,
      timestamp: new Date(),
    };
  });
}
