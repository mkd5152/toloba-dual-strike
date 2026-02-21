# 🏏 Dual Strike Game Format - User Story

## Overview
4 teams play together in a single match. Each team gets to bat for 3 overs while the other 3 teams bowl/field.

---

## Game Structure

### Total: 12 Overs Per Match
- Each team bats: **3 overs**
- Each team bowls: **3 overs** (1 over to each of the other 3 teams)
- **4 innings** total (one per team)

---

## Match Flow

### Before Match Starts
1. **Toss/Chit System**
   - 4 teams: A, B, C, D
   - Draw chits to determine batting order
   - Example result: B → D → A → C

### Innings Breakdown

#### **Innings 1: Team B Bats (Overs 1-3)**
```
Over 1: Team B bats  |  Team A bowls  |  Team A wicket-keeps
Over 2: Team B bats  |  Team C bowls  |  Team C wicket-keeps
Over 3: Team B bats  |  Team D bowls  |  Team D wicket-keeps

Runs scored by Team B = Total for Innings 1
```

#### **Innings 2: Team D Bats (Overs 4-6)**
```
Over 4: Team D bats  |  Team B bowls  |  Team B wicket-keeps
Over 5: Team D bats  |  Team A bowls  |  Team A wicket-keeps
Over 6: Team D bats  |  Team C bowls  |  Team C wicket-keeps

Runs scored by Team D = Total for Innings 2
```

#### **Innings 3: Team A Bats (Overs 7-9)**
```
Over 7: Team A bats  |  Team B bowls  |  Team B wicket-keeps
Over 8: Team A bats  |  Team C bowls  |  Team C wicket-keeps
Over 9: Team A bats  |  Team D bowls  |  Team D wicket-keeps

Runs scored by Team A = Total for Innings 3
```

#### **Innings 4: Team C Bats (Overs 10-12)**
```
Over 10: Team C bats  |  Team B bowls  |  Team B wicket-keeps
Over 11: Team C bats  |  Team D bowls  |  Team D wicket-keeps
Over 12: Team C bats  |  Team A bowls  |  Team A wicket-keeps

Runs scored by Team C = Total for Innings 4
```

---

## Key Rules

### Batting
- **2 players** from batting team are at the crease
- Each team bats for **exactly 3 overs** (their innings)
- 6 balls per over (unless extras)

### Bowling/Fielding
- Each of the **3 non-batting teams** bowls **1 over each**
- **Bowler** and **Wicket-keeper** must be from the **same team**
- No team bowls consecutive overs

### Rotation Pattern
For each innings:
- Batting team plays all 3 overs
- Other 3 teams rotate bowling (one over each)

---

## Scoring Flow (Umpire Perspective)

### Step 1: Match Setup
```
Input:
- 4 team IDs: [team-a, team-b, team-c, team-d]
- Batting order (from toss): [team-b, team-d, team-a, team-c]

Output:
- Match created with 4 innings
- Each innings has 3 overs
- Bowler/keeper teams pre-assigned
```

### Step 2: Start Innings 1
```
Batting Team: Team B
Select 2 batsmen from Team B

Over 1:
- Bowling Team: Team A
- Select bowler from Team A
- Select wicket-keeper from Team A
- Record 6 balls

Over 2:
- Bowling Team: Team C
- Select bowler from Team C
- Select wicket-keeper from Team C
- Record 6 balls

Over 3:
- Bowling Team: Team D
- Select bowler from Team D
- Select wicket-keeper from Team D
- Record 6 balls

Innings 1 Complete → Calculate Team B's total
```

### Step 3: Repeat for Innings 2, 3, 4
Same process for remaining teams in batting order.

### Step 4: Match Complete
Rank teams by total runs:
1. 1st place: 5 points
2. 2nd place: 3 points
3. 3rd place: 1 point
4. 4th place: 0 points

---

## Example Match Scorecard

### Match 1: Teams A, B, C, D
**Batting Order (from toss):** B → D → A → C

#### Innings 1: Team B Batting
| Over | Bowler (Team) | Keeper (Team) | Runs | Wickets |
|------|---------------|---------------|------|---------|
| 1    | A1 (Team A)   | A2 (Team A)   | 12   | 0       |
| 2    | C1 (Team C)   | C2 (Team C)   | 8    | 1       |
| 3    | D1 (Team D)   | D2 (Team D)   | 15   | 0       |
| **Total** |           |               | **35** | **1** |

#### Innings 2: Team D Batting
| Over | Bowler (Team) | Keeper (Team) | Runs | Wickets |
|------|---------------|---------------|------|---------|
| 4    | B1 (Team B)   | B2 (Team B)   | 10   | 1       |
| 5    | A1 (Team A)   | A2 (Team A)   | 14   | 0       |
| 6    | C1 (Team C)   | C2 (Team C)   | 9    | 1       |
| **Total** |           |               | **33** | **2** |

#### Innings 3: Team A Batting
| Over | Bowler (Team) | Keeper (Team) | Runs | Wickets |
|------|---------------|---------------|------|---------|
| 7    | B1 (Team B)   | B2 (Team B)   | 18   | 0       |
| 8    | C1 (Team C)   | C2 (Team C)   | 11   | 0       |
| 9    | D1 (Team D)   | D2 (Team D)   | 13   | 1       |
| **Total** |           |               | **42** | **1** |

#### Innings 4: Team C Batting
| Over | Bowler (Team) | Keeper (Team) | Runs | Wickets |
|------|---------------|---------------|------|---------|
| 10   | B1 (Team B)   | B2 (Team B)   | 7    | 2       |
| 11   | D1 (Team D)   | D2 (Team D)   | 10   | 0       |
| 12   | A1 (Team A)   | A2 (Team A)   | 12   | 0       |
| **Total** |           |               | **29** | **2** |

### Final Rankings
1. **Team A**: 42 runs → **5 points** 🥇
2. **Team B**: 35 runs → **3 points** 🥈
3. **Team D**: 33 runs → **1 point** 🥉
4. **Team C**: 29 runs → **0 points**

---

## User Interface Flow

### 1. Match Start Page
```
┌─────────────────────────────────────┐
│  Match 1 - LEAGUE                   │
│  Court 1 | Feb 26, 20:50           │
├─────────────────────────────────────┤
│  Teams: A, B, C, D                  │
│                                     │
│  [Start Match]                      │
└─────────────────────────────────────┘
```

### 2. Toss/Batting Order
```
┌─────────────────────────────────────┐
│  Set Batting Order                  │
├─────────────────────────────────────┤
│  Drag to reorder:                   │
│  1. [Team B] 🟢 (First to bat)     │
│  2. [Team D]                        │
│  3. [Team A]                        │
│  4. [Team C] (Last to bat)          │
│                                     │
│  [Confirm & Start Innings 1]        │
└─────────────────────────────────────┘
```

### 3. Innings Setup
```
┌─────────────────────────────────────┐
│  Innings 1 - Team B Batting         │
├─────────────────────────────────────┤
│  Select 2 Batsmen from Team B:      │
│  [✓] B1 - Player Name               │
│  [✓] B2 - Player Name               │
│                                     │
│  [Start Over 1]                     │
└─────────────────────────────────────┘
```

### 4. Over Setup
```
┌─────────────────────────────────────┐
│  Over 1 - Team B Batting            │
├─────────────────────────────────────┤
│  Bowling Team: Team A               │
│                                     │
│  Select Bowler: [A1 ▼]             │
│  Select Keeper:  [A2 ▼]             │
│                                     │
│  [Start Bowling]                    │
└─────────────────────────────────────┘
```

### 5. Ball Scoring
```
┌─────────────────────────────────────┐
│  Over 1, Ball 3                     │
│  Batting: Team B | Bowling: Team A  │
├─────────────────────────────────────┤
│  Runs:                              │
│  [0] [1] [2] [3] [4] [6]           │
│                                     │
│  Extras:                            │
│  [Wicket] [No Ball] [Wide]         │
│                                     │
│  Ball Log: 4, 1, _                 │
│  Score: 5/0 (2.0 overs)            │
└─────────────────────────────────────┘
```

---

## Data Structure Changes Needed

### Current (WRONG):
```typescript
// 3 overs per innings, all bowled by same team
innings: {
  teamId: 'team-a',
  overs: [
    { overNumber: 1, bowlerId: 'b1', keeperId: 'b2' }, // Team B
    { overNumber: 2, bowlerId: 'b1', keeperId: 'b2' }, // Team B
    { overNumber: 3, bowlerId: 'b1', keeperId: 'b2' }, // Team B
  ]
}
```

### New (CORRECT):
```typescript
// 3 overs per innings, each bowled by DIFFERENT team
innings: {
  teamId: 'team-a', // Batting team
  overs: [
    {
      overNumber: 1,
      bowlingTeamId: 'team-b', // Different team
      bowlerId: 'b1',
      keeperId: 'b2'
    },
    {
      overNumber: 2,
      bowlingTeamId: 'team-c', // Different team
      bowlerId: 'c1',
      keeperId: 'c2'
    },
    {
      overNumber: 3,
      bowlingTeamId: 'team-d', // Different team
      bowlerId: 'd1',
      keeperId: 'd2'
    },
  ]
}
```

---

## Questions to Confirm

1. ✅ Each team bats for exactly 3 overs?
2. ✅ Each of the 3 non-batting teams bowls 1 over each during an innings?
3. ✅ Bowler and wicket-keeper must be from the same team?
4. ❓ Can the same player bowl in multiple innings?
5. ❓ Powerplay rules still apply? (One over per team, 2x runs)
6. ❓ Bonus for no wickets lost?
7. ❓ How are teams ranked if scores are tied?

---

## Implementation Plan

### Phase 1: Data Model Changes
- [ ] Update `Innings` type to track batting team only
- [ ] Update `Over` type to include `bowlingTeamId`
- [ ] Create bowling rotation calculator
- [ ] Update match initialization

### Phase 2: UI Changes
- [ ] Create batting order selector (toss page)
- [ ] Update innings header to show batting vs bowling teams
- [ ] Add bowler/keeper selector (must be from correct team)
- [ ] Fix scoring panel logic

### Phase 3: Validation
- [ ] Ensure bowler/keeper are from bowling team
- [ ] Ensure correct team is bowling for each over
- [ ] Prevent same team bowling consecutive overs

### Phase 4: Testing
- [ ] Score a complete match (all 12 overs)
- [ ] Verify rankings calculation
- [ ] Test with actual tournament data

---

**Is this correct? Should I proceed with implementation?**
