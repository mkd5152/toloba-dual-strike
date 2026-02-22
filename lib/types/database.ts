/**
 * Database type definitions
 *
 * This file will be auto-generated from Supabase once the database schema is created.
 * Run: npx supabase gen types typescript --project-id <project-ref> > lib/types/database.ts
 *
 * For now, we use a minimal type definition.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'organizer' | 'umpire' | 'spectator'
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'organizer' | 'umpire' | 'spectator'
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'organizer' | 'umpire' | 'spectator'
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          full_name: string
          organizer: string
          venue: string | null
          start_date: string
          end_date: string
          start_time: string
          matches_per_team: number
          teams_per_match: number
          overs_per_innings: number
          tagline: string | null
          youtube_link: string | null
          registration_link: string | null
          contacts: Json | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          full_name: string
          organizer: string
          venue?: string | null
          start_date: string
          end_date: string
          start_time: string
          matches_per_team?: number
          teams_per_match?: number
          overs_per_innings?: number
          tagline?: string | null
          youtube_link?: string | null
          registration_link?: string | null
          contacts?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          full_name?: string
          organizer?: string
          venue?: string | null
          start_date?: string
          end_date?: string
          start_time?: string
          matches_per_team?: number
          teams_per_match?: number
          overs_per_innings?: number
          tagline?: string | null
          youtube_link?: string | null
          registration_link?: string | null
          contacts?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          tournament_id: string
          name: string
          color: string
          group: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tournament_id: string
          name: string
          color: string
          group?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          name?: string
          color?: string
          group?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          team_id: string
          name: string
          role: 'batsman' | 'bowler' | 'all_rounder' | 'wicket_keeper' | 'none' | null
          is_late_arrival: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          team_id: string
          name: string
          role?: 'batsman' | 'bowler' | 'all_rounder' | 'wicket_keeper' | 'none' | null
          is_late_arrival?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          name?: string
          role?: 'batsman' | 'bowler' | 'all_rounder' | 'wicket_keeper' | 'none' | null
          is_late_arrival?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          match_number: number
          court: string
          start_time: string
          umpire_id: string | null
          umpire_name: string | null
          team_ids: string[]
          state: 'CREATED' | 'READY' | 'TOSS' | 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED'
          stage: 'LEAGUE' | 'QF' | 'SEMI' | 'FINAL'
          batting_order: string[] | null
          rankings: Json | null
          locked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tournament_id: string
          match_number: number
          court: string
          start_time: string
          umpire_id?: string | null
          umpire_name?: string | null
          team_ids: string[]
          state: 'CREATED' | 'READY' | 'TOSS' | 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED'
          stage?: 'LEAGUE' | 'QF' | 'SEMI' | 'FINAL'
          batting_order?: string[] | null
          rankings?: Json | null
          locked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          match_number?: number
          court?: string
          start_time?: string
          umpire_id?: string | null
          umpire_name?: string | null
          team_ids?: string[]
          state?: 'CREATED' | 'READY' | 'TOSS' | 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED'
          stage?: 'LEAGUE' | 'QF' | 'SEMI' | 'FINAL'
          batting_order?: string[] | null
          rankings?: Json | null
          locked_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      innings: {
        Row: {
          id: string
          match_id: string
          team_id: string
          batting_pair: string[]
          bowling_team_id: string
          state: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
          powerplay_over: number | null
          total_runs: number
          total_wickets: number
          no_wicket_bonus: boolean
          final_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          match_id: string
          team_id: string
          batting_pair: string[]
          bowling_team_id: string
          state: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
          powerplay_over?: number | null
          total_runs?: number
          total_wickets?: number
          no_wicket_bonus?: boolean
          final_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          team_id?: string
          batting_pair?: string[]
          bowling_team_id?: string
          state?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
          powerplay_over?: number | null
          total_runs?: number
          total_wickets?: number
          no_wicket_bonus?: boolean
          final_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      overs: {
        Row: {
          id: string
          innings_id: string
          over_number: number
          bowler_id: string | null
          keeper_id: string | null
          is_powerplay: boolean
          created_at: string
        }
        Insert: {
          id?: string
          innings_id: string
          over_number: number
          bowler_id?: string | null
          keeper_id?: string | null
          is_powerplay?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          innings_id?: string
          over_number?: number
          bowler_id?: string | null
          keeper_id?: string | null
          is_powerplay?: boolean
          created_at?: string
        }
      }
      balls: {
        Row: {
          id: string
          over_id: string
          ball_number: number
          runs: number
          is_wicket: boolean
          wicket_type: 'NORMAL' | 'BOWLING_ONLY' | null
          is_noball: boolean
          is_wide: boolean
          is_free_hit: boolean
          misconduct: boolean
          effective_runs: number
          timestamp: string
        }
        Insert: {
          id?: string
          over_id: string
          ball_number: number
          runs: number
          is_wicket?: boolean
          wicket_type?: 'NORMAL' | 'BOWLING_ONLY' | null
          is_noball?: boolean
          is_wide?: boolean
          is_free_hit?: boolean
          misconduct?: boolean
          effective_runs: number
          timestamp?: string
        }
        Update: {
          id?: string
          over_id?: string
          ball_number?: number
          runs?: number
          is_wicket?: boolean
          wicket_type?: 'NORMAL' | 'BOWLING_ONLY' | null
          is_noball?: boolean
          is_wide?: boolean
          is_free_hit?: boolean
          misconduct?: boolean
          effective_runs?: number
          timestamp?: string
        }
      }
      player_substitutions: {
        Row: {
          id: string
          match_id: string
          innings_id: string | null
          over_id: string | null
          substitution_type: 'batting_pair' | 'bowler' | 'keeper'
          player_in: string
          player_out: string | null
          reason: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          match_id: string
          innings_id?: string | null
          over_id?: string | null
          substitution_type: 'batting_pair' | 'bowler' | 'keeper'
          player_in: string
          player_out?: string | null
          reason?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          match_id?: string
          innings_id?: string | null
          over_id?: string | null
          substitution_type?: 'batting_pair' | 'bowler' | 'keeper'
          player_in?: string
          player_out?: string | null
          reason?: string | null
          timestamp?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
