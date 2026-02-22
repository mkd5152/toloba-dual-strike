# Playoff Stages Bug Fix Instructions

## What Happened?

You discovered a critical bug where:
1. The database schema only supported `LEAGUE`, `SEMI`, `FINAL` stages
2. The code tried to create matches with stage `QF` (Quarter Finals)
3. The `createMatch` function didn't pass the `stage` parameter
4. Result: QF matches were created as LEAGUE matches
5. When you clicked "Generate QFs" twice, it created 4 duplicate league matches

## What Was Fixed?

✅ **Fixed the `createMatch` function** ([lib/api/matches.ts:321-322](lib/api/matches.ts#L321-L322))
   - Now properly passes `stage` and `group_name` to the database

✅ **Created migration to update database constraint**
   - File: `supabase/migrations/20260222_update_stage_constraint.sql`
   - Adds support for `QF` stage

✅ **Created cleanup script**
   - File: `supabase/migrations/20260222_cleanup_duplicate_qf_matches.sql`
   - Removes duplicate matches created with wrong stage

## How to Fix Your Database

### Option 1: Using Supabase SQL Editor (Easiest)

1. Go to your Supabase Dashboard → SQL Editor

2. **Run Migration 1** - Update Stage Constraint:
   ```sql
   -- Update stage column constraint to support new playoff structure
   ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_stage_check;

   ALTER TABLE matches
   ADD CONSTRAINT matches_stage_check
   CHECK (stage IN ('LEAGUE', 'QF', 'SEMI', 'FINAL'));

   COMMENT ON COLUMN matches.stage IS 'Tournament stage: LEAGUE (1-25), QF (26-27), SEMI (28-29), or FINAL (30)';
   ```

3. **Run Migration 2** - Clean Up Duplicates:
   ```sql
   -- Delete duplicate matches (match_number > 25 with stage = LEAGUE)
   DELETE FROM matches
   WHERE tournament_id = 'tdst-season-1'
     AND stage = 'LEAGUE'
     AND match_number > 25;
   ```

4. **Verify** the cleanup:
   ```sql
   SELECT stage, COUNT(*) as match_count,
          MIN(match_number) as min_match_num,
          MAX(match_number) as max_match_num
   FROM matches
   WHERE tournament_id = 'tdst-season-1'
   GROUP BY stage
   ORDER BY stage;
   ```

   **Expected Results:**
   - LEAGUE: 25 matches (1-25)
   - QF: 0 matches (none yet)
   - SEMI: 0 matches (none yet)
   - FINAL: 0 matches (none yet)

### Option 2: Using Supabase CLI

```bash
# Apply the migrations
npx supabase db push

# Or apply specific migration files
psql $DATABASE_URL -f supabase/migrations/20260222_update_stage_constraint.sql
psql $DATABASE_URL -f supabase/migrations/20260222_cleanup_duplicate_qf_matches.sql
```

## After the Fix

1. **Refresh your app** to load the updated code
2. Go to **Organizer → Playoffs**
3. Click **"Generate QFs"** - it should now work correctly!
4. Verify on **Schedule page** that matches 26-27 appear as Quarter-Finals, not League matches

## Understanding the Playoff Structure

**New Tournament Flow:**
```
25 League Matches (1-25)
    ↓
2 Quarter-Finals (26-27)
  - QF1: Teams ranked 5, 6, 11, 12
  - QF2: Teams ranked 7, 8, 9, 10
    ↓
2 Semi-Finals (28-29)
  - SF1: QF2 Top 2 + Overall Rank 1, 2
  - SF2: QF1 Top 2 + Overall Rank 3, 4
    ↓
1 Final (30)
  - Top 2 from each Semi-Final
```

## Verification Checklist

- [ ] Database constraint updated to support 'QF' stage
- [ ] Duplicate league matches deleted
- [ ] Only 25 league matches remain (match numbers 1-25)
- [ ] `createMatch` function updated to pass stage parameter
- [ ] Generate QFs button works correctly
- [ ] Matches 26-27 created with stage='QF' (not 'LEAGUE')
- [ ] Schedule page shows correct stage labels

## Troubleshooting

**If the button is still enabled after generating QFs:**
- Check that matches were created with `stage='QF'` (not 'LEAGUE')
- Run this query:
  ```sql
  SELECT match_number, stage FROM matches
  WHERE tournament_id = 'tdst-season-1' AND match_number >= 26
  ORDER BY match_number;
  ```

**If you see more than 25 league matches:**
- Run the cleanup migration again to delete duplicates

**If you get "Quarter-finals already exist" error:**
- Check if matches 26-27 exist with any stage
- Delete them manually if needed:
  ```sql
  DELETE FROM matches
  WHERE tournament_id = 'tdst-season-1' AND match_number IN (26, 27);
  ```
