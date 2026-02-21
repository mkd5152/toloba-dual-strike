-- ================================================================
-- DOUBLE WICKET TOURNAMENT SEASON 1 - RAMADAN EDITION 2026
-- ACTUAL REGISTERED TEAMS - 20 TEAMS
-- ================================================================
-- Tournament Structure:
-- - 20 Real Registered Teams
-- - 4 Groups of 5 teams each
-- - 2 Players per team (Double Wicket format)
-- - 25 League Matches + 2 Semi-finals + 1 Final = 28 total matches
-- - Each team plays 5 matches in league stage
-- - Schedule: March 3-6, 2026 (3rd-6th Ramadan)
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
  '2026-03-03',
  '2026-03-06',
  '20:30:00',
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
-- Team assignment pattern:
-- Group 1 = A,B,C,D,E | Group 2 = F,G,H,I,J
-- Group 3 = K,L,M,N,O | Group 4 = P,Q,R,S,T

-- GROUP 1 TEAMS (A-E)
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-dhaba', 'tdst-season-1', 'Dhaba', '#FF5733', 1, NOW(), NOW()),                          -- A
  ('team-dhanera', 'tdst-season-1', 'Dhanera Daredevils', '#3498DB', 1, NOW(), NOW()),          -- B
  ('team-dragons', 'tdst-season-1', 'Dragons', '#E74C3C', 1, NOW(), NOW()),                     -- C
  ('team-dynamic', 'tdst-season-1', 'Dynamic Duo', '#9B59B6', 1, NOW(), NOW()),                 -- D
  ('team-hakimi', 'tdst-season-1', 'Hakimi Dynamos', '#F39C12', 1, NOW(), NOW());               -- E

-- GROUP 2 TEAMS (F-J)
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-hunters', 'tdst-season-1', 'Hunters', '#16A085', 2, NOW(), NOW()),                     -- F
  ('team-khatte', 'tdst-season-1', 'Khatte Angoor', '#D35400', 2, NOW(), NOW()),                -- G
  ('team-ma', 'tdst-season-1', 'MA Stars', '#2980B9', 2, NOW(), NOW()),                         -- H
  ('team-nahda', 'tdst-season-1', 'Nahda Shooters', '#F1C40F', 2, NOW(), NOW()),                -- I
  ('team-nuqum', 'tdst-season-1', 'Nuqum Rock', '#34495E', 2, NOW(), NOW());                    -- J

-- GROUP 3 TEAMS (K-O)
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-parallel', 'tdst-season-1', 'Parallel Power', '#27AE60', 3, NOW(), NOW()),             -- K
  ('team-royal', 'tdst-season-1', 'Royal Blasters', '#C0392B', 3, NOW(), NOW()),                -- L
  ('team-sakeena', 'tdst-season-1', 'Sakeena Strikers', '#3498DB', 3, NOW(), NOW()),            -- M
  ('team-sibling', 'tdst-season-1', 'Sibling Strikers', '#E67E22', 3, NOW(), NOW()),            -- N
  ('team-sultan', 'tdst-season-1', 'Sultan Strikers', '#8E44AD', 3, NOW(), NOW());              -- O

-- GROUP 4 TEAMS (P-T)
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-swat', 'tdst-season-1', 'Swat Katz', '#95A5A6', 4, NOW(), NOW()),                      -- P
  ('team-taher', 'tdst-season-1', 'Taher Ali', '#196F3D', 4, NOW(), NOW()),                     -- Q
  ('team-jade', 'tdst-season-1', 'Team Jade Jaguars', '#566573', 4, NOW(), NOW()),              -- R
  ('team-thunder', 'tdst-season-1', 'Thunder Strikers', '#DC7633', 4, NOW(), NOW()),            -- S
  ('team-wicket', 'tdst-season-1', 'Wicket Warriors', '#6C3483', 4, NOW(), NOW());              -- T

-- ================================================================
-- STEP 4: ADD PLAYERS TO EACH TEAM (ACTUAL REGISTERED PLAYERS)
-- ================================================================

-- GROUP 1 PLAYERS
-- Team A: Dhaba
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-dhaba-1', 'team-dhaba', 'Aliasgar Dhanerawala', 'batsman', false, NOW(), NOW()),
  ('player-dhaba-2', 'team-dhaba', 'Aliasgar Barbhaya', 'bowler', false, NOW(), NOW());

-- Team B: Dhanera Daredevils
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-dhanera-1', 'team-dhanera', 'Abdul Taiyab', 'batsman', false, NOW(), NOW()),
  ('player-dhanera-2', 'team-dhanera', 'Mustafa Abdul Taiyab', 'bowler', false, NOW(), NOW());

-- Team C: Dragons
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-dragons-1', 'team-dragons', 'Mudar Koshish', 'batsman', false, NOW(), NOW()),
  ('player-dragons-2', 'team-dragons', 'Hasan Mahuwala', 'bowler', false, NOW(), NOW());

-- Team D: Dynamic Duo
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-dynamic-1', 'team-dynamic', 'Burhanuddin', 'batsman', false, NOW(), NOW()),
  ('player-dynamic-2', 'team-dynamic', 'Mustafa Patan', 'bowler', false, NOW(), NOW());

-- Team E: Hakimi Dynamos
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-hakimi-1', 'team-hakimi', 'Mohammed Juzer Lokhandwala', 'batsman', false, NOW(), NOW()),
  ('player-hakimi-2', 'team-hakimi', 'Yusuf Hatim Sunelwala', 'bowler', false, NOW(), NOW());

-- GROUP 2 PLAYERS
-- Team F: Hunters
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-hunters-1', 'team-hunters', 'Fakhruddin Moiz Attarwala', 'batsman', false, NOW(), NOW()),
  ('player-hunters-2', 'team-hunters', 'Mustafa Shaikh Abdul Husain Barbhaya', 'bowler', false, NOW(), NOW());

-- Team G: Khatte Angoor
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-khatte-1', 'team-khatte', 'Murtaza Taskin', 'batsman', false, NOW(), NOW()),
  ('player-khatte-2', 'team-khatte', 'Abbas Gheewala', 'bowler', false, NOW(), NOW());

-- Team H: MA Stars
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-ma-1', 'team-ma', 'Abdeali Nulwala', 'batsman', false, NOW(), NOW()),
  ('player-ma-2', 'team-ma', 'Mufaddal Maimoon', 'bowler', false, NOW(), NOW());

-- Team I: Nahda Shooters
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-nahda-1', 'team-nahda', 'Husain Shaikh Kutbuddin Electricwala', 'batsman', false, NOW(), NOW()),
  ('player-nahda-2', 'team-nahda', 'Husain Aziz Pansari', 'bowler', false, NOW(), NOW());

-- Team J: Nuqum Rock
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-nuqum-1', 'team-nuqum', 'Mohammed Mulla Zoeb Badri', 'batsman', false, NOW(), NOW()),
  ('player-nuqum-2', 'team-nuqum', 'Abdul Qader Najmuddin Madarwala', 'bowler', false, NOW(), NOW());

-- GROUP 3 PLAYERS
-- Team K: Parallel Power
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-parallel-1', 'team-parallel', 'Mohammed Abbas', 'batsman', false, NOW(), NOW()),
  ('player-parallel-2', 'team-parallel', 'Mohammad Hozefa', 'bowler', false, NOW(), NOW());

-- Team L: Royal Blasters
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-royal-1', 'team-royal', 'Adnan Dabba', 'batsman', false, NOW(), NOW()),
  ('player-royal-2', 'team-royal', 'Burhanuddin Kanpur', 'bowler', false, NOW(), NOW());

-- Team M: Sakeena Strikers
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-sakeena-1', 'team-sakeena', 'Abizer Khanjiwala', 'batsman', false, NOW(), NOW()),
  ('player-sakeena-2', 'team-sakeena', 'Abizer Khanjiwala Jr', 'bowler', false, NOW(), NOW());

-- Team N: Sibling Strikers
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-sibling-1', 'team-sibling', 'Shabbir Abid Pumpwala', 'batsman', false, NOW(), NOW()),
  ('player-sibling-2', 'team-sibling', 'Husain Abid Pumpwala', 'bowler', false, NOW(), NOW());

-- Team O: Sultan Strikers
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-sultan-1', 'team-sultan', 'Huzefa Gohil', 'batsman', false, NOW(), NOW()),
  ('player-sultan-2', 'team-sultan', 'Malekulashter', 'bowler', false, NOW(), NOW());

-- GROUP 4 PLAYERS
-- Team P: Swat Katz
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-swat-1', 'team-swat', 'Mulla Mustafa Yusuf Galabhai', 'batsman', false, NOW(), NOW()),
  ('player-swat-2', 'team-swat', 'Husain Shaikh Akber Tambawala', 'bowler', false, NOW(), NOW());

-- Team Q: Taher Ali
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-taher-1', 'team-taher', 'Aliasgar Khandwawala', 'batsman', false, NOW(), NOW()),
  ('player-taher-2', 'team-taher', 'Taher Shabbir Gadiwala', 'bowler', false, NOW(), NOW());

-- Team R: Team Jade Jaguars
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-jade-1', 'team-jade', 'Aziz Moiz Patanwala', 'batsman', false, NOW(), NOW()),
  ('player-jade-2', 'team-jade', 'Taher Husain Motiwala', 'bowler', false, NOW(), NOW());

-- Team S: Thunder Strikers
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-thunder-1', 'team-thunder', 'Ibrahim Sheikh Husain Ezzi', 'batsman', false, NOW(), NOW()),
  ('player-thunder-2', 'team-thunder', 'Qaid Joher Huzefa Nasir', 'bowler', false, NOW(), NOW());

-- Team T: Wicket Warriors
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-wicket-1', 'team-wicket', 'Hussain Tamba', 'batsman', false, NOW(), NOW()),
  ('player-wicket-2', 'team-wicket', 'Abbas Saifee', 'bowler', false, NOW(), NOW());

-- ================================================================
-- STEP 5: SCHEDULE LEAGUE MATCHES (25 MATCHES)
-- Following the exact fixture pattern from tournament plan
-- ================================================================
-- Team Mapping:
-- A=Dhaba, B=Dhanera, C=Dragons, D=Dynamic, E=Hakimi
-- F=Hunters, G=Khatte, H=MA, I=Nahda, J=Nuqum
-- K=Parallel, L=Royal, M=Sakeena, N=Sibling, O=Sultan
-- P=Swat, Q=Taher, R=Jade, S=Thunder, T=Wicket
-- ================================================================

-- ROUND 1 (Matches 1-6)
-- Thursday, March 3, 2026 - Opening Ceremony + 6 League Games
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  -- 1. A–F–K–P (Dhaba-Hunters-Parallel-Swat)
  ('match-01', 'tdst-season-1', 1, 'Court A', '2026-03-03 20:50:00', NULL, NULL,
   ARRAY['team-dhaba', 'team-hunters', 'team-parallel', 'team-swat'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 2. B–G–L–Q (Dhanera-Khatte-Royal-Taher)
  ('match-02', 'tdst-season-1', 2, 'Court A', '2026-03-03 21:30:00', NULL, NULL,
   ARRAY['team-dhanera', 'team-khatte', 'team-royal', 'team-taher'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 3. C–H–M–R (Dragons-MA-Sakeena-Jade)
  ('match-03', 'tdst-season-1', 3, 'Court A', '2026-03-03 22:10:00', NULL, NULL,
   ARRAY['team-dragons', 'team-ma', 'team-sakeena', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 4. D–I–N–S (Dynamic-Nahda-Sibling-Thunder)
  ('match-04', 'tdst-season-1', 4, 'Court A', '2026-03-03 22:50:00', NULL, NULL,
   ARRAY['team-dynamic', 'team-nahda', 'team-sibling', 'team-thunder'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 5. E–J–O–T (Hakimi-Nuqum-Sultan-Wicket)
  ('match-05', 'tdst-season-1', 5, 'Court A', '2026-03-03 23:30:00', NULL, NULL,
   ARRAY['team-hakimi', 'team-nuqum', 'team-sultan', 'team-wicket'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 6. A–G–M–T (Dhaba-Khatte-Sakeena-Wicket)
  ('match-06', 'tdst-season-1', 6, 'Court A', '2026-03-03 20:10:00', NULL, NULL,
   ARRAY['team-dhaba', 'team-khatte', 'team-sakeena', 'team-wicket'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- ROUND 2 (Matches 7-14)
-- Friday, March 4, 2026 - 8 League Games
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  -- 7. B–H–N–P (Dhanera-MA-Sibling-Swat)
  ('match-07', 'tdst-season-1', 7, 'Court A', '2026-03-04 20:00:00', NULL, NULL,
   ARRAY['team-dhanera', 'team-ma', 'team-sibling', 'team-swat'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 8. C–I–O–Q (Dragons-Nahda-Sultan-Taher)
  ('match-08', 'tdst-season-1', 8, 'Court A', '2026-03-04 20:40:00', NULL, NULL,
   ARRAY['team-dragons', 'team-nahda', 'team-sultan', 'team-taher'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 9. D–J–K–R (Dynamic-Nuqum-Parallel-Jade)
  ('match-09', 'tdst-season-1', 9, 'Court A', '2026-03-04 21:20:00', NULL, NULL,
   ARRAY['team-dynamic', 'team-nuqum', 'team-parallel', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 10. E–F–L–S (Hakimi-Hunters-Royal-Thunder)
  ('match-10', 'tdst-season-1', 10, 'Court A', '2026-03-04 22:00:00', NULL, NULL,
   ARRAY['team-hakimi', 'team-hunters', 'team-royal', 'team-thunder'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 11. A–H–O–S (Dhaba-MA-Sultan-Thunder)
  ('match-11', 'tdst-season-1', 11, 'Court A', '2026-03-04 22:40:00', NULL, NULL,
   ARRAY['team-dhaba', 'team-ma', 'team-sultan', 'team-thunder'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 12. B–I–K–T (Dhanera-Nahda-Parallel-Wicket)
  ('match-12', 'tdst-season-1', 12, 'Court A', '2026-03-04 23:20:00', NULL, NULL,
   ARRAY['team-dhanera', 'team-nahda', 'team-parallel', 'team-wicket'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 13. C–J–L–P (Dragons-Nuqum-Royal-Swat)
  ('match-13', 'tdst-season-1', 13, 'Court A', '2026-03-05 00:00:00', NULL, NULL,
   ARRAY['team-dragons', 'team-nuqum', 'team-royal', 'team-swat'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 14. D–F–M–Q (Dynamic-Hunters-Sakeena-Taher)
  ('match-14', 'tdst-season-1', 14, 'Court A', '2026-03-05 00:40:00', NULL, NULL,
   ARRAY['team-dynamic', 'team-hunters', 'team-sakeena', 'team-taher'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- ROUND 3 & 4 (Matches 15-20)
-- Saturday, March 5, 2026 - 8 League Games
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  -- 15. E–G–N–R (Hakimi-Khatte-Sibling-Jade)
  ('match-15', 'tdst-season-1', 15, 'Court A', '2026-03-05 20:00:00', NULL, NULL,
   ARRAY['team-hakimi', 'team-khatte', 'team-sibling', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 16. A–I–L–R (Dhaba-Nahda-Royal-Jade)
  ('match-16', 'tdst-season-1', 16, 'Court A', '2026-03-05 20:40:00', NULL, NULL,
   ARRAY['team-dhaba', 'team-nahda', 'team-royal', 'team-jade'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 17. B–J–M–S (Dhanera-Nuqum-Sakeena-Thunder)
  ('match-17', 'tdst-season-1', 17, 'Court A', '2026-03-05 21:20:00', NULL, NULL,
   ARRAY['team-dhanera', 'team-nuqum', 'team-sakeena', 'team-thunder'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 18. C–F–N–T (Dragons-Hunters-Sibling-Wicket)
  ('match-18', 'tdst-season-1', 18, 'Court A', '2026-03-05 22:00:00', NULL, NULL,
   ARRAY['team-dragons', 'team-hunters', 'team-sibling', 'team-wicket'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 19. D–G–O–P (Dynamic-Khatte-Sultan-Swat)
  ('match-19', 'tdst-season-1', 19, 'Court A', '2026-03-05 22:40:00', NULL, NULL,
   ARRAY['team-dynamic', 'team-khatte', 'team-sultan', 'team-swat'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 20. E–H–K–Q (Hakimi-MA-Parallel-Taher)
  ('match-20', 'tdst-season-1', 20, 'Court A', '2026-03-05 23:20:00', NULL, NULL,
   ARRAY['team-hakimi', 'team-ma', 'team-parallel', 'team-taher'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- ROUND 5 (Matches 21-25) - WITHIN-GROUP MATCHES
-- Sunday, March 6, 2026 - 3 League Games + Semi-finals + Final
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  -- 21. A–B–C–D (Group 1: Dhaba-Dhanera-Dragons-Dynamic)
  ('match-21', 'tdst-season-1', 21, 'Court A', '2026-03-06 20:00:00', NULL, NULL,
   ARRAY['team-dhaba', 'team-dhanera', 'team-dragons', 'team-dynamic'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 22. E–F–G–H (Group 1+2 mix: Hakimi-Hunters-Khatte-MA)
  ('match-22', 'tdst-season-1', 22, 'Court A', '2026-03-06 20:40:00', NULL, NULL,
   ARRAY['team-hakimi', 'team-hunters', 'team-khatte', 'team-ma'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 23. I–J–K–L (Group 2+3 mix: Nahda-Nuqum-Parallel-Royal)
  ('match-23', 'tdst-season-1', 23, 'Court A', '2026-03-06 21:20:00', NULL, NULL,
   ARRAY['team-nahda', 'team-nuqum', 'team-parallel', 'team-royal'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 24. M–N–O–P (Group 3+4 mix: Sakeena-Sibling-Sultan-Swat)
  ('match-24', 'tdst-season-1', 24, 'Court A', '2026-03-06 22:00:00', NULL, NULL,
   ARRAY['team-sakeena', 'team-sibling', 'team-sultan', 'team-swat'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),

  -- 25. Q–R–S–T (Group 4: Taher-Jade-Thunder-Wicket)
  ('match-25', 'tdst-season-1', 25, 'Court A', '2026-03-06 22:40:00', NULL, NULL,
   ARRAY['team-taher', 'team-jade', 'team-thunder', 'team-wicket'],
   'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- ================================================================
-- NOTE: SEMI-FINALS AND FINALS WILL BE CREATED AFTER LEAGUE STAGE
-- ================================================================
-- Match 26: Semi-Final 1 (G1S1 V G2S2 V G3S1 V G4S2)
-- Match 27: Semi-Final 2 (G1S2 V G2S1 V G3S2 V G4S1)
-- Match 28: Grand Finale (Top 2 from each semi-final)
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

-- Check matches by stage
SELECT stage, COUNT(*) as match_count
FROM matches
WHERE tournament_id = 'tdst-season-1'
GROUP BY stage
ORDER BY stage;

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
  COALESCE(tmc.matches_played, 0) as matches_scheduled
FROM teams t
LEFT JOIN team_match_counts tmc ON t.id = tmc.team_id
WHERE t.tournament_id = 'tdst-season-1'
ORDER BY t.name;

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
  RAISE NOTICE '   - 25 League matches scheduled (March 3-6, 2026)';
  RAISE NOTICE '   - 4 Groups of 5 teams each';
  RAISE NOTICE '   ';
  RAISE NOTICE '📋 Teams by Group:';
  RAISE NOTICE '   Group 1: Dhaba, Dhanera Daredevils, Dragons, Dynamic Duo, Hakimi Dynamos';
  RAISE NOTICE '   Group 2: Hunters, Khatte Angoor, MA Stars, Nahda Shooters, Nuqum Rock';
  RAISE NOTICE '   Group 3: Parallel Power, Royal Blasters, Sakeena Strikers, Sibling Strikers, Sultan Strikers';
  RAISE NOTICE '   Group 4: Swat Katz, Taher Ali, Team Jade Jaguars, Thunder Strikers, Wicket Warriors';
  RAISE NOTICE '   ';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '   1. Assign umpires to matches';
  RAISE NOTICE '   2. Start scoring matches from Umpire Portal';
  RAISE NOTICE '   3. After league stage, create SEMI and FINAL matches';
  RAISE NOTICE '   ';
  RAISE NOTICE '🚀 Ready to start the tournament!';
END $$;
