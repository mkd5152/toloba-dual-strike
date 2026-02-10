import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🏏 Seeding TDST Season 1 Tournament Data...\n');

async function seedData() {
  try {
    // Step 1: Clear existing data
    console.log('🔄 Clearing existing data...');
    await supabase.from('balls').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('overs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('innings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('tournaments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Cleared existing data\n');

    // Step 2: Insert Tournament
    console.log('🔄 Creating tournament...');
    const { error: tournError } = await supabase.from('tournaments').insert({
      id: 'tdst-season-1',
      name: 'TDST – Season 1',
      full_name: 'Toloba Dual Strike Tournament – Season 1',
      organizer: 'Toloba',
      venue: 'TBD',
      start_date: '2026-02-26',
      end_date: '2026-03-01',
      start_time: '20:30',
      matches_per_team: 5,
      teams_per_match: 4,
      overs_per_innings: 3,
      tagline: 'Two players. One mission. Dual Strike. 👑',
      youtube_link: 'https://youtu.be/mMVo6wet-L0?si=vzLx1Dpw7Cl--jQM',
      registration_link: 'https://forms.gle/hvyjFPtwM96qyJBK7',
      contacts: ['Contact 1: Mustafa +971 56 736 9803', 'Contact 2: Huzefa +971 56 355 0605']
    });

    if (tournError) throw tournError;
    console.log('✅ Tournament created\n');

    // Step 3: Insert 20 Teams
    console.log('🔄 Creating 20 teams...');
    const teams = [
      { id: 'team-a', name: 'Team A', color: '#FF6B6B' },
      { id: 'team-b', name: 'Team B', color: '#4ECDC4' },
      { id: 'team-c', name: 'Team C', color: '#45B7D1' },
      { id: 'team-d', name: 'Team D', color: '#FFA07A' },
      { id: 'team-e', name: 'Team E', color: '#98D8C8' },
      { id: 'team-f', name: 'Team F', color: '#F7DC6F' },
      { id: 'team-g', name: 'Team G', color: '#BB8FCE' },
      { id: 'team-h', name: 'Team H', color: '#85C1E2' },
      { id: 'team-i', name: 'Team I', color: '#F8B739' },
      { id: 'team-j', name: 'Team J', color: '#52BE80' },
      { id: 'team-k', name: 'Team K', color: '#EC7063' },
      { id: 'team-l', name: 'Team L', color: '#AF7AC5' },
      { id: 'team-m', name: 'Team M', color: '#5DADE2' },
      { id: 'team-n', name: 'Team N', color: '#58D68D' },
      { id: 'team-o', name: 'Team O', color: '#F5B041' },
      { id: 'team-p', name: 'Team P', color: '#EB984E' },
      { id: 'team-q', name: 'Team Q', color: '#85929E' },
      { id: 'team-r', name: 'Team R', color: '#D98880' },
      { id: 'team-s', name: 'Team S', color: '#A569BD' },
      { id: 'team-t', name: 'Team T', color: '#7FB3D5' }
    ].map(t => ({ ...t, tournament_id: 'tdst-season-1' }));

    const { error: teamsError } = await supabase.from('teams').insert(teams);
    if (teamsError) throw teamsError;
    console.log('✅ 20 teams created\n');

    // Step 4: Insert 40 Players
    console.log('🔄 Creating 40 players...');
    const players = [];
    const teamLetters = 'abcdefghijklmnopqrst';
    for (let i = 0; i < 20; i++) {
      const letter = teamLetters[i];
      players.push(
        { id: `player-${letter}1`, team_id: `team-${letter}`, name: `Player ${letter.toUpperCase()}1`, role: 'batsman', is_late_arrival: false },
        { id: `player-${letter}2`, team_id: `team-${letter}`, name: `Player ${letter.toUpperCase()}2`, role: 'bowler', is_late_arrival: false }
      );
    }

    const { error: playersError } = await supabase.from('players').insert(players);
    if (playersError) throw playersError;
    console.log('✅ 40 players created\n');

    // Step 5: Insert 28 Matches
    console.log('🔄 Creating 28 matches...');

    const fixtures = [
      // Thursday Feb 26
      { num: 1, date: '2026-02-26', time: '20:50:00', teams: ['team-a', 'team-f', 'team-k', 'team-p'] },
      { num: 2, date: '2026-02-26', time: '21:25:00', teams: ['team-b', 'team-g', 'team-l', 'team-q'] },
      { num: 3, date: '2026-02-26', time: '22:00:00', teams: ['team-c', 'team-h', 'team-m', 'team-r'] },
      { num: 4, date: '2026-02-26', time: '22:35:00', teams: ['team-d', 'team-i', 'team-n', 'team-s'] },
      { num: 5, date: '2026-02-26', time: '23:10:00', teams: ['team-e', 'team-j', 'team-o', 'team-t'] },
      { num: 6, date: '2026-02-26', time: '23:45:00', teams: ['team-a', 'team-g', 'team-m', 'team-t'] },
      // Friday Feb 27
      { num: 7, date: '2026-02-27', time: '20:00:00', teams: ['team-b', 'team-h', 'team-n', 'team-p'] },
      { num: 8, date: '2026-02-27', time: '20:35:00', teams: ['team-c', 'team-i', 'team-o', 'team-q'] },
      { num: 9, date: '2026-02-27', time: '21:10:00', teams: ['team-d', 'team-j', 'team-k', 'team-r'] },
      { num: 10, date: '2026-02-27', time: '21:45:00', teams: ['team-e', 'team-f', 'team-l', 'team-s'] },
      { num: 11, date: '2026-02-27', time: '22:20:00', teams: ['team-a', 'team-h', 'team-o', 'team-s'] },
      { num: 12, date: '2026-02-27', time: '22:55:00', teams: ['team-b', 'team-i', 'team-k', 'team-t'] },
      { num: 13, date: '2026-02-27', time: '23:30:00', teams: ['team-c', 'team-j', 'team-l', 'team-p'] },
      { num: 14, date: '2026-02-28', time: '00:05:00', teams: ['team-d', 'team-f', 'team-m', 'team-q'] },
      // Saturday Feb 28
      { num: 15, date: '2026-02-28', time: '20:00:00', teams: ['team-e', 'team-g', 'team-n', 'team-r'] },
      { num: 16, date: '2026-02-28', time: '20:35:00', teams: ['team-a', 'team-i', 'team-l', 'team-r'] },
      { num: 17, date: '2026-02-28', time: '21:10:00', teams: ['team-b', 'team-j', 'team-m', 'team-s'] },
      { num: 18, date: '2026-02-28', time: '21:45:00', teams: ['team-c', 'team-f', 'team-n', 'team-t'] },
      { num: 19, date: '2026-02-28', time: '22:20:00', teams: ['team-d', 'team-g', 'team-o', 'team-p'] },
      { num: 20, date: '2026-02-28', time: '22:55:00', teams: ['team-e', 'team-h', 'team-k', 'team-q'] },
      { num: 21, date: '2026-02-28', time: '23:30:00', teams: ['team-a', 'team-b', 'team-c', 'team-d'] },
      { num: 22, date: '2026-03-01', time: '00:05:00', teams: ['team-e', 'team-f', 'team-g', 'team-h'] },
      // Sunday Mar 1
      { num: 23, date: '2026-03-01', time: '20:00:00', teams: ['team-i', 'team-j', 'team-k', 'team-l'] },
      { num: 24, date: '2026-03-01', time: '20:35:00', teams: ['team-m', 'team-n', 'team-o', 'team-p'] },
      { num: 25, date: '2026-03-01', time: '21:10:00', teams: ['team-q', 'team-r', 'team-s', 'team-t'] },
      // Semis & Final
      { num: 26, date: '2026-03-01', time: '21:55:00', teams: ['team-a', 'team-f', 'team-k', 'team-p'] },
      { num: 27, date: '2026-03-01', time: '22:30:00', teams: ['team-b', 'team-g', 'team-l', 'team-q'] },
      { num: 28, date: '2026-03-01', time: '23:05:00', teams: ['team-a', 'team-b', 'team-f', 'team-g'] }
    ];

    const matches = fixtures.map(f => ({
      id: `match-${f.num}`,
      tournament_id: 'tdst-season-1',
      match_number: f.num,
      court: 'Court 1',
      start_time: `${f.date} ${f.time}+00`,
      team_ids: f.teams,
      state: 'CREATED',
      batting_order: f.teams
    }));

    const { error: matchesError } = await supabase.from('matches').insert(matches);
    if (matchesError) throw matchesError;
    console.log('✅ 28 matches created\n');

    // Verification
    console.log('🔍 Verifying data...');
    const { count: teamCount } = await supabase.from('teams').select('*', { count: 'exact', head: true });
    const { count: playerCount } = await supabase.from('players').select('*', { count: 'exact', head: true });
    const { count: matchCount } = await supabase.from('matches').select('*', { count: 'exact', head: true });

    console.log('\n✅ Tournament data seeded successfully!\n');
    console.log('📋 Summary:');
    console.log(`   • ${teamCount} Teams (A-T)`);
    console.log(`   • ${playerCount} Players (2 per team)`);
    console.log(`   • ${matchCount} Matches (25 league + 2 semis + 1 final)`);
    console.log('');
    console.log('🗓️  Schedule:');
    console.log('   • Feb 26 (Thu): 6 games + opening');
    console.log('   • Feb 27 (Fri): 8 games');
    console.log('   • Feb 28 (Sat): 8 games');
    console.log('   • Mar 1 (Sun): 3 games + semis + final + closing');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
