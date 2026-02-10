-- Quick fix: Add missing bowling_team_id column to innings table
-- This fixes the error: "Could not find the 'bowling_team_id' column"

-- Add the column
ALTER TABLE innings
ADD COLUMN IF NOT EXISTS bowling_team_id TEXT;

-- Add foreign key constraint
ALTER TABLE innings
DROP CONSTRAINT IF EXISTS innings_bowling_team_id_fkey;

ALTER TABLE innings
ADD CONSTRAINT innings_bowling_team_id_fkey
FOREIGN KEY (bowling_team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_innings_bowling_team_id ON innings(bowling_team_id);

-- Verify
SELECT 'bowling_team_id column added successfully!' as status;
