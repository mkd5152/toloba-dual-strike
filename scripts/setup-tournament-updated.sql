-- ================================================================
-- TDST SEASON 1 - RAMADAN EDITION 2026
-- ACTUAL REGISTERED TEAMS - 20 TEAMS
-- Feb 26 - Mar 1, 2026 (Thursday-Sunday)
-- ================================================================
-- Tournament Structure:
-- - 20 Real Registered Teams
-- - Overall Standings (No Groups)
-- - 2 Players per team (Double Wicket format)
-- - 2 Courts (Court 1 & Court 2)
-- - 25 League Matches + 2 QFs + 2 SFs + 1 Final = 30 total matches
-- - Each team plays 5 matches in league stage
-- - Schedule: Feb 26 - Mar 1, 2026 (Thursday-Sunday)
-- - Timing: 40 mins per game (35min + 5min buffer)
-- ================================================================

-- ================================================================
-- STEP 1: CLEAR ALL EXISTING DATA
-- ================================================================
TRUNCATE TABLE balls CASCADE;
TRUNCATE TABLE overs CASCADE;
TRUNCATE TABLE innings CASCADE;
TRUNCATE TABLE player_substitutions CASCADE;
TRUNCATE TABLE matches CASCADE;
TRUNCATE TABLE players CASCADE;
TRUNCATE TABLE teams CASCADE;
TRUNCATE TABLE tournaments CASCADE;

-- ================================================================
-- STEP 2: CREATE TOURNAMENT
-- ================================================================
INSERT INTO tournaments (
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
  created_at,
  updated_at
) VALUES (
  'tdst-season-1',
  'TDST – Season 1',
  'Toloba Dual Strike Tournament – Season 1',
  'Toloba',
  'TBD',
  '2026-02-26',
  '2026-03-01',
  '20:00:00',
  5,
  4,
  3,
  'Two players. One mission. Dual Strike. 👑',
  'https://youtu.be/mMVo6wet-L0?si=vzLx1Dpw7Cl--jQM',
  'https://forms.gle/hvyjFPtwM96qyJBK7',
  '[{"name": "Mustafa", "phone": "+971 56 736 9803"}, {"name": "Huzefa", "phone": "+971 56 355 0605"}]'::jsonb,
  NOW(),
  NOW()
);

-- ================================================================
-- STEP 3: CREATE TEAMS (20 TEAMS - NO GROUPS)
-- ================================================================
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-dhaba', 'tdst-season-1', 'Dhaba', '#FF5733', NULL, NOW(), NOW()),
  ('team-parallel', 'tdst-season-1', 'Parallel Power', '#27AE60', NULL, NOW(), NOW()),
  ('team-dynamic', 'tdst-season-1', 'Dynamic Duo', '#9B59B6', NULL, NOW(), NOW()),
  ('team-dragons', 'tdst-season-1', 'Dragons', '#E74C3C', NULL, NOW(), NOW()),
  ('team-dhanera', 'tdst-season-1', 'Dhanera Daredevils', '#3498DB', NULL, NOW(), NOW()),
  ('team-hunters', 'tdst-season-1', 'Hunters', '#16A085', NULL, NOW(), NOW()),
  ('team-sibling', 'tdst-season-1', 'Sibling Strikers', '#E67E22', NULL, NOW(), NOW()),
  ('team-nahda', 'tdst-season-1', 'Nahda Shooters', '#F1C40F', NULL, NOW(), NOW()),
  ('team-jade', 'tdst-season-1', 'Team Jade Jaguars', '#566573', NULL, NOW(), NOW()),
  ('team-swat', 'tdst-season-1', 'Swat Katz', '#95A5A6', NULL, NOW(), NOW()),
  ('team-hakimi', 'tdst-season-1', 'Hakimi Dynamos', '#F39C12', NULL, NOW(), NOW()),
  ('team-royal', 'tdst-season-1', 'Royal Blasters', '#C0392B', NULL, NOW(), NOW()),
  ('team-khatte', 'tdst-season-1', 'Khatte Angoor', '#D35400', NULL, NOW(), NOW()),
  ('team-dubai', 'tdst-season-1', 'Dubai Sultans', '#6C3483', NULL, NOW(), NOW()),
  ('team-taher', 'tdst-season-1', 'Taher Ali', '#196F3D', NULL, NOW(), NOW()),
  ('team-sultan', 'tdst-season-1', 'Sultan Strikers', '#8E44AD', NULL, NOW(), NOW()),
  ('team-thunder', 'tdst-season-1', 'Thunder Strikers', '#DC7633', NULL, NOW(), NOW()),
  ('team-ma', 'tdst-season-1', 'MA Stars', '#2980B9', NULL, NOW(), NOW()),
  ('team-nuqum', 'tdst-season-1', 'Nuqum Rock', '#34495E', NULL, NOW(), NOW()),
  ('team-power', 'tdst-season-1', 'Power Strikers', '#1ABC9C', NULL, NOW(), NOW());

-- ================================================================
-- STEP 4: ADD PLAYERS TO EACH TEAM (ACTUAL REGISTERED PLAYERS)
-- ================================================================
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  -- Dhaba
  ('player-dhaba-1', 'team-dhaba', 'Aliasgar Dhanerawala', 'batsman', false, NOW(), NOW()),
  ('player-dhaba-2', 'team-dhaba', 'Aliasgar Barbhaya', 'bowler', false, NOW(), NOW()),

  -- Parallel Power
  ('player-parallel-1', 'team-parallel', 'Mohammed Abbas', 'batsman', false, NOW(), NOW()),
  ('player-parallel-2', 'team-parallel', 'Mohammad Hozefa', 'bowler', false, NOW(), NOW()),

  -- Dynamic Duo
  ('player-dynamic-1', 'team-dynamic', 'Burhanuddin', 'batsman', false, NOW(), NOW()),
  ('player-dynamic-2', 'team-dynamic', 'Mustafa Patan', 'bowler', false, NOW(), NOW()),

  -- Dragons
  ('player-dragons-1', 'team-dragons', 'Mudar Koshish', 'batsman', false, NOW(), NOW()),
  ('player-dragons-2', 'team-dragons', 'Hasan Mahuwala', 'bowler', false, NOW(), NOW()),

  -- Dhanera Daredevils
  ('player-dhanera-1', 'team-dhanera', 'Abdul Taiyab', 'batsman', false, NOW(), NOW()),
  ('player-dhanera-2', 'team-dhanera', 'Mustafa Abdul Taiyab', 'bowler', false, NOW(), NOW()),

  -- Hunters
  ('player-hunters-1', 'team-hunters', 'Fakhruddin Moiz Attarwala', 'batsman', false, NOW(), NOW()),
  ('player-hunters-2', 'team-hunters', 'Mustafa Shaikh Abdul Husain Barbhaya', 'bowler', false, NOW(), NOW()),

  -- Sibling Strikers
  ('player-sibling-1', 'team-sibling', 'Shabbir Abid Pumpwala', 'batsman', false, NOW(), NOW()),
  ('player-sibling-2', 'team-sibling', 'Husain Abid Pumpwala', 'bowler', false, NOW(), NOW()),

  -- Nahda Shooters
  ('player-nahda-1', 'team-nahda', 'Husain Shaikh Kutbuddin Electricwala', 'batsman', false, NOW(), NOW()),
  ('player-nahda-2', 'team-nahda', 'Husain Aziz Pansari', 'bowler', false, NOW(), NOW()),

  -- Team Jade Jaguars
  ('player-jade-1', 'team-jade', 'Aziz Moiz Patanwala', 'batsman', false, NOW(), NOW()),
  ('player-jade-2', 'team-jade', 'Taher Husain Motiwala', 'bowler', false, NOW(), NOW()),

  -- Swat Katz
  ('player-swat-1', 'team-swat', 'Mulla Mustafa Yusuf Galabhai', 'batsman', false, NOW(), NOW()),
  ('player-swat-2', 'team-swat', 'Husain Shaikh Akber Tambawala', 'bowler', false, NOW(), NOW()),

  -- Hakimi Dynamos
  ('player-hakimi-1', 'team-hakimi', 'Mohammed Juzer Lokhandwala', 'batsman', false, NOW(), NOW()),
  ('player-hakimi-2', 'team-hakimi', 'Yusuf Hatim Sunelwala', 'bowler', false, NOW(), NOW()),

  -- Royal Blasters
  ('player-royal-1', 'team-royal', 'Adnan Dabba', 'batsman', false, NOW(), NOW()),
  ('player-royal-2', 'team-royal', 'Burhanuddin Kanpur', 'bowler', false, NOW(), NOW()),

  -- Khatte Angoor
  ('player-khatte-1', 'team-khatte', 'Murtaza Taskin', 'batsman', false, NOW(), NOW()),
  ('player-khatte-2', 'team-khatte', 'Abbas Gheewala', 'bowler', false, NOW(), NOW()),

  -- Dubai Sultans
  ('player-dubai-1', 'team-dubai', 'Burhanuddin Chunawala', 'batsman', false, NOW(), NOW()),
  ('player-dubai-2', 'team-dubai', 'Husain Ali', 'bowler', false, NOW(), NOW()),

  -- Taher Ali
  ('player-taher-1', 'team-taher', 'Aliasgar Khandwawala', 'batsman', false, NOW(), NOW()),
  ('player-taher-2', 'team-taher', 'Taher Shabbir Gadiwala', 'bowler', false, NOW(), NOW()),

  -- Sultan Strikers
  ('player-sultan-1', 'team-sultan', 'Huzefa Gohil', 'batsman', false, NOW(), NOW()),
  ('player-sultan-2', 'team-sultan', 'Malekulashter', 'bowler', false, NOW(), NOW()),

  -- Thunder Strikers
  ('player-thunder-1', 'team-thunder', 'Ibrahim Sheikh Husain Ezzi', 'batsman', false, NOW(), NOW()),
  ('player-thunder-2', 'team-thunder', 'Qaid Joher Huzefa Nasir', 'bowler', false, NOW(), NOW()),

  -- MA Stars
  ('player-ma-1', 'team-ma', 'Abdeali Nulwala', 'batsman', false, NOW(), NOW()),
  ('player-ma-2', 'team-ma', 'Mufaddal Maimoon', 'bowler', false, NOW(), NOW()),

  -- Nuqum Rock
  ('player-nuqum-1', 'team-nuqum', 'Mohammed Mulla Zoeb Badri', 'batsman', false, NOW(), NOW()),
  ('player-nuqum-2', 'team-nuqum', 'Abdul Qader Najmuddin Madarwala', 'bowler', false, NOW(), NOW()),

  -- Power Strikers
  ('player-power-1', 'team-power', 'Huzefa Najmi', 'batsman', false, NOW(), NOW()),
  ('player-power-2', 'team-power', 'Burhanuddin Nasir', 'bowler', false, NOW(), NOW());

-- ================================================================
-- STEP 5: SCHEDULE LEAGUE MATCHES (25 MATCHES)
-- 2 Courts running parallel, 40 mins per match (35min + 5min buffer)
-- Dates: Feb 26 - Mar 1, 2026
-- ================================================================

-- THURSDAY, FEB 26, 2026 - OPENING CEREMONY + 7 LEAGUE GAMES
-- Opening Ceremony: 7:30 PM - 8:00 PM UAE Time
-- Time Slot 1: 8:00 PM UAE (Matches 1 & 2) = 16:00 UTC
-- Time Slot 2: 8:40 PM UAE (Matches 3 & 4) = 16:40 UTC
-- Time Slot 3: 9:20 PM UAE (Matches 5 & 6) = 17:20 UTC
-- Time Slot 4: 10:00 PM UAE (Match 7) = 18:00 UTC

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  -- Match 1 & 2 (8:00 PM UAE = 16:00 UTC)
  -- Match 1: Original Match 5 (Dubai Sultans vs Nahda vs Sultan vs Jade)
  ('match-01', 'tdst-season-1', 1, 'Court 1', '2026-02-26 16:00:00', NULL, NULL,
   ARRAY['team-dubai', 'team-nahda', 'team-sultan', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 2: Original Match 1 (MA vs Dhaba vs Dhanera vs Nuqum)
  ('match-02', 'tdst-season-1', 2, 'Court 2', '2026-02-26 16:00:00', NULL, NULL,
   ARRAY['team-ma', 'team-dhaba', 'team-dhanera', 'team-nuqum'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 3 & 4 (8:40 PM UAE = 16:40 UTC)
  -- Match 3: Original Match 2 (Thunder vs Dragons vs Dynamic vs Sibling)
  ('match-03', 'tdst-season-1', 3, 'Court 1', '2026-02-26 16:40:00', NULL, NULL,
   ARRAY['team-thunder', 'team-dragons', 'team-dynamic', 'team-sibling'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 4: Original Match 3 (Royal vs Hakimi vs Khatte vs Swat)
  ('match-04', 'tdst-season-1', 4, 'Court 2', '2026-02-26 16:40:00', NULL, NULL,
   ARRAY['team-royal', 'team-hakimi', 'team-khatte', 'team-swat'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 5 & 6 (9:20 PM UAE = 17:20 UTC)
  -- Match 5: Original Match 4 (Parallel vs Hunters vs Power vs Taher)
  ('match-05', 'tdst-season-1', 5, 'Court 1', '2026-02-26 17:20:00', NULL, NULL,
   ARRAY['team-parallel', 'team-hunters', 'team-power', 'team-taher'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 6: Original Match 6 (MA vs Dragons vs Power vs Jade)
  ('match-06', 'tdst-season-1', 6, 'Court 2', '2026-02-26 17:20:00', NULL, NULL,
   ARRAY['team-ma', 'team-dragons', 'team-power', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 7 (10:00 PM UAE = 18:00 UTC)
  -- Match 7: Original Sunday Match 25 (Taher vs Sibling vs Swat vs Jade)
  ('match-07', 'tdst-season-1', 7, 'Court 1', '2026-02-26 18:00:00', NULL, NULL,
   ARRAY['team-taher', 'team-sibling', 'team-swat', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- FRIDAY, FEB 27, 2026 - 8 LEAGUE GAMES
-- Time Slot 1: 8:00 PM UAE (Matches 8 & 9) = 16:00 UTC
-- Time Slot 2: 8:40 PM UAE (Matches 10 & 11) = 16:40 UTC
-- Time Slot 3: 9:20 PM UAE (Matches 12 & 13) = 17:20 UTC
-- Time Slot 4: 10:00 PM UAE (Matches 14 & 15) = 18:00 UTC

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  -- Match 8 & 9 (8:00 PM UAE = 16:00 UTC)
  ('match-08', 'tdst-season-1', 8, 'Court 1', '2026-02-27 16:00:00', NULL, NULL,
   ARRAY['team-thunder', 'team-hakimi', 'team-sibling', 'team-nuqum'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-09', 'tdst-season-1', 9, 'Court 2', '2026-02-27 16:00:00', NULL, NULL,
   ARRAY['team-royal', 'team-nahda', 'team-sultan', 'team-taher'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 10 & 11 (8:40 PM UAE = 16:40 UTC)
  ('match-10', 'tdst-season-1', 10, 'Court 1', '2026-02-27 16:40:00', NULL, NULL,
   ARRAY['team-parallel', 'team-hunters', 'team-dhanera', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-11', 'tdst-season-1', 11, 'Court 2', '2026-02-27 16:40:00', NULL, NULL,
   ARRAY['team-dubai', 'team-dhaba', 'team-dynamic', 'team-swat'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 12 & 13 (9:20 PM UAE = 17:20 UTC)
  ('match-12', 'tdst-season-1', 12, 'Court 1', '2026-02-27 17:20:00', NULL, NULL,
   ARRAY['team-ma', 'team-hakimi', 'team-sultan', 'team-swat'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-13', 'tdst-season-1', 13, 'Court 2', '2026-02-27 17:20:00', NULL, NULL,
   ARRAY['team-thunder', 'team-nahda', 'team-dhanera', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 14 & 15 (10:00 PM UAE = 18:00 UTC)
  ('match-14', 'tdst-season-1', 14, 'Court 1', '2026-02-27 18:00:00', NULL, NULL,
   ARRAY['team-royal', 'team-hunters', 'team-dynamic', 'team-nuqum'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-15', 'tdst-season-1', 15, 'Court 2', '2026-02-27 18:00:00', NULL, NULL,
   ARRAY['team-parallel', 'team-dhaba', 'team-power', 'team-taher'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- SATURDAY, FEB 28, 2026 - 10 LEAGUE GAMES
-- Time Slot 1: 8:00 PM UAE (Matches 16 & 17) = 16:00 UTC
-- Time Slot 2: 8:40 PM UAE (Matches 18 & 19) = 16:40 UTC
-- Time Slot 3: 9:20 PM UAE (Matches 20 & 21) = 17:20 UTC
-- Time Slot 4: 10:00 PM UAE (Matches 22 & 23) = 18:00 UTC
-- Time Slot 5: 10:40 PM UAE (Matches 24 & 25) = 18:40 UTC

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  -- Match 16 & 17 (8:00 PM UAE = 16:00 UTC)
  ('match-16', 'tdst-season-1', 16, 'Court 1', '2026-02-28 16:00:00', NULL, NULL,
   ARRAY['team-dubai', 'team-dragons', 'team-khatte', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-17', 'tdst-season-1', 17, 'Court 2', '2026-02-28 16:00:00', NULL, NULL,
   ARRAY['team-ma', 'team-nahda', 'team-dynamic', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 18 & 19 (8:40 PM UAE = 16:40 UTC)
  ('match-18', 'tdst-season-1', 18, 'Court 1', '2026-02-28 16:40:00', NULL, NULL,
   ARRAY['team-thunder', 'team-hunters', 'team-power', 'team-swat'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-19', 'tdst-season-1', 19, 'Court 2', '2026-02-28 16:40:00', NULL, NULL,
   ARRAY['team-royal', 'team-dhaba', 'team-sibling', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 20 & 21 (9:20 PM UAE = 17:20 UTC)
  ('match-20', 'tdst-season-1', 20, 'Court 1', '2026-02-28 17:20:00', NULL, NULL,
   ARRAY['team-parallel', 'team-dragons', 'team-sultan', 'team-nuqum'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-21', 'tdst-season-1', 21, 'Court 2', '2026-02-28 17:20:00', NULL, NULL,
   ARRAY['team-dubai', 'team-hakimi', 'team-dhanera', 'team-taher'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 22 & 23 (10:00 PM UAE = 18:00 UTC)
  ('match-22', 'tdst-season-1', 22, 'Court 1', '2026-02-28 18:00:00', NULL, NULL,
   ARRAY['team-ma', 'team-thunder', 'team-royal', 'team-parallel'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-23', 'tdst-season-1', 23, 'Court 2', '2026-02-28 18:00:00', NULL, NULL,
   ARRAY['team-dubai', 'team-dhaba', 'team-dragons', 'team-hakimi'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 24 & 25 (10:40 PM UAE = 18:40 UTC)
  ('match-24', 'tdst-season-1', 24, 'Court 1', '2026-02-28 18:40:00', NULL, NULL,
   ARRAY['team-hunters', 'team-nahda', 'team-dhanera', 'team-dynamic'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-25', 'tdst-season-1', 25, 'Court 2', '2026-02-28 18:40:00', NULL, NULL,
   ARRAY['team-power', 'team-khatte', 'team-sultan', 'team-nuqum'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- ================================================================
-- SUNDAY, MAR 1, 2026 - PLAYOFFS ONLY
-- ================================================================
-- Break: 8:00 PM - 8:10 PM (10 mins)
-- QF1 & QF2: 8:10 PM UAE = 16:10 UTC
-- Break: 8:50 PM - 9:00 PM (10 mins)
-- SF1 & SF2: 9:00 PM UAE = 17:00 UTC
-- Break: 9:40 PM - 9:50 PM (10 mins)
-- Final: 9:50 PM UAE = 17:50 UTC
-- Closing Ceremony: 10:30 PM - 11:00 PM
-- ================================================================

-- ================================================================
-- NOTE: QUARTER-FINALS, SEMI-FINALS AND FINALS
-- ================================================================
-- These will be created automatically after league stage completes
-- Based on overall standings
--
-- Match 26 (8:10 PM, Court 1): QF1 (Teams 5, 6, 11, 12)
-- Match 27 (8:10 PM, Court 2): QF2 (Teams 7, 8, 9, 10)
-- Match 28 (9:00 PM, Court 1): SF1 (QF2 top 2 + Overall 1, 2)
-- Match 29 (9:00 PM, Court 2): SF2 (QF1 top 2 + Overall 3, 4)
-- Match 30 (9:50 PM, Court 1): Grand Finale (Top 2 from each SF)
-- Closing Ceremony: 10:30 PM - 11:00 PM
-- ================================================================

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check tournament
SELECT * FROM tournaments WHERE id = 'tdst-season-1';

-- Check total teams
SELECT COUNT(*) as total_teams
FROM teams
WHERE tournament_id = 'tdst-season-1';

-- List all teams
SELECT name FROM teams WHERE tournament_id = 'tdst-season-1' ORDER BY name;

-- Check total players
SELECT COUNT(*) as total_players
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.tournament_id = 'tdst-season-1';

-- Check matches by stage and court
SELECT stage, court, COUNT(*) as match_count
FROM matches
WHERE tournament_id = 'tdst-season-1'
GROUP BY stage, court
ORDER BY stage, court;

-- Show all teams with their players
SELECT
  t.name as team_name,
  COUNT(p.id) as player_count,
  STRING_AGG(p.name, ', ' ORDER BY p.name) as players
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.tournament_id = 'tdst-season-1'
GROUP BY t.id, t.name
ORDER BY t.name;

-- Validate each team plays exactly 5 matches
WITH team_match_counts AS (
  SELECT
    UNNEST(team_ids) as team_id,
    COUNT(*) as matches_played
  FROM matches
  WHERE tournament_id = 'tdst-season-1' AND stage = 'LEAGUE'
  GROUP BY UNNEST(team_ids)
)
SELECT
  t.name,
  COALESCE(tmc.matches_played, 0) as matches_scheduled
FROM teams t
LEFT JOIN team_match_counts tmc ON t.id = tmc.team_id
WHERE t.tournament_id = 'tdst-season-1'
ORDER BY t.name;

-- Show schedule by date
SELECT
  DATE(start_time) as match_date,
  court,
  COUNT(*) as matches,
  MIN(TO_CHAR(start_time, 'HH24:MI')) as first_match,
  MAX(TO_CHAR(start_time, 'HH24:MI')) as last_match
FROM matches
WHERE tournament_id = 'tdst-season-1' AND stage = 'LEAGUE'
GROUP BY DATE(start_time), court
ORDER BY match_date, court;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ TDST Season 1 setup complete!';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   - 1 Tournament created (TDST – Season 1)';
  RAISE NOTICE '   - 20 Real Teams with actual registrations';
  RAISE NOTICE '   - 40 Players (2 per team)';
  RAISE NOTICE '   - 25 League matches scheduled (Feb 26 - Mar 1, 2026)';
  RAISE NOTICE '   - Overall Standings (No Groups)';
  RAISE NOTICE '   - 2 Courts (Court 1 & Court 2)';
  RAISE NOTICE '   - 40 mins per match (35min game + 5min buffer)';
  RAISE NOTICE '   ';
  RAISE NOTICE '📋 Teams:';
  RAISE NOTICE '   Dhaba, Parallel Power, Dynamic Duo, Dragons, Dhanera Daredevils';
  RAISE NOTICE '   Hunters, Sibling Strikers, Nahda Shooters, Team Jade Jaguars, Swat Katz';
  RAISE NOTICE '   Hakimi Dynamos, Royal Blasters, Khatte Angoor, Dubai Sultans, Taher Ali';
  RAISE NOTICE '   Sultan Strikers, Thunder Strikers, MA Stars, Nuqum Rock, Power Strikers';
  RAISE NOTICE '   ';
  RAISE NOTICE '📅 Schedule:';
  RAISE NOTICE '   Thursday, Feb 26:  8:00 PM - 7 league matches (after opening ceremony)';
  RAISE NOTICE '   Friday, Feb 27:    8:00 PM - 8 league matches';
  RAISE NOTICE '   Saturday, Feb 28:  8:00 PM - 10 league matches';
  RAISE NOTICE '   Sunday, Mar 1:     8:10 PM - Playoffs only (QFs + SFs + Final)';
  RAISE NOTICE '   ';
  RAISE NOTICE '🏆 Playoff Structure:';
  RAISE NOTICE '   - Quarter-Finals (Matches 26-27): Teams 5,6,11,12 vs 7,8,9,10';
  RAISE NOTICE '   - Semi-Finals (Matches 28-29): QF winners + Top 4';
  RAISE NOTICE '   - Final (Match 30): Top 2 from each Semi';
  RAISE NOTICE '   ';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '   1. Assign umpires to matches';
  RAISE NOTICE '   2. Start scoring matches from Umpire Portal';
  RAISE NOTICE '   3. After league stage, generate QFs/SFs/Final from Playoffs page';
  RAISE NOTICE '   ';
  RAISE NOTICE '🚀 Ready to start the tournament!';
END $$;
