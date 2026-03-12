"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Match } from "@/lib/types";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Trophy, Swords, Crown, Flame } from "lucide-react";

interface PlayoffMatchCardProps {
  match: Match;
}

// Get stage-specific styling
function getStageStyle(matchNumber: number) {
  // Quarter Finals: 26, 27
  if (matchNumber >= 26 && matchNumber <= 27) {
    return {
      gradientFrom: '#a855f7',
      gradientTo: '#ec4899',
      glowColor: 'rgba(168, 85, 247, 0.6)',
      badgeBg: 'linear-gradient(135deg, #a855f7, #ec4899)',
      stageName: matchNumber === 26 ? 'QUALIFIER 1' : 'QUALIFIER 2',
      stageIcon: Swords,
      borderColor: '#a855f7',
    };
  }
  // Semi Finals: 28, 29
  if (matchNumber >= 28 && matchNumber <= 29) {
    return {
      gradientFrom: '#fbbf24',
      gradientTo: '#f59e0b',
      glowColor: 'rgba(251, 191, 36, 0.6)',
      badgeBg: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      stageName: matchNumber === 28 ? 'SEMI-FINAL 1' : 'SEMI-FINAL 2',
      stageIcon: Crown,
      borderColor: '#fbbf24',
    };
  }
  // Grand Finale: 30
  return {
    gradientFrom: '#dc2626',
    gradientTo: '#fbbf24',
    glowColor: 'rgba(220, 38, 38, 0.8)',
    badgeBg: 'linear-gradient(135deg, #dc2626, #fbbf24)',
    stageName: 'GRAND FINALE',
    stageIcon: Trophy,
    borderColor: '#dc2626',
  };
}

export function PlayoffMatchCard({ match }: PlayoffMatchCardProps) {
  const { getTeam } = useTournamentStore();

  const style = getStageStyle(match.matchNumber);
  const StageIcon = style.stageIcon;

  // Get all 4 teams
  const teams = match.teamIds?.map(id => getTeam(id)).filter(Boolean) || [];

  const isLive = match.state === "IN_PROGRESS";
  const isCompleted = match.state === "COMPLETED" || match.state === "LOCKED";

  return (
    <Card
      className="relative overflow-hidden border-0"
      style={{
        background: `linear-gradient(135deg, ${style.gradientFrom}15, ${style.gradientTo}25)`,
        boxShadow: isLive
          ? `0 0 40px ${style.glowColor}, 0 20px 60px rgba(0,0,0,0.4), inset 0 0 60px ${style.glowColor.replace('0.6', '0.1')}`
          : `0 10px 40px rgba(0,0,0,0.3), 0 0 20px ${style.glowColor.replace('0.6', '0.2')}`,
        border: `3px solid ${style.borderColor}`,
        transition: 'all 0.3s ease',
        animation: isLive ? 'pulse-glow 2s infinite' : 'none',
      }}
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${style.gradientFrom}, transparent 70%)`,
          animation: isLive ? 'rotate-gradient 10s linear infinite' : 'none',
        }}
      />

      <div className="relative p-6">
        {/* Stage Badge */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: style.badgeBg,
              boxShadow: `0 4px 15px ${style.glowColor}`,
            }}
          >
            <StageIcon className="w-5 h-5 text-white" />
            <span className="text-white font-black text-sm tracking-wider">
              {style.stageName}
            </span>
          </div>

          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              <span className="text-white font-black text-xs">LIVE</span>
            </div>
          )}
        </div>

        {/* Match Number */}
        <div className="flex items-center justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: style.badgeBg,
              boxShadow: `0 0 25px ${style.glowColor}`,
              border: `3px solid ${style.borderColor}`,
            }}
          >
            <span className="text-white font-black text-2xl">{match.matchNumber}</span>
          </div>
        </div>

        {/* Teams Section */}
        <div className="space-y-3 mb-4">
          {teams.slice(0, 4).map((team, idx) => {
            const innings = match.innings?.find(i => i.teamId === team?.id);
            const ranking = match.rankings?.find(r => r.teamId === team?.id);

            return (
              <div
                key={team?.id || idx}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: `linear-gradient(90deg, ${team?.color}25, ${team?.color}10)`,
                  border: `2px solid ${team?.color}`,
                  boxShadow: `0 0 15px ${team?.color}40`,
                }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: team?.color,
                      boxShadow: `0 0 15px ${team?.color}80`,
                      border: '3px solid white',
                    }}
                  />
                  <span className="font-black text-white text-lg truncate">
                    {team?.name || 'TBD'}
                  </span>
                </div>

                {innings && (
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">
                      {ranking?.totalScore ?? innings.totalRuns ?? 0}
                      <span className="text-sm text-white/70 ml-1">
                        /{innings.totalWickets || 0}
                      </span>
                    </div>
                    {innings.state !== "COMPLETED" && match.state === "IN_PROGRESS" && (
                      <div className="text-xs text-white/80 font-bold">
                        {(() => {
                          const currentOverIndex = innings.overs?.findIndex((over) => {
                            const isPowerplayOver = over.isPowerplay;
                            if (isPowerplayOver) {
                              const legalBallCount = over.balls.filter(b => !b.isWide && !b.isNoball).length;
                              return legalBallCount < 6;
                            } else {
                              return over.balls.length < 6;
                            }
                          });

                          if (currentOverIndex < 0) return '3.0 ov';

                          const currentOver = innings.overs[currentOverIndex];
                          const legalBalls = currentOver.balls.filter(b => !b.isWide && !b.isNoball).length;
                          const completedOvers = currentOverIndex;

                          return `${completedOvers}.${legalBalls} ov`;
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Match Status/Time */}
        <div className="text-center pt-3 border-t-2" style={{ borderColor: `${style.borderColor}40` }}>
          {isCompleted && match.rankings && (
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-black text-sm">
                Winner: {getTeam(match.rankings[0].teamId)?.name}
              </span>
            </div>
          )}
          {!isCompleted && !isLive && (
            <div className="flex items-center justify-center gap-2 text-white/70">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-bold">
                {match.court} • {new Date(match.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Victory Glow for Completed */}
      {isCompleted && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${style.glowColor.replace('0.6', '0.3')}, transparent 70%)`,
            animation: 'victory-pulse 3s ease-in-out infinite',
          }}
        />
      )}
    </Card>
  );
}
