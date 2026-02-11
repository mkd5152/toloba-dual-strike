-- ============================================================================
-- CLEAR SCORING DATA ONLY (KEEP MATCHES)
-- ============================================================================
-- This clears ball-by-ball scoring data but preserves:
-- - Matches (schedule remains intact)
-- - Teams
-- - Players
-- - Profiles
--
-- Use this to reset scores without losing the match schedule
-- ============================================================================

-- Delete only scoring data (child tables first)
DELETE FROM public.balls;
DELETE FROM public.overs;
DELETE FROM public.innings;
DELETE FROM public.player_substitutions;

-- Reset match states to CREATED (remove batting order, rankings)
UPDATE public.matches SET
  state = 'CREATED',
  batting_order = '{}',
  rankings = '[]',
  locked_at = NULL
WHERE state != 'CREATED';

-- Verification
SELECT
  'Scoring data cleared, matches preserved!' as status,
  (SELECT COUNT(*) FROM public.matches) as matches_remaining,
  (SELECT COUNT(*) FROM public.innings) as innings_remaining,
  (SELECT COUNT(*) FROM public.balls) as balls_remaining;

SELECT '✅ All matches reset to CREATED state' as note;
SELECT '✅ Ready to start scoring fresh!' as note;
