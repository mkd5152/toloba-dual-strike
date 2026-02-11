-- ============================================================================
-- FIX OVER NUMBERING: Change from 1-3 to 0-2 (cricket convention)
-- ============================================================================
-- Run this migration to update database constraints after changing over numbering

-- Step 1: Drop existing CHECK constraints
ALTER TABLE public.overs DROP CONSTRAINT IF EXISTS overs_over_number_check;
ALTER TABLE public.innings DROP CONSTRAINT IF EXISTS innings_powerplay_over_check;

-- Step 2: Add new CHECK constraints with correct range (0-2)
ALTER TABLE public.overs ADD CONSTRAINT overs_over_number_check
  CHECK (over_number BETWEEN 0 AND 2);

ALTER TABLE public.innings ADD CONSTRAINT innings_powerplay_over_check
  CHECK (powerplay_over IN (0, 1, 2));

-- Step 3: Update any existing data (if needed)
-- This will shift existing overs from 1,2,3 to 0,1,2
UPDATE public.overs SET over_number = over_number - 1
  WHERE over_number > 0;

UPDATE public.innings SET powerplay_over = powerplay_over - 1
  WHERE powerplay_over IS NOT NULL AND powerplay_over > 0;

-- Verification
SELECT 'Migration completed successfully!' as status;
SELECT 'Overs now numbered 0-2' as note;
SELECT 'Powerplay can be over 0, 1, or 2' as note;
