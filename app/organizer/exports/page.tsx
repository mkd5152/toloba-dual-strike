"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Trophy,
  BarChart3,
  Download,
  FileSpreadsheet,
  FileJson
} from "lucide-react";
import Link from "next/link";

export default function ExportsPage() {
  const exportOptions = [
    {
      id: "team-sheet",
      title: "Team Roster Sheet",
      description: "Official team roster with player details",
      icon: FileText,
      color: "from-blue-500 to-cyan-600",
      href: "/organizer/exports/team-sheet",
      features: ["Player names & roles", "Team colors", "Official signatures"]
    },
    {
      id: "fixtures",
      title: "Fixture Schedule",
      description: "Complete match schedule with dates and venues",
      icon: Calendar,
      color: "from-purple-500 to-pink-600",
      href: "/organizer/exports/fixtures",
      features: ["Match timeline", "Court assignments", "Date & time details"]
    },
    {
      id: "fixtures-by-day",
      title: "Day-wise Fixtures",
      description: "Match schedule organized by day",
      icon: Calendar,
      color: "from-indigo-500 to-purple-600",
      href: "/organizer/exports/fixtures-by-day",
      features: ["Day-by-day view", "Court assignments", "Same format as fixtures"]
    },
    {
      id: "match-scorecard",
      title: "Match Scorecards",
      description: "Detailed scorecards for completed matches",
      icon: Trophy,
      color: "from-amber-500 to-orange-600",
      href: "/organizer/exports/scorecards",
      features: ["Ball-by-ball", "Rankings", "Player stats"]
    },
    {
      id: "standings",
      title: "Standings & Stats",
      description: "Tournament standings and performance statistics",
      icon: BarChart3,
      color: "from-emerald-500 to-green-600",
      href: "/organizer/exports/standings",
      features: ["Points table", "Team statistics", "Performance metrics"]
    },
    {
      id: "day-wise-standings",
      title: "Day-wise Standings",
      description: "Standings report for matches played on a specific day",
      icon: Trophy,
      color: "from-teal-500 to-cyan-600",
      href: "/organizer/exports/day-wise-standings",
      features: ["Day-by-day view", "Ranking by points", "Professional format"]
    },
    {
      id: "ball-by-ball",
      title: "Ball-by-Ball Data",
      description: "Export detailed ball-by-ball data (CSV)",
      icon: FileSpreadsheet,
      color: "from-red-500 to-rose-600",
      href: "/organizer/exports/ball-by-ball",
      features: ["CSV format", "Complete data", "Excel compatible"]
    },
    {
      id: "tournament-data",
      title: "Tournament Data (JSON)",
      description: "Complete tournament data for backup/analysis",
      icon: FileJson,
      color: "from-slate-500 to-gray-600",
      href: "/organizer/exports/tournament-data",
      features: ["Full backup", "API compatible", "Developer friendly"]
    }
  ];

  return (
    <div className="min-h-screen tournament-bg-pattern p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block px-4 py-2 mb-3 rounded-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-white">
            <p className="text-xs font-black tracking-widest">DOCUMENT CENTER</p>
          </div>
          <h1 className="text-4xl font-black text-white drop-shadow-lg">
            Exports & Documents
          </h1>
        </div>

        {/* Export Options Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card
                key={option.id}
                className="group hover:shadow-2xl transition-all duration-300 border-2 border-white/20 overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${option.color}`}></div>
                <CardHeader>
                  <div className="mb-3">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${option.color} shadow-lg group-hover:scale-110 transition-transform inline-block`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-black text-[#0d3944]">
                    {option.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 font-medium mt-2">
                    {option.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff9800]"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={option.href}>
                    <Button
                      className={`w-full bg-gradient-to-r ${option.color} text-white font-bold hover:opacity-90 transition-opacity`}
                    >
                      Generate Document
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
