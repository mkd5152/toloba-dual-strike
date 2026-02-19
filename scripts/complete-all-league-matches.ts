/**
 * Complete All 25 League Matches with Realistic Data
 *
 * This script generates interesting match scenarios including:
 * - High scoring matches
 * - Low scoring matches
 * - Close finishes
 * - Dominant performances
 * - Varied boundary counts (4s and 6s)
 * - Different wicket scenarios
 * - Realistic ball-by-ball data
 *
 * Run with: npx tsx scripts/complete-all-league-matches.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use service role key to bypass RLS for admin operations
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  WARNING: SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  console.warn('⚠️  Add it to .env.local to bypass RLS policies')
  console.warn('⚠️  Get it from: Supabase Dashboard → Settings → API → service_role key')
  console.warn('')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Tournament ID (update if different)
const TOURNAMENT_ID = 'tdst-season-1'

// Match scenarios for variety
const scenarios = [
  { name: 'High Scoring Thriller', runRange: [55, 65], wicketRange: [0, 2], boundaryPct: 0.4 },
  { name: 'Low Scoring Grind', runRange: [25, 35], wicketRange: [3, 5], boundaryPct: 0.2 },
  { name: 'Balanced Match', runRange: [40, 50], wicketRange: [1, 3], boundaryPct: 0.3 },
  { name: 'Six-Fest', runRange: [50, 60], wicketRange: [0, 1], boundaryPct: 0.5 },
  { name: 'Collapse', runRange: [20, 30], wicketRange: [4, 6], boundaryPct: 0.15 },
]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

function generateBallData(targetRuns: number, targetWickets: number, boundaryPct: number) {
  const balls = []
  let totalRuns = 0
  let wickets = 0
  let ballsPlayed = 0
  const maxBalls = 24 // 4 overs × 6 balls

  // Generate balls until we hit target runs or max balls
  while (ballsPlayed < maxBalls && totalRuns < targetRuns) {
    let runs = 0
    let isWicket = false
    let isNoball = false
    let isWide = false

    // Determine if this ball should be a boundary
    const isBoundary = Math.random() < boundaryPct

    if (isBoundary) {
      // 60% chance of 4, 40% chance of 6 among boundaries
      runs = Math.random() < 0.6 ? 4 : 6
    } else {
      // Regular runs: 0, 1, 2, 3 (weighted towards singles)
      const runDist = [0, 0, 0, 1, 1, 1, 1, 2, 2, 3]
      runs = randomChoice(runDist)
    }

    // Small chance of wicket (if we haven't hit target wickets)
    if (wickets < targetWickets && Math.random() < 0.08 && !isBoundary) {
      isWicket = true
      wickets++
      runs = 0 // Wicket ball typically scores 0
    }

    // Very small chance of extras
    if (Math.random() < 0.05 && !isWicket && !isBoundary) {
      if (Math.random() < 0.5) {
        isNoball = true
        runs += 1 // Noball adds 1 run
      } else {
        isWide = true
        runs = 1 // Wide is 1 run
      }
    }

    totalRuns += runs

    // Don't count noball/wide as a ball in the over
    if (!isNoball && !isWide) {
      ballsPlayed++
    }

    balls.push({
      ballNumber: isNoball || isWide ? ballsPlayed : ballsPlayed,
      runs,
      isWicket,
      isNoball,
      isWide,
      wicketType: isWicket ? randomChoice(['BOWLED', 'CATCH_OUT', 'RUN_OUT', 'LBW', 'STUMPED']) : null,
    })

    // Stop if we've exceeded target runs
    if (totalRuns >= targetRuns) break
  }

  return { balls, totalRuns, totalWickets: wickets, ballsPlayed }
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

    // Pick a random scenario for variety
    const scenario = randomChoice(scenarios)
    console.log(`   Scenario: ${scenario.name}`)

    // Generate scores for each team
    const teamScores = teamIds.map((teamId, index) => {
      const runs = randomInt(scenario.runRange[0], scenario.runRange[1])
      const wickets = randomInt(scenario.wicketRange[0], scenario.wicketRange[1])

      // Add bonus runs (powerplay, no-wicket)
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

    console.log(`   Scores:`, rankings.map(r => `${r.totalScore} (${r.totalRuns}+${r.totalScore - r.totalRuns})`).join(' | '))

    // Update match with rankings
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

    // Create innings data for each team
    for (let i = 0; i < teamIds.length; i++) {
      const teamId = teamIds[i]
      const teamScore = teamScores.find(t => t.teamId === teamId)!

      // Check if innings already exists
      const { data: existingInnings } = await supabase
        .from('innings')
        .select('id')
        .eq('match_id', match.id)
        .eq('team_id', teamId)
        .single()

      let inningsId: string

      if (existingInnings) {
        inningsId = existingInnings.id

        // Update existing innings
        await supabase
          .from('innings')
          .update({
            total_runs: teamScore.runs,
            total_wickets: teamScore.wickets,
            final_score: teamScore.totalScore,
            no_wicket_bonus: teamScore.wickets === 0,
            state: 'COMPLETED',
          })
          .eq('id', inningsId)
      } else {
        // Create new innings
        const { data: newInnings, error: inningsError } = await supabase
          .from('innings')
          .insert({
            id: `${match.id}-innings-${i + 1}`,
            match_id: match.id,
            team_id: teamId,
            bowling_team_id: teamIds[(i + 1) % teamIds.length],
            batting_pair: [`player-1-${teamId}`, `player-2-${teamId}`],
            total_runs: teamScore.runs,
            total_wickets: teamScore.wickets,
            final_score: teamScore.totalScore,
            no_wicket_bonus: teamScore.wickets === 0,
            powerplay_over: 2,
            state: 'COMPLETED',
          })
          .select()
          .single()

        if (inningsError) {
          console.error(`❌ Failed to create innings for team ${teamId}:`, inningsError)
          continue
        }

        inningsId = newInnings!.id
      }

      // Generate ball-by-ball data
      const ballData = generateBallData(teamScore.runs, teamScore.wickets, scenario.boundaryPct)

      // Create overs with balls
      const numOvers = 4
      let ballIndex = 0

      for (let overNum = 1; overNum <= numOvers; overNum++) {
        // Check if over exists
        const { data: existingOver } = await supabase
          .from('overs')
          .select('id')
          .eq('innings_id', inningsId)
          .eq('over_number', overNum)
          .single()

        let overId: string

        if (existingOver) {
          overId = existingOver.id
        } else {
          const { data: newOver, error: overError } = await supabase
            .from('overs')
            .insert({
              id: `${inningsId}-over-${overNum}`,
              innings_id: inningsId,
              over_number: overNum,
              bowling_team_id: teamIds[(i + 1) % teamIds.length],
              bowler_id: `bowler-${overNum}`,
              keeper_id: `keeper-1`,
              is_powerplay: overNum <= 2,
            })
            .select()
            .single()

          if (overError) {
            console.error(`❌ Failed to create over ${overNum}:`, overError)
            continue
          }

          overId = newOver!.id
        }

        // Add balls to this over (max 6 legal balls)
        let legalBalls = 0
        while (legalBalls < 6 && ballIndex < ballData.balls.length) {
          const ball = ballData.balls[ballIndex]

          // Check if ball exists
          const { data: existingBall } = await supabase
            .from('balls')
            .select('id')
            .eq('over_id', overId)
            .eq('ball_number', legalBalls + 1)
            .single()

          if (!existingBall) {
            await supabase.from('balls').insert({
              id: `${overId}-ball-${legalBalls + 1}`,
              over_id: overId,
              ball_number: legalBalls + 1,
              runs: ball.runs,
              is_wicket: ball.isWicket,
              wicket_type: ball.wicketType,
              is_noball: ball.isNoball,
              is_wide: ball.isWide,
              is_free_hit: false,
              misconduct: false,
              effective_runs: ball.runs,
              fielding_team_id: teamIds[(i + 1) % teamIds.length],
              timestamp: new Date().toISOString(),
            })
          }

          if (!ball.isNoball && !ball.isWide) {
            legalBalls++
          }
          ballIndex++
        }
      }
    }

    console.log(`✅ Match ${matchNumber} completed successfully`)
  } catch (err) {
    console.error(`❌ Error completing match ${matchNumber}:`, err)
  }
}

async function main() {
  console.log('🏏 Starting to complete all 25 league matches...\n')
  console.log('📊 Scenarios include:')
  scenarios.forEach(s => console.log(`   - ${s.name}`))
  console.log('')

  // Complete all 25 matches
  for (let matchNum = 1; matchNum <= 25; matchNum++) {
    await completeMatch(matchNum)

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n✨ All league matches completed!')
  console.log('🎯 You can now test the playoff automation at /organizer/playoffs')
}

main().catch(console.error)
