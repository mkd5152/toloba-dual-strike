import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('🔄 Applying groups and stages migration...\n');

    // Step 1: Add columns (if they don't exist, this will error but we can ignore)
    console.log('Step 1: Adding columns...');

    // We'll update teams directly with groups since ALTER TABLE via client might not work
    // Group 1: A-E
    console.log('  Assigning Group 1 (A-E)...');
    const { error: g1Error } = await supabase
      .from('teams')
      .update({ group: 1 } as any)
      .in('id', ['team-a', 'team-b', 'team-c', 'team-d', 'team-e']);

    if (g1Error) console.error('  Error:', g1Error.message);
    else console.log('  ✅ Group 1 assigned');

    // Group 2: F-J
    console.log('  Assigning Group 2 (F-J)...');
    const { error: g2Error } = await supabase
      .from('teams')
      .update({ group: 2 } as any)
      .in('id', ['team-f', 'team-g', 'team-h', 'team-i', 'team-j']);

    if (g2Error) console.error('  Error:', g2Error.message);
    else console.log('  ✅ Group 2 assigned');

    // Group 3: K-O
    console.log('  Assigning Group 3 (K-O)...');
    const { error: g3Error } = await supabase
      .from('teams')
      .update({ group: 3 } as any)
      .in('id', ['team-k', 'team-l', 'team-m', 'team-n', 'team-o']);

    if (g3Error) console.error('  Error:', g3Error.message);
    else console.log('  ✅ Group 3 assigned');

    // Group 4: P-T
    console.log('  Assigning Group 4 (P-T)...');
    const { error: g4Error } = await supabase
      .from('teams')
      .update({ group: 4 } as any)
      .in('id', ['team-p', 'team-q', 'team-r', 'team-s', 'team-t']);

    if (g4Error) console.error('  Error:', g4Error.message);
    else console.log('  ✅ Group 4 assigned');

    // Step 2: Update match stages
    console.log('\nStep 2: Updating match stages...');

    console.log('  Setting LEAGUE stage (matches 1-25)...');
    const { error: leagueError } = await supabase
      .from('matches')
      .update({ stage: 'LEAGUE' } as any)
      .gte('match_number', 1)
      .lte('match_number', 25);

    if (leagueError) console.error('  Error:', leagueError.message);
    else console.log('  ✅ LEAGUE stage set');

    console.log('  Setting SEMI stage (matches 26-27)...');
    const { error: semiError } = await supabase
      .from('matches')
      .update({ stage: 'SEMI' } as any)
      .in('match_number', [26, 27]);

    if (semiError) console.error('  Error:', semiError.message);
    else console.log('  ✅ SEMI stage set');

    console.log('  Setting FINAL stage (match 28)...');
    const { error: finalError } = await supabase
      .from('matches')
      .update({ stage: 'FINAL' } as any)
      .eq('match_number', 28);

    if (finalError) console.error('  Error:', finalError.message);
    else console.log('  ✅ FINAL stage set');

    console.log('\n✅ Migration completed!\n');

    // Verify
    console.log('🔍 Verifying...');
    const { data: teams } = await supabase
      .from('teams')
      .select('id, name, group')
      .order('id')
      .limit(5);

    console.log('\nFirst 5 teams:');
    teams?.forEach(t => console.log(`  ${t.id}: ${t.name} - Group ${(t as any).group || 'NULL'}`));

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

applyMigration();
