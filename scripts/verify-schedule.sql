-- ================================================================
-- VERIFICATION QUERIES FOR TOURNAMENT SCHEDULE
-- Run these after importing the tournament data
-- ================================================================

-- ================================================================
-- CHECK 1: VERIFY EACH TEAM HAS EXACTLY 5 GAMES
-- ================================================================
SELECT
  '=== CHECK 1: GAMES PER TEAM ===' as verification_check;

WITH team_match_counts AS (
  SELECT
    UNNEST(team_ids) as team_id,
    COUNT(*) as matches_played
  FROM matches
  WHERE tournament_id = 'tdst-season-1' AND stage = 'LEAGUE'
  GROUP BY UNNEST(team_ids)
)
SELECT
  CAST(SPLIT_PART(t.id, '-', 2) AS INTEGER) as team_number,
  t.id as team_id,
  t.name as team_name,
  COALESCE(tmc.matches_played, 0) as games_scheduled,
  CASE
    WHEN COALESCE(tmc.matches_played, 0) = 5 THEN '✅ CORRECT'
    ELSE '❌ PROBLEM - Should be 5!'
  END as status
FROM teams t
LEFT JOIN team_match_counts tmc ON t.id = tmc.team_id
WHERE t.tournament_id = 'tdst-season-1'
ORDER BY CAST(SPLIT_PART(t.id, '-', 2) AS INTEGER);

-- Summary count
SELECT
  '=== SUMMARY: GAMES PER TEAM ===' as summary;

WITH team_match_counts AS (
  SELECT
    UNNEST(team_ids) as team_id,
    COUNT(*) as matches_played
  FROM matches
  WHERE tournament_id = 'tdst-season-1' AND stage = 'LEAGUE'
  GROUP BY UNNEST(team_ids)
)
SELECT
  COUNT(*) FILTER (WHERE COALESCE(tmc.matches_played, 0) = 5) as teams_with_5_games,
  COUNT(*) FILTER (WHERE COALESCE(tmc.matches_played, 0) != 5) as teams_with_wrong_count,
  COUNT(*) as total_teams
FROM teams t
LEFT JOIN team_match_counts tmc ON t.id = tmc.team_id
WHERE t.tournament_id = 'tdst-season-1';

-- ================================================================
-- CHECK 2: VERIFY NO OVERLAPPING MATCHES
-- (Same team playing at same time in different courts)
-- ================================================================
SELECT
  '=== CHECK 2: OVERLAPPING MATCHES ===' as verification_check;

WITH match_teams AS (
  SELECT
    m.id as match_id,
    m.match_number,
    m.court,
    m.start_time,
    UNNEST(m.team_ids) as team_id
  FROM matches m
  WHERE m.tournament_id = 'tdst-season-1' AND m.stage = 'LEAGUE'
),
team_time_conflicts AS (
  SELECT
    mt1.team_id,
    mt1.start_time,
    COUNT(DISTINCT mt1.match_id) as concurrent_matches,
    STRING_AGG('Match ' || mt1.match_number::text || ' (' || mt1.court || ')', ', ' ORDER BY mt1.match_number) as conflicting_matches
  FROM match_teams mt1
  GROUP BY mt1.team_id, mt1.start_time
  HAVING COUNT(DISTINCT mt1.match_id) > 1
)
SELECT
  t.name as team_name,
  TO_CHAR(tc.start_time, 'YYYY-MM-DD HH24:MI') as time_slot,
  tc.concurrent_matches as simultaneous_games,
  tc.conflicting_matches,
  '❌ OVERLAP DETECTED!' as status
FROM team_time_conflicts tc
JOIN teams t ON tc.team_id = t.id
ORDER BY tc.start_time, t.name;

-- Summary for overlaps
SELECT
  '=== SUMMARY: OVERLAPPING MATCHES ===' as summary;

WITH match_teams AS (
  SELECT
    m.id as match_id,
    m.match_number,
    m.court,
    m.start_time,
    UNNEST(m.team_ids) as team_id
  FROM matches m
  WHERE m.tournament_id = 'tdst-season-1' AND m.stage = 'LEAGUE'
),
team_time_conflicts AS (
  SELECT
    mt1.team_id,
    mt1.start_time
  FROM match_teams mt1
  GROUP BY mt1.team_id, mt1.start_time
  HAVING COUNT(DISTINCT mt1.match_id) > 1
)
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ NO OVERLAPPING MATCHES - PERFECT!'
    ELSE '❌ OVERLAPS FOUND: ' || COUNT(*) || ' instances'
  END as overlap_status,
  COUNT(*) as total_overlaps
FROM team_time_conflicts;

-- ================================================================
-- CHECK 3: DETAILED MATCH SCHEDULE BY DATE
-- ================================================================
SELECT
  '=== CHECK 3: MATCH SCHEDULE BY DATE ===' as verification_check;

SELECT
  DATE(start_time) as match_date,
  TO_CHAR(start_time, 'Day') as day_of_week,
  court,
  COUNT(*) as total_matches,
  MIN(TO_CHAR(start_time, 'HH24:MI')) as first_match_time,
  MAX(TO_CHAR(start_time, 'HH24:MI')) as last_match_time
FROM matches
WHERE tournament_id = 'tdst-season-1' AND stage = 'LEAGUE'
GROUP BY DATE(start_time), TO_CHAR(start_time, 'Day'), court
ORDER BY match_date, court;

-- ================================================================
-- CHECK 4: LIST ALL MATCHES WITH TEAM NAMES
-- ================================================================
SELECT
  '=== CHECK 4: ALL MATCHES WITH TEAMS ===' as verification_check;

WITH match_details AS (
  SELECT
    m.match_number,
    m.court,
    TO_CHAR(m.start_time, 'YYYY-MM-DD HH24:MI') as match_time,
    m.team_ids,
    (SELECT name FROM teams WHERE id = m.team_ids[1]) as team_1,
    (SELECT name FROM teams WHERE id = m.team_ids[2]) as team_2,
    (SELECT name FROM teams WHERE id = m.team_ids[3]) as team_3,
    (SELECT name FROM teams WHERE id = m.team_ids[4]) as team_4
  FROM matches m
  WHERE m.tournament_id = 'tdst-season-1' AND m.stage = 'LEAGUE'
)
SELECT
  match_number,
  court,
  match_time,
  team_1,
  team_2,
  team_3,
  team_4
FROM match_details
ORDER BY match_number;

-- ================================================================
-- FINAL VERIFICATION SUMMARY
-- ================================================================
SELECT
  '=== FINAL VERIFICATION SUMMARY ===' as final_summary;

WITH
team_match_counts AS (
  SELECT
    UNNEST(team_ids) as team_id,
    COUNT(*) as matches_played
  FROM matches
  WHERE tournament_id = 'tdst-season-1' AND stage = 'LEAGUE'
  GROUP BY UNNEST(team_ids)
),
teams_check AS (
  SELECT
    COUNT(*) FILTER (WHERE COALESCE(tmc.matches_played, 0) = 5) as correct_teams,
    COUNT(*) as total_teams
  FROM teams t
  LEFT JOIN team_match_counts tmc ON t.id = tmc.team_id
  WHERE t.tournament_id = 'tdst-season-1'
),
match_teams AS (
  SELECT
    m.id as match_id,
    m.start_time,
    UNNEST(m.team_ids) as team_id
  FROM matches m
  WHERE m.tournament_id = 'tdst-season-1' AND m.stage = 'LEAGUE'
),
overlap_check AS (
  SELECT COUNT(*) as overlap_count
  FROM (
    SELECT
      mt1.team_id,
      mt1.start_time
    FROM match_teams mt1
    GROUP BY mt1.team_id, mt1.start_time
    HAVING COUNT(DISTINCT mt1.match_id) > 1
  ) AS overlap_instances
)
SELECT
  tc.correct_teams || ' out of ' || tc.total_teams || ' teams have exactly 5 games' as teams_status,
  CASE
    WHEN tc.correct_teams = tc.total_teams THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as teams_check_result,
  oc.overlap_count || ' overlapping match conflicts' as overlap_status,
  CASE
    WHEN oc.overlap_count = 0 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as overlap_check_result,
  CASE
    WHEN tc.correct_teams = tc.total_teams AND oc.overlap_count = 0
    THEN '🎉 SCHEDULE IS PERFECT - READY FOR TOURNAMENT! 🎉'
    ELSE '⚠️  SCHEDULE HAS ISSUES - NEEDS FIXING'
  END as final_result
FROM teams_check tc, overlap_check oc;
