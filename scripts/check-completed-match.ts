import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMatch() {
  console.log('🔍 Checking for matches that should be completed...\n');

  // Check all IN_PROGRESS matches
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, match_number, state, rankings')
    .eq('tournament_id', 'tdst-season-1')
    .eq('state', 'IN_PROGRESS')
    .order('match_number');

  if (error) {
    console.error('Error:', error);
    return;
  }

  const matchCount = matches ? matches.length : 0;
  console.log('Found ' + matchCount + ' IN_PROGRESS matches\n');

  if (!matches) return;

  for (const match of matches) {
    console.log('\n📊 Match ' + match.match_number + ' (' + match.id + '):');
    console.log('State:', match.state);
    console.log('Rankings:', match.rankings ? 'Present' : 'Missing');

    // Check innings count
    const { data: innings, error: inningsError } = await supabase
      .from('innings')
      .select('id, state, total_runs, total_wickets, final_score')
      .eq('match_id', match.id)
      .order('created_at');

    if (inningsError) {
      console.error('Error fetching innings:', inningsError);
      continue;
    }

    const inningsCount = innings ? innings.length : 0;
    console.log('Innings count: ' + inningsCount);
    
    if (innings) {
      innings.forEach((inn: any, idx: number) => {
        console.log('  Innings ' + (idx + 1) + ': ' + inn.state + ', ' + inn.total_runs + ' runs, ' + inn.total_wickets + ' wickets, score: ' + inn.final_score);
      });
    }

    // Check if all 4 innings are complete
    const completedInnings = innings ? innings.filter((i: any) => i.state === 'COMPLETED').length : 0;
    console.log('Completed innings: ' + completedInnings + ' of 4');

    if (completedInnings === 4 && match.state === 'IN_PROGRESS') {
      console.log('⚠️  ISSUE FOUND: All 4 innings completed but match still IN_PROGRESS!');
      console.log('   This match should be marked as COMPLETED');
      console.log('   Match has rankings:', match.rankings ? 'YES' : 'NO');
    }
  }
}

checkMatch();
