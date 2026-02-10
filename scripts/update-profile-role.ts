import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateProfileRole() {
  const email = process.argv[2];
  const newRole = process.argv[3] as 'organizer' | 'umpire' | 'spectator';

  if (!email || !newRole) {
    console.error('❌ Usage: npx tsx scripts/update-profile-role.ts <email> <role>');
    console.error('Example: npx tsx scripts/update-profile-role.ts user@example.com organizer');
    console.error('Roles: organizer, umpire, spectator');
    process.exit(1);
  }

  if (!['organizer', 'umpire', 'spectator'].includes(newRole)) {
    console.error('❌ Invalid role. Must be: organizer, umpire, or spectator');
    process.exit(1);
  }

  try {
    console.log(`\n🔄 Updating profile role for ${email} to ${newRole}...`);

    // Find profile by email
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !profile) {
      console.error('❌ Profile not found for email:', email);
      process.exit(1);
    }

    console.log(`✅ Found profile: ${profile.full_name || profile.email}`);
    console.log(`   Current role: ${profile.role}`);

    // Update role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profile.id);

    if (updateError) throw updateError;

    console.log(`✅ Successfully updated role to: ${newRole}`);
    console.log(`\n✨ You can now login and access the ${newRole} dashboard!\n`);

  } catch (error) {
    console.error('\n❌ Error updating profile:', error);
    process.exit(1);
  }
}

updateProfileRole();
