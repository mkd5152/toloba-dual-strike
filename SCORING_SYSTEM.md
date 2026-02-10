# 🏏 Scoring System Documentation

## Overview
The scoring system is now fully functional with proper role-based access control.

---

## Access Control

### Organizers (Full Access)
- ✅ Can see **ALL matches** in the schedule
- ✅ **"Start Scoring"** button appears on every match (no time/status restrictions)
- ✅ Can score any match at any time
- ✅ Can assign umpires to matches
- ✅ Can override scores if needed

**Where to find:**
- Login as organizer → `/organizer/schedule`
- Click "Start Scoring" on any match

### Umpires (Assigned Matches Only)
- ✅ Can **ONLY see** matches assigned to them
- ✅ **"Start Scoring"** button only appears on their assigned matches
- ✅ Cannot see or score unassigned matches

**Where to find:**
- Login as umpire → `/umpire/matches`
- Only shows matches where `umpire_id` matches their user ID
- Click "Start Scoring" on assigned matches

### Spectators (View Only)
- ✅ Can view live scores
- ✅ Cannot access scoring pages
- ✅ See match status and results

---

## How to Score a Match

### Step 1: Navigate to Scoring Page
**Organizer:**
- Go to `/organizer/schedule`
- Find any match
- Click "Start Scoring"

**Umpire:**
- Go to `/umpire/matches`
- Find your assigned match
- Click "Start Scoring"

### Step 2: Scoring Interface
The scoring page shows:
- ✅ **Match header** - Match number, court, stage (LEAGUE/SEMI/FINAL)
- ✅ **Live badge** - Red "LIVE" indicator for in-progress matches
- ✅ **Innings header** - Current batting team and over info
- ✅ **Scoring panel** - Buttons to record runs, wickets, extras
- ✅ **Ball log** - History of all balls bowled

### Step 3: Recording Balls
Available actions:
- **Runs**: 0, 1, 2, 3, 4, 6 (tap button to record)
- **Wicket**: Record wicket (runs = 0)
- **No Ball**: Extra delivery, runs still count
- **Wide**: Extra delivery, add 1 run
- **Powerplay**: Mark current over as powerplay (2x runs)
- **Undo**: Remove last ball if error

---

## Scoring Flow

### Match States
```
CREATED → READY → TOSS → IN_PROGRESS → COMPLETED → LOCKED
```

- **CREATED**: Match scheduled but not started
- **READY**: Ready to begin
- **TOSS**: Batting order determined
- **IN_PROGRESS**: Currently being scored
- **COMPLETED**: Match finished
- **LOCKED**: Final scores locked, no changes

### Innings Flow
Each match has 4 innings (one per team):
1. Team 1 bats (3 overs)
2. Team 2 bats (3 overs)
3. Team 3 bats (3 overs)
4. Team 4 bats (3 overs)

Each over has 6 balls (unless extras are bowled).

### Powerplay Rules
- Each team can choose **ONE over** (1, 2, or 3) as their powerplay
- During powerplay: **All runs are doubled**
- Select powerplay before the over starts

---

## Technical Details

### URL Structure
```
/umpire/scoring/[matchId]
```
- `matchId` = match UUID from database
- Example: `/umpire/scoring/match-1`

### Data Flow
1. **Load match** from database (`loadMatches()`)
2. **Set current match** in match store (`setCurrentMatch()`)
3. **Record ball** updates match store and database
4. **Real-time updates** via Supabase subscriptions (future enhancement)

### Key Components
- **Page**: `/app/umpire/scoring/[matchId]/page.tsx`
- **Scoring Panel**: `/components/umpire/scoring-panel.tsx`
- **Innings Header**: `/components/umpire/innings-header.tsx`
- **Ball Log**: `/components/umpire/ball-log.tsx`
- **Match Store**: `/lib/stores/match-store.ts`

---

## Testing Checklist

### As Organizer
- [ ] Go to `/organizer/schedule`
- [ ] Verify "Start Scoring" button shows on ALL matches
- [ ] Click "Start Scoring" on Match 1
- [ ] Verify scoring page loads correctly
- [ ] Record a few balls (0, 1, 2, 4, 6 runs)
- [ ] Record a wicket
- [ ] Record a no-ball
- [ ] Use undo button
- [ ] Verify ball log updates

### As Umpire
- [ ] Go to `/umpire/matches`
- [ ] Verify ONLY assigned matches show
- [ ] Click "Start Scoring" on assigned match
- [ ] Complete full scoring flow
- [ ] Verify cannot access unassigned matches

### As Spectator
- [ ] Go to `/spectator/live`
- [ ] Verify can see match status
- [ ] Cannot access `/umpire/scoring/[matchId]`

---

## Common Issues & Fixes

### Issue: "Match not found"
**Cause:** Invalid matchId or match not loaded
**Fix:**
- Check URL has correct matchId
- Click "Try Again" button
- Verify match exists in database

### Issue: Scoring buttons not working
**Cause:** Match store not initialized
**Fix:**
- Refresh page
- Check browser console for errors
- Verify match is loaded

### Issue: Umpire sees all matches
**Cause:** Database query not filtering by umpire_id
**Fix:**
- Check user is logged in as umpire
- Verify profile role is 'umpire'
- Check matches have umpire_id assigned

### Issue: Abort errors in console
**Cause:** React Strict Mode double-mounting
**Fix:** ✅ Already handled - abort errors are silently ignored

---

## Database Schema

### Matches Table
```sql
- id: UUID (match-1, match-2, etc.)
- match_number: INTEGER (1-28)
- stage: TEXT (LEAGUE, SEMI, FINAL)
- state: TEXT (CREATED, IN_PROGRESS, etc.)
- umpire_id: UUID (user ID of assigned umpire)
- team_ids: TEXT[] (4 team IDs)
- court: TEXT
- start_time: TIMESTAMP
```

### Key Queries

**Get all matches (organizer):**
```sql
SELECT * FROM matches ORDER BY match_number;
```

**Get umpire's matches:**
```sql
SELECT * FROM matches WHERE umpire_id = $1 ORDER BY start_time;
```

---

## Future Enhancements

Potential features to add:
- [ ] Real-time updates via Supabase subscriptions
- [ ] Match start/end automation
- [ ] Ball-by-ball saving to database
- [ ] Automatic innings progression
- [ ] Match completion workflow
- [ ] Score validation rules
- [ ] Umpire push notifications

---

Happy scoring! 🏏
