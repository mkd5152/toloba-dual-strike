# 🗄️ Database Setup Required

## ⚠️ Getting This Error?

```
Error: Could not find the 'bowling_team_id' column of 'innings' in the schema cache
```

**Your database needs to be migrated!**

## 🚀 Quick Fix (2 Commands)

```bash
# 1. Run migrations (adds missing columns)
psql $DATABASE_URL -f scripts/run-all-migrations.sql

# 2. Load tournament data (teams, players, matches)
psql $DATABASE_URL -f scripts/init-tournament-data.sql
```

**Get your `DATABASE_URL`:**
- Supabase Dashboard → Settings → Database → Connection string (URI)

---

## 📚 Detailed Guide

See **[scripts/QUICK-START.md](scripts/QUICK-START.md)** for:
- Step-by-step instructions
- Alternative methods (Supabase Dashboard)
- Troubleshooting
- Verification queries

---

## What Gets Set Up

✅ Database schema updates (stage, group, bowling_team_id columns)  
✅ 20 teams in 4 groups  
✅ 80 players (4 per team)  
✅ 20 pre-scheduled league matches  

**Then you're ready to start scoring!** 🏏
