"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Match } from "@/lib/types";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Trophy, Swords, Crown, Flame, Zap, Target } from "lucide-react";

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
      battingGlow: 'rgba(168, 85, 247, 0.4)',
      bowlingGlow: 'rgba(236, 72, 153, 0.4)',
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
      battingGlow: 'rgba(251, 191, 36, 0.5)',
      bowlingGlow: 'rgba(245, 158, 11, 0.5)',
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
    battingGlow: 'rgba(220, 38, 38, 0.6)',
    bowlingGlow: 'rgba(251, 191, 36, 0.6)',
  };
}

export function PlayoffMatchCard({ match }: PlayoffMatchCardProps) {
  const { getTeam } = useTournamentStore();
  const [, setTick] = useState(0);

  // Force re-render every 5 seconds to update banner visibility
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const style = getStageStyle(match.matchNumber);
  const StageIcon = style.stageIcon;

  const isLive = match.state === "IN_PROGRESS";
  const isCompleted = match.state === "COMPLETED" || match.state === "LOCKED";

  // Get ONLY the most recent ball's stats (not cumulative!)
  const getLastBallStats = () => {
    if (!match.innings || match.innings.length === 0) {
      return { isRecent: false, isFour: false, isSix: false, isWicket: false, wicketType: null };
    }

    let lastBall: any = null;
    let lastBallTimestamp: Date | null = null;

    match.innings.forEach(innings => {
      if (!innings.overs) return;
      innings.overs.forEach(over => {
        if (!over.balls) return;
        over.balls.forEach(ball => {
          if (!lastBallTimestamp || ball.timestamp > lastBallTimestamp) {
            lastBallTimestamp = ball.timestamp;
            lastBall = { ...ball, bowlingTeamId: over.bowlingTeamId };
          }
        });
      });
    });

    if (!lastBall || !lastBallTimestamp) {
      return { isRecent: false, isFour: false, isSix: false, isWicket: false, wicketType: null };
    }

    // Check if last ball was within 20 seconds
    const isRecent = (Date.now() - lastBallTimestamp.getTime()) < 20000;

    // Check what type of ball it was
    const isFour = !lastBall.isWide && !lastBall.isNoball && lastBall.runs === 4;
    const isSix = !lastBall.isWide && !lastBall.isNoball && lastBall.runs === 6;
    const isWicket = lastBall.isWicket;
    const wicketType = lastBall.wicketType;

    return { isRecent, isFour, isSix, isWicket, wicketType };
  };

  // Find currently batting team
  const getCurrentlyBattingTeamId = () => {
    if (!match.innings) return null;
    const currentInnings = match.innings.find(inn => inn.state === "IN_PROGRESS");
    return currentInnings?.teamId || null;
  };

  // Find currently bowling team
  const getCurrentlyBowlingTeamId = () => {
    if (!match.innings) return null;
    const currentInnings = match.innings.find(inn => inn.state === "IN_PROGRESS");
    if (!currentInnings || !currentInnings.overs || currentInnings.overs.length === 0) {
      return null;
    }

    const currentOver = currentInnings.overs.find((over) => {
      const isPowerplayOver = over.isPowerplay;
      if (isPowerplayOver) {
        const legalBallCount = over.balls.filter(b => !b.isWide && !b.isNoball).length;
        return legalBallCount < 6;
      } else {
        return over.balls.length < 6;
      }
    });

    return currentOver?.bowlingTeamId || null;
  };

  const lastBallStats = isLive ? getLastBallStats() : null;
  const showBanner = isLive && lastBallStats && lastBallStats.isRecent && (lastBallStats.isFour || lastBallStats.isSix || lastBallStats.isWicket);
  const battingTeamId = isLive ? getCurrentlyBattingTeamId() : null;
  const bowlingTeamId = isLive ? getCurrentlyBowlingTeamId() : null;

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
      {/* Cricket Stats Banner - Shows ONLY the most recent ball */}
      {showBanner && lastBallStats && (
        <div
          className="absolute top-0 left-0 right-0 h-16 flex items-center justify-center gap-4 shadow-2xl z-20"
          style={{
            background: `linear-gradient(135deg, ${style.gradientFrom}, ${style.gradientTo})`,
            animation: 'slide-in-from-top 0.5s ease-out',
          }}
        >
          {/* Four */}
          {lastBallStats.isFour && (
            <div className="flex items-center gap-3 px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full border-3 border-white shadow-2xl animate-bounce-in">
              <Zap className="w-8 h-8 text-white animate-pulse" />
              <span className="text-white font-black text-3xl tabular-nums drop-shadow-2xl">4</span>
              <span className="text-white/90 text-lg font-black tracking-wider">FOUR!</span>
            </div>
          )}

          {/* Six */}
          {lastBallStats.isSix && (
            <div className="flex items-center gap-3 px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full border-3 border-white shadow-2xl animate-bounce-in">
              <Trophy className="w-8 h-8 text-white animate-pulse" />
              <span className="text-white font-black text-3xl tabular-nums drop-shadow-2xl">6</span>
              <span className="text-white/90 text-lg font-black tracking-wider">MAXIMUM!</span>
            </div>
          )}

          {/* Wicket */}
          {lastBallStats.isWicket && (
            <div className="flex items-center gap-3 px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full border-3 border-white shadow-2xl animate-bounce-in">
              <Target className="w-8 h-8 text-white animate-spin-slow" />
              <div className="flex flex-col">
                <span className="text-white text-lg font-black leading-tight tracking-wider">WICKET!</span>
                {lastBallStats.wicketType && lastBallStats.wicketType !== "BOWLING_TEAM" && (
                  <span className="text-white/80 text-xs font-bold leading-tight uppercase tracking-wide">
                    {lastBallStats.wicketType.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${style.gradientFrom}, transparent 70%)`,
          animation: isLive ? 'rotate-gradient 10s linear infinite' : 'none',
        }}
      />

      <div className={`relative ${showBanner ? 'pt-16' : ''}`}>
        <div className="p-6">
          {/* Stage Badge & Live Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: style.badgeBg,
                boxShadow: `0 4px 20px ${style.glowColor}`,
              }}
            >
              <StageIcon className="w-5 h-5 text-white" />
              <span className="text-white font-black text-sm tracking-wider">
                {style.stageName}
              </span>
            </div>

            {isLive && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                  boxShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
                }}
              >
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                <span className="text-white font-black text-xs tracking-wide">LIVE</span>
              </div>
            )}
          </div>

          {/* Match Number Badge */}
          <div className="flex items-center justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center relative"
              style={{
                background: style.badgeBg,
                boxShadow: `0 0 30px ${style.glowColor}, inset 0 0 20px rgba(255,255,255,0.2)`,
                border: `4px solid ${style.borderColor}`,
              }}
            >
              <span className="text-white font-black text-3xl drop-shadow-lg">{match.matchNumber}</span>
              {isLive && (
                <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
              )}
            </div>
          </div>

          {/* Teams Section - Display in batting order */}
          <div className="space-y-4 mb-4">
            {(match.battingOrder && match.battingOrder.length > 0 ? match.battingOrder : match.teamIds || []).map((teamId) => {
              const team = getTeam(teamId);
              const innings = match.innings?.find(i => i.teamId === teamId);
              const ranking = match.rankings?.find(r => r.teamId === teamId);

              // For IN_PROGRESS matches: only show teams that have started batting
              if (isLive && (!innings || !innings.overs || innings.overs.length === 0)) {
                return null;
              }

              const isBatting = battingTeamId === teamId;
              const isBowling = bowlingTeamId === teamId;

              return (
                <div
                  key={teamId}
                  className="relative rounded-2xl p-4 transition-all duration-300"
                  style={{
                    background: isBatting
                      ? `linear-gradient(135deg, ${team?.color}60, ${team?.color}30)`
                      : isBowling
                      ? `linear-gradient(135deg, ${team?.color}40, ${team?.color}20)`
                      : `linear-gradient(90deg, ${team?.color}25, ${team?.color}10)`,
                    border: isBatting || isBowling
                      ? `3px solid ${team?.color}`
                      : `2px solid ${team?.color}80`,
                    boxShadow: isBatting
                      ? `0 0 30px ${team?.color}80, inset 0 0 20px ${team?.color}40`
                      : isBowling
                      ? `0 0 20px ${team?.color}60, inset 0 0 15px ${team?.color}30`
                      : `0 0 15px ${team?.color}40`,
                  }}
                >
                  {/* Batting/Bowling Badge */}
                  {isBatting && (
                    <div className="absolute -top-2 left-4 px-3 py-1 bg-green-600 text-white text-xs font-black rounded-full shadow-lg border-2 border-white">
                      🏏 BATTING
                    </div>
                  )}
                  {isBowling && (
                    <div className="absolute -top-2 left-4 px-3 py-1 bg-orange-600 text-white text-xs font-black rounded-full shadow-lg border-2 border-white">
                      ⚡ BOWLING
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-12 h-12 rounded-full transition-transform duration-300"
                          style={{
                            backgroundColor: team?.color,
                            boxShadow: `0 0 20px ${team?.color}80, inset 0 0 10px rgba(255,255,255,0.3)`,
                            border: '3px solid white',
                            transform: isBatting ? 'scale(1.1)' : 'scale(1)',
                          }}
                        />
                        {isBatting && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full animate-pulse border-2 border-white shadow-lg" />
                        )}
                        {isBowling && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-500 rounded-full animate-pulse border-2 border-white shadow-lg" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <span className="font-black text-white text-lg drop-shadow-lg block truncate">
                          {team?.name || 'TBD'}
                        </span>
                        {team?.players && team.players.length > 0 && (
                          <p className="text-[10px] text-white/70 font-semibold mt-0.5 truncate">
                            {team.players.map((p) => p.name).join(" • ")}
                          </p>
                        )}
                      </div>
                    </div>

                    {innings ? (
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-black text-white drop-shadow-lg whitespace-nowrap">
                          {ranking?.totalScore ?? innings.totalRuns ?? 0}
                          <span className="text-base text-white/70 ml-1 font-bold">
                            /{innings.totalWickets || 0}
                          </span>
                        </div>
                        <div className="text-[10px] text-white/80 font-bold mt-0.5 whitespace-nowrap">
                          {(() => {
                            if (!innings.overs || innings.overs.length === 0) {
                              return '0.0 ov';
                            }

                            if (innings.state === "COMPLETED") {
                              return '3.0 ov';
                            }

                            const currentOverIndex = innings.overs.findIndex((over) => {
                              const isPowerplayOver = over.isPowerplay;
                              if (isPowerplayOver) {
                                const legalBallCount = over.balls.filter(b => !b.isWide && !b.isNoball).length;
                                return legalBallCount < 6;
                              } else {
                                return over.balls.length < 6;
                              }
                            });

                            if (currentOverIndex < 0) {
                              return '3.0 ov';
                            }

                            const currentOver = innings.overs[currentOverIndex];
                            const legalBalls = currentOver.balls.filter(b => !b.isWide && !b.isNoball).length;
                            const completedOvers = currentOverIndex;

                            return `${completedOvers}.${legalBalls} ov`;
                          })()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-white/50 font-bold text-sm flex-shrink-0">Waiting…</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Match Status/Time */}
          <div className="text-center pt-4 border-t-2" style={{ borderColor: `${style.borderColor}40` }}>
            {isCompleted && match.rankings && match.rankings.length > 0 && (
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400 animate-pulse" />
                <span className="text-white font-black text-base drop-shadow-lg">
                  CHAMPION: {getTeam(match.rankings[0].teamId)?.name}
                </span>
              </div>
            )}
            {!isCompleted && !isLive && (
              <div className="flex items-center justify-center gap-2 text-white/70">
                <Flame className="w-5 h-5" />
                <span className="text-sm font-bold">
                  {match.court} • {new Date(match.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
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

      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes slide-in-from-top {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </Card>
  );
}
