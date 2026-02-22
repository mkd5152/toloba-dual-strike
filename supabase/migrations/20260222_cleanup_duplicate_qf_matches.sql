-- Cleanup script for duplicate quarter-final matches created as league matches
-- This fixes the issue where QF matches were created with stage='LEAGUE' instead of stage='QF'

BEGIN;

-- First, let's see what we have
DO $$
DECLARE
  league_count INTEGER;
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO league_count
  FROM matches
  WHERE tournament_id = 'tdst-season-1' AND stage = 'LEAGUE';

  SELECT COUNT(*) INTO duplicate_count
  FROM matches
  WHERE tournament_id = 'tdst-season-1' AND stage = 'LEAGUE' AND match_number > 25;

  RAISE NOTICE 'Current state:';
  RAISE NOTICE '  - Total league matches: %', league_count;
  RAISE NOTICE '  - Duplicate matches (match_number > 25 with stage=LEAGUE): %', duplicate_count;
END $$;

-- Delete duplicate matches that were created as LEAGUE but should have been QF/SEMI/FINAL
-- These are matches with number > 25 that have stage = 'LEAGUE'
DELETE FROM matches
WHERE tournament_id = 'tdst-season-1'
  AND stage = 'LEAGUE'
  AND match_number > 25;

-- Verify cleanup
DO $$
DECLARE
  league_count INTEGER;
  qf_count INTEGER;
  semi_count INTEGER;
  final_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO league_count
  FROM matches
  WHERE tournament_id = 'tdst-season-1' AND stage = 'LEAGUE';

  SELECT COUNT(*) INTO qf_count
  FROM matches
  WHERE tournament_id = 'tdst-season-1' AND stage = 'QF';

  SELECT COUNT(*) INTO semi_count
  FROM matches
  WHERE tournament_id = 'tdst-season-1' AND stage = 'SEMI';

  SELECT COUNT(*) INTO final_count
  FROM matches
  WHERE tournament_id = 'tdst-season-1' AND stage = 'FINAL';

  RAISE NOTICE 'After cleanup:';
  RAISE NOTICE '  - League matches (should be 25): %', league_count;
  RAISE NOTICE '  - Quarter-final matches (should be 0 until generated): %', qf_count;
  RAISE NOTICE '  - Semi-final matches (should be 0 until generated): %', semi_count;
  RAISE NOTICE '  - Final matches (should be 0 until generated): %', final_count;

  IF league_count != 25 THEN
    RAISE WARNING 'Expected 25 league matches but found %', league_count;
  END IF;
END $$;

COMMIT;

-- Display current match distribution
SELECT stage, COUNT(*) as match_count,
       MIN(match_number) as min_match_num,
       MAX(match_number) as max_match_num
FROM matches
WHERE tournament_id = 'tdst-season-1'
GROUP BY stage
ORDER BY
  CASE stage
    WHEN 'LEAGUE' THEN 1
    WHEN 'QF' THEN 2
    WHEN 'SEMI' THEN 3
    WHEN 'FINAL' THEN 4
  END;
