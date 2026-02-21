-- ================================================================
-- TDST SEASON 1 - RAMADAN EDITION 2026
-- ACTUAL REGISTERED TEAMS - 20 TEAMS
-- Feb 26 - Mar 1, 2026 (Thursday-Sunday)
-- ================================================================
-- Tournament Structure:
-- - 20 Real Registered Teams
-- - 4 Groups of 5 teams each
-- - Group 1: MA Stars, Thunder Strikers, Royal Blasters, Parallel Power, Wicket Warriors
-- - 2 Players per team (Double Wicket format)
-- - 2 Courts (Court 1 & Court 2)
-- - 25 League Matches + 2 Semi-finals + 1 Final = 28 total matches
-- - Each team plays 5 matches in league stage
-- - Schedule: Feb 26 - Mar 1, 2026 (Thursday-Sunday)
-- - Timing: 35 mins per game + 6 mins buffer = 41 mins total
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
-- STEP 3: CREATE TEAMS (20 TEAMS, 5 TEAMS PER GROUP)
-- ================================================================

-- GROUP 1 TEAMS (SPECIFIED GROUP)
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-ma', 'tdst-season-1', 'MA Stars', '#2980B9', 1, NOW(), NOW()),
  ('team-thunder', 'tdst-season-1', 'Thunder Strikers', '#DC7633', 1, NOW(), NOW()),
  ('team-royal', 'tdst-season-1', 'Royal Blasters', '#C0392B', 1, NOW(), NOW()),
  ('team-parallel', 'tdst-season-1', 'Parallel Power', '#27AE60', 1, NOW(), NOW()),
  ('team-wicket', 'tdst-season-1', 'Wicket Warriors', '#6C3483', 1, NOW(), NOW());

-- GROUP 2 TEAMS
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-dhaba', 'tdst-season-1', 'Dhaba', '#FF5733', 2, NOW(), NOW()),
  ('team-dragons', 'tdst-season-1', 'Dragons', '#E74C3C', 2, NOW(), NOW()),
  ('team-hakimi', 'tdst-season-1', 'Hakimi Dynamos', '#F39C12', 2, NOW(), NOW()),
  ('team-hunters', 'tdst-season-1', 'Hunters', '#16A085', 2, NOW(), NOW()),
  ('team-nahda', 'tdst-season-1', 'Nahda Shooters', '#F1C40F', 2, NOW(), NOW());

-- GROUP 3 TEAMS
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-dhanera', 'tdst-season-1', 'Dhanera Daredevils', '#3498DB', 3, NOW(), NOW()),
  ('team-dynamic', 'tdst-season-1', 'Dynamic Duo', '#9B59B6', 3, NOW(), NOW()),
  ('team-khatte', 'tdst-season-1', 'Khatte Angoor', '#D35400', 3, NOW(), NOW()),
  ('team-sakeena', 'tdst-season-1', 'Sakeena Strikers', '#3498DB', 3, NOW(), NOW()),
  ('team-sultan', 'tdst-season-1', 'Sultan Strikers', '#8E44AD', 3, NOW(), NOW());

-- GROUP 4 TEAMS
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-nuqum', 'tdst-season-1', 'Nuqum Rock', '#34495E', 4, NOW(), NOW()),
  ('team-sibling', 'tdst-season-1', 'Sibling Strikers', '#E67E22', 4, NOW(), NOW()),
  ('team-swat', 'tdst-season-1', 'Swat Katz', '#95A5A6', 4, NOW(), NOW()),
  ('team-taher', 'tdst-season-1', 'Taher Ali', '#196F3D', 4, NOW(), NOW()),
  ('team-jade', 'tdst-season-1', 'Team Jade Jaguars', '#566573', 4, NOW(), NOW());

-- ================================================================
-- STEP 4: ADD PLAYERS TO EACH TEAM (ACTUAL REGISTERED PLAYERS)
-- ================================================================

-- GROUP 1 PLAYERS
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-ma-1', 'team-ma', 'Abdeali Nulwala', 'batsman', false, NOW(), NOW()),
  ('player-ma-2', 'team-ma', 'Mufaddal Maimoon', 'bowler', false, NOW(), NOW()),

  ('player-thunder-1', 'team-thunder', 'Ibrahim Sheikh Husain Ezzi', 'batsman', false, NOW(), NOW()),
  ('player-thunder-2', 'team-thunder', 'Qaid Joher Huzefa Nasir', 'bowler', false, NOW(), NOW()),

  ('player-royal-1', 'team-royal', 'Adnan Dabba', 'batsman', false, NOW(), NOW()),
  ('player-royal-2', 'team-royal', 'Burhanuddin Kanpur', 'bowler', false, NOW(), NOW()),

  ('player-parallel-1', 'team-parallel', 'Mohammed Abbas', 'batsman', false, NOW(), NOW()),
  ('player-parallel-2', 'team-parallel', 'Mohammad Hozefa', 'bowler', false, NOW(), NOW()),

  ('player-wicket-1', 'team-wicket', 'Hussain Tamba', 'batsman', false, NOW(), NOW()),
  ('player-wicket-2', 'team-wicket', 'Abbas Saifee', 'bowler', false, NOW(), NOW());

-- GROUP 2 PLAYERS
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-dhaba-1', 'team-dhaba', 'Aliasgar Dhanerawala', 'batsman', false, NOW(), NOW()),
  ('player-dhaba-2', 'team-dhaba', 'Aliasgar Barbhaya', 'bowler', false, NOW(), NOW()),

  ('player-dragons-1', 'team-dragons', 'Mudar Koshish', 'batsman', false, NOW(), NOW()),
  ('player-dragons-2', 'team-dragons', 'Hasan Mahuwala', 'bowler', false, NOW(), NOW()),

  ('player-hakimi-1', 'team-hakimi', 'Mohammed Juzer Lokhandwala', 'batsman', false, NOW(), NOW()),
  ('player-hakimi-2', 'team-hakimi', 'Yusuf Hatim Sunelwala', 'bowler', false, NOW(), NOW()),

  ('player-hunters-1', 'team-hunters', 'Fakhruddin Moiz Attarwala', 'batsman', false, NOW(), NOW()),
  ('player-hunters-2', 'team-hunters', 'Mustafa Shaikh Abdul Husain Barbhaya', 'bowler', false, NOW(), NOW()),

  ('player-nahda-1', 'team-nahda', 'Husain Shaikh Kutbuddin Electricwala', 'batsman', false, NOW(), NOW()),
  ('player-nahda-2', 'team-nahda', 'Husain Aziz Pansari', 'bowler', false, NOW(), NOW());

-- GROUP 3 PLAYERS
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-dhanera-1', 'team-dhanera', 'Abdul Taiyab', 'batsman', false, NOW(), NOW()),
  ('player-dhanera-2', 'team-dhanera', 'Mustafa Abdul Taiyab', 'bowler', false, NOW(), NOW()),

  ('player-dynamic-1', 'team-dynamic', 'Burhanuddin', 'batsman', false, NOW(), NOW()),
  ('player-dynamic-2', 'team-dynamic', 'Mustafa Patan', 'bowler', false, NOW(), NOW()),

  ('player-khatte-1', 'team-khatte', 'Murtaza Taskin', 'batsman', false, NOW(), NOW()),
  ('player-khatte-2', 'team-khatte', 'Abbas Gheewala', 'bowler', false, NOW(), NOW()),

  ('player-sakeena-1', 'team-sakeena', 'Abizer Khanjiwala', 'batsman', false, NOW(), NOW()),
  ('player-sakeena-2', 'team-sakeena', 'Abizer Khanjiwala Jr', 'bowler', false, NOW(), NOW()),

  ('player-sultan-1', 'team-sultan', 'Huzefa Gohil', 'batsman', false, NOW(), NOW()),
  ('player-sultan-2', 'team-sultan', 'Malekulashter', 'bowler', false, NOW(), NOW());

-- GROUP 4 PLAYERS
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-nuqum-1', 'team-nuqum', 'Mohammed Mulla Zoeb Badri', 'batsman', false, NOW(), NOW()),
  ('player-nuqum-2', 'team-nuqum', 'Abdul Qader Najmuddin Madarwala', 'bowler', false, NOW(), NOW()),

  ('player-sibling-1', 'team-sibling', 'Shabbir Abid Pumpwala', 'batsman', false, NOW(), NOW()),
  ('player-sibling-2', 'team-sibling', 'Husain Abid Pumpwala', 'bowler', false, NOW(), NOW()),

  ('player-swat-1', 'team-swat', 'Mulla Mustafa Yusuf Galabhai', 'batsman', false, NOW(), NOW()),
  ('player-swat-2', 'team-swat', 'Husain Shaikh Akber Tambawala', 'bowler', false, NOW(), NOW()),

  ('player-taher-1', 'team-taher', 'Aliasgar Khandwawala', 'batsman', false, NOW(), NOW()),
  ('player-taher-2', 'team-taher', 'Taher Shabbir Gadiwala', 'bowler', false, NOW(), NOW()),

  ('player-jade-1', 'team-jade', 'Aziz Moiz Patanwala', 'batsman', false, NOW(), NOW()),
  ('player-jade-2', 'team-jade', 'Taher Husain Motiwala', 'bowler', false, NOW(), NOW());

-- ================================================================
-- STEP 5: SCHEDULE LEAGUE MATCHES (25 MATCHES)
-- 2 Courts running parallel, 41 mins per match (35min + 6min buffer)
-- Dates: Feb 26 - Mar 1, 2026
-- ================================================================

-- THURSDAY, FEB 26, 2026 - OPENING CEREMONY + 6 LEAGUE GAMES
-- Opening Ceremony: 8:00 PM - 8:20 PM UAE Time
-- Time Slot 1: 8:30 PM UAE (Matches 1 & 2) = 16:30 UTC
-- Time Slot 2: 9:11 PM UAE (Matches 3 & 4) = 17:11 UTC
-- Time Slot 3: 9:52 PM UAE (Matches 5 & 6) = 17:52 UTC

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  -- Match 1 & 2 (8:30 PM UAE = 16:30 UTC)
  ('match-01', 'tdst-season-1', 1, 'Court 1', '2026-02-26 16:30:00', NULL, NULL,
   ARRAY['team-ma', 'team-dhaba', 'team-dhanera', 'team-nuqum'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-02', 'tdst-season-1', 2, 'Court 2', '2026-02-26 16:30:00', NULL, NULL,
   ARRAY['team-thunder', 'team-dragons', 'team-dynamic', 'team-sibling'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 3 & 4 (9:11 PM UAE = 17:11 UTC)
  ('match-03', 'tdst-season-1', 3, 'Court 1', '2026-02-26 17:11:00', NULL, NULL,
   ARRAY['team-royal', 'team-hakimi', 'team-khatte', 'team-swat'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-04', 'tdst-season-1', 4, 'Court 2', '2026-02-26 17:11:00', NULL, NULL,
   ARRAY['team-parallel', 'team-hunters', 'team-sakeena', 'team-taher'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 5 & 6 (9:52 PM UAE = 17:52 UTC)
  ('match-05', 'tdst-season-1', 5, 'Court 1', '2026-02-26 17:52:00', NULL, NULL,
   ARRAY['team-wicket', 'team-nahda', 'team-sultan', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-06', 'tdst-season-1', 6, 'Court 2', '2026-02-26 17:52:00', NULL, NULL,
   ARRAY['team-ma', 'team-dragons', 'team-sakeena', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- FRIDAY, FEB 27, 2026 - 8 LEAGUE GAMES
-- Time Slot 1: 8:00 PM UAE (Matches 7 & 8) = 16:00 UTC
-- Time Slot 2: 8:41 PM UAE (Matches 9 & 10) = 16:41 UTC
-- Time Slot 3: 9:22 PM UAE (Matches 11 & 12) = 17:22 UTC
-- Time Slot 4: 10:03 PM UAE (Matches 13 & 14) = 18:03 UTC

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  -- Match 7 & 8 (8:00 PM UAE = 16:00 UTC)
  ('match-07', 'tdst-season-1', 7, 'Court 1', '2026-02-27 16:00:00', NULL, NULL,
   ARRAY['team-thunder', 'team-hakimi', 'team-sibling', 'team-nuqum'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-08', 'tdst-season-1', 8, 'Court 2', '2026-02-27 16:00:00', NULL, NULL,
   ARRAY['team-royal', 'team-nahda', 'team-sultan', 'team-taher'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 9 & 10 (8:41 PM UAE = 16:41 UTC)
  ('match-09', 'tdst-season-1', 9, 'Court 1', '2026-02-27 16:41:00', NULL, NULL,
   ARRAY['team-parallel', 'team-hunters', 'team-dhanera', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-10', 'tdst-season-1', 10, 'Court 2', '2026-02-27 16:41:00', NULL, NULL,
   ARRAY['team-wicket', 'team-dhaba', 'team-dynamic', 'team-swat'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 11 & 12 (9:22 PM UAE = 17:22 UTC)
  ('match-11', 'tdst-season-1', 11, 'Court 1', '2026-02-27 17:22:00', NULL, NULL,
   ARRAY['team-ma', 'team-hakimi', 'team-sultan', 'team-swat'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-12', 'tdst-season-1', 12, 'Court 2', '2026-02-27 17:22:00', NULL, NULL,
   ARRAY['team-thunder', 'team-nahda', 'team-dhanera', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 13 & 14 (10:03 PM UAE = 18:03 UTC)
  ('match-13', 'tdst-season-1', 13, 'Court 1', '2026-02-27 18:03:00', NULL, NULL,
   ARRAY['team-royal', 'team-hunters', 'team-dynamic', 'team-nuqum'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-14', 'tdst-season-1', 14, 'Court 2', '2026-02-27 18:03:00', NULL, NULL,
   ARRAY['team-parallel', 'team-dhaba', 'team-sakeena', 'team-taher'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- SATURDAY, FEB 28, 2026 - 8 LEAGUE GAMES
-- Time Slot 1: 8:00 PM UAE (Matches 15 & 16) = 16:00 UTC
-- Time Slot 2: 8:41 PM UAE (Matches 17 & 18) = 16:41 UTC
-- Time Slot 3: 9:22 PM UAE (Matches 19 & 20) = 17:22 UTC
-- Time Slot 4: 10:03 PM UAE (Matches 21 & 22) = 18:03 UTC

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  -- Match 15 & 16 (8:00 PM UAE = 16:00 UTC)
  ('match-15', 'tdst-season-1', 15, 'Court 1', '2026-02-28 16:00:00', NULL, NULL,
   ARRAY['team-wicket', 'team-dragons', 'team-khatte', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-16', 'tdst-season-1', 16, 'Court 2', '2026-02-28 16:00:00', NULL, NULL,
   ARRAY['team-ma', 'team-nahda', 'team-dynamic', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 17 & 18 (8:41 PM UAE = 16:41 UTC)
  ('match-17', 'tdst-season-1', 17, 'Court 1', '2026-02-28 16:41:00', NULL, NULL,
   ARRAY['team-thunder', 'team-hunters', 'team-sakeena', 'team-swat'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-18', 'tdst-season-1', 18, 'Court 2', '2026-02-28 16:41:00', NULL, NULL,
   ARRAY['team-royal', 'team-dhaba', 'team-sibling', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 19 & 20 (9:22 PM UAE = 17:22 UTC)
  ('match-19', 'tdst-season-1', 19, 'Court 1', '2026-02-28 17:22:00', NULL, NULL,
   ARRAY['team-parallel', 'team-dragons', 'team-sultan', 'team-nuqum'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-20', 'tdst-season-1', 20, 'Court 2', '2026-02-28 17:22:00', NULL, NULL,
   ARRAY['team-wicket', 'team-hakimi', 'team-dhanera', 'team-taher'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 21 & 22 (10:03 PM UAE = 18:03 UTC)
  ('match-21', 'tdst-season-1', 21, 'Court 1', '2026-02-28 18:03:00', NULL, NULL,
   ARRAY['team-ma', 'team-thunder', 'team-royal', 'team-parallel'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-22', 'tdst-season-1', 22, 'Court 2', '2026-02-28 18:03:00', NULL, NULL,
   ARRAY['team-wicket', 'team-dhaba', 'team-dragons', 'team-hakimi'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- SUNDAY, MAR 1, 2026 - 3 LEAGUE GAMES + SEMI-FINALS + FINAL
-- Time Slot 1: 8:00 PM (Matches 23 & 24)
-- Time Slot 2: 8:41 PM (Match 25)
-- Break: 10 mins (9:22 PM - 9:32 PM)
-- Semi-Finals: 9:32 PM (Matches 26 & 27 - both courts)
-- Finals: 10:12 PM (Match 28)

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  -- Match 23 & 24 (8:00 PM UAE = 16:00 UTC)
  ('match-23', 'tdst-season-1', 23, 'Court 1', '2026-03-01 16:00:00', NULL, NULL,
   ARRAY['team-hunters', 'team-nahda', 'team-dhanera', 'team-dynamic'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  ('match-24', 'tdst-season-1', 24, 'Court 2', '2026-03-01 16:00:00', NULL, NULL,
   ARRAY['team-sakeena', 'team-khatte', 'team-sultan', 'team-nuqum'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- Match 25 (8:41 PM UAE = 16:41 UTC - last league match)
  ('match-25', 'tdst-season-1', 25, 'Court 1', '2026-03-01 16:41:00', NULL, NULL,
   ARRAY['team-taher', 'team-sibling', 'team-swat', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- ================================================================
-- NOTE: SEMI-FINALS AND FINALS
-- ================================================================
-- These will be created after league stage completes
-- Based on top 2 teams from each group
--
-- Match 26 (9:32 PM, Court 1): Semi-Final 1 (G1S1 V G2S2 V G3S1 V G4S2)
-- Match 27 (9:32 PM, Court 2): Semi-Final 2 (G1S2 V G2S1 V G3S2 V G4S1)
-- Match 28 (10:12 PM, Court 1): Grand Finale (Top 2 from each semi-final)
-- Closing Ceremony: 10:47 PM - 11:17 PM
-- ================================================================

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check tournament
SELECT * FROM tournaments WHERE id = 'tdst-season-1';

-- Check teams by group
SELECT "group", COUNT(*) as team_count, STRING_AGG(name, ', ' ORDER BY name) as teams
FROM teams
WHERE tournament_id = 'tdst-season-1'
GROUP BY "group"
ORDER BY "group";

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

-- Show all teams with their groups and players
SELECT
  t.name as team_name,
  t."group",
  COUNT(p.id) as player_count,
  STRING_AGG(p.name, ', ' ORDER BY p.name) as players
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.tournament_id = 'tdst-season-1'
GROUP BY t.id, t.name, t."group"
ORDER BY t."group", t.name;

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
  t."group",
  COALESCE(tmc.matches_played, 0) as matches_scheduled
FROM teams t
LEFT JOIN team_match_counts tmc ON t.id = tmc.team_id
WHERE t.tournament_id = 'tdst-season-1'
ORDER BY t."group", t.name;

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
  RAISE NOTICE '   - 4 Groups of 5 teams each';
  RAISE NOTICE '   - 2 Courts (Court 1 & Court 2)';
  RAISE NOTICE '   - 41 mins per match (35min game + 6min buffer)';
  RAISE NOTICE '   ';
  RAISE NOTICE '📋 Teams by Group:';
  RAISE NOTICE '   Group 1: MA Stars, Thunder Strikers, Royal Blasters, Parallel Power, Wicket Warriors';
  RAISE NOTICE '   Group 2: Dhaba, Dragons, Hakimi Dynamos, Hunters, Nahda Shooters';
  RAISE NOTICE '   Group 3: Dhanera Daredevils, Dynamic Duo, Khatte Angoor, Sakeena Strikers, Sultan Strikers';
  RAISE NOTICE '   Group 4: Nuqum Rock, Sibling Strikers, Swat Katz, Taher Ali, Team Jade Jaguars';
  RAISE NOTICE '   ';
  RAISE NOTICE '📅 Schedule:';
  RAISE NOTICE '   Thursday, Feb 26: 8:30 PM - 6 league matches (after opening ceremony)';
  RAISE NOTICE '   Friday, Feb 27:   8:00 PM - 8 league matches';
  RAISE NOTICE '   Saturday, Feb 28:  8:00 PM - 8 league matches';
  RAISE NOTICE '   Sunday, Mar 1:     8:00 PM - 3 league + semis + final';
  RAISE NOTICE '   ';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '   1. Assign umpires to matches';
  RAISE NOTICE '   2. Start scoring matches from Umpire Portal';
  RAISE NOTICE '   3. After league stage, create SEMI and FINAL matches';
  RAISE NOTICE '   ';
  RAISE NOTICE '🚀 Ready to start the tournament!';
END $$;
