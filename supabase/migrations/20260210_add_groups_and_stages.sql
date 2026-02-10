-- Add group field to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS "group" INTEGER;

-- Add stage field to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'LEAGUE';

-- Update existing teams with their groups based on team IDs
-- Group 1: A-E (teams a, b, c, d, e)
UPDATE teams SET "group" = 1 WHERE id IN ('team-a', 'team-b', 'team-c', 'team-d', 'team-e');

-- Group 2: F-J (teams f, g, h, i, j)
UPDATE teams SET "group" = 2 WHERE id IN ('team-f', 'team-g', 'team-h', 'team-i', 'team-j');

-- Group 3: K-O (teams k, l, m, n, o)
UPDATE teams SET "group" = 3 WHERE id IN ('team-k', 'team-l', 'team-m', 'team-n', 'team-o');

-- Group 4: P-T (teams p, q, r, s, t)
UPDATE teams SET "group" = 4 WHERE id IN ('team-p', 'team-q', 'team-r', 'team-s', 'team-t');

-- Update match stages
-- Matches 1-25 are LEAGUE
UPDATE matches SET stage = 'LEAGUE' WHERE match_number BETWEEN 1 AND 25;

-- Matches 26-27 are SEMI
UPDATE matches SET stage = 'SEMI' WHERE match_number BETWEEN 26 AND 27;

-- Match 28 is FINAL
UPDATE matches SET stage = 'FINAL' WHERE match_number = 28;

-- Add comment to explain groups
COMMENT ON COLUMN teams."group" IS 'Group number (1-4) for tournament qualification';
COMMENT ON COLUMN matches.stage IS 'Tournament stage: LEAGUE, SEMI, or FINAL';
