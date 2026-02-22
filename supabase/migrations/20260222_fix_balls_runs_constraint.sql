-- Fix balls runs constraint to allow 5 runs
-- In cricket, 5 runs can be scored through overthrows, all-run fives, etc.

-- Drop the old constraint
ALTER TABLE balls DROP CONSTRAINT IF EXISTS balls_runs_check;

-- Add new constraint that includes 5 runs
ALTER TABLE balls
ADD CONSTRAINT balls_runs_check
CHECK (runs IN (0, 1, 2, 3, 4, 5, 6));

-- Verify the constraint
COMMENT ON CONSTRAINT balls_runs_check ON balls IS 'Allows runs: 0, 1, 2, 3, 4, 5, 6 (includes 5 for overthrows/all-run fives)';
