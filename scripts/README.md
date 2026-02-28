# Admin Scripts

This folder contains administrative scripts for managing the tournament.

## Reset Match Script

Completely resets a match by deleting all data and returning it to CREATED state.

### What it does:
- Deletes all balls from all overs
- Deletes all overs from all innings
- Deletes all innings
- Resets match state to `CREATED`
- Clears batting order (allows you to re-select teams)
- Clears rankings

### Usage:

**Option 1: Using npm script (recommended)**
```bash
npm run reset-match <match-number>
```

**Option 2: Using tsx directly**
```bash
npx tsx scripts/reset-match.ts <match-number>
```

### Examples:

```bash
# Reset Match 11
npm run reset-match 11

# Reset Match 15
npm run reset-match 15

# Reset Match 1
npm run reset-match 1
```

### After Reset:

After resetting a match, you can:
1. Go to the umpire scoring interface
2. Select the batting order (toss)
3. Start scoring from scratch

The match will be in `CREATED` state, which means it's ready for batting order selection.

### Requirements:

- `.env.local` file must exist with valid Supabase credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Safety:

This script uses the Supabase service role key to bypass Row Level Security (RLS) policies. Use with caution as it permanently deletes data.
