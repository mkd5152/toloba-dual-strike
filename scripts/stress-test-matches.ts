/**
 * Stress Test Script - Parallel Match Scoring
 *
 * Tests complex scenarios:
 * - Wickets (all types: bowling team, catch out, run out)
 * - Extras (wides, no balls)
 * - Reballs
 * - Boundaries (4s and 6s)
 * - Powerplay overs
 * - Parallel match scoring
 * - Real-time updates
 *
 * Usage: npx tsx scripts/stress-test-matches.ts 16 17
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Utility to wait between actions
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Random selection helper
const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface BallScenario {
  runs: number;
  isWide?: boolean;
  isNoball?: boolean;
  isWicket?: boolean;
  wicketType?: string;
  fieldingTeamId?: string;
  description: string;
}

// Complex ball scenarios to test
const getComplexScenarios = (bowlingTeamId: string, fieldingTeamIds: string[]): BallScenario[] => [
  // Normal runs
  { runs: 0, description: 'Dot ball' },
  { runs: 1, description: 'Single' },
  { runs: 2, description: 'Two runs' },
  { runs: 3, description: 'Three runs' },

  // Boundaries
  { runs: 4, description: '4️⃣ FOUR!' },
  { runs: 6, description: '6️⃣ SIX!' },

  // Extras
  { runs: 1, isWide: true, description: 'Wide' },
  { runs: 2, isWide: true, description: 'Wide + run' },
  { runs: 1, isNoball: true, description: 'No ball' },
  { runs: 4, isNoball: true, description: 'No ball + FOUR' },
  { runs: 6, isNoball: true, description: 'No ball + SIX' },

  // Wickets - Bowling Team
  { runs: 0, isWicket: true, wicketType: 'BOWLING_TEAM', description: '🏏 WICKET (Bowling Team)' },

  // Wickets - Catch Out (fielding teams)
  { runs: 0, isWicket: true, wicketType: 'CATCH_OUT', fieldingTeamId: fieldingTeamIds[0], description: '🧤 WICKET (Catch Out)' },
  { runs: 1, isWicket: true, wicketType: 'CATCH_OUT', fieldingTeamId: fieldingTeamIds[1], description: '🧤 WICKET (Catch Out + run)' },

  // Wickets - Run Out (fielding teams)
  { runs: 1, isWicket: true, wicketType: 'RUN_OUT', fieldingTeamId: fieldingTeamIds[0], description: '🏃 WICKET (Run Out)' },
  { runs: 2, isWicket: true, wicketType: 'RUN_OUT', fieldingTeamId: fieldingTeamIds[1], description: '🏃 WICKET (Run Out + 2 runs)' },
];

async function scoreMatch(matchNumber: number, delayMs: number = 500) {
  console.log(`\n🎯 Starting stress test for Match ${matchNumber}...`);

  // Fetch match
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('match_number', matchNumber)
    .single();

  if (matchError || !match) {
    console.error(`❌ Match ${matchNumber}: Error fetching match`);
    return;
  }

  console.log(`✅ Match ${matchNumber}: Found (State: ${match.state})`);

  // If match is CREATED, set batting order first
  if (match.state === 'CREATED') {
    console.log(`📋 Match ${matchNumber}: Setting batting order...`);
    const battingOrder = match.team_ids;

    await supabase
      .from('matches')
      .update({
        state: 'READY',
        batting_order: battingOrder,
      })
      .eq('id', match.id);

    // Create innings
    for (let i = 0; i < 4; i++) {
      const inningsId = `match-${matchNumber}-innings-${i + 1}`;
      await supabase.from('innings').insert({
        id: inningsId,
        match_id: match.id,
        team_id: battingOrder[i],
        batting_pair: [],
        state: i === 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        total_runs: 0,
        total_wickets: 0,
      });
    }

    // Update match to IN_PROGRESS
    await supabase
      .from('matches')
      .update({ state: 'IN_PROGRESS' })
      .eq('id', match.id);

    console.log(`✅ Match ${matchNumber}: Innings created, match IN_PROGRESS`);
  }

  // Fetch innings
  const { data: innings } = await supabase
    .from('innings')
    .select('*')
    .eq('match_id', match.id)
    .order('created_at', { ascending: true });

  if (!innings || innings.length === 0) {
    console.error(`❌ Match ${matchNumber}: No innings found`);
    return;
  }

  const teamIds = match.team_ids || [];

  // Score all 4 innings
  for (let inningsIdx = 0; inningsIdx < 4; inningsIdx++) {
    const currentInnings = innings[inningsIdx];
    const battingTeamId = currentInnings.team_id;
    const otherTeams = teamIds.filter((id: string) => id !== battingTeamId);

    console.log(`\n  📊 Match ${matchNumber}, Innings ${inningsIdx + 1}/4 (Team: ${battingTeamId})`);

    // Set innings to IN_PROGRESS
    await supabase
      .from('innings')
      .update({ state: 'IN_PROGRESS' })
      .eq('id', currentInnings.id);

    let totalRuns = 0;
    let totalWickets = 0;

    // Score 3 overs
    for (let overNum = 0; overNum < 3; overNum++) {
      const bowlingTeamId = otherTeams[overNum];
      const fieldingTeamIds = otherTeams.filter((id: string) => id !== bowlingTeamId);

      const overId = `${currentInnings.id}-over-${overNum}`;
      const isPowerplay = overNum === Math.floor(Math.random() * 3); // Random powerplay

      console.log(`    Over ${overNum}: Bowling: ${bowlingTeamId}${isPowerplay ? ' ⚡ POWERPLAY' : ''}`);

      // Create over
      await supabase.from('overs').insert({
        id: overId,
        innings_id: currentInnings.id,
        over_number: overNum,
        bowling_team_id: bowlingTeamId,
        bowler_id: `player-${bowlingTeamId.split('-')[1]}-1`,
        keeper_id: `player-${bowlingTeamId.split('-')[1]}-2`,
        is_powerplay: isPowerplay,
      });

      // Set powerplay if selected
      if (isPowerplay) {
        await supabase
          .from('innings')
          .update({ powerplay_over: overNum as any })
          .eq('id', currentInnings.id);
      }

      // Get complex scenarios for this over
      const scenarios = getComplexScenarios(bowlingTeamId, fieldingTeamIds);

      // Score 6-10 balls (including extras/reballs)
      const numBalls = isPowerplay ? 8 : 6; // Powerplay gets extra balls to test
      let legalBalls = 0;

      for (let ballIdx = 0; ballIdx < numBalls && legalBalls < 6; ballIdx++) {
        // Pick a scenario (weighted towards normal runs, but include all types)
        let scenario: BallScenario;
        const rand = Math.random();

        if (rand < 0.5) {
          // 50% normal runs (0-3)
          scenario = scenarios[Math.floor(Math.random() * 4)];
        } else if (rand < 0.65) {
          // 15% boundaries
          scenario = randomItem([scenarios[4], scenarios[5]]);
        } else if (rand < 0.80) {
          // 15% extras
          scenario = randomItem(scenarios.slice(6, 11));
        } else {
          // 20% wickets
          scenario = randomItem(scenarios.slice(11));
        }

        const isLegal = !scenario.isWide && !scenario.isNoball;
        const ballNumber = isLegal ? legalBalls : legalBalls - 0.1; // Extras get decimal ball numbers
        const effectiveRuns = scenario.runs + (scenario.isWicket ? 5 : 0);

        // Insert ball
        await supabase.from('balls').insert({
          id: `${overId}-ball-${ballIdx}`,
          over_id: overId,
          ball_number: ballNumber,
          runs: scenario.runs,
          is_wide: scenario.isWide || false,
          is_noball: scenario.isNoball || false,
          is_wicket: scenario.isWicket || false,
          wicket_type: scenario.wicketType || null,
          fielding_team_id: scenario.fieldingTeamId || null,
          effective_runs: effectiveRuns,
          timestamp: new Date().toISOString(),
        });

        totalRuns += effectiveRuns;
        if (scenario.isWicket) totalWickets++;

        console.log(`      Ball ${ballNumber.toFixed(1)}: ${scenario.description} (Runs: ${effectiveRuns})`);

        if (isLegal) legalBalls++;

        await wait(delayMs); // Simulate realistic delay
      }
    }

    // Update innings totals and complete
    await supabase
      .from('innings')
      .update({
        total_runs: totalRuns,
        total_wickets: totalWickets,
        state: 'COMPLETED',
      })
      .eq('id', currentInnings.id);

    console.log(`  ✅ Innings ${inningsIdx + 1} complete: ${totalRuns} runs, ${totalWickets} wickets`);
  }

  // Calculate rankings and complete match
  const { data: finalInnings } = await supabase
    .from('innings')
    .select('*')
    .eq('match_id', match.id);

  const rankings = finalInnings!
    .map((inn: any) => ({
      teamId: inn.team_id,
      totalRuns: inn.total_runs,
      totalScore: inn.total_runs,
      totalDismissals: inn.total_wickets,
      rank: 0,
      points: 0,
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((r, idx) => ({
      ...r,
      rank: idx + 1,
      points: idx === 0 ? 5 : idx === 1 ? 3 : idx === 2 ? 1 : 0,
    }));

  await supabase
    .from('matches')
    .update({
      state: 'COMPLETED',
      rankings,
    })
    .eq('id', match.id);

  console.log(`\n🎉 Match ${matchNumber} COMPLETED!`);
  console.log(`   Rankings:`, rankings.map(r => `#${r.rank}: ${r.teamId} (${r.totalScore} runs, ${r.points} pts)`).join(', '));
}

async function stressTest() {
  const match1 = parseInt(process.argv[2], 10) || 16;
  const match2 = parseInt(process.argv[3], 10) || 17;

  console.log('🚀 STRESS TEST: Parallel Match Scoring');
  console.log(`   Match ${match1} and Match ${match2}`);
  console.log('');
  console.log('📋 Test Scenarios:');
  console.log('   ✅ Wickets (Bowling Team, Catch Out, Run Out)');
  console.log('   ✅ Extras (Wides, No Balls)');
  console.log('   ✅ Boundaries (4s and 6s)');
  console.log('   ✅ Powerplay overs');
  console.log('   ✅ Parallel scoring (2 matches simultaneously)');
  console.log('   ✅ Real-time database updates');
  console.log('');
  console.log('👀 MONITOR Match Center at: http://localhost:3000/spectator/match-center');
  console.log('   You should see live updates for both matches!');
  console.log('');
  console.log('⏱️  Estimated time: ~2-3 minutes per match');
  console.log('');

  // Score both matches in parallel
  await Promise.all([
    scoreMatch(match1, 300),  // 300ms delay between balls
    scoreMatch(match2, 400),  // 400ms delay (slightly offset)
  ]);

  console.log('\n');
  console.log('=' .repeat(60));
  console.log('✅ STRESS TEST COMPLETE!');
  console.log('=' .repeat(60));
  console.log('');
  console.log('📊 Check Match Center to verify:');
  console.log('   - Both matches show COMPLETED');
  console.log('   - Rankings are correct');
  console.log('   - Stats banner appeared for 4s, 6s, wickets');
  console.log('');
  console.log('🧹 Cleanup (when done testing):');
  console.log(`   npm run reset-match ${match1}`);
  console.log(`   npm run reset-match ${match2}`);
  console.log('');
}

stressTest().catch(console.error);
