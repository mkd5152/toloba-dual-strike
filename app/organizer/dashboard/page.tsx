"use client";

import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { CreateUmpireDialog } from "@/components/organizer/create-umpire-dialog";
import { Users, Calendar, Trophy, CheckCircle } from "lucide-react";

export default function OrganizerDashboard() {
  const { tournament, teams, matches, loadTeams, loadMatches, loading } = useTournamentStore();

  useEffect(() => {
    // Load data from database
    loadTeams();
    loadMatches();
  }, [loadTeams, loadMatches]);

  const completedMatches = matches.filter(
    (m) => m.state === "COMPLETED" || m.state === "LOCKED"
  ).length;

  const stats = [
    {
      label: "Teams",
      value: teams.length,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Total Matches",
      value: matches.length,
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      label: "Completed",
      value: completedMatches,
      icon: CheckCircle,
      color: "bg-purple-500",
    },
    {
      label: "Tournament",
      value: tournament.name,
      icon: Trophy,
      color: "bg-yellow-500",
      isText: true,
    },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-block px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white text-xs font-bold uppercase tracking-wide">
            Organizer Dashboard
          </div>
          <h1 className="text-4xl font-black text-white drop-shadow-lg">
            {tournament.name}
          </h1>
          <p className="text-white/80 mt-2">{tournament.tagline}</p>
        </div>
        <CreateUmpireDialog />
      </div>

      {loading ? (
        <div className="text-center text-white/70 py-12">Loading dashboard...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-2 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-bold">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-black text-[#0d3944] mt-1">
                        {stat.isText ? stat.value : stat.value}
                      </p>
                    </div>
                    <div
                      className={`${stat.color} p-3 rounded-lg shadow-lg`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Info */}
          {teams.length === 0 && (
            <Card className="border-2 border-yellow-400 bg-yellow-50 mt-8">
              <CardHeader>
                <CardTitle className="text-yellow-800">Get Started</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700">
                  No teams yet! Go to the <strong>Teams</strong> page to add your first team.
                </p>
              </CardContent>
            </Card>
          )}

          {teams.length > 0 && matches.length === 0 && (
            <Card className="border-2 border-blue-400 bg-blue-50 mt-8">
              <CardHeader>
                <CardTitle className="text-blue-800">Next Step</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700">
                  You have {teams.length} teams! Go to the <strong>Schedule</strong> page to create matches.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
