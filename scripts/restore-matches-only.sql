-- ================================================================
-- RESTORE 20 LEAGUE MATCHES ONLY
-- ================================================================
-- This restores the 20 league matches without affecting teams/players
-- Run this if you accidentally deleted matches but want them back
-- ================================================================

-- GROUP 1 MATCHES (5 matches)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-g1-01', 'tdst-season-1', 1, 'Court A', '2024-12-01 09:00:00', NULL, NULL, ARRAY['team-g1-01', 'team-g1-02', 'team-g1-03', 'team-g1-04'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g1-02', 'tdst-season-1', 2, 'Court B', '2024-12-01 10:00:00', NULL, NULL, ARRAY['team-g1-01', 'team-g1-02', 'team-g1-03', 'team-g1-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g1-03', 'tdst-season-1', 3, 'Court C', '2024-12-01 11:00:00', NULL, NULL, ARRAY['team-g1-01', 'team-g1-02', 'team-g1-04', 'team-g1-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g1-04', 'tdst-season-1', 4, 'Court A', '2024-12-01 12:00:00', NULL, NULL, ARRAY['team-g1-01', 'team-g1-03', 'team-g1-04', 'team-g1-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g1-05', 'tdst-season-1', 5, 'Court B', '2024-12-01 13:00:00', NULL, NULL, ARRAY['team-g1-02', 'team-g1-03', 'team-g1-04', 'team-g1-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- GROUP 2 MATCHES (5 matches)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-g2-01', 'tdst-season-1', 6, 'Court C', '2024-12-02 09:00:00', NULL, NULL, ARRAY['team-g2-01', 'team-g2-02', 'team-g2-03', 'team-g2-04'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g2-02', 'tdst-season-1', 7, 'Court A', '2024-12-02 10:00:00', NULL, NULL, ARRAY['team-g2-01', 'team-g2-02', 'team-g2-03', 'team-g2-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g2-03', 'tdst-season-1', 8, 'Court B', '2024-12-02 11:00:00', NULL, NULL, ARRAY['team-g2-01', 'team-g2-02', 'team-g2-04', 'team-g2-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g2-04', 'tdst-season-1', 9, 'Court C', '2024-12-02 12:00:00', NULL, NULL, ARRAY['team-g2-01', 'team-g2-03', 'team-g2-04', 'team-g2-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g2-05', 'tdst-season-1', 10, 'Court A', '2024-12-02 13:00:00', NULL, NULL, ARRAY['team-g2-02', 'team-g2-03', 'team-g2-04', 'team-g2-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- GROUP 3 MATCHES (5 matches)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-g3-01', 'tdst-season-1', 11, 'Court B', '2024-12-03 09:00:00', NULL, NULL, ARRAY['team-g3-01', 'team-g3-02', 'team-g3-03', 'team-g3-04'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g3-02', 'tdst-season-1', 12, 'Court C', '2024-12-03 10:00:00', NULL, NULL, ARRAY['team-g3-01', 'team-g3-02', 'team-g3-03', 'team-g3-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g3-03', 'tdst-season-1', 13, 'Court A', '2024-12-03 11:00:00', NULL, NULL, ARRAY['team-g3-01', 'team-g3-02', 'team-g3-04', 'team-g3-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g3-04', 'tdst-season-1', 14, 'Court B', '2024-12-03 12:00:00', NULL, NULL, ARRAY['team-g3-01', 'team-g3-03', 'team-g3-04', 'team-g3-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g3-05', 'tdst-season-1', 15, 'Court C', '2024-12-03 13:00:00', NULL, NULL, ARRAY['team-g3-02', 'team-g3-03', 'team-g3-04', 'team-g3-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- GROUP 4 MATCHES (5 matches)
INSERT INTO matches (id, tournament_id, match_number, court, start_time, umpire_id, umpire_name, team_ids, state, stage, batting_order, rankings, locked_at, created_at, updated_at) VALUES
  ('match-g4-01', 'tdst-season-1', 16, 'Court A', '2024-12-04 09:00:00', NULL, NULL, ARRAY['team-g4-01', 'team-g4-02', 'team-g4-03', 'team-g4-04'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g4-02', 'tdst-season-1', 17, 'Court B', '2024-12-04 10:00:00', NULL, NULL, ARRAY['team-g4-01', 'team-g4-02', 'team-g4-03', 'team-g4-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g4-03', 'tdst-season-1', 18, 'Court C', '2024-12-04 11:00:00', NULL, NULL, ARRAY['team-g4-01', 'team-g4-02', 'team-g4-04', 'team-g4-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g4-04', 'tdst-season-1', 19, 'Court A', '2024-12-04 12:00:00', NULL, NULL, ARRAY['team-g4-01', 'team-g4-03', 'team-g4-04', 'team-g4-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW()),
  ('match-g4-05', 'tdst-season-1', 20, 'Court B', '2024-12-04 13:00:00', NULL, NULL, ARRAY['team-g4-02', 'team-g4-03', 'team-g4-04', 'team-g4-05'], 'CREATED', 'LEAGUE', '{}', '[]', NULL, NOW(), NOW());

-- Verification
SELECT COUNT(*) as total_matches FROM matches WHERE tournament_id = 'tdst-season-1';
SELECT '✅ 20 league matches restored!' as status;
