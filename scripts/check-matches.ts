import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMatches() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', 'tdst-season-1')
    .order('match_number', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📊 All Matches in Database:\n');
  console.log('Total matches:', matches?.length || 0);
  console.log('\nMatch Details:');
  matches?.forEach((match: any) => {
    console.log(`Match ${match.match_number}: ${match.state} - ${match.court}`);
  });

  // Group by state
  const byState = matches?.reduce((acc: any, match: any) => {
    acc[match.state] = (acc[match.state] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📈 Matches by State:');
  console.log(byState);
}

checkMatches();
