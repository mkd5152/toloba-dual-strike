"use client";

import { useEffect } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { TeamCard } from "@/components/organizer/team-card";
import { AddTeamDialog } from "@/components/organizer/add-team-dialog";

export default function TeamsPage() {
  const { teams, initializeDummyData, removeTeam, addTeam } =
    useTournamentStore();

  useEffect(() => {
    if (teams.length === 0) {
      initializeDummyData();
    }
  }, [teams.length, initializeDummyData]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-block px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white text-xs font-bold uppercase tracking-wide">
            Tournament Roster
          </div>
          <h1 className="text-4xl font-black text-white drop-shadow-lg">Teams</h1>
        </div>
        <AddTeamDialog onAdd={addTeam} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} onRemove={removeTeam} />
        ))}
      </div>
    </div>
  );
}
