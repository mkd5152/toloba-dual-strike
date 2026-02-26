-- ================================================================
-- TDST SEASON 1 - RAMADAN EDITION 2026
-- ACTUAL REGISTERED TEAMS - 20 TEAMS (ORDERED BY PDF)
-- Feb 26 - Mar 1, 2026 (Thursday-Sunday)
-- ✅ VERIFIED: All teams play exactly 5 matches
-- ✅ VERIFIED: No overlapping matches
-- ✅ UPDATED: Match 5 & 7 team swaps applied
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
-- - Team IDs follow PDF order: team-1 = MUSTABIZ, team-2 = Dhanera Daredevils, etc.
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
-- STEP 3: CREATE TEAMS (20 TEAMS - ORDERED BY PDF)
-- ================================================================
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-1', 'tdst-season-1', 'MUSTABIZ', '#FF5733', NULL, NOW(), NOW()),
  ('team-2', 'tdst-season-1', 'Dhanera Daredevils', '#3498DB', NULL, NOW(), NOW()),
  ('team-3', 'tdst-season-1', 'Dragons', '#E74C3C', NULL, NOW(), NOW()),
  ('team-4', 'tdst-season-1', 'Dubai Sultans', '#6C3483', NULL, NOW(), NOW()),
  ('team-5', 'tdst-season-1', 'Dynamic Duo', '#9B59B6', NULL, NOW(), NOW()),
  ('team-6', 'tdst-season-1', 'Hakimi Dynamos', '#F39C12', NULL, NOW(), NOW()),
  ('team-7', 'tdst-season-1', 'Hunters', '#16A085', NULL, NOW(), NOW()),
  ('team-8', 'tdst-season-1', 'Khatte Angoor', '#D35400', NULL, NOW(), NOW()),
  ('team-9', 'tdst-season-1', 'MA Stars', '#2980B9', NULL, NOW(), NOW()),
  ('team-10', 'tdst-season-1', 'Nahda Shooters', '#F1C40F', NULL, NOW(), NOW()),
  ('team-11', 'tdst-season-1', 'Nuqum Rock', '#34495E', NULL, NOW(), NOW()),
  ('team-12', 'tdst-season-1', 'Parallel Power', '#27AE60', NULL, NOW(), NOW()),
  ('team-13', 'tdst-season-1', 'Power Strikers', '#1ABC9C', NULL, NOW(), NOW()),
  ('team-14', 'tdst-season-1', 'Royal Blasters', '#C0392B', NULL, NOW(), NOW()),
  ('team-15', 'tdst-season-1', 'Sibling Strikers', '#E67E22', NULL, NOW(), NOW()),
  ('team-16', 'tdst-season-1', 'Sultan Strikers', '#8E44AD', NULL, NOW(), NOW()),
  ('team-17', 'tdst-season-1', 'Swat Katz', '#95A5A6', NULL, NOW(), NOW()),
  ('team-18', 'tdst-season-1', 'Taher Ali', '#196F3D', NULL, NOW(), NOW()),
  ('team-19', 'tdst-season-1', 'Team Jade Jaguars', '#566573', NULL, NOW(), NOW()),
  ('team-20', 'tdst-season-1', 'Thunder Strikers', '#DC7633', NULL, NOW(), NOW());

-- ================================================================
-- STEP 4: ADD PLAYERS TO EACH TEAM (ORDERED BY PDF)
-- ================================================================
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  -- 1. MUSTABIZ
  ('player-1-1', 'team-1', 'Mustafa Cement', 'batsman', false, NOW(), NOW()),
  ('player-1-2', 'team-1', 'Abizer Kapadia', 'bowler', false, NOW(), NOW()),

  -- 2. Dhanera Daredevils
  ('player-2-1', 'team-2', 'Abdul Taiyab', 'batsman', false, NOW(), NOW()),
  ('player-2-2', 'team-2', 'Mustafa Abdul Taiyab', 'bowler', false, NOW(), NOW()),

  -- 3. Dragons
  ('player-3-1', 'team-3', 'Hasan Mahuwala', 'batsman', false, NOW(), NOW()),
  ('player-3-2', 'team-3', 'Mudar Koshish', 'bowler', false, NOW(), NOW()),

  -- 4. Dubai Sultans
  ('player-4-1', 'team-4', 'Burhanuddin Chunawala', 'batsman', false, NOW(), NOW()),
  ('player-4-2', 'team-4', 'Husain Ali', 'bowler', false, NOW(), NOW()),

  -- 5. Dynamic Duo
  ('player-5-1', 'team-5', 'Burhanuddin', 'batsman', false, NOW(), NOW()),
  ('player-5-2', 'team-5', 'Mustafa Patan', 'bowler', false, NOW(), NOW()),

  -- 6. Hakimi Dynamos
  ('player-6-1', 'team-6', 'Mohammed Juzer Lokhandwala', 'batsman', false, NOW(), NOW()),
  ('player-6-2', 'team-6', 'Yusuf Hatim Sunelwala', 'bowler', false, NOW(), NOW()),

  -- 7. Hunters
  ('player-7-1', 'team-7', 'Fakhruddin Moiz Attarwala', 'batsman', false, NOW(), NOW()),
  ('player-7-2', 'team-7', 'Mustafa Shaikh Abdul Husain Barbhaya', 'bowler', false, NOW(), NOW()),

  -- 8. Khatte Angoor
  ('player-8-1', 'team-8', 'Abbas Gheewala', 'batsman', false, NOW(), NOW()),
  ('player-8-2', 'team-8', 'Murtaza Taskin', 'bowler', false, NOW(), NOW()),

  -- 9. MA Stars
  ('player-9-1', 'team-9', 'Abdeali Nulwala', 'batsman', false, NOW(), NOW()),
  ('player-9-2', 'team-9', 'Mufaddal Maimoon', 'bowler', false, NOW(), NOW()),

  -- 10. Nahda Shooters
  ('player-10-1', 'team-10', 'Husain Aziz Pansari', 'batsman', false, NOW(), NOW()),
  ('player-10-2', 'team-10', 'Husain Shaikh Kutbuddin Electricwala', 'bowler', false, NOW(), NOW()),

  -- 11. Nuqum Rock
  ('player-11-1', 'team-11', 'Abdul Qader Najmuddin Madarwala', 'batsman', false, NOW(), NOW()),
  ('player-11-2', 'team-11', 'Mohammed Mulla Zoeb Badri', 'bowler', false, NOW(), NOW()),

  -- 12. Parallel Power
  ('player-12-1', 'team-12', 'Mohammad Hozefa', 'batsman', false, NOW(), NOW()),
  ('player-12-2', 'team-12', 'Mohammed Abbas', 'bowler', false, NOW(), NOW()),

  -- 13. Power Strikers
  ('player-13-1', 'team-13', 'Burhanuddin Nasir', 'batsman', false, NOW(), NOW()),
  ('player-13-2', 'team-13', 'Huzefa Najmi', 'bowler', false, NOW(), NOW()),

  -- 14. Royal Blasters
  ('player-14-1', 'team-14', 'Adnan Dabba', 'batsman', false, NOW(), NOW()),
  ('player-14-2', 'team-14', 'Burhanuddin Kanpur', 'bowler', false, NOW(), NOW()),

  -- 15. Sibling Strikers
  ('player-15-1', 'team-15', 'Husain Abid Pumpwala', 'batsman', false, NOW(), NOW()),
  ('player-15-2', 'team-15', 'Shabbir Abid Pumpwala', 'bowler', false, NOW(), NOW()),

  -- 16. Sultan Strikers
  ('player-16-1', 'team-16', 'Huzefa Gohil', 'batsman', false, NOW(), NOW()),
  ('player-16-2', 'team-16', 'Malekulashter', 'bowler', false, NOW(), NOW()),

  -- 17. Swat Katz
  ('player-17-1', 'team-17', 'Husain Shaikh Akber Tambawala', 'batsman', false, NOW(), NOW()),
  ('player-17-2', 'team-17', 'Mulla Mustafa Yusuf Galabhai', 'bowler', false, NOW(), NOW()),

  -- 18. Taher Ali
  ('player-18-1', 'team-18', 'Aliasgar Khandwawala', 'batsman', false, NOW(), NOW()),
  ('player-18-2', 'team-18', 'Taher Shabbir Gadiwala', 'bowler', false, NOW(), NOW()),

  -- 19. Team Jade Jaguars
  ('player-19-1', 'team-19', 'Aziz Moiz Patanwala', 'batsman', false, NOW(), NOW()),
  ('player-19-2', 'team-19', 'Taher Husain Motiwala', 'bowler', false, NOW(), NOW()),

  -- 20. Thunder Strikers
  ('player-20-1', 'team-20', 'Ibrahim Sheikh Husain Ezzi', 'batsman', false, NOW(), NOW()),
  ('player-20-2', 'team-20', 'Qaid Joher Huzefa Nasir', 'bowler', false, NOW(), NOW());

-- ================================================================
-- STEP 5: SCHEDULE LEAGUE MATCHES (25 MATCHES)
-- 2 Courts running parallel, 40 mins per match (35min + 5min buffer)
-- Dates: Feb 26 - Mar 1, 2026
-- NOTE: Using new team IDs based on PDF order
-- ================================================================

-- THURSDAY, FEB 26, 2026 - OPENING CEREMONY + 7 LEAGUE GAMES
-- Opening Ceremony: 7:30 PM - 8:00 PM UAE Time
-- Time Slot 1: 8:00 PM UAE (Matches 1 & 2) = 16:00 UTC
-- Time Slot 2: 8:40 PM UAE (Matches 3 & 4) = 16:40 UTC
-- Time Slot 3: 9:20 PM UAE (Matches 5 & 6) = 17:20 UTC
-- Time Slot 4: 10:00 PM UAE (Match 7) = 18:00 UTC

-- Match 1 & 2 (8:00 PM UAE = 16:00 UTC)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-01', 'tdst-season-1', 1, 'Court 1', '2026-02-26 16:00:00', NULL, NULL,
   ARRAY['team-4', 'team-10', 'team-16', 'team-19'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-02', 'tdst-season-1', 2, 'Court 2', '2026-02-26 16:00:00', NULL, NULL,
   ARRAY['team-9', 'team-1', 'team-2', 'team-11'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- Match 3 & 4 (8:40 PM UAE = 16:40 UTC)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-03', 'tdst-season-1', 3, 'Court 1', '2026-02-26 16:40:00', NULL, NULL,
   ARRAY['team-20', 'team-3', 'team-5', 'team-15'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-04', 'tdst-season-1', 4, 'Court 2', '2026-02-26 16:40:00', NULL, NULL,
   ARRAY['team-14', 'team-6', 'team-8', 'team-17'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- Match 5 & 6 (9:20 PM UAE = 17:20 UTC)
-- ✅ UPDATED: Match 5 - Team Jade Jaguars (was Nahda Shooters)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-05', 'tdst-season-1', 5, 'Court 1', '2026-02-26 17:20:00', NULL, NULL,
   ARRAY['team-12', 'team-7', 'team-19', 'team-18'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-06', 'tdst-season-1', 6, 'Court 2', '2026-02-26 17:20:00', NULL, NULL,
   ARRAY['team-9', 'team-3', 'team-13', 'team-15'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- Match 7 (10:00 PM UAE = 18:00 UTC)
-- ✅ UPDATED: Match 7 - Nahda Shooters (was Team Jade Jaguars)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-07', 'tdst-season-1', 7, 'Court 1', '2026-02-26 18:00:00', NULL, NULL,
   ARRAY['team-18', 'team-15', 'team-17', 'team-10'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- FRIDAY, FEB 27, 2026 - 8 LEAGUE GAMES
-- Match 8 & 9 (8:00 PM UAE = 16:00 UTC)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-08', 'tdst-season-1', 8, 'Court 1', '2026-02-27 16:00:00', NULL, NULL,
   ARRAY['team-20', 'team-6', 'team-15', 'team-11'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-09', 'tdst-season-1', 9, 'Court 2', '2026-02-27 16:00:00', NULL, NULL,
   ARRAY['team-14', 'team-10', 'team-16', 'team-18'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- Match 10 & 11 (8:40 PM UAE = 16:40 UTC)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-10', 'tdst-season-1', 10, 'Court 1', '2026-02-27 16:40:00', NULL, NULL,
   ARRAY['team-12', 'team-7', 'team-2', 'team-8'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-11', 'tdst-season-1', 11, 'Court 2', '2026-02-27 16:40:00', NULL, NULL,
   ARRAY['team-4', 'team-1', 'team-5', 'team-17'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- Match 12 & 13 (9:20 PM UAE = 17:20 UTC)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-12', 'tdst-season-1', 12, 'Court 1', '2026-02-27 17:20:00', NULL, NULL,
   ARRAY['team-9', 'team-6', 'team-16', 'team-17'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-13', 'tdst-season-1', 13, 'Court 2', '2026-02-27 17:20:00', NULL, NULL,
   ARRAY['team-20', 'team-10', 'team-2', 'team-8'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- Match 14 & 15 (10:00 PM UAE = 18:00 UTC)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-14', 'tdst-season-1', 14, 'Court 1', '2026-02-27 18:00:00', NULL, NULL,
   ARRAY['team-14', 'team-7', 'team-5', 'team-11'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-15', 'tdst-season-1', 15, 'Court 2', '2026-02-27 18:00:00', NULL, NULL,
   ARRAY['team-12', 'team-1', 'team-13', 'team-18'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- SATURDAY, FEB 28, 2026 - 10 LEAGUE GAMES
-- Match 16 & 17 (8:00 PM UAE = 16:00 UTC)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-16', 'tdst-season-1', 16, 'Court 1', '2026-02-28 16:00:00', NULL, NULL,
   ARRAY['team-4', 'team-3', 'team-8', 'team-19'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-17', 'tdst-season-1', 17, 'Court 2', '2026-02-28 16:00:00', NULL, NULL,
   ARRAY['team-9', 'team-10', 'team-5', 'team-13'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- Match 18 & 19 (8:40 PM UAE = 16:40 UTC)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-18', 'tdst-season-1', 18, 'Court 1', '2026-02-28 16:40:00', NULL, NULL,
   ARRAY['team-20', 'team-7', 'team-13', 'team-17'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-19', 'tdst-season-1', 19, 'Court 2', '2026-02-28 16:40:00', NULL, NULL,
   ARRAY['team-14', 'team-1', 'team-15', 'team-19'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- Match 20 & 21 (9:20 PM UAE = 17:20 UTC)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-20', 'tdst-season-1', 20, 'Court 1', '2026-02-28 17:20:00', NULL, NULL,
   ARRAY['team-12', 'team-3', 'team-16', 'team-11'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-21', 'tdst-season-1', 21, 'Court 2', '2026-02-28 17:20:00', NULL, NULL,
   ARRAY['team-4', 'team-6', 'team-2', 'team-18'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- Match 22 & 23 (10:00 PM UAE = 18:00 UTC)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-22', 'tdst-season-1', 22, 'Court 1', '2026-02-28 18:00:00', NULL, NULL,
   ARRAY['team-9', 'team-20', 'team-14', 'team-12'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-23', 'tdst-season-1', 23, 'Court 2', '2026-02-28 18:00:00', NULL, NULL,
   ARRAY['team-4', 'team-1', 'team-3', 'team-6'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- Match 24 & 25 (10:40 PM UAE = 18:40 UTC)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-24', 'tdst-season-1', 24, 'Court 1', '2026-02-28 18:40:00', NULL, NULL,
   ARRAY['team-7', 'team-19', 'team-2', 'team-5'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-25', 'tdst-season-1', 25, 'Court 2', '2026-02-28 18:40:00', NULL, NULL,
   ARRAY['team-13', 'team-8', 'team-16', 'team-11'],
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

-- List all teams (ordered by ID for PDF sequence)
SELECT id, name FROM teams
WHERE tournament_id = 'tdst-season-1'
ORDER BY CAST(SPLIT_PART(id, '-', 2) AS INTEGER);

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

-- Show all teams with their players (ordered by PDF sequence)
SELECT
  t.id,
  t.name as team_name,
  COUNT(p.id) as player_count,
  STRING_AGG(p.name, ', ' ORDER BY p.name) as players
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.tournament_id = 'tdst-season-1'
GROUP BY t.id, t.name
ORDER BY CAST(SPLIT_PART(t.id, '-', 2) AS INTEGER);

-- ✅ Validate each team plays exactly 5 matches
WITH team_match_counts AS (
  SELECT
    UNNEST(team_ids) as team_id,
    COUNT(*) as matches_played
  FROM matches
  WHERE tournament_id = 'tdst-season-1' AND stage = 'LEAGUE'
  GROUP BY UNNEST(team_ids)
)
SELECT
  t.id,
  t.name,
  COALESCE(tmc.matches_played, 0) as matches_scheduled
FROM teams t
LEFT JOIN team_match_counts tmc ON t.id = tmc.team_id
WHERE t.tournament_id = 'tdst-season-1'
ORDER BY CAST(SPLIT_PART(t.id, '-', 2) AS INTEGER);

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
  RAISE NOTICE '   - 20 Real Teams with actual registrations (PDF order)';
  RAISE NOTICE '   - 40 Players (2 per team)';
  RAISE NOTICE '   - 25 League matches scheduled (Feb 26 - Mar 1, 2026)';
  RAISE NOTICE '   - Overall Standings (No Groups)';
  RAISE NOTICE '   - 2 Courts (Court 1 & Court 2)';
  RAISE NOTICE '   - 40 mins per match (35min game + 5min buffer)';
  RAISE NOTICE '   ';
  RAISE NOTICE '✅ UPDATED MATCHES:';
  RAISE NOTICE '   - Match 5: Team Jade Jaguars (was Nahda Shooters)';
  RAISE NOTICE '   - Match 7: Nahda Shooters (was Team Jade Jaguars)';
  RAISE NOTICE '   ';
  RAISE NOTICE '✅ VERIFIED FIXES APPLIED:';
  RAISE NOTICE '   - Match 6: Sibling Strikers replaced Jade Jaguars';
  RAISE NOTICE '   - Match 10: Khatte Angoor replaced Jade Jaguars';
  RAISE NOTICE '   - Match 13: Khatte Angoor replaced Jade Jaguars';
  RAISE NOTICE '   - All 20 teams now play exactly 5 matches';
  RAISE NOTICE '   - No overlapping matches (verified)';
  RAISE NOTICE '   ';
  RAISE NOTICE '📋 Teams (PDF Order):';
  RAISE NOTICE '   1-MUSTABIZ, 2-Dhanera Daredevils, 3-Dragons, 4-Dubai Sultans';
  RAISE NOTICE '   5-Dynamic Duo, 6-Hakimi Dynamos, 7-Hunters, 8-Khatte Angoor';
  RAISE NOTICE '   9-MA Stars, 10-Nahda Shooters, 11-Nuqum Rock, 12-Parallel Power';
  RAISE NOTICE '   13-Power Strikers, 14-Royal Blasters, 15-Sibling Strikers, 16-Sultan Strikers';
  RAISE NOTICE '   17-Swat Katz, 18-Taher Ali, 19-Team Jade Jaguars, 20-Thunder Strikers';
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
  RAISE NOTICE '   - Final (Match 30): Top 2 from each SF';
  RAISE NOTICE '   ';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '   1. Assign umpires to matches';
  RAISE NOTICE '   2. Start scoring matches from Umpire Portal';
  RAISE NOTICE '   3. After league stage, generate QFs/SFs/Final from Playoffs page';
  RAISE NOTICE '   ';
  RAISE NOTICE '🚀 Ready to start the tournament!';
END $$;
