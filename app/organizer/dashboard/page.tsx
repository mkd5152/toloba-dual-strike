"use client";

import { useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { CreateUmpireDialog } from "@/components/organizer/create-umpire-dialog";
import { Users, Calendar, Trophy, CheckCircle } from "lucide-react";

export default function OrganizerDashboard() {
  const { tournament, teams, matches, loadTeams, loadMatches, loading } = useTournamentStore();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      const loadData = async () => {
        await loadTeams();
        await loadMatches();
      };
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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

          {/* Recent Activity */}
          {matches.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {/* Upcoming Matches */}
              <Card className="border-2 border-white/10">
                <CardHeader>
                  <CardTitle className="text-[#0d3944]">Upcoming Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  {matches
                    .filter((m) => m.state === "CREATED" || m.state === "READY" || m.state === "TOSS")
                    .slice(0, 5)
                    .map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between py-3 border-b last:border-b-0"
                      >
                        <div>
                          <p className="font-bold text-[#0d3944]">
                            Match {match.matchNumber}
                          </p>
                          <p className="text-sm text-gray-600">{match.court}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {match.startTime.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {match.startTime.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  {matches.filter((m) => m.state === "CREATED" || m.state === "READY" || m.state === "TOSS")
                    .length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No upcoming matches
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Completed Matches */}
              <Card className="border-2 border-white/10">
                <CardHeader>
                  <CardTitle className="text-[#0d3944]">Recent Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  {matches
                    .filter((m) => m.state === "COMPLETED" || m.state === "LOCKED")
                    .slice(-5)
                    .reverse()
                    .map((match) => {
                      const winner = match.rankings[0];
                      const winnerTeam = teams.find((t) => t.id === winner?.teamId);
                      return (
                        <div
                          key={match.id}
                          className="flex items-center justify-between py-3 border-b last:border-b-0"
                        >
                          <div>
                            <p className="font-bold text-[#0d3944]">
                              Match {match.matchNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              {winnerTeam?.name || "TBD"}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold">
                              {winner?.totalRuns} runs
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {matches.filter((m) => m.state === "COMPLETED" || m.state === "LOCKED")
                    .length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No completed matches yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
