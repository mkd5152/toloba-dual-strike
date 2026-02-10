# Quick Fix: Add Groups and Stages to Database

The `group` and `stage` columns need to be added to your Supabase database.

## Option 1: Via Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **+ New Query**
4. Copy and paste this SQL:

```sql
-- Add group column to teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS "group" INTEGER;

-- Add stage column to matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'LEAGUE';

-- Assign groups to teams
UPDATE teams SET "group" = 1 WHERE id IN ('team-a', 'team-b', 'team-c', 'team-d', 'team-e');
UPDATE teams SET "group" = 2 WHERE id IN ('team-f', 'team-g', 'team-h', 'team-i', 'team-j');
UPDATE teams SET "group" = 3 WHERE id IN ('team-k', 'team-l', 'team-m', 'team-n', 'team-o');
UPDATE teams SET "group" = 4 WHERE id IN ('team-p', 'team-q', 'team-r', 'team-s', 'team-t');

-- Assign stages to matches
UPDATE matches SET stage = 'LEAGUE' WHERE match_number BETWEEN 1 AND 25;
UPDATE matches SET stage = 'SEMI' WHERE match_number BETWEEN 26 AND 27;
UPDATE matches SET stage = 'FINAL' WHERE match_number = 28;
```

5. Click **Run** or press **Ctrl+Enter** (Cmd+Enter on Mac)
6. You should see "Success. No rows returned"

## Option 2: Via psql (If you have it installed)

```bash
# Run the migration SQL file
psql "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" \
  -f supabase/migrations/20260210_add_groups_and_stages.sql
```

## Verify It Worked

Run this in your browser after refreshing:

```bash
# In your terminal
npx tsx scripts/check-groups.ts
```

You should see all teams with their groups assigned!

## Then Refresh Your App

After running the SQL:
1. **Refresh your browser** (Ctrl+R or Cmd+R)
2. Go to **Spectator → Groups**
3. You'll see the group standings!

---

**Need help?** The migration file is at: `supabase/migrations/20260210_add_groups_and_stages.sql`
