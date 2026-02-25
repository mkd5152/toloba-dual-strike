"use client";

import { useEffect } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { TeamCard } from "@/components/organizer/team-card";

export default function TeamsPage() {
  const { teams, loadTeams, loadingTeams } = useTournamentStore();

  // Fetch data every time component mounts
  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sort teams by ID (team-1, team-2, etc.) for proper numeric ordering
  const sortedTeams = [...teams].sort((a, b) => {
    // Extract numeric part from team IDs (e.g., "team-1" -> 1, "team-10" -> 10)
    const numA = parseInt(a.id.split('-')[1] || '0');
    const numB = parseInt(b.id.split('-')[1] || '0');
    return numA - numB;
  });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <div className="inline-block px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white text-xs font-bold uppercase tracking-wide">
          Tournament Roster
        </div>
        <h1 className="text-4xl font-black text-white drop-shadow-lg">Teams</h1>
        <p className="text-white/70 text-sm mt-2">Teams are managed via database</p>
      </div>

      {loadingTeams && teams.length === 0 ? (
        <div className="text-center text-white/70 py-12">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="text-center text-white/70 py-12">
          No teams yet. Add teams via database.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
