-- ================================================================
-- RUN ALL MIGRATIONS IN CORRECT ORDER
-- ================================================================
-- This script runs all necessary migrations to bring your database
-- schema up to date with the latest code.
--
-- Run this BEFORE loading initial data!
-- ================================================================

-- ================================================================
-- MIGRATION 1: Add stage and group columns
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '🔄 Running Migration 1: Adding stage and group columns...';
END $$;

-- Add stage column to matches table
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'LEAGUE' CHECK (stage IN ('LEAGUE', 'SEMI', 'FINAL'));

-- Add group column to teams table
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS "group" INTEGER CHECK ("group" >= 1 AND "group" <= 4);

-- Update existing matches to have LEAGUE stage (if any exist)
UPDATE matches SET stage = 'LEAGUE' WHERE stage IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);
CREATE INDEX IF NOT EXISTS idx_teams_group ON teams("group");

-- Add comments
COMMENT ON COLUMN matches.stage IS 'Tournament stage: LEAGUE, SEMI, or FINAL';
COMMENT ON COLUMN teams."group" IS 'Group number (1-4) for league stage qualification';

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 1 complete: stage and group columns added';
END $$;

-- ================================================================
-- MIGRATION 2: Add bowling_team_id to innings
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '🔄 Running Migration 2: Adding bowling rotation support...';
END $$;

-- Add bowling_team_id column to innings table
ALTER TABLE innings
ADD COLUMN IF NOT EXISTS bowling_team_id TEXT;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'innings_bowling_team_id_fkey'
  ) THEN
    ALTER TABLE innings
    ADD CONSTRAINT innings_bowling_team_id_fkey
    FOREIGN KEY (bowling_team_id) REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for bowling team lookups
CREATE INDEX IF NOT EXISTS idx_innings_bowling_team_id ON innings(bowling_team_id);

-- Add comment
COMMENT ON COLUMN innings.bowling_team_id IS 'The team that bowls during this innings (rotating system)';

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 2 complete: bowling_team_id column added';
END $$;

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
  has_stage BOOLEAN;
  has_group BOOLEAN;
  has_bowling_team_id BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Verifying schema changes...';

  -- Check if columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'stage'
  ) INTO has_stage;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teams' AND column_name = 'group'
  ) INTO has_group;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'innings' AND column_name = 'bowling_team_id'
  ) INTO has_bowling_team_id;

  -- Report results
  IF has_stage THEN
    RAISE NOTICE '  ✅ matches.stage column exists';
  ELSE
    RAISE EXCEPTION '  ❌ matches.stage column missing!';
  END IF;

  IF has_group THEN
    RAISE NOTICE '  ✅ teams.group column exists';
  ELSE
    RAISE EXCEPTION '  ❌ teams.group column missing!';
  END IF;

  IF has_bowling_team_id THEN
    RAISE NOTICE '  ✅ innings.bowling_team_id column exists';
  ELSE
    RAISE EXCEPTION '  ❌ innings.bowling_team_id column missing!';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '✨ All migrations completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '   1. Run: psql $DATABASE_URL -f scripts/init-tournament-data.sql';
  RAISE NOTICE '   2. Login to organizer portal';
  RAISE NOTICE '   3. Start scoring matches!';
  RAISE NOTICE '';
END $$;
