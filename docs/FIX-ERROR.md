# Fix: bowling_team_id Column Missing

## Quick Fix - Run This Command:

**Using psql:**
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres" -f scripts/fix-bowling-column.sql
```

**OR Using Supabase Dashboard:**

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy and paste this:

```sql
-- Add missing bowling_team_id column
ALTER TABLE innings
ADD COLUMN IF NOT EXISTS bowling_team_id TEXT;

-- Add foreign key
ALTER TABLE innings
ADD CONSTRAINT innings_bowling_team_id_fkey
FOREIGN KEY (bowling_team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_innings_bowling_team_id ON innings(bowling_team_id);
```

4. Click **Run**
5. Refresh your browser
6. Error should be gone!

---

## Get Your Database URL:

Supabase Dashboard → Settings → Database → Connection string (URI)

It looks like:
```
postgresql://postgres:YOUR_PASSWORD@abc123xyz.supabase.co:5432/postgres
```
