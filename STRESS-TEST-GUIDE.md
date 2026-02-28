# 🧪 Stress Test Guide

## Quick Start

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Open Match Center
Open in browser: http://localhost:3000/spectator/match-center

### Step 3: Run Stress Test (in new terminal)
```bash
npm run stress-test 16 17
```

---

## ✅ Testing Checklist

### During Test (Watch Match Center)

- [ ] **Both matches appear** as "LIVE" cards
- [ ] **Scores update in real-time** every ~300-400ms
- [ ] **Cricket stats banner appears** when:
  - 4 scored → Shows "4 FOUR!" (blue)
  - 6 scored → Shows "6 SIX!" (purple)
  - Wicket taken → Shows "WICKET!" (red) with type
- [ ] **Banner auto-hides** after 20 seconds
- [ ] **Batting team highlighted** (green border + badge)
- [ ] **Bowling team highlighted** (orange border + badge)
- [ ] **Team highlights change** each over
- [ ] **Over count updates** correctly (0.0 → 3.0)
- [ ] **Wicket count increases** when wickets fall
- [ ] **Powerplay badge** appears for powerplay overs
- [ ] **Match completes** after 4 innings
- [ ] **Rankings appear** when match ends

### Check DB Status Indicator

Open umpire page: http://localhost:3000/umpire/scoring/match-16

- [ ] **Status dot shows**:
  - Yellow while saving
  - Green after save success
  - Never stuck on "Saving..."
- [ ] **"Saved X ago"** updates correctly

### Check Standings

Open: http://localhost:3000/spectator/standings

- [ ] **New matches appear** in standings
- [ ] **Points calculated correctly**:
  - 1st place: 5 points
  - 2nd place: 3 points
  - 3rd place: 1 point
  - 4th place: 0 points
- [ ] **Total runs** sum correctly

---

## 🐛 Issues to Watch For

### Critical Issues:
- ❌ Database save stuck on "Saving..."
- ❌ Match Center not updating (real-time broken)
- ❌ Cricket banner shows cumulative stats instead of last ball
- ❌ Powerplay selection crashes/hangs
- ❌ Race conditions (match state corruption)

### Minor Issues:
- ⚠️ Slow updates (>2 second delay)
- ⚠️ Banner doesn't auto-hide
- ⚠️ Team highlights don't change
- ⚠️ Wicket type not displayed

---

## 📊 Expected Results

### Match 16 & 17 Should Have:
- **4 innings** each
- **3 overs** per innings
- **6-10 balls** per over (extras create additional balls)
- **Random powerplay** in each innings
- **Multiple wickets** (all 3 types tested)
- **Multiple boundaries** (4s and 6s)
- **Multiple extras** (wides and no balls)
- **Completed state** at end
- **Rankings** with 4 teams

### Terminal Output Should Show:
```
🎯 Starting stress test for Match 16...
✅ Match 16: Found (State: CREATED)
📋 Match 16: Setting batting order...
✅ Match 16: Innings created, match IN_PROGRESS

  📊 Match 16, Innings 1/4 (Team: team-4)
    Over 0: Bowling: team-3
      Ball 0.0: Dot ball (Runs: 0)
      Ball 1.0: 4️⃣ FOUR! (Runs: 4)
      Ball 2.0: 🏏 WICKET (Bowling Team) (Runs: 5)
      ...

  ✅ Innings 1 complete: 45 runs, 2 wickets
  ...

🎉 Match 16 COMPLETED!
   Rankings: #1: team-4 (45 runs, 5 pts), ...
```

---

## 🧹 Cleanup

When testing is complete:

```bash
# Reset both test matches
npm run reset-match 16
npm run reset-match 17
```

This will:
- Delete all balls, overs, innings
- Reset match state to CREATED
- Clear batting order and rankings
- Ready for tomorrow's actual matches

---

## 💡 Tips

1. **Keep Match Center visible** during the entire test
2. **Watch for the cricket banner** - it should appear multiple times
3. **Check terminal output** for any error messages
4. **Note any UI freezes or delays**
5. **Test real-time** by refreshing Match Center during test - should still update
6. **Check mobile view** if possible (responsive design)

---

## 🆘 Troubleshooting

**Test won't start:**
- Check `.env.local` has Supabase credentials
- Ensure dev server is running (`npm run dev`)

**No real-time updates:**
- Check browser console for errors
- Verify Supabase realtime is enabled
- Try refreshing Match Center page

**Test stuck/hanging:**
- Stop with Ctrl+C
- Run cleanup: `npm run reset-match 16 && npm run reset-match 17`
- Try again

**Database errors:**
- Check Supabase dashboard for connection issues
- Verify service role key is correct
- Check database constraints
