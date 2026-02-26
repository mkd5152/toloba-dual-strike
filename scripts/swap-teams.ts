/**
 * Script to swap teams in Match 5 and Match 7
 * Match 5: Replace Nahda Shooters (team-10) with Team Jade Jaguars (team-19)
 * Match 7: Replace Team Jade Jaguars (team-19) with Nahda Shooters (team-10)
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function swapTeams() {
  console.log('🔄 Starting team swap...\n');

  try {
    // Update Match 5: Replace team-10 with team-19
    console.log('Updating Match 5...');
    const { error: error5 } = await supabase
      .from('matches')
      .update({
        team_ids: ['team-12', 'team-7', 'team-19', 'team-18'],
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'match-05');

    if (error5) {
      console.error('❌ Error updating Match 5:', error5);
      throw error5;
    }
    console.log('✅ Match 5 updated: Nahda Shooters → Team Jade Jaguars\n');

    // Update Match 7: Replace team-19 with team-10
    console.log('Updating Match 7...');
    const { error: error7 } = await supabase
      .from('matches')
      .update({
        team_ids: ['team-18', 'team-15', 'team-17', 'team-10'],
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'match-07');

    if (error7) {
      console.error('❌ Error updating Match 7:', error7);
      throw error7;
    }
    console.log('✅ Match 7 updated: Team Jade Jaguars → Nahda Shooters\n');

    // Verify the changes
    console.log('📋 Verifying changes...');
    const { data: matches, error: fetchError } = await supabase
      .from('matches')
      .select('match_number, court, start_time, team_ids')
      .in('id', ['match-05', 'match-07'])
      .order('match_number');

    if (fetchError) {
      console.error('❌ Error fetching matches:', fetchError);
      throw fetchError;
    }

    if (matches) {
      console.log('\nUpdated matches:');
      for (const match of matches) {
        const teamNames = await getTeamNames(match.team_ids);
        console.log(`\nMatch ${match.match_number} (${match.court}):`);
        console.log(`  Teams: ${teamNames.join(', ')}`);
      }
    }

    console.log('\n✅ All changes completed successfully!');
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

async function getTeamNames(teamIds: string[]): Promise<string[]> {
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .in('id', teamIds);

  if (!teams) return teamIds;

  return teamIds.map(id => {
    const team = teams.find(t => t.id === id);
    return team?.name || id;
  });
}

// Run the script
swapTeams();
