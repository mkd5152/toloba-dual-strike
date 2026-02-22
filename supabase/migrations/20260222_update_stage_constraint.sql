-- Update stage column constraint to support new playoff structure
-- New structure: LEAGUE (25) → QF (2) → SEMI (2) → FINAL (1)

-- Drop old constraint
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_stage_check;

-- Add new constraint with QF support
ALTER TABLE matches
ADD CONSTRAINT matches_stage_check
CHECK (stage IN ('LEAGUE', 'QF', 'SEMI', 'FINAL'));

-- Update comment
COMMENT ON COLUMN matches.stage IS 'Tournament stage: LEAGUE (1-25), QF (26-27), SEMI (28-29), or FINAL (30)';
