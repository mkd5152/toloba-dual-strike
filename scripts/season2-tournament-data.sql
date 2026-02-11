-- ================================================================
-- DOUBLE WICKET TOURNAMENT SEASON 2 - RAMADAN EDITION 2026
-- ================================================================
-- Tournament Structure:
-- - 20 Teams (Team A through Team T)
-- - 4 Groups of 5 teams each
-- - 2 Players per team (Double Wicket format)
-- - 25 League Matches + 2 Semi-finals + 1 Final = 28 total matches
-- - Each team plays 5 matches in league stage
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
  youtube_link,
  registration_link,
  contacts,
  created_at,
  updated_at
) VALUES (
  'tdst-season-2',
  'TDST - Season 2',
  'Double Wicket Tournament Season 2 - Ramadan Edition 2026',
  'Toloba Sports Club',
  'Toloba Cricket Ground',
  '2026-03-03',
  '2026-03-06',
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

-- GROUP 1 TEAMS: A, B, C, D, E
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-a', 'tdst-season-2', 'Team A', '#FF5733', 1, NOW(), NOW()),
  ('team-b', 'tdst-season-2', 'Team B', '#3498DB', 1, NOW(), NOW()),
  ('team-c', 'tdst-season-2', 'Team C', '#E74C3C', 1, NOW(), NOW()),
  ('team-d', 'tdst-season-2', 'Team D', '#9B59B6', 1, NOW(), NOW()),
  ('team-e', 'tdst-season-2', 'Team E', '#F39C12', 1, NOW(), NOW());

-- GROUP 2 TEAMS: F, G, H, I, J
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-f', 'tdst-season-2', 'Team F', '#16A085', 2, NOW(), NOW()),
  ('team-g', 'tdst-season-2', 'Team G', '#D35400', 2, NOW(), NOW()),
  ('team-h', 'tdst-season-2', 'Team H', '#2980B9', 2, NOW(), NOW()),
  ('team-i', 'tdst-season-2', 'Team I', '#F1C40F', 2, NOW(), NOW()),
  ('team-j', 'tdst-season-2', 'Team J', '#34495E', 2, NOW(), NOW());

-- GROUP 3 TEAMS: K, L, M, N, O
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-k', 'tdst-season-2', 'Team K', '#27AE60', 3, NOW(), NOW()),
  ('team-l', 'tdst-season-2', 'Team L', '#C0392B', 3, NOW(), NOW()),
  ('team-m', 'tdst-season-2', 'Team M', '#3498DB', 3, NOW(), NOW()),
  ('team-n', 'tdst-season-2', 'Team N', '#E67E22', 3, NOW(), NOW()),
  ('team-o', 'tdst-season-2', 'Team O', '#8E44AD', 3, NOW(), NOW());

-- GROUP 4 TEAMS: P, Q, R, S, T
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-p', 'tdst-season-2', 'Team P', '#95A5A6', 4, NOW(), NOW()),
  ('team-q', 'tdst-season-2', 'Team Q', '#196F3D', 4, NOW(), NOW()),
  ('team-r', 'tdst-season-2', 'Team R', '#566573', 4, NOW(), NOW()),
  ('team-s', 'tdst-season-2', 'Team S', '#DC7633', 4, NOW(), NOW()),
  ('team-t', 'tdst-season-2', 'Team T', '#6C3483', 4, NOW(), NOW());

-- ================================================================
-- STEP 4: ADD PLAYERS TO EACH TEAM (2 players per team - Double Wicket)
-- ================================================================

INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  -- Team A
  ('player-a1', 'team-a', 'Player A1', 'batsman', false, NOW(), NOW()),
  ('player-a2', 'team-a', 'Player A2', 'bowler', false, NOW(), NOW()),

  -- Team B
  ('player-b1', 'team-b', 'Player B1', 'batsman', false, NOW(), NOW()),
  ('player-b2', 'team-b', 'Player B2', 'bowler', false, NOW(), NOW()),

  -- Team C
  ('player-c1', 'team-c', 'Player C1', 'batsman', false, NOW(), NOW()),
  ('player-c2', 'team-c', 'Player C2', 'bowler', false, NOW(), NOW()),

  -- Team D
  ('player-d1', 'team-d', 'Player D1', 'batsman', false, NOW(), NOW()),
  ('player-d2', 'team-d', 'Player D2', 'bowler', false, NOW(), NOW()),

  -- Team E
  ('player-e1', 'team-e', 'Player E1', 'batsman', false, NOW(), NOW()),
  ('player-e2', 'team-e', 'Player E2', 'bowler', false, NOW(), NOW()),

  -- Team F
  ('player-f1', 'team-f', 'Player F1', 'batsman', false, NOW(), NOW()),
  ('player-f2', 'team-f', 'Player F2', 'bowler', false, NOW(), NOW()),

  -- Team G
  ('player-g1', 'team-g', 'Player G1', 'batsman', false, NOW(), NOW()),
  ('player-g2', 'team-g', 'Player G2', 'bowler', false, NOW(), NOW()),

  -- Team H
  ('player-h1', 'team-h', 'Player H1', 'batsman', false, NOW(), NOW()),
  ('player-h2', 'team-h', 'Player H2', 'bowler', false, NOW(), NOW()),

  -- Team I
  ('player-i1', 'team-i', 'Player I1', 'batsman', false, NOW(), NOW()),
  ('player-i2', 'team-i', 'Player I2', 'bowler', false, NOW(), NOW()),

  -- Team J
  ('player-j1', 'team-j', 'Player J1', 'batsman', false, NOW(), NOW()),
  ('player-j2', 'team-j', 'Player J2', 'bowler', false, NOW(), NOW()),

  -- Team K
  ('player-k1', 'team-k', 'Player K1', 'batsman', false, NOW(), NOW()),
  ('player-k2', 'team-k', 'Player K2', 'bowler', false, NOW(), NOW()),

  -- Team L
  ('player-l1', 'team-l', 'Player L1', 'batsman', false, NOW(), NOW()),
  ('player-l2', 'team-l', 'Player L2', 'bowler', false, NOW(), NOW()),

  -- Team M
  ('player-m1', 'team-m', 'Player M1', 'batsman', false, NOW(), NOW()),
  ('player-m2', 'team-m', 'Player M2', 'bowler', false, NOW(), NOW()),

  -- Team N
  ('player-n1', 'team-n', 'Player N1', 'batsman', false, NOW(), NOW()),
  ('player-n2', 'team-n', 'Player N2', 'bowler', false, NOW(), NOW()),

  -- Team O
  ('player-o1', 'team-o', 'Player O1', 'batsman', false, NOW(), NOW()),
  ('player-o2', 'team-o', 'Player O2', 'bowler', false, NOW(), NOW()),

  -- Team P
  ('player-p1', 'team-p', 'Player P1', 'batsman', false, NOW(), NOW()),
  ('player-p2', 'team-p', 'Player P2', 'bowler', false, NOW(), NOW()),

  -- Team Q
  ('player-q1', 'team-q', 'Player Q1', 'batsman', false, NOW(), NOW()),
  ('player-q2', 'team-q', 'Player Q2', 'bowler', false, NOW(), NOW()),

  -- Team R
  ('player-r1', 'team-r', 'Player R1', 'batsman', false, NOW(), NOW()),
  ('player-r2', 'team-r', 'Player R2', 'bowler', false, NOW(), NOW()),

  -- Team S
  ('player-s1', 'team-s', 'Player S1', 'batsman', false, NOW(), NOW()),
  ('player-s2', 'team-s', 'Player S2', 'bowler', false, NOW(), NOW()),

  -- Team T
  ('player-t1', 'team-t', 'Player T1', 'batsman', false, NOW(), NOW()),
  ('player-t2', 'team-t', 'Player T2', 'bowler', false, NOW(), NOW());

-- ================================================================
-- STEP 5: SCHEDULE LEAGUE MATCHES (25 MATCHES)
-- ================================================================
-- Schedule: March 3-6, 2026
-- Thursday: 6 matches (8:30 PM - 11:30 PM)
-- Friday: 8 matches (8:00 PM - 11:00 PM)
-- Saturday: 8 matches (8:00 PM - 11:00 PM)
-- Sunday: 3 matches (8:00 PM start)
-- ================================================================

-- ROUND 1 (Matches 1-5) - Thursday, March 3
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-01', 'tdst-season-2', 1, 'Court A', '2026-03-03 20:50:00', NULL, NULL, ARRAY['team-a', 'team-f', 'team-k', 'team-p'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-02', 'tdst-season-2', 2, 'Court A', '2026-03-03 21:30:00', NULL, NULL, ARRAY['team-b', 'team-g', 'team-l', 'team-q'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-03', 'tdst-season-2', 3, 'Court A', '2026-03-03 22:10:00', NULL, NULL, ARRAY['team-c', 'team-h', 'team-m', 'team-r'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-04', 'tdst-season-2', 4, 'Court A', '2026-03-03 22:50:00', NULL, NULL, ARRAY['team-d', 'team-i', 'team-n', 'team-s'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-05', 'tdst-season-2', 5, 'Court A', '2026-03-03 23:30:00', NULL, NULL, ARRAY['team-e', 'team-j', 'team-o', 'team-t'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- ROUND 1 continued (Match 6) - Thursday
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-06', 'tdst-season-2', 6, 'Court A', '2026-03-03 20:10:00', NULL, NULL, ARRAY['team-a', 'team-g', 'team-m', 'team-t'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- ROUND 2 (Matches 7-10) - Friday, March 4
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-07', 'tdst-season-2', 7, 'Court A', '2026-03-04 20:00:00', NULL, NULL, ARRAY['team-b', 'team-h', 'team-n', 'team-p'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-08', 'tdst-season-2', 8, 'Court A', '2026-03-04 20:40:00', NULL, NULL, ARRAY['team-c', 'team-i', 'team-o', 'team-q'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-09', 'tdst-season-2', 9, 'Court A', '2026-03-04 21:20:00', NULL, NULL, ARRAY['team-d', 'team-j', 'team-k', 'team-r'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-10', 'tdst-season-2', 10, 'Court A', '2026-03-04 22:00:00', NULL, NULL, ARRAY['team-e', 'team-f', 'team-l', 'team-s'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- ROUND 3 (Matches 11-14) - Friday continued
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-11', 'tdst-season-2', 11, 'Court A', '2026-03-04 22:40:00', NULL, NULL, ARRAY['team-a', 'team-h', 'team-o', 'team-s'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-12', 'tdst-season-2', 12, 'Court A', '2026-03-04 23:20:00', NULL, NULL, ARRAY['team-b', 'team-i', 'team-k', 'team-t'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-13', 'tdst-season-2', 13, 'Court A', '2026-03-05 00:00:00', NULL, NULL, ARRAY['team-c', 'team-j', 'team-l', 'team-p'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-14', 'tdst-season-2', 14, 'Court A', '2026-03-05 00:40:00', NULL, NULL, ARRAY['team-d', 'team-f', 'team-m', 'team-q'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- ROUND 3 & 4 (Matches 15-18) - Saturday, March 5
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-15', 'tdst-season-2', 15, 'Court A', '2026-03-05 20:00:00', NULL, NULL, ARRAY['team-e', 'team-g', 'team-n', 'team-r'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-16', 'tdst-season-2', 16, 'Court A', '2026-03-05 20:40:00', NULL, NULL, ARRAY['team-a', 'team-i', 'team-l', 'team-r'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-17', 'tdst-season-2', 17, 'Court A', '2026-03-05 21:20:00', NULL, NULL, ARRAY['team-b', 'team-j', 'team-m', 'team-s'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-18', 'tdst-season-2', 18, 'Court A', '2026-03-05 22:00:00', NULL, NULL, ARRAY['team-c', 'team-f', 'team-n', 'team-t'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- ROUND 4 (Matches 19-20) - Saturday continued
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-19', 'tdst-season-2', 19, 'Court A', '2026-03-05 22:40:00', NULL, NULL, ARRAY['team-d', 'team-g', 'team-o', 'team-p'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-20', 'tdst-season-2', 20, 'Court A', '2026-03-05 23:20:00', NULL, NULL, ARRAY['team-e', 'team-h', 'team-k', 'team-q'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- ROUND 5 (Matches 21-25) - Sunday, March 6
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-21', 'tdst-season-2', 21, 'Court A', '2026-03-06 20:00:00', NULL, NULL, ARRAY['team-a', 'team-b', 'team-c', 'team-d'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-22', 'tdst-season-2', 22, 'Court A', '2026-03-06 20:40:00', NULL, NULL, ARRAY['team-e', 'team-f', 'team-g', 'team-h'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-23', 'tdst-season-2', 23, 'Court A', '2026-03-06 21:20:00', NULL, NULL, ARRAY['team-i', 'team-j', 'team-k', 'team-l'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-24', 'tdst-season-2', 24, 'Court A', '2026-03-06 22:00:00', NULL, NULL, ARRAY['team-m', 'team-n', 'team-o', 'team-p'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-25', 'tdst-season-2', 25, 'Court A', '2026-03-06 22:40:00', NULL, NULL, ARRAY['team-q', 'team-r', 'team-s', 'team-t'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- ================================================================
-- NOTE: SEMI-FINALS AND FINALS
-- ================================================================
-- Semi-finals and finals will be created AFTER league stage completes
-- Based on top 2 teams from each group
--
-- SEMI 1: G1S1 V G2S2 V G3S1 V G4S2 (Match 26)
-- SEMI 2: G1S2 V G2S1 V G3S2 V G4S1 (Match 27)
-- FINAL: Top 2 from each semi-final (Match 28)
-- ================================================================

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check tournament
SELECT * FROM tournaments WHERE id = 'tdst-season-2';

-- Check teams by group
SELECT "group", COUNT(*) as team_count
FROM teams
WHERE tournament_id = 'tdst-season-2'
GROUP BY "group"
ORDER BY "group";

-- Check total players
SELECT COUNT(*) as total_players
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.tournament_id = 'tdst-season-2';

-- Check matches by stage
SELECT stage, COUNT(*) as match_count
FROM matches
WHERE tournament_id = 'tdst-season-2'
GROUP BY stage
ORDER BY stage;

-- Show all teams with their groups
SELECT t.name, t."group", COUNT(p.id) as player_count
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.tournament_id = 'tdst-season-2'
GROUP BY t.id, t.name, t."group"
ORDER BY t."group", t.name;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Tournament Season 2 setup complete!';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   - 1 Tournament created (Double Wicket Season 2)';
  RAISE NOTICE '   - 20 Teams (Team A through Team T)';
  RAISE NOTICE '   - 40 Players (2 per team)';
  RAISE NOTICE '   - 25 League matches scheduled';
  RAISE NOTICE '   ';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '   1. Assign umpires to matches';
  RAISE NOTICE '   2. Start scoring matches from Umpire Portal';
  RAISE NOTICE '   3. After league stage, create SEMI and FINAL matches';
  RAISE NOTICE '   ';
  RAISE NOTICE '🚀 Ready for Ramadan Cricket!';
END $$;
