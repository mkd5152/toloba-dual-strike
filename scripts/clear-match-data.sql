-- ============================================================================
-- CLEAR MATCH DATA ONLY
-- ============================================================================
-- This clears all match-related data while preserving:
-- - Profiles (users)
-- - Tournaments
-- - Teams
-- - Players
--
-- What gets deleted:
-- - All matches
-- - All innings
-- - All overs
-- - All balls
-- - All player substitutions
-- ============================================================================

-- Delete in correct order (child tables first due to foreign keys)
DELETE FROM public.balls;
DELETE FROM public.overs;
DELETE FROM public.player_substitutions;
DELETE FROM public.innings;
DELETE FROM public.matches;

-- Verification
SELECT
  'Match data cleared successfully!' as status,
  (SELECT COUNT(*) FROM public.matches) as matches_remaining,
  (SELECT COUNT(*) FROM public.teams) as teams_remaining,
  (SELECT COUNT(*) FROM public.players) as players_remaining,
  (SELECT COUNT(*) FROM public.profiles) as profiles_remaining;

SELECT 'Teams, players, and profiles preserved ✓' as note;
