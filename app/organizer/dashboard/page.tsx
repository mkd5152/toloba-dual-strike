"use client";

import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { TournamentStats } from "@/components/organizer/tournament-stats";
import { CreateUmpireDialog } from "@/components/organizer/create-umpire-dialog";
import { Users, Calendar, Trophy, CheckCircle } from "lucide-react";

export default function OrganizerDashboard() {
  const { tournament, teams, matches, initializeDummyData } = useTournamentStore();

  useEffect(() => {
    if (teams.length === 0) {
      initializeDummyData();
    }
  }, [teams.length, initializeDummyData]);

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
      label: "Remaining",
      value: matches.length - completedMatches,
      icon: Trophy,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="p-4 md:p-8 relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-64 bg-gradient-to-l from-[#b71c1c]/20 to-transparent pointer-events-none rounded-bl-[100px]" />

      <div className="mb-8 relative z-10">
        <div className="inline-block px-4 py-1.5 mb-3 rounded-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] shadow-lg">
          <p className="text-[#0d3944] font-black text-sm uppercase tracking-wide">
            Tournament Dashboard
          </p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
          {tournament.name}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border-2 border-white/20">
            <Calendar className="w-4 h-4 text-[#ffb300]" />
            <p className="text-white font-bold text-sm">
              {tournament.startDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}{" "}
              -{" "}
              {tournament.endDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-[#b71c1c] to-[#c62828] rounded-lg shadow-lg border-2 border-white/10">
            <p className="text-white font-bold text-sm">
              Starting {tournament.startTime}
            </p>
          </div>
        </div>
        {tournament.tagline && (
          <p className="text-lg text-white/80 font-bold italic mt-3 drop-shadow">
            {tournament.tagline}
          </p>
        )}
      </div>

      <TournamentStats stats={stats} />

      {/* Quick Actions */}
      <div className="mt-8 flex justify-end">
        <CreateUmpireDialog />
      </div>

      <Card className="mt-8 border-2 border-[#0d3944]/10 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#0d3944] to-[#1a4a57] text-white">
          <CardTitle className="flex items-center gap-2 text-xl font-black">
            <Trophy className="w-5 h-5 text-[#ffb300]" />
            Upcoming Matches
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {matches.slice(0, 5).map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-[#b71c1c] transition-colors bg-white shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#ff9800] to-[#ffb300] rounded-lg flex items-center justify-center font-black text-[#0d3944] shadow">
                    {match.matchNumber}
                  </div>
                  <div>
                    <span className="font-bold text-[#0d3944]">
                      Match {match.matchNumber}
                    </span>
                    <span className="text-gray-500 ml-2 font-medium">
                      {match.court}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`font-bold uppercase tracking-wide ${
                    match.state === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : match.state === "IN_PROGRESS"
                        ? "bg-[#ffb300] text-[#0d3944]"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {match.state}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
