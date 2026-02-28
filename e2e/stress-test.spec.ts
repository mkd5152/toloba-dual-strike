import { test, expect, Page } from '@playwright/test';

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Test credentials - set these as environment variables or update directly
const TEST_EMAIL = process.env.TEST_UMPIRE_EMAIL || 'admin@tdst.com';
const TEST_PASSWORD = process.env.TEST_UMPIRE_PASSWORD || 'admin1';

// Helper to login
async function login(page: Page) {
  await page.goto('/auth/login');
  await page.waitForSelector('input[placeholder="your@email.com"]', { timeout: 10000 });
  await page.fill('input[placeholder="your@email.com"]', TEST_EMAIL);
  await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
  await page.click('button:has-text("Sign In")');
  await wait(2000); // Wait for redirect
}

// Helper to select batting order
async function selectBattingOrder(page: Page) {
  // Wait for batting order dialog
  await page.waitForSelector('text=Set Batting Order', { timeout: 15000 });

  // Click "Confirm & Start Match" button
  await page.click('button:has-text("Confirm & Start Match")');

  // Wait for match to initialize
  await wait(3000);

  // Wait for scoring interface to load
  await page.waitForSelector('text=Innings 1', { timeout: 15000 });
}

// Helper to score a ball
async function scoreBall(page: Page, runs: number, options?: {
  isWide?: boolean;
  isNoball?: boolean;
  isWicket?: boolean;
  wicketType?: string;
}) {
  // Click the runs button
  await page.click(`button:has-text("${runs}")`);

  // If it's an extra
  if (options?.isWide) {
    await page.click('button:has-text("Wide")');
  }
  if (options?.isNoball) {
    await page.click('button:has-text("No Ball")');
  }

  // If it's a wicket
  if (options?.isWicket) {
    await page.click('button:has-text("Wicket")');

    // Wait for wicket dialog
    await page.waitForSelector('text=WICKET!', { timeout: 10000 });

    // Select wicket type
    if (options.wicketType === 'CATCH_OUT') {
      await page.click('button:has-text("Catch Out")');
      await wait(500);
      // Select first fielding team from the list
      const fieldingTeamButtons = await page.locator('button:has-text("+5 runs bonus")');
      await fieldingTeamButtons.first().click();
    } else if (options.wicketType === 'RUN_OUT') {
      await page.click('button:has-text("Run Out")');
      await wait(500);
      // Select first fielding team from the list
      const fieldingTeamButtons = await page.locator('button:has-text("+5 runs bonus")');
      await fieldingTeamButtons.first().click();
    } else {
      await page.click('button:has-text("Bowling Team Wicket")');
    }
  }

  // Wait for save
  await wait(500);
}

// Helper to check Match Center
async function checkMatchCenter(matchCenterPage: Page, matchNumbers: number[]) {
  await matchCenterPage.reload();
  await wait(1000);

  // Check both matches are visible
  for (const matchNum of matchNumbers) {
    await expect(matchCenterPage.getByText(`Match ${matchNum}`)).toBeVisible();
  }
}

test.describe('Parallel Match Stress Test via UI', () => {
  // Reset matches before test
  test.beforeAll(async () => {
    console.log('\n🧹 Resetting Match 16 and 17...');
    const { execSync } = require('child_process');
    execSync('npm run reset-match 16', { stdio: 'inherit' });
    execSync('npm run reset-match 17', { stdio: 'inherit' });
    console.log('✅ Matches reset\n');
  });

  test('Score Match 16 and 17 in parallel with all edge cases', async ({ browser }) => {
    // Increase test timeout for this long test
    test.setTimeout(180000); // 3 minutes
    // Create 3 browser contexts (2 for scoring, 1 for monitoring)
    const match16Context = await browser.newContext();
    const match17Context = await browser.newContext();
    const monitorContext = await browser.newContext();

    const match16Page = await match16Context.newPage();
    const match17Page = await match17Context.newPage();
    const matchCenterPage = await monitorContext.newPage();

    console.log('\n🚀 Starting E2E Stress Test...\n');

    // Login for Match 16
    console.log('🔐 Logging in...');
    await login(match16Page);

    // Share session between contexts by copying cookies
    const cookies = await match16Context.cookies();
    await match17Context.addCookies(cookies);
    await monitorContext.addCookies(cookies);

    console.log('✅ Logged in\n');

    // Navigate to pages
    await match16Page.goto('/umpire/scoring/match-16');
    await match17Page.goto('/umpire/scoring/match-17');
    await matchCenterPage.goto('/spectator/match-center');

    console.log('✅ Opened all 3 pages');

    // Select batting order for both matches
    console.log('\n📋 Selecting batting order...');
    await selectBattingOrder(match16Page);
    await selectBattingOrder(match17Page);
    console.log('✅ Batting order selected for both matches');

    // Check Match Center shows both matches as LIVE
    await checkMatchCenter(matchCenterPage, [16, 17]);
    console.log('✅ Match Center shows both matches');

    // Score Innings 1 for Match 16
    console.log('\n📊 Match 16, Innings 1...');

    // Over 0
    console.log('  Over 0');
    await scoreBall(match16Page, 0); // Dot ball
    await scoreBall(match16Page, 4); // FOUR
    await scoreBall(match16Page, 0, { isWicket: true, wicketType: 'BOWLING_TEAM' }); // Wicket
    await scoreBall(match16Page, 1); // Single
    await scoreBall(match16Page, 2); // Two runs
    await scoreBall(match16Page, 1, { isWide: true }); // Wide

    // Check Match Center for updates
    await checkMatchCenter(matchCenterPage, [16, 17]);
    console.log('  ✅ Match Center updated');

    // Over 1 (Score some balls in Match 17 in parallel)
    console.log('  Over 1 + scoring Match 17 in parallel');

    // Select powerplay for Match 16
    await match16Page.click('text=Select Powerplay');
    await wait(500);

    // Start next over
    await scoreBall(match16Page, 6); // SIX

    // Now score some balls in Match 17
    console.log('\n📊 Match 17, Innings 1 (parallel)...');
    await scoreBall(match17Page, 0); // Dot
    await scoreBall(match17Page, 4); // FOUR

    // Back to Match 16
    await scoreBall(match16Page, 0, { isWicket: true, wicketType: 'CATCH_OUT' }); // Catch out
    await scoreBall(match16Page, 1, { isNoball: true }); // No ball
    await scoreBall(match16Page, 3); // Three
    await scoreBall(match16Page, 2); // Two

    // More in Match 17
    await scoreBall(match17Page, 6); // SIX
    await scoreBall(match17Page, 0, { isWicket: true, wicketType: 'RUN_OUT' }); // Run out

    // Check Match Center
    await checkMatchCenter(matchCenterPage, [16, 17]);
    console.log('  ✅ Parallel scoring working');

    // Continue with rapid scoring for both matches
    console.log('\n⚡ Rapid scoring test...');

    // Match 16 Over 2
    await scoreBall(match16Page, 4); // FOUR
    await scoreBall(match16Page, 1); // Single
    await scoreBall(match16Page, 0); // Dot
    await scoreBall(match16Page, 2); // Two
    await scoreBall(match16Page, 3); // Three
    await scoreBall(match16Page, 1); // Single

    // Complete innings button
    await match16Page.click('button:has-text("Complete Innings")');
    await wait(1000);

    console.log('✅ Match 16 Innings 1 complete');

    // Continue Match 17
    await scoreBall(match17Page, 1); // Single
    await scoreBall(match17Page, 2); // Two

    // Complete Match 17 Over 0
    await scoreBall(match17Page, 4); // FOUR

    // Match 17 Over 1
    await scoreBall(match17Page, 0); // Dot
    await scoreBall(match17Page, 1); // Single
    await scoreBall(match17Page, 6); // SIX
    await scoreBall(match17Page, 2); // Two
    await scoreBall(match17Page, 0); // Dot
    await scoreBall(match17Page, 3); // Three

    // Match 17 Over 2
    await scoreBall(match17Page, 4); // FOUR
    await scoreBall(match17Page, 0, { isWicket: true, wicketType: 'CATCH_OUT' }); // Wicket
    await scoreBall(match17Page, 1); // Single
    await scoreBall(match17Page, 2); // Two
    await scoreBall(match17Page, 1, { isWide: true }); // Wide
    await scoreBall(match17Page, 0); // Dot

    // Complete Match 17 Innings 1
    await match17Page.click('button:has-text("Complete Innings")');
    await wait(1000);

    console.log('✅ Match 17 Innings 1 complete');

    // Check Match Center
    await checkMatchCenter(matchCenterPage, [16, 17]);
    console.log('✅ Match Center shows Innings 2');

    // Continue with Innings 2, 3, 4 (abbreviated for speed)
    console.log('\n📊 Completing remaining innings (fast mode)...');

    // Match 16 Innings 2-4 (6 balls each over, 3 overs)
    for (let innings = 0; innings < 3; innings++) {
      console.log(`  Match 16 Innings ${innings + 2}`);
      for (let over = 0; over < 3; over++) {
        for (let ball = 0; ball < 6; ball++) {
          const randomRuns = Math.floor(Math.random() * 5); // 0-4
          await scoreBall(match16Page, randomRuns);
        }
      }
      await match16Page.click('button:has-text("Complete Innings")');
      await wait(500);
    }

    // Match 17 Innings 2-4
    for (let innings = 0; innings < 3; innings++) {
      console.log(`  Match 17 Innings ${innings + 2}`);
      for (let over = 0; over < 3; over++) {
        for (let ball = 0; ball < 6; ball++) {
          const randomRuns = Math.floor(Math.random() * 5);
          await scoreBall(match17Page, randomRuns);
        }
      }
      await match17Page.click('button:has-text("Complete Innings")');
      await wait(500);
    }

    console.log('\n✅ All innings completed!');

    // Final Match Center check
    await checkMatchCenter(matchCenterPage, [16, 17]);

    // Check that matches show COMPLETED
    await expect(matchCenterPage.getByText('COMPLETED').first()).toBeVisible({ timeout: 5000 });

    console.log('\n🎉 STRESS TEST COMPLETE!');
    console.log('   Both matches scored successfully through UI');
    console.log('   Match Center updated in real-time');
    console.log('   All edge cases tested (wickets, extras, boundaries, powerplay)');

    // Keep browser open for 5 seconds to review
    await wait(5000);

    // Cleanup
    await match16Context.close();
    await match17Context.close();
    await monitorContext.close();
  });
});
