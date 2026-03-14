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

  // Force re-render every 1 second to update banner visibility (for smooth disappear after 20 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
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
          const ballTime = ball.timestamp instanceof Date ? ball.timestamp : new Date(ball.timestamp);
          if (!lastBallTimestamp || ballTime > lastBallTimestamp) {
            lastBallTimestamp = ballTime;
            lastBall = { ...ball, bowlingTeamId: over.bowlingTeamId };
          }
        });
      });
    });

    if (!lastBall || !lastBallTimestamp) {
      return { isRecent: false, isFour: false, isSix: false, isWicket: false, wicketType: null };
    }

    // Check if last ball was within 20 seconds
    const timeDiff = Date.now() - lastBallTimestamp.getTime();
    const isRecent = timeDiff < 20000;

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
      className="relative overflow-hidden border-0 w-full"
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
          className="absolute top-0 left-0 right-0 h-14 flex items-center justify-center gap-2 md:gap-4 shadow-2xl z-20 px-2"
          style={{
            background: `linear-gradient(135deg, ${style.gradientFrom}, ${style.gradientTo})`,
            animation: 'slide-in-from-top 0.5s ease-out',
          }}
        >
          {/* Four */}
          {lastBallStats.isFour && (
            <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white shadow-2xl animate-bounce-in">
              <span className="text-white font-black text-xl md:text-2xl tabular-nums drop-shadow-2xl">4</span>
              <span className="text-white/90 text-xs md:text-sm font-black tracking-wider">FOUR!</span>
            </div>
          )}

          {/* Six */}
          {lastBallStats.isSix && (
            <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white shadow-2xl animate-bounce-in">
              <span className="text-white font-black text-xl md:text-2xl tabular-nums drop-shadow-2xl">6</span>
              <span className="text-white/90 text-xs md:text-sm font-black tracking-wider">SIX!</span>
            </div>
          )}

          {/* Wicket */}
          {lastBallStats.isWicket && (
            <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white shadow-2xl animate-bounce-in">
              <span className="text-white font-black text-lg md:text-xl">🏏</span>
              <div className="flex flex-col">
                <span className="text-white text-xs md:text-sm font-black leading-tight tracking-wider">WICKET!</span>
                {lastBallStats.wicketType && lastBallStats.wicketType !== "BOWLING_TEAM" && (
                  <span className="text-white/80 text-[10px] font-bold leading-tight uppercase tracking-wide">
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

      <div className={`relative w-full ${showBanner ? 'pt-14' : ''}`}>
        <div className="p-4 md:p-6 w-full">
          {/* Stage Badge & Live Indicator */}
          <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
            <div
              className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm"
              style={{
                background: style.badgeBg,
                boxShadow: `0 4px 20px ${style.glowColor}`,
              }}
            >
              <StageIcon className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" />
              <span className="text-white font-black tracking-wider">
                {style.stageName}
              </span>
            </div>

            {isLive && (
              <div
                className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-full animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                  boxShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
                }}
              >
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full animate-ping" />
                <span className="text-white font-black text-xs tracking-wide">LIVE</span>
              </div>
            )}
          </div>

          {/* Match Number Badge */}
          <div className="flex items-center justify-center mb-4 md:mb-6">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center relative"
              style={{
                background: style.badgeBg,
                boxShadow: `0 0 30px ${style.glowColor}, inset 0 0 20px rgba(255,255,255,0.2)`,
                border: `3px solid ${style.borderColor}`,
              }}
            >
              <span className="text-white font-black text-2xl md:text-3xl drop-shadow-lg">{match.matchNumber}</span>
              {isLive && (
                <div className="absolute inset-0 rounded-full border-3 md:border-4 border-white/30 animate-ping" />
              )}
            </div>
          </div>

          {/* Teams Section - Display in batting order */}
          <div className="space-y-3 mb-3 md:mb-4 w-full">
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
                  className="relative rounded-xl md:rounded-2xl p-3 md:p-4 transition-all duration-300 w-full overflow-hidden"
                  style={{
                    background: isBatting
                      ? `linear-gradient(135deg, ${team?.color}60, ${team?.color}30)`
                      : isBowling
                      ? `linear-gradient(135deg, ${team?.color}40, ${team?.color}20)`
                      : `linear-gradient(90deg, ${team?.color}25, ${team?.color}10)`,
                    border: isBatting || isBowling
                      ? `2px solid ${team?.color}`
                      : `2px solid ${team?.color}80`,
                    boxShadow: isBatting
                      ? `0 0 20px ${team?.color}80, inset 0 0 15px ${team?.color}40`
                      : isBowling
                      ? `0 0 15px ${team?.color}60, inset 0 0 10px ${team?.color}30`
                      : `0 0 10px ${team?.color}40`,
                  }}
                >
                  {/* Batting/Bowling Badge */}
                  {isBatting && (
                    <div className="absolute -top-2 left-2 md:left-4 px-2 md:px-3 py-0.5 md:py-1 bg-green-600 text-white text-[10px] md:text-xs font-black rounded-full shadow-lg border-2 border-white">
                      BATTING
                    </div>
                  )}
                  {isBowling && (
                    <div className="absolute -top-2 left-2 md:left-4 px-2 md:px-3 py-0.5 md:py-1 bg-orange-600 text-white text-[10px] md:text-xs font-black rounded-full shadow-lg border-2 border-white">
                      BOWLING
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 md:gap-3">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full transition-transform duration-300"
                          style={{
                            backgroundColor: team?.color,
                            boxShadow: `0 0 15px ${team?.color}80, inset 0 0 8px rgba(255,255,255,0.3)`,
                            border: '2px solid white',
                            transform: isBatting ? 'scale(1.1)' : 'scale(1)',
                          }}
                        />
                        {isBatting && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white shadow-lg" />
                        )}
                        {isBowling && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse border-2 border-white shadow-lg" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <span className="font-black text-white text-sm md:text-base drop-shadow-lg block truncate">
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
                        <div className="text-xl md:text-2xl font-black text-white drop-shadow-lg whitespace-nowrap">
                          {ranking?.totalScore ?? innings.totalRuns ?? 0}
                          <span className="text-sm md:text-base text-white/70 ml-1 font-bold">
                            /{innings.totalWickets || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 justify-end">
                          <div className="text-[10px] md:text-xs text-white/80 font-bold whitespace-nowrap">
                            {(() => {
                              if (!innings.overs || innings.overs.length === 0) {
                                return '0.0 ov';
                              }

                              // Check if innings or match is completed (all 3 overs bowled)
                              // Always show 3.0 for completed/locked matches to avoid corrupted data display
                              if (innings.state === "COMPLETED" || match.state === "COMPLETED" || match.state === "LOCKED") {
                                return '3.0 ov';
                              }

                              // Count balls per over based on over type
                              // NORMAL over: ALL balls count (including wides/no-balls)
                              // POWERPLAY over: Only LEGAL balls count (exclude wides/no-balls)
                              const totalBalls = innings.overs.reduce((sum, over) => {
                                if (!over.balls) return sum;

                                if (over.isPowerplay) {
                                  // Powerplay: only count legal balls
                                  return sum + over.balls.filter(b => !b.isWide && !b.isNoball).length;
                                } else {
                                  // Normal over: count ALL balls
                                  return sum + over.balls.length;
                                }
                              }, 0);

                              const completeOvers = Math.floor(totalBalls / 6);
                              const remainingBalls = totalBalls % 6;

                              return `${completeOvers}.${remainingBalls} ov`;
                            })()}
                          </div>
                          {(() => {
                            // Show POWERPLAY indicator only for in-progress matches and innings
                            // Don't show for completed/locked matches to avoid misleading displays
                            if (match.state === "COMPLETED" || match.state === "LOCKED" || innings.state === "COMPLETED") {
                              return null;
                            }

                            const totalBalls = innings.overs?.reduce((sum, over) => {
                              if (!over.balls) return sum;
                              if (over.isPowerplay) {
                                return sum + over.balls.filter(b => !b.isWide && !b.isNoball).length;
                              } else {
                                return sum + over.balls.length;
                              }
                            }, 0) || 0;

                            const currentOverIndex = Math.floor(totalBalls / 6);
                            const currentOver = innings.overs?.[currentOverIndex];

                            if (currentOver?.isPowerplay && innings.state === "IN_PROGRESS") {
                              return (
                                <span className="px-1.5 py-0.5 bg-yellow-500 text-black text-[8px] font-black rounded whitespace-nowrap animate-pulse">
                                  ⚡ POWERPLAY
                                </span>
                              );
                            }
                            return null;
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
          <div className="text-center pt-3 md:pt-4 border-t-2" style={{ borderColor: `${style.borderColor}40` }}>
            {isCompleted && match.rankings && match.rankings.length > 0 && (
              <div className="flex items-center justify-center gap-1.5 md:gap-2 flex-wrap">
                <Trophy className="w-4 h-4 md:w-6 md:h-6 text-yellow-400 animate-pulse" />
                <span className="text-white font-black text-sm md:text-base drop-shadow-lg truncate">
                  CHAMPION: {getTeam(match.rankings[0].teamId)?.name}
                </span>
              </div>
            )}
            {!isCompleted && !isLive && (
              <div className="flex items-center justify-center gap-1.5 md:gap-2 text-white/70 flex-wrap">
                <Flame className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-bold">
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
