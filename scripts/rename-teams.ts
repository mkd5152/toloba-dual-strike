import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function renameTeams() {
  try {
    console.log('🔄 Renaming teams to Team A, B, C, etc...\n');

    const teamLetters = 'abcdefghijklmnopqrst'.split('');

    for (const letter of teamLetters) {
      const teamId = `team-${letter}`;
      const newName = `Team ${letter.toUpperCase()}`;

      const { error } = await supabase
        .from('teams')
        .update({ name: newName })
        .eq('id', teamId);

      if (error) {
        console.error(`❌ Error updating ${teamId}:`, error);
      } else {
        console.log(`✅ ${teamId} → ${newName}`);
      }
    }

    console.log('\n✅ All teams renamed successfully!\n');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

renameTeams();
