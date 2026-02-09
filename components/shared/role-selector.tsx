"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Gavel, Eye } from "lucide-react";
import { TOURNAMENT_INFO } from "@/lib/constants";

export function RoleSelector() {
  const router = useRouter();

  const roles = [
    {
      id: "organizer",
      label: "Organizer",
      icon: Shield,
      description: "Manage teams, schedule, and tournament",
      path: "/organizer/dashboard",
    },
    {
      id: "umpire",
      label: "Umpire",
      icon: Gavel,
      description: "Score matches and manage gameplay",
      path: "/umpire/matches",
    },
    {
      id: "spectator",
      label: "Spectator",
      icon: Eye,
      description: "View live scores and standings",
      path: "/spectator/dashboard",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center tournament-bg-pattern relative overflow-hidden p-4">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#8b1538]/20 to-transparent clip-path-diagonal pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-[#ffb300]/10 to-transparent pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full badge-gold text-sm font-bold uppercase tracking-wide">
            {TOURNAMENT_INFO.ORGANIZER} presents
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white mb-3 tracking-tight drop-shadow-lg">
            <span className="block text-3xl md:text-4xl mb-1 opacity-90">DUAL STRIKE</span>
            <span className="tournament-gradient-text glow-text">TOURNAMENT</span>
          </h1>
          <div className="inline-block px-5 py-2 mb-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <p className="text-white/90 font-semibold text-lg">
              {new Date(TOURNAMENT_INFO.START_DATE).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {new Date(TOURNAMENT_INFO.END_DATE).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              <span className="text-[#ffb300]">•</span> {TOURNAMENT_INFO.START_TIME}
            </p>
          </div>
          <p className="text-xl md:text-2xl text-white/80 font-bold italic mb-6 drop-shadow">
            {TOURNAMENT_INFO.TAGLINE}
          </p>
          <p className="text-white/70 font-medium uppercase tracking-wider text-sm">
            Select your role to continue
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const gradients = [
              "from-[#b71c1c] to-[#c62828]", // Red for Organizer
              "from-[#0d3944] to-[#1a4a57]", // Teal for Umpire
              "from-[#ff9800] to-[#ffb300]", // Gold for Spectator
            ];
            return (
              <Card
                key={role.id}
                className="tournament-card hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden group border-0"
              >
                <CardHeader className="relative pb-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${gradients[index]} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-[#0d3944]">
                    {role.label}
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className={`w-full bg-gradient-to-r ${gradients[index]} text-white font-bold py-6 text-base hover:opacity-90 transition-opacity border-0 shadow-lg`}
                    onClick={() => router.push(role.path)}
                  >
                    Continue as {role.label}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
