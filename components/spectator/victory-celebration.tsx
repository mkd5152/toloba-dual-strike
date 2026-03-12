"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Sparkles, Award, TrendingUp } from "lucide-react";
import type { Match } from "@/lib/types";

interface VictoryCelebrationProps {
  match: Match;
  championTeamName: string;
  championTeamColor: string;
  onClose: () => void;
}

export function VictoryCelebration({
  match,
  championTeamName,
  championTeamColor,
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

  const topRankings = match.rankings?.slice(0, 4) || [];

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
        className={`relative max-w-4xl w-full border-0 transition-all duration-1000 ${
          show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(251, 191, 36, 0.3))',
          boxShadow: '0 0 60px rgba(251, 191, 36, 0.6), 0 0 100px rgba(220, 38, 38, 0.4)',
          border: '3px solid #fbbf24',
        }}
      >
        <div className="p-8 md:p-12 text-center space-y-8">
          {/* Trophy Animation */}
          <div
            className="flex justify-center"
            style={{
              animation: 'trophy-bounce 2s ease-in-out infinite',
            }}
          >
            <div
              className="relative w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                boxShadow: '0 0 60px #fbbf24, inset 0 0 40px rgba(255,255,255,0.3)',
              }}
            >
              <Trophy className="w-20 h-20 text-white drop-shadow-2xl" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-10 h-10 text-yellow-300 animate-spin" />
              </div>
            </div>
          </div>

          {/* Championship Announcement */}
          <div className="space-y-4">
            <h1
              className="text-5xl md:text-7xl font-black tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #dc2626, #fbbf24)',
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradient-shift 3s ease infinite',
                textShadow: '0 0 40px rgba(251, 191, 36, 0.5)',
              }}
            >
              CHAMPIONS!
            </h1>

            <div
              className="inline-block px-8 py-4 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${championTeamColor}40, ${championTeamColor}60)`,
                border: `3px solid ${championTeamColor}`,
                boxShadow: `0 0 40px ${championTeamColor}80`,
              }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
                {championTeamName}
              </h2>
            </div>

            <p className="text-xl md:text-2xl font-bold text-white/90 mt-4">
              🏆 DUAL STRIKE TOURNAMENT CHAMPIONS 2026 🏆
            </p>
          </div>

          {/* Final Standings */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-center gap-2 text-white/70 mb-4">
              <Award className="w-5 h-5" />
              <span className="font-black text-sm uppercase tracking-wide">Final Standings</span>
            </div>

            {topRankings.map((ranking, idx) => {
              const medalColors = ['#ffd700', '#c0c0c0', '#cd7f32', '#94a3b8'];
              const medalEmojis = ['🥇', '🥈', '🥉', '4️⃣'];

              return (
                <div
                  key={ranking.teamId}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{
                    background: `linear-gradient(90deg, ${medalColors[idx]}20, transparent)`,
                    border: `2px solid ${medalColors[idx]}40`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{medalEmojis[idx]}</span>
                    <span className="font-black text-white text-lg">
                      Rank {ranking.rank}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white text-xl">
                      {ranking.totalScore} pts
                    </div>
                    <div className="text-sm text-white/70 font-bold">
                      {ranking.points} match pts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-8 px-8 py-4 rounded-xl font-black text-lg text-white uppercase tracking-wide transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #dc2626, #fbbf24)',
              boxShadow: '0 10px 30px rgba(220, 38, 38, 0.5)',
            }}
          >
            Close Celebration
          </button>
        </div>

        {/* Sparkle Effects */}
        <div className="absolute top-10 left-10 animate-ping">
          <Sparkles className="w-6 h-6 text-yellow-300" />
        </div>
        <div className="absolute bottom-10 right-10 animate-ping" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-6 h-6 text-red-400" />
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
