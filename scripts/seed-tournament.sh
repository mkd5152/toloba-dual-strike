#!/bin/bash

# Seed Tournament Data Script
# Run this to populate the database with the exact tournament structure

echo "🏏 Seeding TDST Season 1 Tournament Data..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.local | xargs)

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing required environment variables"
    echo "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    exit 1
fi

# Extract project ref from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\/\([^.]*\).*/\1/')

echo "📊 Project: $PROJECT_REF"
echo ""

# Run the SQL file
echo "🔄 Executing SQL seed file..."
psql "postgresql://postgres:$SUPABASE_SERVICE_ROLE_KEY@db.$PROJECT_REF.supabase.co:5432/postgres" -f supabase/seed-tournament-data.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Tournament data seeded successfully!"
    echo ""
    echo "📋 Summary:"
    echo "   • 20 Teams (A-T)"
    echo "   • 40 Players (2 per team)"
    echo "   • 28 Matches (25 league + 2 semis + 1 final)"
    echo ""
    echo "🗓️  Schedule:"
    echo "   • Feb 26 (Thu): 6 games + opening"
    echo "   • Feb 27 (Fri): 8 games"
    echo "   • Feb 28 (Sat): 8 games"
    echo "   • Mar 1 (Sun): 3 games + semis + final + closing"
    echo ""
else
    echo ""
    echo "❌ Error seeding tournament data"
    exit 1
fi
