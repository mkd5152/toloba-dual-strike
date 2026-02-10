# Tournament Data Setup Guide

This guide will help you initialize the tournament with all teams, players, and matches.

## 📋 What Gets Created

The initialization script will create:

- **1 Tournament**: TDST Season 1
- **20 Teams**: Divided into 4 groups (5 teams per group)
- **80 Players**: 4 players per team (roles: batsman, bowler, all-rounder, wicket-keeper)
- **20 League Matches**: 5 matches per group, scheduled across 4 days

### Team Structure

**Group 1:**
- Thunder Strikers
- Lightning Bolts
- Fire Dragons
- Storm Chasers
- Royal Warriors

**Group 2:**
- Eagle Hunters
- Blazing Comets
- Ocean Titans
- Golden Panthers
- Shadow Ninjas

**Group 3:**
- Viper Squad
- Crimson Knights
- Ice Breakers
- Phoenix Rising
- Mountain Lions

**Group 4:**
- Tornado Force
- Jungle Cats
- Steel Wolves
- Sunset Spartans
- Mystic Legends

## 🚀 Quick Start

### Method 1: Using psql (Recommended - Fastest)

```bash
# Get your database URL from Supabase dashboard
# Settings > Database > Connection string (URI)

# Run the SQL file directly
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres" -f scripts/init-tournament-data.sql
```

### Method 2: Using Supabase Dashboard

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `scripts/init-tournament-data.sql`
5. Paste into the editor
6. Click **Run**

### Method 3: Using TypeScript script

```bash
# Ensure you have tsx installed
npm install -D tsx

# Run the loader script
npx tsx scripts/load-initial-data.ts
```

## ⚠️ Important Notes

### Before Running

1. **Backup your data** if you have any existing data you want to keep
2. This script will **DELETE ALL existing tournament data**:
   - All matches, innings, overs, balls
   - All teams and players
   - All tournaments

3. User accounts (profiles table) are **NOT deleted** - your umpire and organizer accounts remain safe

### After Running

1. **Login to Organizer Portal**
   - Use your existing organizer account
   - You'll see all 20 teams and 20 scheduled matches

2. **Assign Umpires**
   - Go to "Matches" page
   - Assign umpires to each match

3. **Start Scoring**
   - Umpires login to their portal
   - Select their assigned match
   - Start scoring!

## 📝 Customization

### To Modify Teams

Edit `scripts/init-tournament-data.sql`:

```sql
-- Around line 50, modify team names and colors
INSERT INTO teams (id, tournament_id, name, color, "group", created_at, updated_at) VALUES
  ('team-g1-01', 'tdst-season-1', 'YOUR TEAM NAME', '#YOUR_COLOR', 1, NOW(), NOW()),
```

### To Add More Players

```sql
-- Around line 140, add more player records
INSERT INTO players (id, team_id, name, role, is_late_arrival, created_at, updated_at) VALUES
  ('player-g1-01-05', 'team-g1-01', 'New Player Name', 'batsman', false, NOW(), NOW()),
```

### To Change Match Schedule

```sql
-- Around line 290, modify match times and courts
INSERT INTO matches (...) VALUES
  ('match-g1-01', 'tdst-season-1', 1, 'Court A', '2024-12-01 09:00:00', ...),
```

## 🔍 Verification Queries

After loading data, verify with these queries in SQL Editor:

```sql
-- Check total teams by group
SELECT "group", COUNT(*) as team_count
FROM teams
WHERE tournament_id = 'tdst-season-1'
GROUP BY "group"
ORDER BY "group";

-- Check total players
SELECT COUNT(*) as total_players
FROM players p
JOIN teams t ON p.team_id = t.id
WHERE t.tournament_id = 'tdst-season-1';

-- Check matches by stage
SELECT stage, COUNT(*) as match_count
FROM matches
WHERE tournament_id = 'tdst-season-1'
GROUP BY stage;

-- List all teams with player counts
SELECT
  t.name,
  t."group",
  COUNT(p.id) as player_count
FROM teams t
LEFT JOIN players p ON t.id = p.team_id
WHERE t.tournament_id = 'tdst-season-1'
GROUP BY t.id, t.name, t."group"
ORDER BY t."group", t.name;
```

## 🎯 Tournament Flow

1. **League Stage** (20 matches)
   - Each group plays 5 matches
   - Top 2 teams from each group qualify for semis

2. **Semi-Finals** (2 matches - Create manually after league)
   - Semi 1: G1-1st, G2-2nd, G3-1st, G4-2nd
   - Semi 2: G1-2nd, G2-1st, G3-2nd, G4-1st

3. **Final** (1 match - Create manually after semis)
   - Top 2 teams from each semi-final

## 🆘 Troubleshooting

### "permission denied" error

Make sure you're using the **service role key** (not anon key) in your `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### "relation does not exist" error

Make sure you've run all migrations first:

```bash
# Run the stage and group columns migration
npx tsx scripts/add-stage-and-group-columns.ts
```

### Script hangs or times out

Use Method 1 (psql) instead - it's faster and more reliable for bulk operations.

## 📚 Additional Scripts

- `add-stage-and-group-columns.ts` - Adds missing database columns
- `migrate-bowling-rotation.ts` - Migrates bowling rotation data
- `clear-match-batting-order.ts` - Clears batting order for a match

---

**Need help?** Check the main project README or create an issue on GitHub.
