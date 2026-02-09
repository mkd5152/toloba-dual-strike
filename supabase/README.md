# Supabase Setup Guide

This guide will help you set up the Supabase backend for the Dual Strike Tournament app.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Install Supabase CLI (optional, for local development):
   ```bash
   npm install -g supabase
   ```

## Step 1: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: TDST Season 1 (or any name you prefer)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (1-2 minutes)

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (for admin operations, also starts with `eyJ...`)

## Step 3: Set Environment Variables

1. In your project root, create a `.env.local` file (if it doesn't exist)
2. Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:** Never commit `.env.local` to version control!

## Step 4: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `migrations/20260209_initial_schema.sql`
5. Paste and click **Run**
6. Repeat for `migrations/20260209_rls_policies.sql`

### Option B: Using Supabase CLI

```bash
# Link your local project to Supabase
supabase link --project-ref your-project-ref

# Push migrations to Supabase
supabase db push
```

## Step 5: Verify Database Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see the following tables:
   - profiles
   - tournaments
   - teams
   - players
   - matches
   - innings
   - overs
   - balls
   - player_substitutions

3. Check that the default tournament exists:
   - Go to **tournaments** table
   - You should see "TDST – Season 1" with id `tdst-season-1`

## Step 6: Enable Realtime (Optional but Recommended)

1. Go to **Database** → **Replication**
2. Enable replication for the following tables:
   - `balls` (for live scoring)
   - `innings` (for live innings updates)
   - `matches` (for match state changes)
3. Click **Save**

## Step 7: Configure Auth Settings

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add your development URL:
   - For local: `http://localhost:3000`
   - For production: Your deployed URL
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - Your production callback URL
4. Disable email confirmation for development (optional):
   - Go to **Email Auth** tab
   - Uncheck "Enable email confirmations"

## Step 8: Test the Setup

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/signup`

3. Create a test user with role "organizer"

4. Check Supabase dashboard:
   - Go to **Authentication** → **Users**
   - You should see your new user
   - Go to **Table Editor** → **profiles**
   - You should see the profile with the correct role

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env.local` exists in your project root
- Verify that variable names match exactly (including `NEXT_PUBLIC_` prefix)
- Restart your dev server after adding environment variables

### Error: "Invalid API key"
- Double-check that you copied the correct keys from Supabase dashboard
- Make sure there are no extra spaces or line breaks in the keys

### Error: "Row Level Security policy violation"
- Check that RLS policies were applied correctly
- Go to **Table Editor** → select a table → **Policies** tab
- Each table should have policies listed

### Can't sign up users
- Check that Auth is enabled in **Authentication** → **Settings**
- Verify that email confirmations are disabled for development

## Next Steps

Once your Supabase setup is complete:

1. ✅ Authentication should work (login/signup)
2. ✅ Protected routes should block unauthorized access
3. ✅ Data will persist across page refreshes
4. ⏳ Next: Implement API layer to connect Zustand stores to Supabase
5. ⏳ Then: Add real-time subscriptions for live scoring

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
