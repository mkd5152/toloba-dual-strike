"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

interface TournamentStatsProps {
  stats: StatItem[];
}

export function TournamentStats({ stats }: TournamentStatsProps) {
  const gradients = [
    "from-[#0d3944] to-[#1a4a57]", // Teal
    "from-[#b71c1c] to-[#c62828]", // Red
    "from-[#ff9800] to-[#ffb300]", // Gold
    "from-[#8b1538] to-[#b71c1c]", // Dark Red
  ];

  return (
    <div className="grid md:grid-cols-4 gap-6 relative z-10">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all hover:scale-105 overflow-hidden group"
          >
            <CardContent className="pt-6 pb-6 relative">
              {/* Background gradient overlay */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradients[index]} opacity-5 rounded-bl-full`}
              />

              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-black text-[#0d3944]">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${gradients[index]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
