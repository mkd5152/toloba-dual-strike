import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { Client } from 'pg';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Extract project ref from URL
const projectRef = supabaseUrl.replace('https://', '').split('.')[0];

async function runMigration() {
  console.log('🔄 Running bowling rotation migration...\\n');

  const connectionString = `postgresql://postgres:${supabaseServiceKey}@db.${projectRef}.supabase.co:5432/postgres`;

  console.log(`📡 Connecting to: db.${projectRef}.supabase.co:5432\\n`);

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database!\\n');

    console.log('Step 1: Adding bowling_team_id column to overs table...');

    await client.query(`
      ALTER TABLE overs ADD COLUMN IF NOT EXISTS bowling_team_id TEXT;
    `);
    console.log('  ✅ Added bowling_team_id column\\n');

    console.log('Step 2: Adding foreign key constraint...');

    // Drop constraint if it exists first (in case re-running)
    await client.query(`
      ALTER TABLE overs DROP CONSTRAINT IF EXISTS overs_bowling_team_fkey;
    `);

    await client.query(`
      ALTER TABLE overs
      ADD CONSTRAINT overs_bowling_team_fkey
      FOREIGN KEY (bowling_team_id)
      REFERENCES teams(id)
      ON DELETE CASCADE;
    `);
    console.log('  ✅ Added foreign key constraint\\n');

    console.log('Step 3: Removing bowling_team_id from innings table (if exists)...');

    await client.query(`
      ALTER TABLE innings DROP COLUMN IF EXISTS bowling_team_id;
    `);
    console.log('  ✅ Removed bowling_team_id from innings\\n');

    console.log('Step 4: Creating index for faster lookups...');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_overs_bowling_team ON overs(bowling_team_id);
    `);
    console.log('  ✅ Created index\\n');

    // Verify
    console.log('🔍 Verifying schema...');
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'overs' AND column_name = 'bowling_team_id';
    `);

    if (result.rows.length > 0) {
      console.log('\\n✅ Verification successful!');
      console.log(`  Column: ${result.rows[0].column_name}`);
      console.log(`  Type: ${result.rows[0].data_type}\\n`);
    } else {
      throw new Error('Column not found after migration!');
    }

    console.log('✅ Migration completed successfully!\\n');
    console.log('📋 Next steps:');
    console.log('  1. Restart your dev server');
    console.log('  2. Test batting order selection');
    console.log('  3. Verify bowling rotation in match scoring\\n');

  } catch (error: any) {
    console.error('\\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
