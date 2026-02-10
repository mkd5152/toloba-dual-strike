// Match States
export type MatchState =
  | "CREATED"
  | "READY"
  | "TOSS"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "LOCKED";
export type MatchStage = "LEAGUE" | "SEMI" | "FINAL";
export type InningsState = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type WicketType = "NORMAL" | "BOWLING_ONLY" | null;

// Core Entities
export interface Tournament {
  id: string;
  name: string;
  fullName: string;
  organizer: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  matchesPerTeam: number;
  teamsPerMatch: number;
  oversPerInnings: number;
  tagline?: string;
  youtubeLink?: string;
  registrationLink?: string;
  contacts?: Array<{ name: string; phone: string }>;
}

export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  color: string; // Hex color for UI
  group?: number; // Group number (1-4) for playoff qualification
  players: Player[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type PlayerRole = "batsman" | "bowler" | "all_rounder" | "wicket_keeper" | "none";

export interface Player {
  id: string;
  name: string;
  teamId: string;
  role: PlayerRole;
  isLateArrival?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Match {
  id: string;
  tournamentId: string;
  matchNumber: number;
  court: string;
  startTime: Date;
  umpireId: string | null;
  umpireName: string | null;
  teamIds: [string, string, string, string];
  state: MatchState;
  stage: MatchStage; // Tournament stage: LEAGUE, SEMI, or FINAL
  battingOrder: string[]; // Team IDs in batting order (set at toss)
  innings: Innings[];
  rankings: MatchRanking[];
  lockedAt: Date | null;
}

export interface Innings {
  id: string;
  teamId: string;
  battingPair: [string, string]; // Player IDs
  bowlingTeamId: string;
  state: InningsState;
  overs: Over[];
  powerplayOver: number | null; // 1, 2, or 3
  totalRuns: number;
  totalWickets: number;
  noWicketBonus: boolean;
  finalScore: number; // After bonuses/penalties
}

export interface Over {
  overNumber: number; // 1-3
  bowlerId: string;
  keeperId: string;
  balls: Ball[];
  isPowerplay: boolean;
}

export interface Ball {
  ballNumber: number;
  runs: 0 | 1 | 2 | 3 | 4 | 6;
  isWicket: boolean;
  wicketType: WicketType;
  isNoball: boolean;
  isWide: boolean;
  isFreeHit: boolean;
  misconduct: boolean;
  thirdBallViolation: boolean;
  effectiveRuns: number; // After powerplay/penalties
  timestamp: Date;
}

export interface MatchRanking {
  teamId: string;
  rank: 1 | 2 | 3 | 4;
  points: 5 | 3 | 1 | 0;
  totalRuns: number;
}

export interface StandingsEntry {
  teamId: string;
  teamName: string;
  matchesPlayed: number;
  points: number;
  totalRuns: number;
  totalDismissals: number;
  rank: number;
}
