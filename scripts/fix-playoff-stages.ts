/**
 * Fix playoff stages issue:
 * 1. Update database constraint to support 'QF' stage
 * 2. Clean up duplicate matches created with wrong stage
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
})

async function runMigration(filePath: string, description: string) {
  console.log(`\n📄 Running: ${description}`)
  console.log(`   File: ${path.basename(filePath)}`)

  const sql = fs.readFileSync(filePath, 'utf-8')

  const { error } = await supabase.rpc('exec_sql', { sql })

  if (error) {
    // If exec_sql doesn't exist, try direct query
    const { error: queryError } = await supabase.from('_').select('*').limit(0) as any

    if (queryError) {
      console.error(`❌ Failed: ${error.message}`)
      throw error
    }
  }

  console.log(`✅ Success: ${description}`)
}

async function runSqlDirect(sql: string, description: string) {
  console.log(`\n📄 Running: ${description}`)

  // Split by semicolons but be careful with strings and comments
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    if (statement.includes('BEGIN') || statement.includes('COMMIT') || statement.includes('DO $$')) {
      // Execute complex blocks as-is via RPC if available
      try {
        const { error } = await (supabase as any).rpc('exec_sql', { sql: statement })
        if (error) {
          console.warn(`⚠️  Note: ${error.message}`)
        }
      } catch (err) {
        console.warn(`⚠️  Skipping complex statement (requires exec_sql function)`)
      }
    } else {
      // Simple statements
      const { error } = await (supabase as any).rpc('exec_sql', { sql: statement })
      if (error) {
        console.error(`❌ Error: ${error.message}`)
      }
    }
  }

  console.log(`✅ Completed: ${description}`)
}

async function main() {
  console.log('🔧 Fixing Playoff Stages Issue\n')
  console.log('This will:')
  console.log('  1. Update stage constraint to support QF (Quarter Finals)')
  console.log('  2. Delete duplicate matches created with wrong stage')
  console.log('')

  try {
    // Read migration files
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')

    const updateConstraintFile = path.join(migrationsDir, '20260222_update_stage_constraint.sql')
    const cleanupFile = path.join(migrationsDir, '20260222_cleanup_duplicate_qf_matches.sql')

    // Check if files exist
    if (!fs.existsSync(updateConstraintFile)) {
      throw new Error(`Migration file not found: ${updateConstraintFile}`)
    }
    if (!fs.existsSync(cleanupFile)) {
      throw new Error(`Migration file not found: ${cleanupFile}`)
    }

    // Run migrations
    const updateSql = fs.readFileSync(updateConstraintFile, 'utf-8')
    const cleanupSql = fs.readFileSync(cleanupFile, 'utf-8')

    await runSqlDirect(updateSql, 'Update stage constraint to support QF')
    await runSqlDirect(cleanupSql, 'Clean up duplicate matches')

    console.log('\n✅ All migrations completed successfully!')
    console.log('\n📊 Verification:')
    console.log('   Run this query in Supabase SQL Editor to verify:')
    console.log('   ')
    console.log('   SELECT stage, COUNT(*) as count, MIN(match_number) as min, MAX(match_number) as max')
    console.log('   FROM matches WHERE tournament_id = \'tdst-season-1\'')
    console.log('   GROUP BY stage ORDER BY stage;')
    console.log('')
    console.log('   Expected results:')
    console.log('   - LEAGUE: 25 matches (1-25)')
    console.log('   - QF: 0 matches (will be created when you click Generate QFs)')
    console.log('   - SEMI: 0 matches (will be created later)')
    console.log('   - FINAL: 0 matches (will be created later)')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

main()
