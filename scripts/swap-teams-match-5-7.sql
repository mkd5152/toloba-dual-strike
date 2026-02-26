-- ================================================================
-- SWAP TEAMS IN MATCH 5 AND MATCH 7 (THURSDAY, FEB 26)
-- ================================================================
-- Match 5: Replace NAHDA SHOOTERS (team-10) with TEAM JADE JAGUARS (team-19)
-- Match 7: Replace TEAM JADE JAGUARS (team-19) with NAHDA SHOOTERS (team-10)
-- ================================================================

-- Match 5: Change Nahda Shooters → Team Jade Jaguars
UPDATE matches
SET team_ids = ARRAY['team-12', 'team-7', 'team-19', 'team-18']
WHERE id = 'match-05';

-- Match 7: Change Team Jade Jaguars → Nahda Shooters
UPDATE matches
SET team_ids = ARRAY['team-18', 'team-15', 'team-17', 'team-10']
WHERE id = 'match-07';

-- Verification: Show updated matches
SELECT
  match_number,
  court,
  TO_CHAR(start_time AT TIME ZONE 'Asia/Dubai', 'Day, Mon DD - HH24:MI') as match_time_uae,
  (SELECT STRING_AGG(t.name, ', ' ORDER BY array_position(m.team_ids, t.id))
   FROM teams t
   WHERE t.id = ANY(m.team_ids)) as teams
FROM matches m
WHERE id IN ('match-05', 'match-07')
ORDER BY match_number;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Teams swapped successfully!';
  RAISE NOTICE '   Match 5: Nahda Shooters → Team Jade Jaguars';
  RAISE NOTICE '   Match 7: Team Jade Jaguars → Nahda Shooters';
END $$;
