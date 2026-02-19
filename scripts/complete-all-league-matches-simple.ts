/**
 * Complete All 25 League Matches - SIMPLIFIED VERSION
 *
 * This version ONLY updates match rankings without creating innings/overs/balls data.
 * This is sufficient for testing playoff automation.
 *
 * Run with: npx tsx scripts/complete-all-league-matches-simple.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const TOURNAMENT_ID = 'tdst-season-1'

// Match scenarios for variety
const scenarios = [
  { name: 'High Scoring', runRange: [55, 65], wicketRange: [0, 2] },
  { name: 'Low Scoring', runRange: [25, 35], wicketRange: [3, 5] },
  { name: 'Balanced', runRange: [40, 50], wicketRange: [1, 3] },
  { name: 'Six-Fest', runRange: [50, 60], wicketRange: [0, 1] },
  { name: 'Collapse', runRange: [20, 30], wicketRange: [4, 6] },
]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

async function completeMatch(matchNumber: number) {
  try {
    console.log(`\n📍 Processing Match ${matchNumber}...`)

    // Fetch match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', TOURNAMENT_ID)
      .eq('match_number', matchNumber)
      .eq('stage', 'LEAGUE')
      .single()

    if (matchError || !match) {
      console.error(`❌ Match ${matchNumber} not found:`, matchError)
      return
    }

    if (match.state === 'COMPLETED' || match.state === 'LOCKED') {
      console.log(`⏭️  Match ${matchNumber} already completed, skipping`)
      return
    }

    const teamIds = match.team_ids as string[]
    const scenario = randomChoice(scenarios)
    console.log(`   Scenario: ${scenario.name}`)

    // Generate scores for each team
    const teamScores = teamIds.map((teamId) => {
      const runs = randomInt(scenario.runRange[0], scenario.runRange[1])
      const wickets = randomInt(scenario.wicketRange[0], scenario.wicketRange[1])

      // Add bonus runs
      let bonus = 0
      const noPowerplayWicket = wickets === 0 && Math.random() < 0.3
      const noWicketInMatch = wickets === 0

      if (noPowerplayWicket) bonus += 10 // Powerplay bonus
      if (noWicketInMatch) bonus += 15 // No wicket bonus

      return {
        teamId,
        runs,
        wickets,
        bonus,
        totalScore: runs + bonus,
      }
    })

    // Sort by total score to determine rankings
    const sorted = [...teamScores].sort((a, b) => b.totalScore - a.totalScore)

    // Create rankings with points
    const pointsMap = [5, 3, 1, 0] // 1st, 2nd, 3rd, 4th place points
    const rankings = sorted.map((team, index) => ({
      teamId: team.teamId,
      rank: index + 1,
      points: pointsMap[index],
      totalRuns: team.runs,
      totalScore: team.totalScore,
      totalDismissals: team.wickets,
    }))

    console.log(`   Scores:`, rankings.map(r =>
      `${r.totalScore} (R:${r.totalRuns} W:${r.totalDismissals} Pts:${r.points})`
    ).join(' | '))

    // Update match with rankings and mark as completed
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        state: 'COMPLETED',
        rankings: rankings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', match.id)

    if (updateError) {
      console.error(`❌ Failed to update match ${matchNumber}:`, updateError)
      return
    }

    console.log(`✅ Match ${matchNumber} completed successfully`)
  } catch (err) {
    console.error(`❌ Error completing match ${matchNumber}:`, err)
  }
}

async function main() {
  console.log('🏏 Starting to complete all 25 league matches...\n')
  console.log('📊 This will ONLY update match rankings (no innings/overs/balls)')
  console.log('📊 Sufficient for testing playoff automation\n')
  console.log('📊 Scenarios:')
  scenarios.forEach(s => console.log(`   - ${s.name}`))
  console.log('')

  // Complete all 25 matches
  for (let matchNum = 1; matchNum <= 25; matchNum++) {
    await completeMatch(matchNum)
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log('\n✨ All 25 league matches completed!')
  console.log('🎯 Test playoff automation at: http://localhost:3000/organizer/playoffs')
}

main().catch(console.error)
