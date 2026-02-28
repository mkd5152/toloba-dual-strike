# Manual UI Stress Test Guide

Since automated E2E testing requires authentication setup, here's a manual stress testing guide you can follow:

## Prerequisites

1. **Reset the test matches:**
   ```bash
   npm run reset-match 16
   npm run reset-match 17
   ```

2. **Make sure dev server is running:**
   ```bash
   npm run dev
   ```

## Setup (3 Browser Windows)

Open these 3 URLs in separate windows/tabs:

1. **Match 16 Scoring:** [http://localhost:3000/umpire/scoring/match-16](http://localhost:3000/umpire/scoring/match-16)
2. **Match 17 Scoring:** [http://localhost:3000/umpire/scoring/match-17](http://localhost:3000/umpire/scoring/match-17)
3. **Match Center (Monitor):** [http://localhost:3000/spectator/match-center](http://localhost:3000/spectator/match-center)

*(Login as umpire or organizer if prompted)*

## Testing Flow

### 1. Start Both Matches (in parallel)

**Window 1 (Match 16):**
- Dialog should appear: "Set Batting Order"
- Click "Confirm & Start Match"
- Wait for scoring interface to load

**Window 2 (Match 17):**
- Same steps as Match 16

**Window 3 (Match Center):**
- Refresh page
- Both matches should now show as "LIVE"

---

### 2. Score Balls Rapidly (Test Database Stress)

Switch between Window 1 and Window 2, clicking balls as fast as possible:

**Match 16 - Over 0:**
- Click: `0` (Dot ball)
- Click: `4` (FOUR) → **Check Window 3 for cricket banner!**
- Click: `Wicket` → Select "Bowling Team" → Confirm
- Click: `1` (Single)
- Click: `2` (Two runs)
- Click: `Wide` + `1`

**Match 17 - Over 0 (parallel):**
- Click: `0` (Dot)
- Click: `6` (SIX) → **Check Window 3 for cricket banner!**
- Click: `Wicket` → Select "Catch Out" → Pick fielding team → Confirm
- Click: `1`, `2`, `3`

---

### 3. Test Powerplay (Critical Feature)

**Match 16 - Before Over 1:**
- Click "Select Powerplay" button
- Click "⚡ Powerplay" checkbox for Over 1
- Click "Confirm Powerplay"

**Score Over 1:**
- Click 6 balls rapidly: `6`, `0`, `Wicket (Run Out)`, `No Ball + 1`, `3`, `2`

**Window 3 Check:**
- Match Center should show powerplay indicator
- Real-time updates working?

---

### 4. Parallel Stress Test

Now alternate between Match 16 and Match 17 every 2-3 balls:

**Match 16 Over 2:**
- `4`, `1`, `0`

**Match 17 Over 1:**
- `2`, `6`, `Wicket`

**Match 16 Over 2 (continue):**
- `2`, `3`, `1`

**Match 17 Over 1 (continue):**
- `4`, `0`, `1`

**Check Window 3:**
- Both matches updating in real-time?
- Cricket banner appearing for both matches?
- No lag or "Saving..." stuck?

---

### 5. Complete All Innings (Fast Mode)

For each match, complete all 4 innings:

**Each Over (3 overs per innings):**
- Click 6 balls rapidly: random 0-4 runs
- Mix in occasional 4s, 6s, wickets, extras

**After each innings:**
- Click "Complete Innings"
- Next innings should load automatically

---

## What to Watch For

### ✅ Expected Behavior:

- [ ] **Database Status:** Shows yellow (saving) → green (saved) → "Saved X ago"
- [ ] **Never stuck on "Saving..."**
- [ ] **Match Center:** Real-time updates within 1-2 seconds
- [ ] **Cricket Banner:** Appears for 4s, 6s, wickets with correct info
- [ ] **Banner Auto-hide:** Disappears after 20 seconds
- [ ] **Team Highlights:** Batting team (green), Bowling team (orange)
- [ ] **Powerplay Indicator:** Appears when powerplay over is active
- [ ] **Wicket Types:** Displays correctly (Catch Out, Run Out, not just "Bowling Team")
- [ ] **Parallel Scoring:** Both matches update independently
- [ ] **No UI freezes or crashes**

### ❌ Issues to Report:

- Database stuck on "Saving..."
- Match Center not updating
- Cricket banner shows wrong stats (cumulative instead of last ball)
- Banner doesn't auto-hide
- Powerplay selection crashes or hangs
- Wicket type displays incorrectly
- Real-time updates lag >5 seconds
- UI freezes when clicking rapidly

---

## After Testing

Clean up the test data:

```bash
npm run reset-match 16
npm run reset-match 17
```

---

## Advanced: Test Edge Cases

- **Rapid Clicks:** Click balls as fast as possible (< 0.5 sec apart)
- **Multiple Wickets:** Score 3 wickets in one over
- **All Extras:** Over with only wides and no balls
- **Powerplay Last Over:** Set powerplay for Over 2 (last over)
- **Browser Refresh During Scoring:** Refresh Match 16 page mid-over, continue scoring
- **Multiple Match Center Viewers:** Open Match Center in 2 tabs, verify both update

---

## Cleanup Script

If something goes wrong and you need to reset everything:

```bash
# Reset both matches
npm run reset-match 16 && npm run reset-match 17

# Restart dev server
# Ctrl+C to stop, then npm run dev
```

---

## Tips

1. **Keep Match Center visible** the entire time
2. **Watch for the cricket banner** - should appear multiple times
3. **Check browser console** for any errors (F12 → Console tab)
4. **Note any slow-downs** or delays
5. **Test on different browsers** (Chrome, Safari, Firefox) if possible
6. **Mobile test:** Try on phone/tablet if available

---

Good luck with the testing! 🏏
