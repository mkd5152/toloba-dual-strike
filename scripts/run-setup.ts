/**
 * Run the tournament setup SQL script
 * Usage: npx tsx scripts/run-setup.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runSetup() {
  try {
    console.log('📖 Reading SQL script...')
    const sqlPath = join(__dirname, 'setup-tournament.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    console.log('🚀 Executing SQL script...')

    // Split by semicolons but be careful with array literals
    const statements = sql
      .split(/;\s*\n/)
      .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))

    console.log(`   Found ${statements.length} SQL statements`)

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim()
      if (!stmt) continue

      process.stdout.write(`   Executing statement ${i + 1}/${statements.length}...\r`)

      const { error } = await supabase.rpc('exec_sql', { sql: stmt })

      if (error) {
        console.error(`\n❌ Error executing statement ${i + 1}:`)
        console.error(stmt.substring(0, 200) + '...')
        console.error(error)
        process.exit(1)
      }
    }

    console.log('\n✅ Tournament setup complete!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Failed to run setup:', err)
    process.exit(1)
  }
}

runSetup()
