import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearMatchBattingOrder() {
  try {
    console.log('🔄 Clearing batting order for match-1...\n');

    // Clear batting order and reset state
    const { error } = await supabase
      .from('matches')
      .update({
        batting_order: [],
        state: 'CREATED'
      })
      .eq('id', 'match-1');

    if (error) throw error;

    console.log('✅ Batting order cleared successfully!\n');
    console.log('Now you can:');
    console.log('1. Refresh the scoring page');
    console.log('2. The batting order selector will appear');
    console.log('3. Set the batting order again\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearMatchBattingOrder();
