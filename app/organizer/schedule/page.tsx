"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { MatchScheduleTable } from "@/components/organizer/match-schedule-table";
import { Trophy, Zap, Target, Award } from "lucide-react";
import type { MatchStage, Match } from "@/lib/types";
import { fetchMatches } from "@/lib/api/matches";
import { fetchTeams } from "@/lib/api/teams";
import { fetchPlayersByTeams } from "@/lib/api/players";

export default function SchedulePage() {
  const { tournament } = useTournamentStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [selectedStages, setSelectedStages] = useState<MatchStage[]>([]);

  // Fetch data directly from API every time component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingMatches(true);

        // Fetch matches and teams directly from API (no race conditions)
        const [matchesData, teamsData] = await Promise.all([
          fetchMatches(tournament.id),
          fetchTeams(tournament.id)
        ]);

        // Fetch players for all teams (same logic as store)
        const teamIds = teamsData.map(t => t.id);
        if (teamIds.length > 0) {
          const playersByTeam = await fetchPlayersByTeams(teamIds);

          // Attach players to teams
          teamsData.forEach(team => {
            team.players = playersByTeam[team.id] || [];
          });
        }

        setMatches(matchesData);

        // Also update the store so MatchScheduleTable can access teams via getTeam()
        useTournamentStore.setState({ teams: teamsData });

        setLoadingMatches(false);
      } catch (err) {
        console.error('Error loading schedule data:', err);
        setLoadingMatches(false);
      }
    };

    loadData();
  }, [tournament.id]);

  const toggleStage = (stage: MatchStage) => {
    setSelectedStages(prev =>
      prev.includes(stage)
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    );
  };

  const filteredMatches = selectedStages.length === 0
    ? matches
    : matches.filter(m => selectedStages.includes(m.stage));

  const stageFilters = [
    {
      stage: "LEAGUE" as MatchStage,
      label: "League",
      icon: Trophy,
      color: "from-[#ff9800] to-[#ffb300]",
      textColor: "text-[#0d3944]",
      ringColor: "ring-[#ff9800]",
      count: matches.filter(m => m.stage === "LEAGUE").length
    },
    {
      stage: "QF" as MatchStage,
      label: "QF",
      icon: Zap,
      color: "from-purple-500 to-pink-600",
      textColor: "text-white",
      ringColor: "ring-purple-500",
      count: matches.filter(m => m.stage === "QF").length
    },
    {
      stage: "SEMI" as MatchStage,
      label: "SF",
      icon: Target,
      color: "from-orange-500 to-red-600",
      textColor: "text-white",
      ringColor: "ring-orange-500",
      count: matches.filter(m => m.stage === "SEMI").length
    },
    {
      stage: "FINAL" as MatchStage,
      label: "Final",
      icon: Award,
      color: "from-amber-500 to-yellow-600",
      textColor: "text-white",
      ringColor: "ring-amber-500",
      count: matches.filter(m => m.stage === "FINAL").length
    },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <div className="inline-block px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] text-xs font-bold uppercase tracking-wide">
          Tournament Calendar
        </div>
        <h1 className="text-4xl font-black text-white drop-shadow-lg">Match Schedule</h1>
      </div>

      {/* Stage Filters */}
      {matches.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {stageFilters.map(({ stage, label, icon: Icon, color, textColor, ringColor, count }) => {
            const isSelected = selectedStages.includes(stage);
            return (
              <button
                key={stage}
                onClick={() => toggleStage(stage)}
                className={`
                  group relative px-4 py-2 rounded-lg font-bold text-sm
                  transition-all duration-200 ease-out
                  ${isSelected
                    ? `bg-gradient-to-r ${color} ${textColor} ring-2 ${ringColor} scale-105 shadow-lg`
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:scale-105'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isSelected ? '' : 'opacity-60 group-hover:opacity-100'}`} />
                  <span>{label}</span>
                  {count > 0 && (
                    <span className={`
                      ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black
                      ${isSelected
                        ? 'bg-white/30'
                        : 'bg-white/10 group-hover:bg-white/20'
                      }
                    `}>
                      {count}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0d3944] animate-pulse" />
                )}
              </button>
            );
          })}
          {selectedStages.length > 0 && (
            <button
              onClick={() => setSelectedStages([])}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {matches.length === 0 ? (
        loadingMatches ? (
          <div className="text-center text-white/70 py-12">Loading matches...</div>
        ) : (
          <div className="text-center text-white/70 py-12">
            No matches scheduled yet. Create some teams first!
          </div>
        )
      ) : (
        <Card className="border-2 border-[#0d3944]/10 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#0d3944] to-[#1a4a57] text-white">
            <CardTitle className="text-xl font-black flex items-center justify-between">
              <span>
                {selectedStages.length > 0
                  ? `${stageFilters.filter(f => selectedStages.includes(f.stage)).map(f => f.label).join(', ')} Matches`
                  : 'All Matches'
                }
              </span>
              <span className="text-sm font-normal opacity-70">
                {filteredMatches.length} of {matches.length}
                {loadingMatches && ' (updating...)'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <MatchScheduleTable matches={filteredMatches} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
