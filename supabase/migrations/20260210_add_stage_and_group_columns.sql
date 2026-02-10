-- Add stage column to matches table
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'LEAGUE' CHECK (stage IN ('LEAGUE', 'SEMI', 'FINAL'));

-- Add group column to teams table
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS "group" INTEGER CHECK ("group" >= 1 AND "group" <= 4);

-- Update existing matches to have LEAGUE stage (if any exist)
UPDATE matches SET stage = 'LEAGUE' WHERE stage IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);
CREATE INDEX IF NOT EXISTS idx_teams_group ON teams("group");

-- Add comment
COMMENT ON COLUMN matches.stage IS 'Tournament stage: LEAGUE, SEMI, or FINAL';
COMMENT ON COLUMN teams."group" IS 'Group number (1-4) for league stage qualification';
