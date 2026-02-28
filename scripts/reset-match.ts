/**
 * Reset Match Script
 *
 * Completely resets a match by:
 * - Deleting all balls, overs, and innings
 * - Resetting match state to CREATED
 * - Clearing batting order and rankings
 *
 * Usage: npx tsx scripts/reset-match.ts <match-number>
 * Example: npx tsx scripts/reset-match.ts 11
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetMatch(matchNumber: number) {
  console.log(`🔍 Fetching Match ${matchNumber}...`);

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('match_number', matchNumber)
    .single();

  if (matchError || !match) {
    console.error(`❌ Error fetching match: ${matchError?.message || 'Match not found'}`);
    process.exit(1);
  }

  console.log(`✅ Found Match ${match.match_number} (Current state: ${match.state})`);
  console.log(`   Teams: ${match.team_ids?.join(', ') || 'N/A'}`);

  // Get all innings IDs
  const { data: innings, error: inningsError } = await supabase
    .from('innings')
    .select('id')
    .eq('match_id', match.id);

  if (inningsError) {
    console.error('❌ Error fetching innings:', inningsError.message);
    process.exit(1);
  }

  console.log(`\n📊 Found ${innings?.length || 0} innings to delete`);

  // For each innings, delete overs and balls first (foreign key constraints)
  if (innings && innings.length > 0) {
    for (const inning of innings) {
      // Get all overs for this innings
      const { data: overs } = await supabase
        .from('overs')
        .select('id')
        .eq('innings_id', inning.id);

      if (overs && overs.length > 0) {
        const overIds = overs.map(o => o.id);

        // Delete all balls
        const { error: ballsError, count: ballsCount } = await supabase
          .from('balls')
          .delete()
          .in('over_id', overIds);

        if (ballsError) {
          console.error(`❌ Error deleting balls:`, ballsError.message);
        } else {
          console.log(`  ✅ Deleted ${ballsCount || 0} balls for innings ${inning.id}`);
        }

        // Delete all overs
        const { error: oversError, count: oversCount } = await supabase
          .from('overs')
          .delete()
          .eq('innings_id', inning.id);

        if (oversError) {
          console.error(`❌ Error deleting overs:`, oversError.message);
        } else {
          console.log(`  ✅ Deleted ${oversCount || 0} overs for innings ${inning.id}`);
        }
      }
    }

    // Now delete all innings
    const { error: deleteInningsError, count: inningsCount } = await supabase
      .from('innings')
      .delete()
      .eq('match_id', match.id);

    if (deleteInningsError) {
      console.error('❌ Error deleting innings:', deleteInningsError.message);
      process.exit(1);
    }

    console.log(`✅ Deleted ${inningsCount || 0} innings`);
  }

  // Reset match to CREATED state with no batting order
  console.log('\n🔄 Resetting match to CREATED state...');
  const { error: updateError } = await supabase
    .from('matches')
    .update({
      state: 'CREATED',
      batting_order: null,
      rankings: [],
    })
    .eq('id', match.id);

  if (updateError) {
    console.error('❌ Error updating match:', updateError.message);
    process.exit(1);
  }

  console.log('✅ Match state set to CREATED');
  console.log('✅ Batting order cleared');
  console.log('✅ Rankings cleared');

  console.log(`\n🎉 Match ${matchNumber} fully reset!`);
  console.log('You can now select the batting order and start scoring from scratch.');
}

// Get match number from command line arguments
const matchNumber = parseInt(process.argv[2], 10);

if (!matchNumber || isNaN(matchNumber)) {
  console.error('❌ Usage: npx tsx scripts/reset-match.ts <match-number>');
  console.error('   Example: npx tsx scripts/reset-match.ts 11');
  process.exit(1);
}

resetMatch(matchNumber).catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
