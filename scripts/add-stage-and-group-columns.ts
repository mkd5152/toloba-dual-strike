/**
 * Add stage and group columns to database
 *
 * Run this script to add the missing stage column to matches table
 * and group column to teams table.
 *
 * Usage: npx tsx scripts/add-stage-and-group-columns.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addColumns() {
  console.log('🚀 Adding stage and group columns...\n')

  try {
    // Add stage column to matches
    console.log('1️⃣ Adding stage column to matches table...')
    const { error: stageError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE matches
        ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'LEAGUE' CHECK (stage IN ('LEAGUE', 'SEMI', 'FINAL'));

        UPDATE matches SET stage = 'LEAGUE' WHERE stage IS NULL;

        CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);

        COMMENT ON COLUMN matches.stage IS 'Tournament stage: LEAGUE, SEMI, or FINAL';
      `
    })

    if (stageError) {
      console.error('❌ Error adding stage column:', stageError)
    } else {
      console.log('✅ Stage column added successfully')
    }

    // Add group column to teams
    console.log('\n2️⃣ Adding group column to teams table...')
    const { error: groupError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE teams
        ADD COLUMN IF NOT EXISTS "group" INTEGER CHECK ("group" >= 1 AND "group" <= 4);

        CREATE INDEX IF NOT EXISTS idx_teams_group ON teams("group");

        COMMENT ON COLUMN teams."group" IS 'Group number (1-4) for league stage qualification';
      `
    })

    if (groupError) {
      console.error('❌ Error adding group column:', groupError)
    } else {
      console.log('✅ Group column added successfully')
    }

    console.log('\n✨ Migration complete!')
    console.log('\n📝 Next steps:')
    console.log('   - Assign groups to teams (1-4) in the organizer portal')
    console.log('   - All matches will default to LEAGUE stage')
    console.log('   - Create SEMI and FINAL stage matches as needed')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

addColumns()
