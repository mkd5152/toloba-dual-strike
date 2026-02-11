-- ============================================================================
-- ADD FIELDING TEAM ID TO BALLS TABLE
-- ============================================================================
-- This migration adds fielding_team_id column to track which team gets credit
-- for CATCH_OUT and RUN_OUT wickets (they receive +5 runs bonus)
-- ============================================================================

-- Add fielding_team_id column (nullable, only set for CATCH_OUT/RUN_OUT)
ALTER TABLE public.balls
ADD COLUMN IF NOT EXISTS fielding_team_id TEXT;

-- Add foreign key constraint
ALTER TABLE public.balls
ADD CONSTRAINT balls_fielding_team_fkey
FOREIGN KEY (fielding_team_id)
REFERENCES public.teams(id)
ON DELETE SET NULL;

-- Update wicket_type check constraint to include new wicket types
ALTER TABLE public.balls
DROP CONSTRAINT IF EXISTS balls_wicket_type_check;

ALTER TABLE public.balls
ADD CONSTRAINT balls_wicket_type_check
CHECK (wicket_type IN ('NORMAL', 'BOWLING_TEAM', 'CATCH_OUT', 'RUN_OUT'));

-- Verification
SELECT 'Migration completed successfully!' as status;
SELECT 'Added fielding_team_id column to balls table' as note;
SELECT 'Updated wicket_type constraint: NORMAL, BOWLING_TEAM, CATCH_OUT, RUN_OUT' as wicket_types;
