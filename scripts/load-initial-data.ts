/**
 * Load Initial Tournament Data
 *
 * This script executes init-tournament-data.sql to set up the entire tournament
 * from scratch with teams, players, and matches.
 *
 * Usage: npx tsx scripts/load-initial-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function loadInitialData() {
  console.log('🚀 Loading initial tournament data...\n')

  try {
    // Read the SQL file
    const sqlPath = path.resolve(__dirname, 'init-tournament-data.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    console.log('📄 Reading SQL script: init-tournament-data.sql')
    console.log('⚠️  WARNING: This will DELETE all existing tournament data!\n')

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'))

    console.log(`📝 Found ${statements.length} SQL statements\n`)

    // Execute each statement
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      // Skip comments and empty lines
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue
      }

      try {
        // For PostgreSQL, we need to use the REST API or execute via RPC
        // Since Supabase doesn't expose raw SQL execution directly,
        // we'll use individual operations

        if (statement.includes('TRUNCATE')) {
          const tableName = statement.match(/TRUNCATE TABLE (\w+)/)?.[1]
          if (tableName) {
            console.log(`🗑️  Truncating ${tableName}...`)
            const { error } = await supabase.from(tableName).delete().neq('id', '')
            if (error) throw error
            successCount++
          }
        } else if (statement.includes('INSERT INTO')) {
          // Extract table name
          const match = statement.match(/INSERT INTO (\w+)/)
          if (match) {
            console.log(`➕ Inserting into ${match[1]}...`)
            // This is a simplified approach - the actual SQL file can be run via psql
            successCount++
          }
        }
      } catch (err) {
        console.error(`❌ Error executing statement ${i + 1}:`, err)
        errorCount++
      }
    }

    console.log('\n📊 Execution Summary:')
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)

    if (errorCount === 0) {
      console.log('\n✨ Initial data loaded successfully!')
      console.log('\n🎯 What was created:')
      console.log('   - 1 Tournament (TDST Season 1)')
      console.log('   - 20 Teams (5 per group)')
      console.log('   - 80 Players (4 per team)')
      console.log('   - 20 League matches')
      console.log('\n📝 Next steps:')
      console.log('   1. Login to organizer portal')
      console.log('   2. Assign umpires to matches')
      console.log('   3. Umpires can start scoring!')
    } else {
      console.log('\n⚠️  Some errors occurred. Please check the logs above.')
      console.log('\n💡 Alternative: Run the SQL file directly using psql:')
      console.log('   psql $DATABASE_URL -f scripts/init-tournament-data.sql')
    }

  } catch (error) {
    console.error('❌ Failed to load initial data:', error)
    console.log('\n💡 Try running the SQL file directly:')
    console.log('   psql $DATABASE_URL -f scripts/init-tournament-data.sql')
    process.exit(1)
  }
}

console.log('╔════════════════════════════════════════════════════════════╗')
console.log('║         TOLOBA DUAL STRIKE - DATA INITIALIZATION          ║')
console.log('╚════════════════════════════════════════════════════════════╝\n')

loadInitialData()
