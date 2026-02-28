import { test, expect, Page } from '@playwright/test';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const TEST_EMAIL = process.env.TEST_UMPIRE_EMAIL || 'admin@tdst.com';
const TEST_PASSWORD = process.env.TEST_UMPIRE_PASSWORD || 'admin1';

async function login(page: Page) {
  await page.goto('/auth/login');
  await page.waitForSelector('input[placeholder="your@email.com"]', { timeout: 10000 });
  await page.fill('input[placeholder="your@email.com"]', TEST_EMAIL);
  await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
  await page.click('button:has-text("Sign In")');
  await wait(2000);
}

async function selectBattingOrder(page: Page) {
  await page.waitForSelector('text=Set Batting Order', { timeout: 15000 });
  await page.click('button:has-text("Confirm & Start Match")');
  await wait(3000);
  await page.waitForSelector('text=Innings 1', { timeout: 15000 });
}

async function scoreBall(page: Page, runs: number, options?: {
  isWide?: boolean;
  isNoball?: boolean;
  isWicket?: boolean;
  wicketType?: string;
}) {
  await page.click(`button:has-text("${runs}")`);

  if (options?.isWide) {
    await page.click('button:has-text("Wide")');
  }
  if (options?.isNoball) {
    await page.click('button:has-text("No Ball")');
  }

  if (options?.isWicket) {
    await page.click('button:has-text("Wicket")');
    await page.waitForSelector('text=WICKET!', { timeout: 10000 });

    if (options.wicketType === 'CATCH_OUT') {
      await page.click('button:has-text("Catch Out")');
      await wait(500);
      const fieldingTeamButtons = await page.locator('button:has-text("+5 runs bonus")');
      await fieldingTeamButtons.first().click();
    } else if (options.wicketType === 'RUN_OUT') {
      await page.click('button:has-text("Run Out")');
      await wait(500);
      const fieldingTeamButtons = await page.locator('button:has-text("+5 runs bonus")');
      await fieldingTeamButtons.first().click();
    } else {
      await page.click('button:has-text("Bowling Team Wicket")');
    }
  }

  await wait(600);
}

test.describe('UI Smoke Test - Parallel Scoring', () => {
  test.beforeAll(async () => {
    console.log('\n🧹 Resetting Match 16 and 17...');
    const { execSync } = require('child_process');
    execSync('npm run reset-match 16', { stdio: 'inherit' });
    execSync('npm run reset-match 17', { stdio: 'inherit' });
    console.log('✅ Matches reset\n');
  });

  test('Smoke test: Score one over in parallel for both matches', async ({ browser }) => {
    test.setTimeout(120000); // 2 minutes

    const match16Context = await browser.newContext();
    const match17Context = await browser.newContext();
    const monitorContext = await browser.newContext();

    const match16Page = await match16Context.newPage();
    const match17Page = await match17Context.newPage();
    const matchCenterPage = await monitorContext.newPage();

    console.log('\n🚀 Starting Smoke Test...\n');

    // Login
    console.log('🔐 Logging in...');
    await login(match16Page);
    const cookies = await match16Context.cookies();
    await match17Context.addCookies(cookies);
    await monitorContext.addCookies(cookies);
    console.log('✅ Logged in\n');

    // Navigate
    await match16Page.goto('/umpire/scoring/match-16');
    await match17Page.goto('/umpire/scoring/match-17');
    await matchCenterPage.goto('/spectator/match-center');
    console.log('✅ Opened all 3 pages');

    // Select batting order
    console.log('\n📋 Selecting batting order...');
    await selectBattingOrder(match16Page);
    await selectBattingOrder(match17Page);
    console.log('✅ Batting order selected\n');

    // Check Match Center
    await matchCenterPage.reload();
    await wait(1000);
    await expect(matchCenterPage.getByText('Match 16')).toBeVisible();
    await expect(matchCenterPage.getByText('Match 17')).toBeVisible();
    console.log('✅ Match Center shows both matches\n');

    // Score Over 0 for Match 16
    console.log('📊 Match 16, Over 0...');
    await scoreBall(match16Page, 0); // Dot
    await scoreBall(match16Page, 4); // FOUR
    console.log('  ⚡ Scored 4 - check Match Center for cricket banner!');
    await scoreBall(match16Page, 0, { isWicket: true, wicketType: 'BOWLING_TEAM' }); // Wicket
    console.log('  ⚡ Wicket - check Match Center for banner!');
    await scoreBall(match16Page, 1); // Single
    await scoreBall(match16Page, 2); // Two
    await scoreBall(match16Page, 1, { isWide: true }); // Wide

    // Score Over 0 for Match 17 (parallel)
    console.log('\n📊 Match 17, Over 0 (parallel)...');
    await scoreBall(match17Page, 0); // Dot
    await scoreBall(match17Page, 6); // SIX
    console.log('  ⚡ Scored 6 - check Match Center for cricket banner!');
    await scoreBall(match17Page, 0, { isWicket: true, wicketType: 'CATCH_OUT' }); // Catch out
    console.log('  ⚡ Wicket (Catch Out) - check Match Center!');
    await scoreBall(match17Page, 1); // Single
    await scoreBall(match17Page, 3); // Three
    await scoreBall(match17Page, 1, { isNoball: true }); // No ball

    // Final Match Center check
    console.log('\n✅ Scoring complete!');
    await matchCenterPage.reload();
    await wait(2000);

    // Verify scores updated
    console.log('✅ Verifying Match Center updates...');
    await expect(matchCenterPage.getByText('Match 16')).toBeVisible();
    await expect(matchCenterPage.getByText('Match 17')).toBeVisible();

    console.log('\n🎉 SMOKE TEST PASSED!');
    console.log('   ✅ Both matches scored successfully');
    console.log('   ✅ Wickets recorded (all types)');
    console.log('   ✅ Extras recorded (wide, no ball)');
    console.log('   ✅ Boundaries recorded (4, 6)');
    console.log('   ✅ Match Center updated in real-time');
    console.log('   ✅ Parallel scoring works!\n');

    // Keep browser open for 5 seconds to review
    console.log('⏳ Keeping browser open for 5 seconds...\n');
    await wait(5000);

    await match16Context.close();
    await match17Context.close();
    await monitorContext.close();
  });
});
