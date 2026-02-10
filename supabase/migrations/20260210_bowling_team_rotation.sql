-- Migration: Add bowling team rotation support
-- Each over has its own bowling team (3 different teams bowl during an innings)

-- Add bowling_team_id to overs table
ALTER TABLE overs ADD COLUMN IF NOT EXISTS bowling_team_id TEXT;

-- Add foreign key constraint
ALTER TABLE overs
ADD CONSTRAINT overs_bowling_team_fkey
FOREIGN KEY (bowling_team_id)
REFERENCES teams(id)
ON DELETE CASCADE;

-- Remove bowling_team_id from innings (no longer needed, each over has its own)
ALTER TABLE innings DROP COLUMN IF EXISTS bowling_team_id;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_overs_bowling_team ON overs(bowling_team_id);
