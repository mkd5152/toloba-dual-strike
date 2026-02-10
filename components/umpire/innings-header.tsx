"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMatchStore } from "@/lib/stores/match-store";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchPlayersByTeams } from "@/lib/api/players";
import type { Player } from "@/lib/types";

export function InningsHeader() {
  const { currentMatch, currentInningsIndex } = useMatchStore();
  const { getTeam } = useTournamentStore();

  // CRITICAL: ALL HOOKS MUST BE AT THE TOP, BEFORE ANY CONDITIONAL RETURNS
  const [players, setPlayers] = useState<Record<string, Player[]>>({});

  // Fetch players for all teams
  useEffect(() => {
    const loadPlayers = async () => {
      if (currentMatch?.teamIds) {
        const playersData = await fetchPlayersByTeams(currentMatch.teamIds);
        setPlayers(playersData);
      }
    };
    loadPlayers();
  }, [currentMatch?.teamIds]);

  // NOW do conditional checks after all hooks
  if (!currentMatch || !currentMatch.innings || currentMatch.innings.length === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <p className="text-muted-foreground text-sm sm:text-base">No innings data available</p>
      </Card>
    );
  }

  const currentInnings = currentMatch.innings[currentInningsIndex];

  // Check if match has ended (all 4 innings complete)
  if (!currentInnings) {
    return (
      <Card className="p-4 sm:p-6 border-2 border-green-600 bg-green-50">
        <div className="text-center">
          <h3 className="text-2xl font-black text-green-700 mb-2">🏆 MATCH COMPLETE!</h3>
          <p className="text-green-600 font-medium">All 4 innings have been completed.</p>
          <p className="text-sm text-green-600 mt-2">Check standings to see final rankings.</p>
        </div>
      </Card>
    );
  }

  const battingTeam = getTeam(currentInnings.teamId);

  // Find current over (first over with less than 6 balls)
  const overIndex = currentInnings.overs.findIndex((o) => o.balls.length < 6);
  const currentOver = overIndex >= 0 ? currentInnings.overs[overIndex] : currentInnings.overs[currentInnings.overs.length - 1];
  const overNum = overIndex >= 0 ? overIndex + 1 : currentInnings.overs.length;
  const ballInOver = currentOver?.balls?.length ?? 0;

  // Get bowling team for current over
  const bowlingTeam = currentOver ? getTeam(currentOver.bowlingTeamId) : null;

  // Calculate total overs in match (innings number * 3)
  const totalOverInMatch = currentInningsIndex * 3 + overNum;

  const isPowerplay = currentOver?.isPowerplay ?? false;

  // Get player names
  const battingPairIds = currentInnings.battingPair;
  const bowlerId = currentOver?.bowlerId;
  const keeperId = currentOver?.keeperId;

  const getPlayerName = (playerId: string | undefined): string => {
    if (!playerId) return "—";
    for (const teamId of Object.keys(players)) {
      const player = players[teamId]?.find(p => p.id === playerId);
      if (player) return player.name;
    }
    return "—";
  };

  const batter1Name = getPlayerName(battingPairIds?.[0]);
  const batter2Name = getPlayerName(battingPairIds?.[1]);
  const bowlerName = getPlayerName(bowlerId);
  const keeperName = getPlayerName(keeperId);

  return (
    <Card className="p-3 sm:p-4 md:p-6 border-2 border-[#0d3944]/20 shadow-lg bg-gradient-to-br from-white to-gray-50">
      {/* Innings Info */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <Badge className="bg-[#0d3944] text-white font-bold px-2 py-1 text-xs sm:px-3 sm:text-sm">
          Innings {currentInningsIndex + 1} of 4
        </Badge>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Match Over</p>
          <p className="text-sm font-bold text-[#0d3944]">{totalOverInMatch} of 12</p>
        </div>
      </div>

      {/* Batting vs Bowling Teams */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Batting</p>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
              style={{ backgroundColor: battingTeam?.color ?? "#ccc" }}
            />
            <p className="text-base sm:text-lg md:text-xl font-black text-[#0d3944] truncate">{battingTeam?.name ?? "—"}</p>
          </div>
          <div className="pl-7 sm:pl-8 space-y-1">
            <p className="text-xs sm:text-sm text-gray-700">🏏 {batter1Name}</p>
            <p className="text-xs sm:text-sm text-gray-700">🏏 {batter2Name}</p>
          </div>
        </div>

        <ArrowRight className="hidden sm:block w-6 h-6 md:w-8 md:h-8 text-[#ff9800] flex-shrink-0" />
        <div className="block sm:hidden h-px bg-gray-300 my-1" />

        <div className="flex-1 sm:text-right">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Bowling (Over {overNum})</p>
          <div className="flex items-center gap-2 sm:justify-end mb-2">
            <div
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 sm:order-2"
              style={{ backgroundColor: bowlingTeam?.color ?? "#ccc" }}
            />
            <p className="text-base sm:text-lg md:text-xl font-black text-[#0d3944] truncate">{bowlingTeam?.name ?? "—"}</p>
          </div>
          <div className="pl-7 sm:pl-0 sm:pr-8 space-y-1">
            <p className="text-xs sm:text-sm text-gray-700">⚾ {bowlerName}</p>
            <p className="text-xs sm:text-sm text-gray-700">🧤 {keeperName}</p>
          </div>
        </div>
      </div>

      {/* Score and Over Info */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t-2 border-gray-200 gap-4">
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground">Current Score</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0d3944]">
            {currentInnings.totalRuns}/{currentInnings.totalWickets}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs sm:text-sm text-muted-foreground">Over</p>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <p className="text-xl sm:text-2xl font-bold text-[#0d3944]">
              {overNum}.{ballInOver}
            </p>
            {isPowerplay && (
              <Badge className="bg-[#ff9800] text-white font-bold text-xs whitespace-nowrap">
                ⚡ POWERPLAY
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Bowling Rotation Info */}
      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-900 font-medium">
          📋 <strong>Note:</strong> Each team bats for 3 overs. The other 3 teams each bowl 1 over during the innings.
        </p>
      </div>
    </Card>
  );
}
