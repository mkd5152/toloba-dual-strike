-- ============================================================================
-- FIX ALL RLS POLICIES - MAKE THEM PERMISSIVE FOR ORGANIZERS
-- ============================================================================

-- ============================================================================
-- PROFILES POLICIES - ALLOW ORGANIZERS TO CREATE UMPIRES
-- ============================================================================
DROP POLICY IF EXISTS "Organizers can create umpire profiles" ON public.profiles;
CREATE POLICY "Organizers can create umpire profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
  );

-- ============================================================================
-- MATCHES POLICIES - ALLOW ORGANIZERS TO CREATE/MANAGE MATCHES
-- ============================================================================
DROP POLICY IF EXISTS "Organizers can create matches" ON public.matches;
CREATE POLICY "Organizers can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
  );

DROP POLICY IF EXISTS "Organizers and umpires can update matches" ON public.matches;
CREATE POLICY "Organizers and umpires can update matches"
  ON public.matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
    OR (umpire_id = auth.uid())
  );

DROP POLICY IF EXISTS "Organizers can delete matches" ON public.matches;
CREATE POLICY "Organizers can delete matches"
  ON public.matches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
  );

-- ============================================================================
-- INNINGS POLICIES - ALLOW ORGANIZERS AND UMPIRES
-- ============================================================================
DROP POLICY IF EXISTS "Umpires can manage innings" ON public.innings;
CREATE POLICY "Umpires and organizers can manage innings"
  ON public.innings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
    OR EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
        AND m.umpire_id = auth.uid()
    )
  );

-- ============================================================================
-- OVERS POLICIES - ALLOW ORGANIZERS AND UMPIRES
-- ============================================================================
DROP POLICY IF EXISTS "Umpires can manage overs" ON public.overs;
CREATE POLICY "Umpires and organizers can manage overs"
  ON public.overs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
    OR EXISTS (
      SELECT 1 FROM public.innings i
      JOIN public.matches m ON i.match_id = m.id
      WHERE i.id = innings_id
        AND m.umpire_id = auth.uid()
    )
  );

-- ============================================================================
-- BALLS POLICIES - ALLOW ORGANIZERS AND UMPIRES
-- ============================================================================
DROP POLICY IF EXISTS "Umpires can manage balls" ON public.balls;
CREATE POLICY "Umpires and organizers can manage balls"
  ON public.balls FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
    OR EXISTS (
      SELECT 1 FROM public.overs o
      JOIN public.innings i ON o.innings_id = i.id
      JOIN public.matches m ON i.match_id = m.id
      WHERE o.id = over_id
        AND m.umpire_id = auth.uid()
    )
  );

-- ============================================================================
-- PLAYER SUBSTITUTIONS POLICIES - ALLOW ORGANIZERS AND UMPIRES
-- ============================================================================
DROP POLICY IF EXISTS "Umpires and organizers can manage substitutions" ON public.player_substitutions;
CREATE POLICY "Umpires and organizers can manage substitutions"
  ON public.player_substitutions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
    OR EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
        AND m.umpire_id = auth.uid()
    )
  );
