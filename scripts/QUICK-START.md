# 🚀 QUICK START GUIDE

## The Error You're Seeing

```
Error: Could not find the 'bowling_team_id' column of 'innings' in the schema cache
```

**This means your database schema is outdated!** You need to run migrations first.

---

## ✅ Fix It Now (3 Steps)

### Step 1: Run Migrations

```bash
# Get your database URL from Supabase Dashboard
# Settings > Database > Connection string (URI format)

# Run all migrations
psql "postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres" -f scripts/run-all-migrations.sql
```

### Step 2: Load Initial Data

```bash
# This creates 20 teams, 80 players, 20 matches
psql "postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres" -f scripts/init-tournament-data.sql
```

### Step 3: Start Scoring!

1. Login to **Organizer Portal**
2. Go to **Matches** page
3. Assign umpires to matches
4. Umpires can now start scoring!

---

## 🔧 Alternative: Run via Supabase Dashboard

If you don't have `psql` installed:

### 1. Run Migrations
1. Open Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy contents of `scripts/run-all-migrations.sql`
4. Paste and click **Run**

### 2. Load Data
1. Same SQL Editor
2. Copy contents of `scripts/init-tournament-data.sql`
3. Paste and click **Run**

---

## 📋 What Gets Created

### Migrations Add:
- ✅ `stage` column to matches (LEAGUE/SEMI/FINAL)
- ✅ `group` column to teams (1-4)
- ✅ `bowling_team_id` column to innings

### Initial Data Includes:
- 🏆 1 Tournament (TDST Season 1)
- 👥 20 Teams (4 groups of 5)
- 🏏 80 Players (4 per team)
- 📅 20 League Matches (pre-scheduled)

---

## ⚠️ Important Notes

### Before Running:
- This will **delete all existing tournament data**
- User accounts are **safe** (not deleted)
- Make a backup if you have data to keep

### Database Connection:
Your connection string looks like:
```
postgresql://postgres:YOUR_PASSWORD@abc123xyz.supabase.co:5432/postgres
```

Get it from:
1. Supabase Dashboard
2. Settings → Database
3. Connection string → URI

---

## 🆘 Troubleshooting

### "psql: command not found"
Install PostgreSQL client or use Supabase Dashboard method.

### "permission denied"
Make sure you're using the correct database password (not your Supabase project password).

### Still getting the error?
1. Refresh your browser (clear cache)
2. Check Supabase Dashboard → SQL Editor → Run:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'innings';
   ```
   You should see `bowling_team_id` in the list.

---

## 🎯 Quick Command Reference

```bash
# 1. Run migrations (REQUIRED)
psql $DATABASE_URL -f scripts/run-all-migrations.sql

# 2. Load initial data (RECOMMENDED)
psql $DATABASE_URL -f scripts/init-tournament-data.sql

# 3. Verify data loaded
psql $DATABASE_URL -c "SELECT COUNT(*) FROM teams;"
# Should return: 20

psql $DATABASE_URL -c "SELECT COUNT(*) FROM matches;"
# Should return: 20
```

---

**Need more help?** Check `scripts/README-DATA-SETUP.md` for detailed documentation.
