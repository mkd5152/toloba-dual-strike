import { create } from "zustand";
import type { Team, Match, Tournament } from "@/lib/types";
import { generateDummyTeams, generateDummyMatches } from "@/lib/utils/dummy-data";
import { TOURNAMENT_INFO } from "@/lib/constants";
import * as teamsAPI from "@/lib/api/teams";
import * as playersAPI from "@/lib/api/players";
import * as matchesAPI from "@/lib/api/matches";

interface TournamentStore {
  tournament: Tournament;
  teams: Team[];
  matches: Match[];
  loading: boolean;
  error: string | null;

  // Actions
  initializeDummyData: () => void;
  loadTeams: () => Promise<void>;
  loadMatches: () => Promise<void>;
  addTeam: (team: Omit<Team, "id" | "createdAt" | "updatedAt" | "players" | "tournamentId">) => Promise<Team>;
  removeTeam: (teamId: string) => Promise<void>;
  updateMatch: (matchId: string, updates: Partial<Match>) => Promise<void>;
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
    contacts: [...TOURNAMENT_INFO.CONTACTS],
  },
  teams: [],
  matches: [],
  loading: false,
  error: null,

  // Initialize with dummy data (for development/demo)
  initializeDummyData: () => {
    const teams = generateDummyTeams(20);
    const matches = generateDummyMatches(teams);
    set({ teams, matches });
  },

  // Load teams from database
  loadTeams: async () => {
    try {
      set({ loading: true, error: null });
      const { tournament } = get();

      // Fetch teams
      const teams = await teamsAPI.fetchTeams(tournament.id);

      // Fetch players for all teams
      const teamIds = teams.map(t => t.id);
      if (teamIds.length > 0) {
        const playersByTeam = await playersAPI.fetchPlayersByTeams(teamIds);

        // Attach players to teams
        teams.forEach(team => {
          team.players = playersByTeam[team.id] || [];
        });
      }

      set({ teams, loading: false });
    } catch (err) {
      console.error("Error loading teams:", err);
      set({
        error: err instanceof Error ? err.message : "Failed to load teams",
        loading: false
      });
    }
  },

  // Load matches from database
  loadMatches: async () => {
    try {
      set({ loading: true, error: null });
      const { tournament } = get();

      const matches = await matchesAPI.fetchMatches(tournament.id);
      set({ matches, loading: false });
    } catch (err) {
      console.error("Error loading matches:", err);
      set({
        error: err instanceof Error ? err.message : "Failed to load matches",
        loading: false
      });
    }
  },

  // Add team to database
  addTeam: async (teamData) => {
    try {
      set({ loading: true, error: null });
      const { tournament } = get();

      // Create team in database
      const team = await teamsAPI.createTeam({
        ...teamData,
        tournamentId: tournament.id,
      });

      // Update local state
      set((state) => ({
        teams: [...state.teams, team],
        loading: false
      }));

      return team;
    } catch (err) {
      console.error("Error adding team:", err);
      set({
        error: err instanceof Error ? err.message : "Failed to add team",
        loading: false
      });
      throw err;
    }
  },

  // Remove team from database
  removeTeam: async (teamId) => {
    try {
      set({ loading: true, error: null });

      // Delete team's players first
      await playersAPI.deletePlayersByTeam(teamId);

      // Delete team
      await teamsAPI.deleteTeam(teamId);

      // Update local state
      set((state) => ({
        teams: state.teams.filter((t) => t.id !== teamId),
        loading: false
      }));
    } catch (err) {
      console.error("Error removing team:", err);
      set({
        error: err instanceof Error ? err.message : "Failed to remove team",
        loading: false
      });
      throw err;
    }
  },

  // Update match in database
  updateMatch: async (matchId, updates) => {
    try {
      set({ loading: true, error: null });

      // Update match in database
      const updatedMatch = await matchesAPI.updateMatch(matchId, updates);

      // Update local state
      set((state) => ({
        matches: state.matches.map((m) =>
          m.id === matchId ? updatedMatch : m
        ),
        loading: false
      }));
    } catch (err) {
      console.error("Error updating match:", err);
      set({
        error: err instanceof Error ? err.message : "Failed to update match",
        loading: false
      });
      throw err;
    }
  },

  getMatch: (matchId) => get().matches.find((m) => m.id === matchId),

  getTeam: (teamId) => get().teams.find((t) => t.id === teamId),
}));
