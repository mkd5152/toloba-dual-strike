-- ============================================================
-- TDST SEASON 1 - TOLOBA DUAL STRIKE TOURNAMENT
-- 20 Teams, 28 Matches (25 League + 2 Semis + 1 Final)
-- Feb 26 - Mar 1, 2026
-- ============================================================

-- Clear existing data (careful in production!)
DELETE FROM balls;
DELETE FROM overs;
DELETE FROM innings;
DELETE FROM matches;
DELETE FROM players;
DELETE FROM teams;
DELETE FROM tournaments;

-- Insert Tournament
INSERT INTO tournaments (id, name, full_name, organizer, venue, start_date, end_date, start_time, matches_per_team, teams_per_match, overs_per_innings, tagline, youtube_link, registration_link, contacts)
VALUES (
  'tdst-season-1',
  'TDST – Season 1',
  'Toloba Dual Strike Tournament – Season 1',
  'Toloba',
  'TBD',
  '2026-02-26',
  '2026-03-01',
  '20:30',
  5,
  4,
  3,
  'Two players. One mission. Dual Strike. 👑',
  'https://youtu.be/mMVo6wet-L0?si=vzLx1Dpw7Cl--jQM',
  'https://forms.gle/hvyjFPtwM96qyJBK7',
  ARRAY['Contact 1: Mustafa +971 56 736 9803', 'Contact 2: Huzefa +971 56 355 0605']
);

-- Insert 20 Teams (A-T with actual cricket team names)
INSERT INTO teams (id, tournament_id, name, color) VALUES
('team-a', 'tdst-season-1', 'Chennai Kings', '#FF6B6B'),
('team-b', 'tdst-season-1', 'Mumbai Warriors', '#4ECDC4'),
('team-c', 'tdst-season-1', 'Delhi Daredevils', '#45B7D1'),
('team-d', 'tdst-season-1', 'Bangalore Royals', '#FFA07A'),
('team-e', 'tdst-season-1', 'Kolkata Knights', '#98D8C8'),
('team-f', 'tdst-season-1', 'Hyderabad Tigers', '#F7DC6F'),
('team-g', 'tdst-season-1', 'Punjab Lions', '#BB8FCE'),
('team-h', 'tdst-season-1', 'Rajasthan Rangers', '#85C1E2'),
('team-i', 'tdst-season-1', 'Gujarat Giants', '#F8B739'),
('team-j', 'tdst-season-1', 'Lucknow Legends', '#52BE80'),
('team-k', 'tdst-season-1', 'Ahmedabad Aces', '#EC7063'),
('team-l', 'tdst-season-1', 'Jaipur Jaguars', '#AF7AC5'),
('team-m', 'tdst-season-1', 'Pune Panthers', '#5DADE2'),
('team-n', 'tdst-season-1', 'Kochi Kings', '#58D68D'),
('team-o', 'tdst-season-1', 'Indore Indians', '#F5B041'),
('team-p', 'tdst-season-1', 'Nagpur Ninjas', '#EB984E'),
('team-q', 'tdst-season-1', 'Surat Strikers', '#85929E'),
('team-r', 'tdst-season-1', 'Bhopal Blazers', '#D98880'),
('team-s', 'tdst-season-1', 'Patna Patriots', '#A569BD'),
('team-t', 'tdst-season-1', 'Ranchi Riders', '#7FB3D5');

-- Insert 40 Players (2 per team)
INSERT INTO players (id, team_id, name, role, is_late_arrival) VALUES
-- Team A
('player-a1', 'team-a', 'Player A1', 'batsman', false),
('player-a2', 'team-a', 'Player A2', 'bowler', false),
-- Team B
('player-b1', 'team-b', 'Player B1', 'batsman', false),
('player-b2', 'team-b', 'Player B2', 'bowler', false),
-- Team C
('player-c1', 'team-c', 'Player C1', 'batsman', false),
('player-c2', 'team-c', 'Player C2', 'bowler', false),
-- Team D
('player-d1', 'team-d', 'Player D1', 'batsman', false),
('player-d2', 'team-d', 'Player D2', 'bowler', false),
-- Team E
('player-e1', 'team-e', 'Player E1', 'batsman', false),
('player-e2', 'team-e', 'Player E2', 'bowler', false),
-- Team F
('player-f1', 'team-f', 'Player F1', 'batsman', false),
('player-f2', 'team-f', 'Player F2', 'bowler', false),
-- Team G
('player-g1', 'team-g', 'Player G1', 'batsman', false),
('player-g2', 'team-g', 'Player G2', 'bowler', false),
-- Team H
('player-h1', 'team-h', 'Player H1', 'batsman', false),
('player-h2', 'team-h', 'Player H2', 'bowler', false),
-- Team I
('player-i1', 'team-i', 'Player I1', 'batsman', false),
('player-i2', 'team-i', 'Player I2', 'bowler', false),
-- Team J
('player-j1', 'team-j', 'Player J1', 'batsman', false),
('player-j2', 'team-j', 'Player J2', 'bowler', false),
-- Team K
('player-k1', 'team-k', 'Player K1', 'batsman', false),
('player-k2', 'team-k', 'Player K2', 'bowler', false),
-- Team L
('player-l1', 'team-l', 'Player L1', 'batsman', false),
('player-l2', 'team-l', 'Player L2', 'bowler', false),
-- Team M
('player-m1', 'team-m', 'Player M1', 'batsman', false),
('player-m2', 'team-m', 'Player M2', 'bowler', false),
-- Team N
('player-n1', 'team-n', 'Player N1', 'batsman', false),
('player-n2', 'team-n', 'Player N2', 'bowler', false),
-- Team O
('player-o1', 'team-o', 'Player O1', 'batsman', false),
('player-o2', 'team-o', 'Player O2', 'bowler', false),
-- Team P
('player-p1', 'team-p', 'Player P1', 'batsman', false),
('player-p2', 'team-p', 'Player P2', 'bowler', false),
-- Team Q
('player-q1', 'team-q', 'Player Q1', 'batsman', false),
('player-q2', 'team-q', 'Player Q2', 'bowler', false),
-- Team R
('player-r1', 'team-r', 'Player R1', 'batsman', false),
('player-r2', 'team-r', 'Player R2', 'bowler', false),
-- Team S
('player-s1', 'team-s', 'Player S1', 'batsman', false),
('player-s2', 'team-s', 'Player S2', 'bowler', false),
-- Team T
('player-t1', 'team-t', 'Player T1', 'batsman', false),
('player-t2', 'team-t', 'Player T2', 'bowler', false);

-- ============================================================
-- MATCHES - 28 TOTAL
-- ============================================================

-- THURSDAY FEB 26, 2026 (3rd Ramadan) - 6 GAMES
-- Opening Ceremony: 20:30-20:50 (20 mins)
-- Games start: 20:50

-- Game 1: A-F-K-P (20:50)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-1', 'tdst-season-1', 1, 'Court 1', '2026-02-26 20:50:00+00',
ARRAY['team-a', 'team-f', 'team-k', 'team-p'], 'CREATED',
ARRAY['team-a', 'team-f', 'team-k', 'team-p']);

-- Game 2: B-G-L-Q (21:25)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-2', 'tdst-season-1', 2, 'Court 1', '2026-02-26 21:25:00+00',
ARRAY['team-b', 'team-g', 'team-l', 'team-q'], 'CREATED',
ARRAY['team-b', 'team-g', 'team-l', 'team-q']);

-- Game 3: C-H-M-R (22:00)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-3', 'tdst-season-1', 3, 'Court 1', '2026-02-26 22:00:00+00',
ARRAY['team-c', 'team-h', 'team-m', 'team-r'], 'CREATED',
ARRAY['team-c', 'team-h', 'team-m', 'team-r']);

-- Game 4: D-I-N-S (22:35)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-4', 'tdst-season-1', 4, 'Court 1', '2026-02-26 22:35:00+00',
ARRAY['team-d', 'team-i', 'team-n', 'team-s'], 'CREATED',
ARRAY['team-d', 'team-i', 'team-n', 'team-s']);

-- Game 5: E-J-O-T (23:10)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-5', 'tdst-season-1', 5, 'Court 1', '2026-02-26 23:10:00+00',
ARRAY['team-e', 'team-j', 'team-o', 'team-t'], 'CREATED',
ARRAY['team-e', 'team-j', 'team-o', 'team-t']);

-- Game 6: A-G-M-T (23:45)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-6', 'tdst-season-1', 6, 'Court 1', '2026-02-26 23:45:00+00',
ARRAY['team-a', 'team-g', 'team-m', 'team-t'], 'CREATED',
ARRAY['team-a', 'team-g', 'team-m', 'team-t']);

-- FRIDAY FEB 27, 2026 (4th Ramadan) - 8 GAMES
-- Start: 20:00

-- Game 7: B-H-N-P (20:00)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-7', 'tdst-season-1', 7, 'Court 1', '2026-02-27 20:00:00+00',
ARRAY['team-b', 'team-h', 'team-n', 'team-p'], 'CREATED',
ARRAY['team-b', 'team-h', 'team-n', 'team-p']);

-- Game 8: C-I-O-Q (20:35)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-8', 'tdst-season-1', 8, 'Court 1', '2026-02-27 20:35:00+00',
ARRAY['team-c', 'team-i', 'team-o', 'team-q'], 'CREATED',
ARRAY['team-c', 'team-i', 'team-o', 'team-q']);

-- Game 9: D-J-K-R (21:10)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-9', 'tdst-season-1', 9, 'Court 1', '2026-02-27 21:10:00+00',
ARRAY['team-d', 'team-j', 'team-k', 'team-r'], 'CREATED',
ARRAY['team-d', 'team-j', 'team-k', 'team-r']);

-- Game 10: E-F-L-S (21:45)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-10', 'tdst-season-1', 10, 'Court 1', '2026-02-27 21:45:00+00',
ARRAY['team-e', 'team-f', 'team-l', 'team-s'], 'CREATED',
ARRAY['team-e', 'team-f', 'team-l', 'team-s']);

-- Game 11: A-H-O-S (22:20)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-11', 'tdst-season-1', 11, 'Court 1', '2026-02-27 22:20:00+00',
ARRAY['team-a', 'team-h', 'team-o', 'team-s'], 'CREATED',
ARRAY['team-a', 'team-h', 'team-o', 'team-s']);

-- Game 12: B-I-K-T (22:55)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-12', 'tdst-season-1', 12, 'Court 1', '2026-02-27 22:55:00+00',
ARRAY['team-b', 'team-i', 'team-k', 'team-t'], 'CREATED',
ARRAY['team-b', 'team-i', 'team-k', 'team-t']);

-- Game 13: C-J-L-P (23:30)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-13', 'tdst-season-1', 13, 'Court 1', '2026-02-27 23:30:00+00',
ARRAY['team-c', 'team-j', 'team-l', 'team-p'], 'CREATED',
ARRAY['team-c', 'team-j', 'team-l', 'team-p']);

-- Game 14: D-F-M-Q (00:05)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-14', 'tdst-season-1', 14, 'Court 1', '2026-02-28 00:05:00+00',
ARRAY['team-d', 'team-f', 'team-m', 'team-q'], 'CREATED',
ARRAY['team-d', 'team-f', 'team-m', 'team-q']);

-- SATURDAY FEB 28, 2026 (5th Ramadan) - 8 GAMES
-- Start: 20:00

-- Game 15: E-G-N-R (20:00)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-15', 'tdst-season-1', 15, 'Court 1', '2026-02-28 20:00:00+00',
ARRAY['team-e', 'team-g', 'team-n', 'team-r'], 'CREATED',
ARRAY['team-e', 'team-g', 'team-n', 'team-r']);

-- Game 16: A-I-L-R (20:35)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-16', 'tdst-season-1', 16, 'Court 1', '2026-02-28 20:35:00+00',
ARRAY['team-a', 'team-i', 'team-l', 'team-r'], 'CREATED',
ARRAY['team-a', 'team-i', 'team-l', 'team-r']);

-- Game 17: B-J-M-S (21:10)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-17', 'tdst-season-1', 17, 'Court 1', '2026-02-28 21:10:00+00',
ARRAY['team-b', 'team-j', 'team-m', 'team-s'], 'CREATED',
ARRAY['team-b', 'team-j', 'team-m', 'team-s']);

-- Game 18: C-F-N-T (21:45)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-18', 'tdst-season-1', 18, 'Court 1', '2026-02-28 21:45:00+00',
ARRAY['team-c', 'team-f', 'team-n', 'team-t'], 'CREATED',
ARRAY['team-c', 'team-f', 'team-n', 'team-t']);

-- Game 19: D-G-O-P (22:20)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-19', 'tdst-season-1', 19, 'Court 1', '2026-02-28 22:20:00+00',
ARRAY['team-d', 'team-g', 'team-o', 'team-p'], 'CREATED',
ARRAY['team-d', 'team-g', 'team-o', 'team-p']);

-- Game 20: E-H-K-Q (22:55)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-20', 'tdst-season-1', 20, 'Court 1', '2026-02-28 22:55:00+00',
ARRAY['team-e', 'team-h', 'team-k', 'team-q'], 'CREATED',
ARRAY['team-e', 'team-h', 'team-k', 'team-q']);

-- Game 21: A-B-C-D (23:30)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-21', 'tdst-season-1', 21, 'Court 1', '2026-02-28 23:30:00+00',
ARRAY['team-a', 'team-b', 'team-c', 'team-d'], 'CREATED',
ARRAY['team-a', 'team-b', 'team-c', 'team-d']);

-- Game 22: E-F-G-H (00:05)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-22', 'tdst-season-1', 22, 'Court 1', '2026-03-01 00:05:00+00',
ARRAY['team-e', 'team-f', 'team-g', 'team-h'], 'CREATED',
ARRAY['team-e', 'team-f', 'team-g', 'team-h']);

-- SUNDAY MAR 1, 2026 (6th Ramadan) - 3 LEAGUE + 2 SEMIS + 1 FINAL
-- Start: 20:00

-- Game 23: I-J-K-L (20:00)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-23', 'tdst-season-1', 23, 'Court 1', '2026-03-01 20:00:00+00',
ARRAY['team-i', 'team-j', 'team-k', 'team-l'], 'CREATED',
ARRAY['team-i', 'team-j', 'team-k', 'team-l']);

-- Game 24: M-N-O-P (20:35)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-24', 'tdst-season-1', 24, 'Court 1', '2026-03-01 20:35:00+00',
ARRAY['team-m', 'team-n', 'team-o', 'team-p'], 'CREATED',
ARRAY['team-m', 'team-n', 'team-o', 'team-p']);

-- Game 25: Q-R-S-T (21:10)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-25', 'tdst-season-1', 25, 'Court 1', '2026-03-01 21:10:00+00',
ARRAY['team-q', 'team-r', 'team-s', 'team-t'], 'CREATED',
ARRAY['team-q', 'team-r', 'team-s', 'team-t']);

-- BREAK: 21:45-21:55 (10 mins)

-- SEMI-FINAL 1: G1S1 vs G2S2 vs G3S1 vs G4S2 (21:55)
-- Note: team_ids will be determined after league stage completes
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-26', 'tdst-season-1', 26, 'Court 1', '2026-03-01 21:55:00+00',
ARRAY['team-a', 'team-f', 'team-k', 'team-p'], 'CREATED',
ARRAY['team-a', 'team-f', 'team-k', 'team-p']);

-- SEMI-FINAL 2: G1S2 vs G2S1 vs G3S2 vs G4S1 (22:30)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-27', 'tdst-season-1', 27, 'Court 1', '2026-03-01 22:30:00+00',
ARRAY['team-b', 'team-g', 'team-l', 'team-q'], 'CREATED',
ARRAY['team-b', 'team-g', 'team-l', 'team-q']);

-- FINAL: Semi 1 Top 2 vs Semi 2 Top 2 (23:05)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, team_ids, state, batting_order)
VALUES ('match-28', 'tdst-season-1', 28, 'Court 1', '2026-03-01 23:05:00+00',
ARRAY['team-a', 'team-b', 'team-f', 'team-g'], 'CREATED',
ARRAY['team-a', 'team-b', 'team-f', 'team-g']);

-- CLOSING CEREMONY: 23:40-00:10 (30 mins)

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check team count
SELECT COUNT(*) as total_teams FROM teams WHERE tournament_id = 'tdst-season-1';

-- Check player count
SELECT COUNT(*) as total_players FROM players
WHERE team_id IN (SELECT id FROM teams WHERE tournament_id = 'tdst-season-1');

-- Check match count
SELECT COUNT(*) as total_matches FROM matches WHERE tournament_id = 'tdst-season-1';

-- Verify each team plays 5 games (games 1-25)
SELECT
  t.name,
  COUNT(DISTINCT m.id) as games_played
FROM teams t
CROSS JOIN LATERAL unnest(ARRAY(
  SELECT id FROM matches
  WHERE tournament_id = 'tdst-season-1'
  AND match_number BETWEEN 1 AND 25
  AND t.id = ANY(team_ids)
)) AS m(id)
WHERE t.tournament_id = 'tdst-season-1'
GROUP BY t.id, t.name
ORDER BY t.name;

-- Show match schedule by day
SELECT
  DATE(start_time AT TIME ZONE 'UTC') as match_date,
  COUNT(*) as matches_count,
  STRING_AGG(match_number::text, ', ' ORDER BY match_number) as match_numbers
FROM matches
WHERE tournament_id = 'tdst-season-1'
GROUP BY DATE(start_time AT TIME ZONE 'UTC')
ORDER BY match_date;
