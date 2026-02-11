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
3. Copy contents from `supabase/migrations/20260211_fix_over_numbering.sql`
4. Paste and click **Run**

## What the Migration Does:
1. ✅ Updates over_number constraint: `BETWEEN 1 AND 3` → `BETWEEN 0 AND 2`
2. ✅ Updates powerplay_over constraint: `IN (1, 2, 3)` → `IN (0, 1, 2)`
3. ✅ Shifts any existing data down by 1 (1→0, 2→1, 3→2)

## After Running Migration:
- Over numbering: **0.1, 0.2, 0.3** → **1.1, 1.2, 1.3** → **2.1, 2.2, 2.3**
- Powerplay buttons: **Over 0**, **Over 1**, **Over 2**

---

**Get Your Database URL:**
Supabase Dashboard → Settings → Database → Connection string (URI)
