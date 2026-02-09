-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('organizer', 'umpire', 'spectator')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. TOURNAMENTS TABLE
-- ============================================================================
CREATE TABLE public.tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  organizer TEXT NOT NULL,
  venue TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  matches_per_team INT DEFAULT 5,
  teams_per_match INT DEFAULT 4,
  overs_per_innings INT DEFAULT 3,
  tagline TEXT,
  youtube_link TEXT,
  registration_link TEXT,
  contacts JSONB,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. TEAMS TABLE
-- ============================================================================
CREATE TABLE public.teams (
  id TEXT PRIMARY KEY,
  tournament_id TEXT REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. PLAYERS TABLE
-- ============================================================================
CREATE TABLE public.players (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('batsman', 'bowler', 'all_rounder', 'wicket_keeper', 'none')),
  is_late_arrival BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. MATCHES TABLE
-- ============================================================================
CREATE TABLE public.matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT REFERENCES public.tournaments(id) ON DELETE CASCADE,
  match_number INT NOT NULL,
  court TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  umpire_id UUID REFERENCES public.profiles(id),
  umpire_name TEXT,
  team_ids TEXT[] NOT NULL CHECK (array_length(team_ids, 1) = 4),
  state TEXT NOT NULL CHECK (state IN ('CREATED', 'READY', 'TOSS', 'IN_PROGRESS', 'COMPLETED', 'LOCKED')),
  batting_order TEXT[],
  rankings JSONB,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. INNINGS TABLE
-- ============================================================================
CREATE TABLE public.innings (
  id TEXT PRIMARY KEY,
  match_id TEXT REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id TEXT REFERENCES public.teams(id),
  batting_pair TEXT[] CHECK (array_length(batting_pair, 1) = 2),
  bowling_team_id TEXT REFERENCES public.teams(id),
  state TEXT NOT NULL CHECK (state IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
  powerplay_over INT CHECK (powerplay_over IN (1, 2, 3)),
  total_runs INT DEFAULT 0,
  total_wickets INT DEFAULT 0,
  no_wicket_bonus BOOLEAN DEFAULT FALSE,
  final_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. OVERS TABLE
-- ============================================================================
CREATE TABLE public.overs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  innings_id TEXT REFERENCES public.innings(id) ON DELETE CASCADE,
  over_number INT NOT NULL CHECK (over_number BETWEEN 1 AND 3),
  bowler_id TEXT REFERENCES public.players(id),
  keeper_id TEXT REFERENCES public.players(id),
  is_powerplay BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. BALLS TABLE
-- ============================================================================
CREATE TABLE public.balls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  over_id UUID REFERENCES public.overs(id) ON DELETE CASCADE,
  ball_number INT NOT NULL CHECK (ball_number BETWEEN 1 AND 6),
  runs INT NOT NULL CHECK (runs IN (0, 1, 2, 3, 4, 6)),
  is_wicket BOOLEAN DEFAULT FALSE,
  wicket_type TEXT CHECK (wicket_type IN ('NORMAL', 'BOWLING_ONLY', NULL)),
  is_noball BOOLEAN DEFAULT FALSE,
  is_wide BOOLEAN DEFAULT FALSE,
  is_free_hit BOOLEAN DEFAULT FALSE,
  misconduct BOOLEAN DEFAULT FALSE,
  third_ball_violation BOOLEAN DEFAULT FALSE,
  effective_runs INT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. PLAYER SUBSTITUTIONS TABLE (NEW)
-- ============================================================================
CREATE TABLE public.player_substitutions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id TEXT REFERENCES public.matches(id) ON DELETE CASCADE,
  innings_id TEXT REFERENCES public.innings(id),
  over_id UUID REFERENCES public.overs(id),
  substitution_type TEXT NOT NULL CHECK (substitution_type IN ('batting_pair', 'bowler', 'keeper')),
  player_in TEXT REFERENCES public.players(id),
  player_out TEXT REFERENCES public.players(id),
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_teams_tournament ON public.teams(tournament_id);
CREATE INDEX idx_players_team ON public.players(team_id);
CREATE INDEX idx_matches_tournament ON public.matches(tournament_id);
CREATE INDEX idx_matches_state ON public.matches(state);
CREATE INDEX idx_matches_umpire ON public.matches(umpire_id);
CREATE INDEX idx_innings_match ON public.innings(match_id);
CREATE INDEX idx_overs_innings ON public.overs(innings_id);
CREATE INDEX idx_balls_over ON public.balls(over_id);
CREATE INDEX idx_balls_timestamp ON public.balls(timestamp);
CREATE INDEX idx_substitutions_match ON public.player_substitutions(match_id);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_innings_updated_at
  BEFORE UPDATE ON public.innings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INSERT DEFAULT TOURNAMENT
-- ============================================================================
INSERT INTO public.tournaments (
  id,
  name,
  full_name,
  organizer,
  venue,
  start_date,
  end_date,
  start_time,
  tagline,
  youtube_link,
  registration_link,
  contacts
)
VALUES (
  'tdst-season-1',
  'TDST – Season 1',
  'Toloba Dual Strike Tournament – Season 1',
  'Toloba',
  'TBD',
  '2026-02-26',
  '2026-03-01',
  '20:30:00',
  'Two players. One mission. Dual Strike. 👑',
  'https://youtu.be/mMVo6wet-L0?si=vzLx1Dpw7Cl--jQM',
  'https://forms.gle/hvyjFPtwM96qyJBK7',
  '[{"name": "Mustafa", "phone": "+971 56 736 9803"}, {"name": "Huzefa", "phone": "+971 56 355 0605"}]'::jsonb
);
