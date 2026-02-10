# 🏆 Playoff System Documentation

## Overview
The tournament now supports a **group-based playoff system** with **fresh scoring** at each stage:
- **League Stage**: 25 matches, teams accumulate points
- **Semifinals**: Fresh scoring, top 2 from each group qualify (8 teams → 2 semis)
- **Finals**: Fresh scoring, top 2 from each semi advance (4 teams)

---

## Group Structure

### 20 Teams Divided into 4 Groups

| Group | Teams |
|-------|-------|
| **Group 1** | Team A, Team B, Team C, Team D, Team E |
| **Group 2** | Team F, Team G, Team H, Team I, Team J |
| **Group 3** | Team K, Team L, Team M, Team N, Team O |
| **Group 4** | Team P, Team Q, Team R, Team S, Team T |

Each team plays 5 matches in the league stage.

---

## Tournament Flow

### Stage 1: League (Matches 1-25)
- **25 matches** across 4 days
- Teams accumulate points:
  - **5 points** for 1st place
  - **3 points** for 2nd place
  - **1 point** for 3rd place
  - **0 points** for 4th place
- **Rankings within each group** determine qualification

### Stage 2: Semifinals (Matches 26-27)
- **2 semi-final matches** with 4 teams each
- **Fresh scoring** - previous league points don't carry over
- **Qualification**:
  - **Semi 1**: G1-1st, G2-2nd, G3-1st, G4-2nd
  - **Semi 2**: G1-2nd, G2-1st, G3-2nd, G4-1st
- Top 2 teams from each semi advance to finals

### Stage 3: Final (Match 28)
- **1 final match** with 4 teams
- **Fresh scoring** - previous semi scores don't carry over
- **Finalists**: Top 2 from Semi 1 + Top 2 from Semi 2

---

## How Qualification Works

### League → Semifinals
```typescript
import { getQualifiedTeamsForSemis } from '@/lib/api/qualification'

const qualified = await getQualifiedTeamsForSemis('tdst-season-1')
// Returns:
// {
//   group1: [Team A, Team B],  // Top 2 from Group 1
//   group2: [Team F, Team G],  // Top 2 from Group 2
//   group3: [Team K, Team L],  // Top 2 from Group 3
//   group4: [Team P, Team Q]   // Top 2 from Group 4
// }
```

**Tiebreaker Rules**:
1. **Points** (descending)
2. **Total Runs** (descending)
3. **Team Name** (alphabetical)

### Semifinals → Finals
```typescript
import { getQualifiedTeamsForFinal } from '@/lib/api/qualification'

const finalists = await getQualifiedTeamsForFinal('tdst-season-1')
// Returns:
// {
//   semi1: [Team A, Team K],  // Top 2 from Semi 1
//   semi2: [Team B, Team F]   // Top 2 from Semi 2
// }
```

---

## Database Schema Changes

### Teams Table
```sql
ALTER TABLE teams ADD COLUMN "group" INTEGER;

-- Groups assigned:
-- Group 1: team-a, team-b, team-c, team-d, team-e
-- Group 2: team-f, team-g, team-h, team-i, team-j
-- Group 3: team-k, team-l, team-m, team-n, team-o
-- Group 4: team-p, team-q, team-r, team-s, team-t
```

### Matches Table
```sql
ALTER TABLE matches ADD COLUMN stage TEXT DEFAULT 'LEAGUE';

-- Stages:
-- 'LEAGUE' - Matches 1-25
-- 'SEMI'   - Matches 26-27
-- 'FINAL'  - Match 28
```

---

## API Usage

### Get League Standings by Group
```typescript
import { getQualifiedTeamsForSemis } from '@/lib/api/qualification'

// Automatically calculates top 2 from each group based on league matches
const qualified = await getQualifiedTeamsForSemis(tournamentId)

console.log(qualified.group1) // Top 2 from Group 1
```

### Get Standings for Specific Stage
```typescript
import { getStandingsByStage } from '@/lib/api/qualification'

// Only counts matches from specified stage
const leagueStandings = await getStandingsByStage(tournamentId, 'LEAGUE')
const semiStandings = await getStandingsByStage(tournamentId, 'SEMI')
const finalStandings = await getStandingsByStage(tournamentId, 'FINAL')
```

---

## Match Stage Examples

### League Match
```typescript
{
  id: 'match-1',
  matchNumber: 1,
  stage: 'LEAGUE',  // ← Stage field
  teamIds: ['team-a', 'team-f', 'team-k', 'team-p'],
  state: 'COMPLETED',
  rankings: [
    { teamId: 'team-a', rank: 1, points: 5, totalRuns: 45 },
    { teamId: 'team-f', rank: 2, points: 3, totalRuns: 38 },
    // ...
  ]
}
```

### Semifinal Match
```typescript
{
  id: 'match-26',
  matchNumber: 26,
  stage: 'SEMI',  // ← Fresh scoring starts here
  teamIds: ['team-a', 'team-g', 'team-k', 'team-q'],  // G1-1st, G2-2nd, G3-1st, G4-2nd
  state: 'CREATED',
  rankings: []  // Empty until match is completed
}
```

### Final Match
```typescript
{
  id: 'match-28',
  matchNumber: 28,
  stage: 'FINAL',  // ← Fresh scoring again
  teamIds: ['team-a', 'team-b', 'team-f', 'team-g'],  // Top 2 from each semi
  state: 'CREATED',
  rankings: []
}
```

---

## Frontend Integration

### Display League Standings by Group
```typescript
const { group1, group2, group3, group4 } = await getQualifiedTeamsForSemis(tournamentId)

// Show top 2 qualified teams from each group
<div>
  <h3>Group 1 - Qualified</h3>
  {group1.map(team => <TeamCard key={team.teamId} team={team} />)}
</div>
```

### Display Stage-Specific Standings
```typescript
const currentStage = match.stage // 'LEAGUE', 'SEMI', or 'FINAL'
const standings = await getStandingsByStage(tournamentId, currentStage)

// Only shows standings from current stage
<StandingsTable standings={standings} stage={currentStage} />
```

---

## Migration Applied

The database has been updated with:
✅ Group assignments for all 20 teams
✅ Stage labels for all 28 matches
✅ Migration file: `supabase/migrations/20260210_add_groups_and_stages.sql`

To re-run migration:
```bash
npx tsx -e "..." # (SQL execution script)
```

---

## Key Points

1. **Scoring resets at each stage** - League points don't carry to semis, semi points don't carry to finals
2. **Groups only matter for league stage** - Determines who qualifies for semis
3. **Tiebreakers**: Points → Total Runs → Alphabetical
4. **API automatically handles qualification logic** - No manual team selection needed

---

## Testing Checklist

- [ ] Complete 25 league matches
- [ ] Verify top 2 teams from each group are correctly identified
- [ ] Start semi-final matches with fresh scoring
- [ ] Complete semi-finals and verify top 2 from each advance
- [ ] Start final with fresh scoring
- [ ] Complete final and declare champion

---

## Future Enhancements

Potential features to add:
- **Automated match setup**: Auto-populate semi/final teams based on qualification
- **Bracket visualization**: Show playoff tree
- **Historical comparison**: Compare league vs playoff performance
- **Group stage dashboard**: Show group standings during league stage

---

Happy scoring! 🏏
