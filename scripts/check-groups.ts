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

(async () => {
  console.log('🔍 Checking teams groups...\n');
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, group')
    .eq('tournament_id', 'tdst-season-1')
    .order('id');

  console.log('Teams with groups:');
  teams?.forEach(t => {
    const groupStr = t.group ? `Group ${t.group}` : 'NULL ❌';
    console.log(`  ${t.id.padEnd(10)} ${t.name.padEnd(20)} ${groupStr}`);
  });

  const hasNoGroup = teams?.filter(t => !t.group).length || 0;
  console.log(`\n⚠️  Teams without group: ${hasNoGroup}`);

  if (hasNoGroup > 0) {
    console.log('\n🔧 Run migration again to fix groups');
  }
})();
