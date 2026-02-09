-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_substitutions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- TOURNAMENTS POLICIES
-- ============================================================================
-- Anyone can view tournaments
CREATE POLICY "Anyone can view tournaments"
  ON public.tournaments FOR SELECT
  USING (true);

-- Organizers can create tournaments
CREATE POLICY "Organizers can create tournaments"
  ON public.tournaments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
  );

-- Organizers can update their own tournaments
CREATE POLICY "Organizers can update their tournaments"
  ON public.tournaments FOR UPDATE
  USING (created_by = auth.uid());

-- Organizers can delete their own tournaments
CREATE POLICY "Organizers can delete their tournaments"
  ON public.tournaments FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================================
-- TEAMS POLICIES
-- ============================================================================
-- Anyone can view teams
CREATE POLICY "Anyone can view teams"
  ON public.teams FOR SELECT
  USING (true);

-- Organizers can create teams in their tournament
CREATE POLICY "Organizers can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tournaments t
      WHERE t.id = tournament_id
        AND t.created_by = auth.uid()
    )
  );

-- Organizers can update teams in their tournament
CREATE POLICY "Organizers can update teams"
  ON public.teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments t
      WHERE t.id = tournament_id
        AND t.created_by = auth.uid()
    )
  );

-- Organizers can delete teams in their tournament
CREATE POLICY "Organizers can delete teams"
  ON public.teams FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments t
      WHERE t.id = tournament_id
        AND t.created_by = auth.uid()
    )
  );

-- ============================================================================
-- PLAYERS POLICIES (Inherit from team's tournament)
-- ============================================================================
-- Anyone can view players
CREATE POLICY "Anyone can view players"
  ON public.players FOR SELECT
  USING (true);

-- Organizers can manage players in their tournament teams
CREATE POLICY "Organizers can manage players"
  ON public.players FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teams tm
      JOIN public.tournaments t ON tm.tournament_id = t.id
      WHERE tm.id = team_id
        AND t.created_by = auth.uid()
    )
  );

-- ============================================================================
-- MATCHES POLICIES
-- ============================================================================
-- Anyone can view matches
CREATE POLICY "Anyone can view matches"
  ON public.matches FOR SELECT
  USING (true);

-- Organizers can create matches in their tournament
CREATE POLICY "Organizers can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tournaments t
      WHERE t.id = tournament_id
        AND t.created_by = auth.uid()
    )
  );

-- Organizers and assigned umpires can update matches
CREATE POLICY "Organizers and umpires can update matches"
  ON public.matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments t
      WHERE t.id = tournament_id
        AND t.created_by = auth.uid()
    )
    OR (umpire_id = auth.uid())
  );

-- Organizers can delete matches in their tournament
CREATE POLICY "Organizers can delete matches"
  ON public.matches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tournaments t
      WHERE t.id = tournament_id
        AND t.created_by = auth.uid()
    )
  );

-- ============================================================================
-- INNINGS POLICIES
-- ============================================================================
-- Anyone can view innings
CREATE POLICY "Anyone can view innings"
  ON public.innings FOR SELECT
  USING (true);

-- Umpires and organizers can manage innings for their matches
CREATE POLICY "Umpires can manage innings"
  ON public.innings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
        AND m.umpire_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.tournaments t ON m.tournament_id = t.id
      WHERE m.id = match_id
        AND t.created_by = auth.uid()
    )
  );

-- ============================================================================
-- OVERS POLICIES
-- ============================================================================
-- Anyone can view overs
CREATE POLICY "Anyone can view overs"
  ON public.overs FOR SELECT
  USING (true);

-- Umpires and organizers can manage overs
CREATE POLICY "Umpires can manage overs"
  ON public.overs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.innings i
      JOIN public.matches m ON i.match_id = m.id
      WHERE i.id = innings_id
        AND m.umpire_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.innings i
      JOIN public.matches m ON i.match_id = m.id
      JOIN public.tournaments t ON m.tournament_id = t.id
      WHERE i.id = innings_id
        AND t.created_by = auth.uid()
    )
  );

-- ============================================================================
-- BALLS POLICIES
-- ============================================================================
-- Anyone can view balls
CREATE POLICY "Anyone can view balls"
  ON public.balls FOR SELECT
  USING (true);

-- Umpires and organizers can manage balls
CREATE POLICY "Umpires can manage balls"
  ON public.balls FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.overs o
      JOIN public.innings i ON o.innings_id = i.id
      JOIN public.matches m ON i.match_id = m.id
      WHERE o.id = over_id
        AND m.umpire_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.overs o
      JOIN public.innings i ON o.innings_id = i.id
      JOIN public.matches m ON i.match_id = m.id
      JOIN public.tournaments t ON m.tournament_id = t.id
      WHERE o.id = over_id
        AND t.created_by = auth.uid()
    )
  );

-- ============================================================================
-- PLAYER SUBSTITUTIONS POLICIES
-- ============================================================================
-- Anyone can view substitutions
CREATE POLICY "Anyone can view substitutions"
  ON public.player_substitutions FOR SELECT
  USING (true);

-- Umpires and organizers can manage substitutions
CREATE POLICY "Umpires and organizers can manage substitutions"
  ON public.player_substitutions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
        AND m.umpire_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.tournaments t ON m.tournament_id = t.id
      WHERE m.id = match_id
        AND t.created_by = auth.uid()
    )
  );
