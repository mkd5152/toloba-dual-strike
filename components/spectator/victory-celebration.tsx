"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Sparkles, Award, TrendingUp, X } from "lucide-react";
import type { Match, Team } from "@/lib/types";
import Image from "next/image";

interface VictoryCelebrationProps {
  match: Match;
  championTeamName: string;
  championTeamColor: string;
  teams: Team[];
  onClose: () => void;
}

export function VictoryCelebration({
  match,
  championTeamName,
  championTeamColor,
  teams,
  onClose,
}: VictoryCelebrationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setShow(true), 100);
  }, []);

  // Generate confetti particles
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
  }));

  const topRankings = match.rankings?.slice(0, 3) || [];

  // Get team names
  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || 'Unknown Team';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.95), rgba(0,0,0,0.98))',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Confetti */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: `${particle.left}%`,
            top: -20,
            backgroundColor: ['#fbbf24', '#dc2626', '#a855f7', '#ec4899', '#10b981'][particle.id % 5],
            animation: `confetti-fall ${particle.duration}s ease-in ${particle.delay}s infinite`,
            boxShadow: '0 0 10px currentColor',
          }}
        />
      ))}

      <Card
        className={`relative max-w-[90vw] w-full border-0 transition-all duration-1000 ${
          show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(251, 191, 36, 0.3))',
          boxShadow: '0 0 70px rgba(251, 191, 36, 0.6), 0 0 100px rgba(220, 38, 38, 0.4)',
          border: '3px solid #fbbf24',
        }}
      >
        {/* Close Button - Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full transition-all hover:scale-110 hover:rotate-90 z-10"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
          }}
          aria-label="Close celebration"
        >
          <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>
        <div className="flex items-center gap-4 md:gap-8 p-4 md:p-8">
          {/* Left Logo - Dual Strike */}
          <div className="hidden md:flex items-center justify-center flex-shrink-0">
            <Image
              src="/logos/dual-strike-logo.png"
              alt="Dual Strike Tournament"
              width={280}
              height={280}
              className="object-contain drop-shadow-2xl"
            />
          </div>

          {/* Center Content */}
          <div className="flex-1 text-center space-y-3 md:space-y-5">
          {/* Championship Announcement */}
          <div className="space-y-2 md:space-y-4">
            <h1
              className="text-3xl md:text-6xl font-black tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #dc2626, #fbbf24)',
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradient-shift 3s ease infinite',
                textShadow: '0 0 50px rgba(251, 191, 36, 0.5)',
              }}
            >
              CHAMPIONS!
            </h1>

            <div
              className="inline-block px-4 md:px-10 py-2 md:py-5 rounded-xl md:rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${championTeamColor}40, ${championTeamColor}60)`,
                border: `3px solid ${championTeamColor}`,
                boxShadow: `0 0 40px ${championTeamColor}80`,
              }}
            >
              <h2 className="text-2xl md:text-5xl font-black text-white drop-shadow-lg">
                {championTeamName}
              </h2>
            </div>

            <p className="text-sm md:text-xl font-bold text-white/90">
              🏆 TOLOBA DUAL STRIKE TOURNAMENT CHAMPIONS 2026 🏆
            </p>
          </div>

          {/* Podium - Top 3 */}
          <div className="mt-3 md:mt-5">
            <div className="flex items-center justify-center gap-2 text-white/70 mb-8 md:mb-10 px-2">
              <Award className="w-4 h-4 md:w-6 md:h-6 flex-shrink-0" />
              <span className="font-black text-xs md:text-base uppercase tracking-wide whitespace-nowrap">Championship Podium</span>
            </div>

            {/* Podium Display */}
            <div className="flex items-end justify-center gap-2 md:gap-4 mb-3">
              {/* 2nd Place - Silver */}
              {topRankings[1] && (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div
                      className="w-16 h-16 md:w-28 md:h-28 rounded-full flex items-center justify-center mb-2 md:mb-3"
                      style={{
                        background: 'linear-gradient(135deg, #e8e8e8, #c0c0c0)',
                        boxShadow: '0 0 35px rgba(192, 192, 192, 0.6)',
                        border: '3px solid #c0c0c0',
                      }}
                    >
                      <span className="text-3xl md:text-5xl">🥈</span>
                    </div>
                  </div>
                  <div
                    className="w-16 md:w-32 px-2 md:px-3 py-4 md:py-8 rounded-t-2xl"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(192, 192, 192, 0.3), rgba(192, 192, 192, 0.1))',
                      border: '2px solid rgba(192, 192, 192, 0.5)',
                      borderBottom: 'none',
                    }}
                  >
                    <p className="font-black text-white text-[10px] md:text-lg mb-1 text-center leading-tight">
                      {getTeamName(topRankings[1].teamId)}
                    </p>
                    <p className="text-xl md:text-3xl font-black text-white text-center">2nd</p>
                    <p className="text-[10px] md:text-sm text-white/70 font-bold text-center mt-1">
                      {topRankings[1].totalScore} pts
                    </p>
                  </div>
                </div>
              )}

              {/* 1st Place - Gold */}
              {topRankings[0] && (
                <div className="flex flex-col items-center -mt-3 md:-mt-6">
                  <div className="relative">
                    <div
                      className="w-20 h-20 md:w-32 md:h-32 rounded-full flex items-center justify-center mb-2 animate-pulse"
                      style={{
                        background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                        boxShadow: '0 0 45px rgba(255, 215, 0, 0.8), inset 0 0 25px rgba(255,255,255,0.3)',
                        border: '4px solid #ffd700',
                      }}
                    >
                      <span className="text-4xl md:text-6xl">🥇</span>
                    </div>
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2">
                      <Sparkles className="w-5 h-5 md:w-9 md:h-9 text-yellow-300 animate-spin" />
                    </div>
                  </div>
                  <div
                    className="w-24 md:w-40 px-2 md:px-5 py-6 md:py-12 rounded-t-2xl"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255, 215, 0, 0.4), rgba(255, 215, 0, 0.2))',
                      border: '3px solid rgba(255, 215, 0, 0.6)',
                      borderBottom: 'none',
                      boxShadow: '0 0 35px rgba(255, 215, 0, 0.4)',
                    }}
                  >
                    <p className="font-black text-white text-xs md:text-xl mb-1 text-center leading-tight drop-shadow-lg">
                      {getTeamName(topRankings[0].teamId)}
                    </p>
                    <p className="text-2xl md:text-5xl font-black text-white text-center drop-shadow-lg">1st</p>
                    <p className="text-xs md:text-base text-white/80 font-bold text-center mt-1">
                      {topRankings[0].totalScore} pts
                    </p>
                  </div>
                </div>
              )}

              {/* 3rd Place - Bronze */}
              {topRankings[2] && (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div
                      className="w-16 h-16 md:w-28 md:h-28 rounded-full flex items-center justify-center mb-2 md:mb-3"
                      style={{
                        background: 'linear-gradient(135deg, #f4a460, #cd7f32)',
                        boxShadow: '0 0 35px rgba(205, 127, 50, 0.6)',
                        border: '3px solid #cd7f32',
                      }}
                    >
                      <span className="text-3xl md:text-5xl">🥉</span>
                    </div>
                  </div>
                  <div
                    className="w-16 md:w-32 px-2 md:px-3 py-3 md:py-6 rounded-t-2xl"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(205, 127, 50, 0.3), rgba(205, 127, 50, 0.1))',
                      border: '2px solid rgba(205, 127, 50, 0.5)',
                      borderBottom: 'none',
                    }}
                  >
                    <p className="font-black text-white text-[10px] md:text-lg mb-1 text-center leading-tight">
                      {getTeamName(topRankings[2].teamId)}
                    </p>
                    <p className="text-xl md:text-3xl font-black text-white text-center">3rd</p>
                    <p className="text-[10px] md:text-sm text-white/70 font-bold text-center mt-1">
                      {topRankings[2].totalScore} pts
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>

          {/* Right Logo - Sponsor */}
          <div className="hidden md:flex items-center justify-center flex-shrink-0">
            <Image
              src="/logos/sponsor.png"
              alt="Sponsor"
              width={280}
              height={280}
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Sparkle Effects */}
        <div className="absolute top-10 left-10 animate-ping">
          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-300" />
        </div>
        <div className="absolute bottom-10 right-10 animate-ping" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-red-400" />
        </div>
      </Card>

      <style jsx global>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes trophy-bounce {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(-5deg);
          }
          75% {
            transform: translateY(-10px) rotate(5deg);
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes victory-pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 40px var(--glow-color), 0 20px 60px rgba(0,0,0,0.4);
          }
          50% {
            box-shadow: 0 0 60px var(--glow-color), 0 20px 60px rgba(0,0,0,0.4);
          }
        }

        @keyframes rotate-gradient {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
