/**
 * API Layer - Centralized exports
 */

// Teams
export {
  fetchTeams,
  fetchTeam,
  createTeam,
  updateTeam,
  deleteTeam,
} from "./teams"

// Players
export {
  fetchPlayersByTeam,
  fetchPlayersByTeams,
  createPlayer,
  createPlayers,
  updatePlayer,
  deletePlayer,
  deletePlayersByTeam,
} from "./players"

// Matches
export {
  fetchMatches,
  fetchMatch,
  fetchUmpireMatches,
  createMatch,
  updateMatch,
  assignUmpire,
  updateMatchRankings,
  lockMatch,
  deleteMatch,
} from "./matches"

// Standings
export {
  calculateStandings,
  getTopTeams,
  getTeamRank,
} from "./standings"
