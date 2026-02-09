import { create } from "zustand";
import type { Team, Match, Tournament } from "@/lib/types";
import { generateDummyTeams, generateDummyMatches } from "@/lib/utils/dummy-data";
import { TOURNAMENT_INFO } from "@/lib/constants";

interface TournamentStore {
  tournament: Tournament;
  teams: Team[];
  matches: Match[];

  // Actions
  initializeDummyData: () => void;
  addTeam: (team: Team) => void;
  removeTeam: (teamId: string) => void;
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
  getMatch: (matchId: string) => Match | undefined;
  getTeam: (teamId: string) => Team | undefined;
}

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  tournament: {
    id: "tdst-season-1",
    name: TOURNAMENT_INFO.NAME,
    fullName: TOURNAMENT_INFO.FULL_NAME,
    organizer: TOURNAMENT_INFO.ORGANIZER,
    venue: TOURNAMENT_INFO.VENUE,
    startDate: new Date(TOURNAMENT_INFO.START_DATE),
    endDate: new Date(TOURNAMENT_INFO.END_DATE),
    startTime: TOURNAMENT_INFO.START_TIME,
    matchesPerTeam: 5,
    teamsPerMatch: 4,
    oversPerInnings: 3,
    tagline: TOURNAMENT_INFO.TAGLINE,
    youtubeLink: TOURNAMENT_INFO.YOUTUBE_LINK,
    registrationLink: TOURNAMENT_INFO.REGISTRATION_LINK,
    contacts: TOURNAMENT_INFO.CONTACTS,
  },
  teams: [],
  matches: [],

  initializeDummyData: () => {
    const teams = generateDummyTeams(20);
    const matches = generateDummyMatches(teams);
    set({ teams, matches });
  },

  addTeam: (team) =>
    set((state) => ({ teams: [...state.teams, team] })),

  removeTeam: (teamId) =>
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== teamId),
    })),

  updateMatch: (matchId, updates) =>
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, ...updates } : m
      ),
    })),

  getMatch: (matchId) => get().matches.find((m) => m.id === matchId),

  getTeam: (teamId) => get().teams.find((t) => t.id === teamId),
}));
