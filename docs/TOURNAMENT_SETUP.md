# 🏏 Tournament Setup Guide

## Double Wicket Tournament Season 2 - Ramadan Edition 2026

This guide explains how to seed the database with the **EXACT** tournament structure from the Excel file.

---

## Tournament Structure

### 📊 Overview
- **20 Teams** (A through T) organized in 4 groups
- **28 Total Matches**: 25 league + 2 semi-finals + 1 final
- **4-Day Tournament**: Feb 26 - Mar 1, 2026 (3rd-6th Ramadan)
- **Each team plays 5 games** in the league stage

### 🏟️ Groups
- **Group 1**: A B C D E (Chennai Kings, Mumbai Warriors, Delhi Daredevils, Bangalore Royals, Kolkata Knights)
- **Group 2**: F G H I J (Hyderabad Tigers, Punjab Lions, Rajasthan Rangers, Gujarat Giants, Lucknow Legends)
- **Group 3**: K L M N O (Ahmedabad Aces, Jaipur Jaguars, Pune Panthers, Kochi Kings, Indore Indians)
- **Group 4**: P Q R S T (Nagpur Ninjas, Surat Strikers, Bhopal Blazers, Patna Patriots, Ranchi Riders)

### 📅 Schedule
- **Thursday, Feb 26** (8:30 PM - 11:30 PM): Opening ceremony + 6 league games
- **Friday, Feb 27** (8:00 PM - 11:00 PM): 8 league games
- **Saturday, Feb 28** (8:00 PM - 11:00 PM): 8 league games
- **Sunday, Mar 1** (8:00 PM - 11:00 PM): 3 league games + 2 semis + final + closing

### 🏆 Playoff Structure
1. **League Stage**: 25 matches across 5 rounds
2. **Semi-Finals**: Top 2 from each group (8 teams → 2 matches)
   - Semi 1: G1S1 vs G2S2 vs G3S1 vs G4S2
   - Semi 2: G1S2 vs G2S1 vs G3S2 vs G4S1
3. **Final**: Top 2 from each semi (4 teams in final match)

---

## 🚀 Setup Instructions

### Prerequisites
1. **Supabase Project** set up and running
2. **.env.local** file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. **PostgreSQL** client (`psql`) installed

### Step 1: Verify Environment
```bash
# Make sure .env.local exists with correct variables
cat .env.local
```

### Step 2: Run the Seed Script
```bash
# Execute the seeding script
./scripts/seed-tournament.sh
```

This will:
- ✅ Clear existing tournament data (if any)
- ✅ Insert tournament metadata
- ✅ Create 20 teams with colors
- ✅ Add 40 players (2 per team)
- ✅ Schedule all 28 matches with exact fixtures
- ✅ Verify the data integrity

### Step 3: Verify the Data
After seeding, you should see:
```
✅ Tournament data seeded successfully!

📋 Summary:
   • 20 Teams (A-T)
   • 40 Players (2 per team)
   • 28 Matches (25 league + 2 semis + 1 final)

🗓️  Schedule:
   • Feb 26 (Thu): 6 games + opening
   • Feb 27 (Fri): 8 games
   • Feb 28 (Sat): 8 games
   • Mar 1 (Sun): 3 games + semis + final + closing
```

---

## 🎯 Match Fixtures (League Stage)

### Round 1 (Games 1-5)
1. A – F – K – P
2. B – G – L – Q
3. C – H – M – R
4. D – I – N – S
5. E – J – O – T

### Round 2 (Games 6-10)
6. A – G – M – T
7. B – H – N – P
8. C – I – O – Q
9. D – J – K – R
10. E – F – L – S

### Round 3 (Games 11-15)
11. A – H – O – S
12. B – I – K – T
13. C – J – L – P
14. D – F – M – Q
15. E – G – N – R

### Round 4 (Games 16-20)
16. A – I – L – R
17. B – J – M – S
18. C – F – N – T
19. D – G – O – P
20. E – H – K – Q

### Round 5 (Games 21-25)
21. A – B – C – D (Group 1 final)
22. E – F – G – H (Group 2 final)
23. I – J – K – L (Group 3 final)
24. M – N – O – P (Group 4 final)
25. Q – R – S – T (Group 4 final cont.)

---

## 📝 Manual SQL Execution (Alternative)

If the script doesn't work, you can run the SQL directly:

```bash
# Connect to your Supabase database
psql "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# Run the seed file
\i supabase/seed-tournament-data.sql
```

---

## ✅ Verification Queries

After seeding, run these queries to verify:

```sql
-- Check team count (should be 20)
SELECT COUNT(*) FROM teams WHERE tournament_id = 'tdst-season-1';

-- Check player count (should be 40)
SELECT COUNT(*) FROM players
WHERE team_id IN (SELECT id FROM teams WHERE tournament_id = 'tdst-season-1');

-- Check match count (should be 28)
SELECT COUNT(*) FROM matches WHERE tournament_id = 'tdst-season-1';

-- Verify each team plays 5 games
SELECT
  t.name,
  COUNT(DISTINCT m.id) as games_played
FROM teams t
CROSS JOIN LATERAL unnest(ARRAY(
  SELECT id FROM matches
  WHERE tournament_id = 'tdst-season-1'
  AND match_number BETWEEN 1 AND 25
  AND t.id = ANY(team_ids)
)) AS m(id)
WHERE t.tournament_id = 'tdst-season-1'
GROUP BY t.id, t.name
ORDER BY t.name;
```

---

## 🔧 Troubleshooting

### Issue: `psql: command not found`
Install PostgreSQL client:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client
```

### Issue: Connection refused
- Verify your Supabase URL and service role key
- Check if your IP is allowed in Supabase settings
- Ensure you're using the correct project reference

### Issue: Permission denied
- Make sure you're using the **SERVICE_ROLE_KEY**, not the anon key
- The service role key bypasses RLS policies

---

## 📊 Database Schema

The seed file creates data in these tables:
- `tournaments` - Tournament metadata
- `teams` - 20 teams with colors
- `players` - 40 players (2 per team)
- `matches` - 28 matches with team assignments

All data uses the tournament ID: **`tdst-season-1`**

---

## 🎮 Using the App

After seeding:
1. Login as **organizer** to view all matches
2. Assign umpires to matches
3. Umpires can start scoring from their dashboard
4. Spectators can view live scores and standings

---

## 📞 Support

If you encounter issues:
1. Check the SQL file: `supabase/seed-tournament-data.sql`
2. Verify environment variables in `.env.local`
3. Review Supabase logs in the dashboard
4. Check console for any errors

Happy scoring! 🏏
