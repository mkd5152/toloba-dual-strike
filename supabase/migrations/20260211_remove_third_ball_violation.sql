-- ============================================================================
-- REMOVE THIRD BALL VIOLATION COLUMN
-- ============================================================================
-- This migration removes the old third_ball_violation field from the balls table
-- and replaces it with the new consecutive dot ball rule (handled in application code)
--
-- New Rule: If 3 consecutive balls are dot balls (0 runs), the 3rd ball is a wicket
-- ============================================================================

-- Drop the third_ball_violation column from balls table
ALTER TABLE public.balls DROP COLUMN IF EXISTS third_ball_violation;

-- Verification
SELECT 'Migration completed successfully!' as status;
SELECT 'third_ball_violation column removed from balls table' as note;
SELECT 'New rule: 3 consecutive dot balls = wicket (applied in app)' as new_rule;
