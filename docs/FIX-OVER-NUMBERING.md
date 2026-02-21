# Fix: Over Numbering Constraint Error

## Error You're Seeing:
```
new row for relation "overs" violates check constraint "overs_over_number_check"
```

## What Happened:
The app now uses cricket convention (overs 0, 1, 2) but the database still expects (overs 1, 2, 3).

## Quick Fix - Run This Migration:

### Option 1: Using psql
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres" -f supabase/migrations/20260211_fix_over_numbering.sql
```

### Option 2: Using Supabase Dashboard
1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy this SQL and paste:

```sql
-- Drop old constraints
ALTER TABLE public.overs DROP CONSTRAINT IF EXISTS overs_over_number_check;
ALTER TABLE public.innings DROP CONSTRAINT IF EXISTS innings_powerplay_over_check;

-- Update existing data BEFORE adding new constraints
UPDATE public.overs SET over_number = over_number - 1
  WHERE over_number > 0;

UPDATE public.innings SET powerplay_over = powerplay_over - 1
  WHERE powerplay_over IS NOT NULL AND powerplay_over > 0;

-- Add new constraints (0-2 instead of 1-3)
ALTER TABLE public.overs ADD CONSTRAINT overs_over_number_check
  CHECK (over_number BETWEEN 0 AND 2);

ALTER TABLE public.innings ADD CONSTRAINT innings_powerplay_over_check
  CHECK (powerplay_over IN (0, 1, 2));
```

4. Click **Run**

## What the Migration Does:
1. ✅ Drops old constraints
2. ✅ Shifts existing data down by 1 (1→0, 2→1, 3→2)
3. ✅ Adds new constraints: `BETWEEN 0 AND 2` for over_number, `IN (0, 1, 2)` for powerplay

## After Running Migration:
- Over numbering: **0.1, 0.2, 0.3** → **1.1, 1.2, 1.3** → **2.1, 2.2, 2.3**
- Powerplay buttons: **Over 0**, **Over 1**, **Over 2**

---

**Get Your Database URL:**
Supabase Dashboard → Settings → Database → Connection string (URI)
