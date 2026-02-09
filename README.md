# TDST Dual Strike Tournament Scoring App

A real-time tournament scoring application built with Next.js 15, Supabase, and TypeScript for managing dual-strike cricket tournaments.

## Features

### ✅ Implemented
- **Authentication & Authorization**
  - Email/password authentication via Supabase
  - Role-based access control (Organizer, Umpire, Spectator)
  - Protected routes with middleware
  - Automatic role-based redirects

- **Organizer Dashboard**
  - Tournament overview with statistics
  - Team management
  - Match scheduling
  - Umpire assignment to matches
  - Score override capability for completed matches
  - Tournament bracket visualization

- **Umpire Interface**
  - View assigned matches only
  - Real-time match scoring
  - Ball-by-ball recording with runs, wickets, extras
  - Powerplay tracking
  - Over and innings management

- **Spectator Features**
  - Live match updates with animations
  - Live events ticker with auto-refresh
  - Tournament standings/leaderboard
  - Match results and rankings
  - Tournament bracket view with podium

### 🚧 In Progress
- Real-time subscriptions via Supabase Realtime
- Data persistence layer (API abstraction)
- Player substitution management
- Export/reporting features (CSV, JSON, PDF)

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/dual-strike-scoring.git
cd dual-strike-scoring
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations:

Execute the SQL files in `supabase/migrations/` in your Supabase SQL editor:
- `20260209_initial_schema.sql` - Database schema
- `20260209_rls_policies.sql` - Row-level security policies
- `auto_create_profile.sql` - Profile auto-creation trigger

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── auth/           # Authentication pages (login, signup, callback)
│   ├── organizer/      # Organizer dashboard and features
│   ├── umpire/         # Umpire scoring interface
│   └── spectator/      # Public spectator views
├── components/
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── organizer/      # Organizer-specific components
│   ├── umpire/         # Umpire-specific components
│   └── spectator/      # Spectator-specific components
├── lib/
│   ├── stores/         # Zustand state management
│   ├── supabase/       # Supabase client configuration
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── supabase/
│   └── migrations/     # Database migrations
└── middleware.ts       # Next.js middleware for auth
```

## User Roles

### Organizer (Admin)
- Full access to all features
- Can create teams and schedule matches
- Can assign umpires to matches
- Can override scores
- Access via: `/organizer/*`

### Umpire
- Can score assigned matches
- Ball-by-ball recording
- Manage overs and innings
- Access via: `/umpire/*`

### Spectator (Default)
- View live matches
- See tournament standings
- View match results and bracket
- Access via: `/spectator/*`

## Database Schema

Key tables:
- `profiles` - User profiles with roles
- `tournaments` - Tournament metadata
- `teams` - Team information
- `players` - Player details with roles
- `matches` - Match state and assignments
- `innings` - Innings data
- `overs` - Over details
- `balls` - Ball-by-ball scoring

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

Add these in your Vercel/hosting dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development Roadmap

- [x] Phase 1: Authentication & Authorization
- [ ] Phase 2: Data Layer & API Abstraction
- [ ] Phase 3: Real-time Updates
- [ ] Phase 4: Dynamic Team Creation
- [ ] Phase 5: Player Substitution
- [ ] Phase 6: Export/Reporting

## Contributing

This is a private project. For issues or feature requests, please contact the repository owner.

## License

Private - All rights reserved
