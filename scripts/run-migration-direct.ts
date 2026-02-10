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
  console.log('🔄 Running migration directly via PostgreSQL...\n');

  // Create PostgreSQL client - Use direct connection format
  const connectionString = `postgresql://postgres:${supabaseServiceKey}@db.${projectRef}.supabase.co:5432/postgres`;

  console.log(`📡 Connecting to: db.${projectRef}.supabase.co:5432\n`);

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database!\n');

    // Run migrations
    console.log('Step 1: Adding columns...');

    await client.query(`
      ALTER TABLE teams ADD COLUMN IF NOT EXISTS "group" INTEGER;
    `);
    console.log('  ✅ Added "group" column to teams');

    await client.query(`
      ALTER TABLE matches ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'LEAGUE';
    `);
    console.log('  ✅ Added "stage" column to matches\n');

    console.log('Step 2: Assigning groups to teams...');

    await client.query(`
      UPDATE teams SET "group" = 1 WHERE id IN ('team-a', 'team-b', 'team-c', 'team-d', 'team-e');
    `);
    console.log('  ✅ Group 1 assigned (A-E)');

    await client.query(`
      UPDATE teams SET "group" = 2 WHERE id IN ('team-f', 'team-g', 'team-h', 'team-i', 'team-j');
    `);
    console.log('  ✅ Group 2 assigned (F-J)');

    await client.query(`
      UPDATE teams SET "group" = 3 WHERE id IN ('team-k', 'team-l', 'team-m', 'team-n', 'team-o');
    `);
    console.log('  ✅ Group 3 assigned (K-O)');

    await client.query(`
      UPDATE teams SET "group" = 4 WHERE id IN ('team-p', 'team-q', 'team-r', 'team-s', 'team-t');
    `);
    console.log('  ✅ Group 4 assigned (P-T)\n');

    console.log('Step 3: Assigning stages to matches...');

    await client.query(`
      UPDATE matches SET stage = 'LEAGUE' WHERE match_number BETWEEN 1 AND 25;
    `);
    console.log('  ✅ LEAGUE stage set (matches 1-25)');

    await client.query(`
      UPDATE matches SET stage = 'SEMI' WHERE match_number IN (26, 27);
    `);
    console.log('  ✅ SEMI stage set (matches 26-27)');

    await client.query(`
      UPDATE matches SET stage = 'FINAL' WHERE match_number = 28;
    `);
    console.log('  ✅ FINAL stage set (match 28)\n');

    // Verify
    console.log('🔍 Verifying...');
    const result = await client.query(`
      SELECT id, name, "group" FROM teams ORDER BY id LIMIT 5;
    `);

    console.log('\nFirst 5 teams:');
    result.rows.forEach(row => {
      console.log(`  ${row.id.padEnd(10)} ${row.name.padEnd(15)} Group ${row.group}`);
    });

    const matchResult = await client.query(`
      SELECT match_number, stage FROM matches ORDER BY match_number LIMIT 5;
    `);

    console.log('\nFirst 5 matches:');
    matchResult.rows.forEach(row => {
      console.log(`  Match ${row.match_number.toString().padEnd(3)} Stage: ${row.stage}`);
    });

    console.log('\n✅ Migration completed successfully!\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
