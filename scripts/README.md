# Admin Scripts

This folder contains administrative scripts for managing the tournament.

---

## Stress Test Script

Comprehensive stress testing for parallel match scoring with all edge cases.

### What it tests:
- ✅ **Wickets**: All types (Bowling Team, Catch Out, Run Out)
- ✅ **Extras**: Wides and No Balls with runs
- ✅ **Boundaries**: 4s and 6s (tests cricket stats banner)
- ✅ **Powerplay**: Random powerplay over selection
- ✅ **Parallel Scoring**: 2 matches scored simultaneously
- ✅ **Real-time Updates**: Tests Match Center live updates
- ✅ **Database Stress**: Rapid consecutive saves

### Usage:

```bash
npm run stress-test <match1> <match2>
```

### Example:

```bash
# Start dev server first
npm run dev

# In another terminal, run stress test
npm run stress-test 16 17

# Monitor Match Center at:
# http://localhost:3000/spectator/match-center
```

### What to Monitor:

1. **Match Center Page** (`/spectator/match-center`):
   - Both matches should show as LIVE
   - Scores update in real-time
   - Cricket stats banner appears for 4s, 6s, wickets
   - Banner auto-hides after 20 seconds
   - Batting/Bowling team highlights

2. **Umpire Scoring Page** (`/umpire/scoring/[matchId]`):
   - Database save indicator works correctly
   - No "saving..." stuck states
   - Powerplay selection works

3. **Standings Page** (`/spectator/standings`):
   - Rankings update when matches complete
   - Points calculated correctly

### Test Duration:
- **~2-3 minutes per match**
- Matches run in parallel
- Total test time: ~3 minutes

### Cleanup:

After testing, reset the matches:

```bash
npm run reset-match 16
npm run reset-match 17
```

This removes all test data and returns matches to CREATED state.

---

## Reset Match Script

Completely resets a match by deleting all data and returning it to CREATED state.

### What it does:
- Deletes all balls from all overs
- Deletes all overs from all innings
- Deletes all innings
- Resets match state to `CREATED`
- Clears batting order (allows you to re-select teams)
- Clears rankings

### Usage:

**Option 1: Using npm script (recommended)**
```bash
npm run reset-match <match-number>
```

**Option 2: Using tsx directly**
```bash
npx tsx scripts/reset-match.ts <match-number>
```

### Examples:

```bash
# Reset Match 11
npm run reset-match 11

# Reset Match 15
npm run reset-match 15

# Reset Match 1
npm run reset-match 1
```

### After Reset:

After resetting a match, you can:
1. Go to the umpire scoring interface
2. Select the batting order (toss)
3. Start scoring from scratch

The match will be in `CREATED` state, which means it's ready for batting order selection.

### Requirements:

- `.env.local` file must exist with valid Supabase credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Safety:

This script uses the Supabase service role key to bypass Row Level Security (RLS) policies. Use with caution as it permanently deletes data.
