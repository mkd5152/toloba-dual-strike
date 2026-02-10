-- ================================================================
-- TOLOBA DUAL STRIKE - INITIAL TOURNAMENT DATA SETUP
-- ================================================================
-- This script will:
-- 1. Clear all existing data
-- 2. Load tournament configuration
-- 3. Create teams with groups (1-4)
-- 4. Add players to each team
-- 5. Schedule all league matches
-- 6. Ready for umpires to start scoring!
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

-- Note: We don't truncate profiles to keep user accounts

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
  created_at,
  updated_at
) VALUES (
  'tdst-season-1',
  'TDST - Season 1',
  'Toloba Dual Strike Tournament - Season 1',
  'Toloba Sports Club',
  'Toloba Cricket Ground',
  '2024-12-01',
  '2024-12-15',
  '09:00:00',
  5,  -- Each team plays 5 matches
  4,  -- 4 teams per match
  3,  -- 3 overs per innings
  'Where Cricket Meets Innovation',
  NOW(),
  NOW()
);

-- ================================================================
-- STEP 3: CREATE TEAMS (20 TEAMS, 5 TEAMS PER GROUP)
-- ================================================================

-- GROUP 1 TEAMS
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-g1-01', 'tdst-season-1', 'Thunder Strikers', '#FF5733', 1, NOW(), NOW()),
  ('team-g1-02', 'tdst-season-1', 'Lightning Bolts', '#3498DB', 1, NOW(), NOW()),
  ('team-g1-03', 'tdst-season-1', 'Fire Dragons', '#E74C3C', 1, NOW(), NOW()),
  ('team-g1-04', 'tdst-season-1', 'Storm Chasers', '#9B59B6', 1, NOW(), NOW()),
  ('team-g1-05', 'tdst-season-1', 'Royal Warriors', '#F39C12', 1, NOW(), NOW());

-- GROUP 2 TEAMS
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-g2-01', 'tdst-season-1', 'Eagle Hunters', '#16A085', 2, NOW(), NOW()),
  ('team-g2-02', 'tdst-season-1', 'Blazing Comets', '#D35400', 2, NOW(), NOW()),
  ('team-g2-03', 'tdst-season-1', 'Ocean Titans', '#2980B9', 2, NOW(), NOW()),
  ('team-g2-04', 'tdst-season-1', 'Golden Panthers', '#F1C40F', 2, NOW(), NOW()),
  ('team-g2-05', 'tdst-season-1', 'Shadow Ninjas', '#34495E', 2, NOW(), NOW());

-- GROUP 3 TEAMS
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-g3-01', 'tdst-season-1', 'Viper Squad', '#27AE60', 3, NOW(), NOW()),
  ('team-g3-02', 'tdst-season-1', 'Crimson Knights', '#C0392B', 3, NOW(), NOW()),
  ('team-g3-03', 'tdst-season-1', 'Ice Breakers', '#3498DB', 3, NOW(), NOW()),
  ('team-g3-04', 'tdst-season-1', 'Phoenix Rising', '#E67E22', 3, NOW(), NOW()),
  ('team-g3-05', 'tdst-season-1', 'Mountain Lions', '#8E44AD', 3, NOW(), NOW());

-- GROUP 4 TEAMS
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-g4-01', 'tdst-season-1', 'Tornado Force', '#95A5A6', 4, NOW(), NOW()),
  ('team-g4-02', 'tdst-season-1', 'Jungle Cats', '#196F3D', 4, NOW(), NOW()),
  ('team-g4-03', 'tdst-season-1', 'Steel Wolves', '#566573', 4, NOW(), NOW()),
  ('team-g4-04', 'tdst-season-1', 'Sunset Spartans', '#DC7633', 4, NOW(), NOW()),
  ('team-g4-05', 'tdst-season-1', 'Mystic Legends', '#6C3483', 4, NOW(), NOW());

-- ================================================================
-- STEP 4: ADD PLAYERS TO EACH TEAM (4 players per team)
-- ================================================================

-- GROUP 1 PLAYERS
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  -- Thunder Strikers
  ('player-g1-01-01', 'team-g1-01', 'Rajesh Kumar', 'batsman', false, NOW(), NOW()),
  ('player-g1-01-02', 'team-g1-01', 'Amit Sharma', 'bowler', false, NOW(), NOW()),
  ('player-g1-01-03', 'team-g1-01', 'Vikram Singh', 'all_rounder', false, NOW(), NOW()),
  ('player-g1-01-04', 'team-g1-01', 'Suresh Patel', 'wicket_keeper', false, NOW(), NOW()),

  -- Lightning Bolts
  ('player-g1-02-01', 'team-g1-02', 'Arjun Reddy', 'batsman', false, NOW(), NOW()),
  ('player-g1-02-02', 'team-g1-02', 'Karan Mehta', 'bowler', false, NOW(), NOW()),
  ('player-g1-02-03', 'team-g1-02', 'Sanjay Gupta', 'all_rounder', false, NOW(), NOW()),
  ('player-g1-02-04', 'team-g1-02', 'Rahul Joshi', 'wicket_keeper', false, NOW(), NOW()),

  -- Fire Dragons
  ('player-g1-03-01', 'team-g1-03', 'Deepak Verma', 'batsman', false, NOW(), NOW()),
  ('player-g1-03-02', 'team-g1-03', 'Anil Kapoor', 'bowler', false, NOW(), NOW()),
  ('player-g1-03-03', 'team-g1-03', 'Manoj Tiwari', 'all_rounder', false, NOW(), NOW()),
  ('player-g1-03-04', 'team-g1-03', 'Ravi Yadav', 'wicket_keeper', false, NOW(), NOW()),

  -- Storm Chasers
  ('player-g1-04-01', 'team-g1-04', 'Naveen Kumar', 'batsman', false, NOW(), NOW()),
  ('player-g1-04-02', 'team-g1-04', 'Ashish Pandey', 'bowler', false, NOW(), NOW()),
  ('player-g1-04-03', 'team-g1-04', 'Rohit Sharma', 'all_rounder', false, NOW(), NOW()),
  ('player-g1-04-04', 'team-g1-04', 'Pradeep Nair', 'wicket_keeper', false, NOW(), NOW()),

  -- Royal Warriors
  ('player-g1-05-01', 'team-g1-05', 'Dinesh Raj', 'batsman', false, NOW(), NOW()),
  ('player-g1-05-02', 'team-g1-05', 'Ganesh Iyer', 'bowler', false, NOW(), NOW()),
  ('player-g1-05-03', 'team-g1-05', 'Harish Bhat', 'all_rounder', false, NOW(), NOW()),
  ('player-g1-05-04', 'team-g1-05', 'Jagdish Pillai', 'wicket_keeper', false, NOW(), NOW());

-- GROUP 2 PLAYERS
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  -- Eagle Hunters
  ('player-g2-01-01', 'team-g2-01', 'Kishore Menon', 'batsman', false, NOW(), NOW()),
  ('player-g2-01-02', 'team-g2-01', 'Lakshman Das', 'bowler', false, NOW(), NOW()),
  ('player-g2-01-03', 'team-g2-01', 'Mohan Rao', 'all_rounder', false, NOW(), NOW()),
  ('player-g2-01-04', 'team-g2-01', 'Naresh Babu', 'wicket_keeper', false, NOW(), NOW()),

  -- Blazing Comets
  ('player-g2-02-01', 'team-g2-02', 'Om Prakash', 'batsman', false, NOW(), NOW()),
  ('player-g2-02-02', 'team-g2-02', 'Pankaj Mishra', 'bowler', false, NOW(), NOW()),
  ('player-g2-02-03', 'team-g2-02', 'Qadir Ali', 'all_rounder', false, NOW(), NOW()),
  ('player-g2-02-04', 'team-g2-02', 'Ramesh Hegde', 'wicket_keeper', false, NOW(), NOW()),

  -- Ocean Titans
  ('player-g2-03-01', 'team-g2-03', 'Sachin Shetty', 'batsman', false, NOW(), NOW()),
  ('player-g2-03-02', 'team-g2-03', 'Tarun Jain', 'bowler', false, NOW(), NOW()),
  ('player-g2-03-03', 'team-g2-03', 'Uday Krishna', 'all_rounder', false, NOW(), NOW()),
  ('player-g2-03-04', 'team-g2-03', 'Varun Shenoy', 'wicket_keeper', false, NOW(), NOW()),

  -- Golden Panthers
  ('player-g2-04-01', 'team-g2-04', 'Wasim Ahmed', 'batsman', false, NOW(), NOW()),
  ('player-g2-04-02', 'team-g2-04', 'Xavier D''Souza', 'bowler', false, NOW(), NOW()),
  ('player-g2-04-03', 'team-g2-04', 'Yash Prabhu', 'all_rounder', false, NOW(), NOW()),
  ('player-g2-04-04', 'team-g2-04', 'Zaheer Khan', 'wicket_keeper', false, NOW(), NOW()),

  -- Shadow Ninjas
  ('player-g2-05-01', 'team-g2-05', 'Abhay Singh', 'batsman', false, NOW(), NOW()),
  ('player-g2-05-02', 'team-g2-05', 'Balaji Rao', 'bowler', false, NOW(), NOW()),
  ('player-g2-05-03', 'team-g2-05', 'Chetan Bhagat', 'all_rounder', false, NOW(), NOW()),
  ('player-g2-05-04', 'team-g2-05', 'Dhruv Patil', 'wicket_keeper', false, NOW(), NOW());

-- GROUP 3 PLAYERS
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  -- Viper Squad
  ('player-g3-01-01', 'team-g3-01', 'Eshan Kulkarni', 'batsman', false, NOW(), NOW()),
  ('player-g3-01-02', 'team-g3-01', 'Faisal Sheikh', 'bowler', false, NOW(), NOW()),
  ('player-g3-01-03', 'team-g3-01', 'Gaurav Desai', 'all_rounder', false, NOW(), NOW()),
  ('player-g3-01-04', 'team-g3-01', 'Hemant Naik', 'wicket_keeper', false, NOW(), NOW()),

  -- Crimson Knights
  ('player-g3-02-01', 'team-g3-02', 'Irfan Pathan', 'batsman', false, NOW(), NOW()),
  ('player-g3-02-02', 'team-g3-02', 'Jatin Parikh', 'bowler', false, NOW(), NOW()),
  ('player-g3-02-03', 'team-g3-02', 'Keshav Murthy', 'all_rounder', false, NOW(), NOW()),
  ('player-g3-02-04', 'team-g3-02', 'Lalit Modi', 'wicket_keeper', false, NOW(), NOW()),

  -- Ice Breakers
  ('player-g3-03-01', 'team-g3-03', 'Mahesh Babu', 'batsman', false, NOW(), NOW()),
  ('player-g3-03-02', 'team-g3-03', 'Nitesh Reddy', 'bowler', false, NOW(), NOW()),
  ('player-g3-03-03', 'team-g3-03', 'Omkar Joshi', 'all_rounder', false, NOW(), NOW()),
  ('player-g3-03-04', 'team-g3-03', 'Pranav Kamath', 'wicket_keeper', false, NOW(), NOW()),

  -- Phoenix Rising
  ('player-g3-04-01', 'team-g3-04', 'Qamar Abbas', 'batsman', false, NOW(), NOW()),
  ('player-g3-04-02', 'team-g3-04', 'Ritesh Deshmukh', 'bowler', false, NOW(), NOW()),
  ('player-g3-04-03', 'team-g3-04', 'Salman Khan', 'all_rounder', false, NOW(), NOW()),
  ('player-g3-04-04', 'team-g3-04', 'Tanmay Bhat', 'wicket_keeper', false, NOW(), NOW()),

  -- Mountain Lions
  ('player-g3-05-01', 'team-g3-05', 'Umesh Yadav', 'batsman', false, NOW(), NOW()),
  ('player-g3-05-02', 'team-g3-05', 'Vinay Kumar', 'bowler', false, NOW(), NOW()),
  ('player-g3-05-03', 'team-g3-05', 'Wasim Jaffer', 'all_rounder', false, NOW(), NOW()),
  ('player-g3-05-04', 'team-g3-05', 'Yuvraj Singh', 'wicket_keeper', false, NOW(), NOW());

-- GROUP 4 PLAYERS
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  -- Tornado Force
  ('player-g4-01-01', 'team-g4-01', 'Zahir Khan', 'batsman', false, NOW(), NOW()),
  ('player-g4-01-02', 'team-g4-01', 'Aarav Mehta', 'bowler', false, NOW(), NOW()),
  ('player-g4-01-03', 'team-g4-01', 'Bharat Kumar', 'all_rounder', false, NOW(), NOW()),
  ('player-g4-01-04', 'team-g4-01', 'Chandan Sinha', 'wicket_keeper', false, NOW(), NOW()),

  -- Jungle Cats
  ('player-g4-02-01', 'team-g4-02', 'Darshan Patel', 'batsman', false, NOW(), NOW()),
  ('player-g4-02-02', 'team-g4-02', 'Eshaan Verma', 'bowler', false, NOW(), NOW()),
  ('player-g4-02-03', 'team-g4-02', 'Farhan Akhtar', 'all_rounder', false, NOW(), NOW()),
  ('player-g4-02-04', 'team-g4-02', 'Gautam Gambhir', 'wicket_keeper', false, NOW(), NOW()),

  -- Steel Wolves
  ('player-g4-03-01', 'team-g4-03', 'Harsh Pandya', 'batsman', false, NOW(), NOW()),
  ('player-g4-03-02', 'team-g4-03', 'Ishant Sharma', 'bowler', false, NOW(), NOW()),
  ('player-g4-03-03', 'team-g4-03', 'Jay Shah', 'all_rounder', false, NOW(), NOW()),
  ('player-g4-03-04', 'team-g4-03', 'Kuldeep Yadav', 'wicket_keeper', false, NOW(), NOW()),

  -- Sunset Spartans
  ('player-g4-04-01', 'team-g4-04', 'Lokesh Rahul', 'batsman', false, NOW(), NOW()),
  ('player-g4-04-02', 'team-g4-04', 'Manish Pandey', 'bowler', false, NOW(), NOW()),
  ('player-g4-04-03', 'team-g4-04', 'Naman Ojha', 'all_rounder', false, NOW(), NOW()),
  ('player-g4-04-04', 'team-g4-04', 'Ojha Nayan', 'wicket_keeper', false, NOW(), NOW()),

  -- Mystic Legends
  ('player-g4-05-01', 'team-g4-05', 'Parthiv Patel', 'batsman', false, NOW(), NOW()),
  ('player-g4-05-02', 'team-g4-05', 'Quinton De Kock', 'bowler', false, NOW(), NOW()),
  ('player-g4-05-03', 'team-g4-05', 'Robin Uthappa', 'all_rounder', false, NOW(), NOW()),
  ('player-g4-05-04', 'team-g4-05', 'Shreyas Iyer', 'wicket_keeper', false, NOW(), NOW());

-- ================================================================
-- STEP 5: SCHEDULE LEAGUE MATCHES
-- ================================================================
-- Each match has 4 teams from the same group
-- Court A, B, C rotation
-- Start times: 9:00 AM, 10:00 AM, 11:00 AM, etc.

-- GROUP 1 MATCHES (5 matches for Group 1)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-g1-01', 'tdst-season-1', 1, 'Court A', '2024-12-01 09:00:00', NULL, NULL, ARRAY['team-g1-01', 'team-g1-02', 'team-g1-03', 'team-g1-04'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g1-02', 'tdst-season-1', 2, 'Court B', '2024-12-01 10:00:00', NULL, NULL, ARRAY['team-g1-01', 'team-g1-02', 'team-g1-03', 'team-g1-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g1-03', 'tdst-season-1', 3, 'Court C', '2024-12-01 11:00:00', NULL, NULL, ARRAY['team-g1-01', 'team-g1-02', 'team-g1-04', 'team-g1-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g1-04', 'tdst-season-1', 4, 'Court A', '2024-12-01 12:00:00', NULL, NULL, ARRAY['team-g1-01', 'team-g1-03', 'team-g1-04', 'team-g1-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g1-05', 'tdst-season-1', 5, 'Court B', '2024-12-01 13:00:00', NULL, NULL, ARRAY['team-g1-02', 'team-g1-03', 'team-g1-04', 'team-g1-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- GROUP 2 MATCHES (5 matches for Group 2)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-g2-01', 'tdst-season-1', 6, 'Court C', '2024-12-02 09:00:00', NULL, NULL, ARRAY['team-g2-01', 'team-g2-02', 'team-g2-03', 'team-g2-04'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g2-02', 'tdst-season-1', 7, 'Court A', '2024-12-02 10:00:00', NULL, NULL, ARRAY['team-g2-01', 'team-g2-02', 'team-g2-03', 'team-g2-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g2-03', 'tdst-season-1', 8, 'Court B', '2024-12-02 11:00:00', NULL, NULL, ARRAY['team-g2-01', 'team-g2-02', 'team-g2-04', 'team-g2-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g2-04', 'tdst-season-1', 9, 'Court C', '2024-12-02 12:00:00', NULL, NULL, ARRAY['team-g2-01', 'team-g2-03', 'team-g2-04', 'team-g2-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g2-05', 'tdst-season-1', 10, 'Court A', '2024-12-02 13:00:00', NULL, NULL, ARRAY['team-g2-02', 'team-g2-03', 'team-g2-04', 'team-g2-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- GROUP 3 MATCHES (5 matches for Group 3)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-g3-01', 'tdst-season-1', 11, 'Court B', '2024-12-03 09:00:00', NULL, NULL, ARRAY['team-g3-01', 'team-g3-02', 'team-g3-03', 'team-g3-04'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g3-02', 'tdst-season-1', 12, 'Court C', '2024-12-03 10:00:00', NULL, NULL, ARRAY['team-g3-01', 'team-g3-02', 'team-g3-03', 'team-g3-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g3-03', 'tdst-season-1', 13, 'Court A', '2024-12-03 11:00:00', NULL, NULL, ARRAY['team-g3-01', 'team-g3-02', 'team-g3-04', 'team-g3-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g3-04', 'tdst-season-1', 14, 'Court B', '2024-12-03 12:00:00', NULL, NULL, ARRAY['team-g3-01', 'team-g3-03', 'team-g3-04', 'team-g3-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g3-05', 'tdst-season-1', 15, 'Court C', '2024-12-03 13:00:00', NULL, NULL, ARRAY['team-g3-02', 'team-g3-03', 'team-g3-04', 'team-g3-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- GROUP 4 MATCHES (5 matches for Group 4)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-g4-01', 'tdst-season-1', 16, 'Court A', '2024-12-04 09:00:00', NULL, NULL, ARRAY['team-g4-01', 'team-g4-02', 'team-g4-03', 'team-g4-04'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g4-02', 'tdst-season-1', 17, 'Court B', '2024-12-04 10:00:00', NULL, NULL, ARRAY['team-g4-01', 'team-g4-02', 'team-g4-03', 'team-g4-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g4-03', 'tdst-season-1', 18, 'Court C', '2024-12-04 11:00:00', NULL, NULL, ARRAY['team-g4-01', 'team-g4-02', 'team-g4-04', 'team-g4-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g4-04', 'tdst-season-1', 19, 'Court A', '2024-12-04 12:00:00', NULL, NULL, ARRAY['team-g4-01', 'team-g4-03', 'team-g4-04', 'team-g4-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g4-05', 'tdst-season-1', 20, 'Court B', '2024-12-04 13:00:00', NULL, NULL, ARRAY['team-g4-02', 'team-g4-03', 'team-g4-04', 'team-g4-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check tournament
SELECT * FROM tournaments WHERE id = 'tdst-season-1';

-- Check teams by group
SELECT "group", COUNT(*) as team_count FROM teams WHERE tournament_id = 'tdst-season-1' GROUP BY "group" ORDER BY "group";

-- Check total players
SELECT COUNT(*) as total_players FROM players p JOIN teams t ON p.team_id = t.id WHERE t.tournament_id = 'tdst-season-1';

-- Check matches by stage and group
SELECT
  stage,
  COUNT(*) as match_count
FROM matches
WHERE tournament_id = 'tdst-season-1'
GROUP BY stage
ORDER BY stage;

-- Show all teams with their groups
SELECT
  t.name,
  t."group",
  COUNT(p.id) as player_count
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.tournament_id = 'tdst-season-1'
GROUP BY t.id, t.name, t."group"
ORDER BY t."group", t.name;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Tournament setup complete!';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   - 1 Tournament created';
  RAISE NOTICE '   - 20 Teams (5 per group)';
  RAISE NOTICE '   - 80 Players (4 per team)';
  RAISE NOTICE '   - 20 League matches scheduled';
  RAISE NOTICE '   ';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '   1. Assign umpires to matches';
  RAISE NOTICE '   2. Start scoring matches from Umpire Portal';
  RAISE NOTICE '   3. After league stage, create SEMI and FINAL matches';
  RAISE NOTICE '   ';
  RAISE NOTICE '🚀 Ready for action!';
END $$;
