-- Add reball tracking columns to innings table
-- Reball feature: Allows batting team to use up to 3 reballs in their last over (over 2)
-- When used, the ball is removed but runs are kept as bonus

ALTER TABLE innings
  ADD COLUMN IF NOT EXISTS reballs_used INTEGER DEFAULT 0 CHECK (reballs_used >= 0 AND reballs_used <= 3),
  ADD COLUMN IF NOT EXISTS reball_bonus_runs INTEGER DEFAULT 0 CHECK (reball_bonus_runs >= 0);

COMMENT ON COLUMN innings.reballs_used IS 'Number of reballs used in the last over (max 3)';
COMMENT ON COLUMN innings.reball_bonus_runs IS 'Bonus runs kept from reballed balls';
