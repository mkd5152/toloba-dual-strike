"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Match } from "@/lib/types";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { formatDubaiTime } from "@/lib/utils/date-utils";
import { Trophy, Clock, CheckCircle2, Circle } from "lucide-react";

interface ScheduleTimelineProps {
  matches: Match[];
  showCompleted?: boolean;
}

export function ScheduleTimeline({ matches, showCompleted = true }: ScheduleTimelineProps) {
  const { getTeam } = useTournamentStore();

  // Group matches by date
  const matchesByDate = useMemo(() => {
    const grouped = new Map<string, Match[]>();

    matches.forEach((match) => {
      const dateKey = formatDubaiTime(match.startTime, "EEEE, MMM d"); // "Thursday, Feb 26"
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(match);
    });

    // Sort matches within each date by startTime
    grouped.forEach((matchList) => {
      matchList.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    });

    return grouped;
  }, [matches]);

  // Convert to array and sort by date
  const sortedDates = Array.from(matchesByDate.entries()).sort((a, b) => {
    const firstMatchA = a[1][0];
    const firstMatchB = b[1][0];
    return firstMatchA.startTime.getTime() - firstMatchB.startTime.getTime();
  });

  const getMatchStateInfo = (match: Match) => {
    switch (match.state) {
      case "IN_PROGRESS":
        return {
          badge: "LIVE",
          badgeClass: "bg-[#b71c1c] text-white animate-pulse",
          icon: <div className="w-2 h-2 bg-[#b71c1c] rounded-full animate-ping" />,
        };
      case "COMPLETED":
      case "LOCKED":
        return {
          badge: "COMPLETED",
          badgeClass: "bg-green-600 text-white",
          icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
        };
      case "READY":
      case "TOSS":
        return {
          badge: "READY",
          badgeClass: "bg-yellow-500 text-[#0d3944]",
          icon: <Clock className="w-4 h-4 text-yellow-500" />,
        };
      default:
        return {
          badge: "UPCOMING",
          badgeClass: "bg-gray-500 text-white",
          icon: <Circle className="w-4 h-4 text-gray-400" />,
        };
    }
  };

  const getRankingForTeam = (match: Match, teamId: string) => {
    return match.rankings.find((r) => r.teamId === teamId);
  };

  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <p className="text-white/70 font-medium">No matches scheduled yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedDates.map(([date, dateMatches]) => (
        <div key={date}>
          {/* Date Header */}
          <div className="mb-4 flex items-center gap-4">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] text-sm font-black uppercase tracking-wide shadow-lg">
              {date}
            </div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-[#ff9800]/50 to-transparent" />
          </div>

          {/* Matches for this date */}
          <div className="space-y-4">
            {dateMatches.map((match) => {
              const teams = match.teamIds.map((id) => getTeam(id)).filter(Boolean);
              const stateInfo = getMatchStateInfo(match);
              const isCompleted = match.state === "COMPLETED" || match.state === "LOCKED";
              const isLive = match.state === "IN_PROGRESS";

              if (!showCompleted && isCompleted) return null;

              return (
                <Card
                  key={match.id}
                  className={`overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                    isLive
                      ? "border-2 border-[#b71c1c] shadow-2xl shadow-[#b71c1c]/20"
                      : "border-2 border-[#0d3944]/20 shadow-lg"
                  }`}
                >
                  {/* Match Header */}
                  <div
                    className={`px-4 py-2 flex items-center justify-between ${
                      isLive
                        ? "bg-gradient-to-r from-[#b71c1c] to-[#c62828]"
                        : "bg-gradient-to-r from-[#0d3944] to-[#1a4a57]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-white/30 font-bold"
                      >
                        Match #{match.matchNumber}
                      </Badge>
                      <Badge className={`font-bold ${stateInfo.badgeClass}`}>
                        {stateInfo.badge}
                      </Badge>
                      <div className="flex items-center gap-2 text-white/80 text-sm">
                        <span className="font-semibold">{match.court}</span>
                        <span>•</span>
                        <span>{formatDubaiTime(match.startTime, "h:mm a")}</span>
                      </div>
                    </div>
                    {match.stage && match.stage !== "LEAGUE" && (
                      <Badge className="bg-yellow-500 text-[#0d3944] font-black">
                        {match.stage}
                      </Badge>
                    )}
                  </div>

                  {/* Teams Display */}
                  <div className="p-4">
                    <div className="space-y-2">
                      {teams.map((team, idx) => {
                        if (!team) return null;
                        const ranking = getRankingForTeam(match, team.id);
                        const isWinner =
                          isCompleted &&
                          ranking &&
                          match.rankings[0]?.teamId === team.id;

                        return (
                          <div
                            key={team.id}
                            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                              isWinner
                                ? "bg-gradient-to-r from-yellow-100 to-amber-50 border-2 border-yellow-500"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {/* Team Color Indicator */}
                              <div
                                className="w-1 h-12 rounded-full"
                                style={{ backgroundColor: team.color }}
                              />

                              {/* Team Name */}
                              <div className="flex-1">
                                <p
                                  className={`font-black ${
                                    isWinner ? "text-[#0d3944] text-lg" : "text-[#0d3944]"
                                  }`}
                                >
                                  {team.name}
                                  {isWinner && (
                                    <Trophy className="inline-block w-5 h-5 ml-2 text-yellow-600" />
                                  )}
                                </p>
                                {ranking && (
                                  <p className="text-xs text-gray-500 font-semibold">
                                    Position: {idx + 1}
                                  </p>
                                )}
                              </div>

                              {/* Score */}
                              {isCompleted && ranking && (
                                <div className="text-right">
                                  <p
                                    className={`font-black ${
                                      isWinner
                                        ? "text-3xl text-[#0d3944]"
                                        : "text-2xl text-gray-700"
                                    }`}
                                  >
                                    {ranking.totalScore || ranking.totalRuns}
                                  </p>
                                  <p className="text-xs text-gray-500 font-semibold">
                                    {ranking.points} pts
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Live indicator for in-progress matches */}
                    {isLive && (
                      <div className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-[#b71c1c]/10 rounded-lg">
                        <div className="w-2 h-2 bg-[#b71c1c] rounded-full animate-pulse" />
                        <span className="text-[#b71c1c] font-bold text-sm uppercase">
                          Match in Progress
                        </span>
                      </div>
                    )}

                    {/* Upcoming match info */}
                    {!isCompleted && !isLive && (
                      <div className="mt-3 text-center py-2 bg-gray-100 rounded-lg">
                        <p className="text-gray-600 text-sm font-semibold">
                          Scheduled for {formatDubaiTime(match.startTime, "h:mm a")}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
