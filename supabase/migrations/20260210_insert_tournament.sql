-- ============================================================================
-- INSERT TOURNAMENT FOR TDST SEASON 1
-- ============================================================================

-- Insert the tournament (created_by will need to be set to your user ID)
-- You need to run this with your actual user ID from Supabase

-- To get your user ID, run this in Supabase SQL Editor:
-- SELECT auth.uid();

-- Then replace 'YOUR_USER_ID_HERE' with your actual user ID and run this:
/*
INSERT INTO public.tournaments (
  id,
  name,
  full_name,
  organizer,
  venue,
  start_date,
  end_date,
  start_time,
  matches_per_team,
  teams_per_match,
  overs_per_innings,
  tagline,
  youtube_link,
  registration_link,
  contacts,
  created_by,
  created_at,
  updated_at
) VALUES (
  'tdst-season-1',
  'TDST – Season 1',
  'Toloba Dual Strike Tournament – Season 1',
  'Toloba Cricket Club',
  'Dubai Sports Complex',
  '2026-02-26',
  '2026-03-01',
  '14:00:00',
  5,
  4,
  3,
  'High-Energy Cricket. Fierce Competition. True Sportsmanship.',
  'https://youtube.com/@tdst',
  'https://tdst.com/register',
  '[{"name": "Mustafa", "phone": "+971 56 736 9803"}, {"name": "Huzefa", "phone": "+971 56 355 0605"}]'::jsonb,
  'YOUR_USER_ID_HERE',  -- Replace this with your actual user ID
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
*/

-- TEMPORARY FIX: Make team creation more permissive for testing
-- Drop the existing policy
DROP POLICY IF EXISTS "Organizers can create teams" ON public.teams;

-- Create a more permissive policy that allows any organizer to create teams
CREATE POLICY "Organizers can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
  );

-- Also update the update and delete policies
DROP POLICY IF EXISTS "Organizers can update teams" ON public.teams;
CREATE POLICY "Organizers can update teams"
  ON public.teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
  );

DROP POLICY IF EXISTS "Organizers can delete teams" ON public.teams;
CREATE POLICY "Organizers can delete teams"
  ON public.teams FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
  );

-- Same for players
DROP POLICY IF EXISTS "Organizers can manage players" ON public.players;
CREATE POLICY "Organizers can manage players"
  ON public.players FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
  );
