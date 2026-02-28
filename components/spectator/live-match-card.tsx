"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Match } from "@/lib/types";
import { useTournamentStore } from "@/lib/stores/tournament-store";

interface LiveMatchCardProps {
  match: Match;
}

export function LiveMatchCard({ match }: LiveMatchCardProps) {
  const { getTeam } = useTournamentStore();

  // Map match state to user-friendly labels
  const getStateLabel = (state: string) => {
    switch (state) {
      case "CREATED":
        return "UPCOMING";
      case "READY":
        return "READY";
      case "TOSS":
        return "READY";
      case "IN_PROGRESS":
        return "LIVE";
      case "COMPLETED":
        return "COMPLETED";
      case "LOCKED":
        return "FINAL";
      default:
        return state;
    }
  };

  // Calculate match statistics
  const calculateMatchStats = () => {
    let fours = 0;
    let sixes = 0;
    let wickets = 0;

    match.innings.forEach(innings => {
      innings.overs.forEach(over => {
        over.balls.forEach(ball => {
          // Count boundaries (exclude wides and noballs from boundary count)
          if (!ball.isWide && !ball.isNoball) {
            if (ball.runs === 4) fours++;
            if (ball.runs === 6) sixes++;
          }
          // Count wickets
          if (ball.isWicket) wickets++;
        });
      });
    });

    return { fours, sixes, wickets };
  };

  const stats = match.state === "IN_PROGRESS" ? calculateMatchStats() : null;
  const showBanner = match.state === "IN_PROGRESS" && stats && (stats.fours > 0 || stats.sixes > 0 || stats.wickets > 0);

  return (
    <Card className="p-6 relative overflow-hidden">
      {/* Cricket Stats Banner - Only for LIVE matches */}
      {showBanner && stats && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#0d3944] via-[#1a5f7a] to-[#0d3944] h-12 flex items-center justify-center gap-6 shadow-lg z-10 animate-in slide-in-from-top duration-500">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>

          {/* Fours */}
          {stats.fours > 0 && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 shadow-xl animate-in zoom-in duration-300">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-black text-white text-sm shadow-lg animate-pulse">
                4
              </div>
              <span className="text-white font-bold text-lg tabular-nums">{stats.fours}</span>
              <span className="text-blue-200 text-xs font-semibold">FOUR{stats.fours !== 1 ? 'S' : ''}</span>
            </div>
          )}

          {/* Sixes */}
          {stats.sixes > 0 && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 shadow-xl animate-in zoom-in duration-300 delay-100">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-lg animate-bounce">
                6
              </div>
              <span className="text-white font-bold text-lg tabular-nums">{stats.sixes}</span>
              <span className="text-purple-200 text-xs font-semibold">SIX{stats.sixes !== 1 ? 'ES' : ''}</span>
            </div>
          )}

          {/* Wickets */}
          {stats.wickets > 0 && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 shadow-xl animate-in zoom-in duration-300 delay-200">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-lg shadow-lg">
                🏏
              </div>
              <span className="text-white font-bold text-lg tabular-nums">{stats.wickets}</span>
              <span className="text-red-200 text-xs font-semibold">WICKET{stats.wickets !== 1 ? 'S' : ''}</span>
            </div>
          )}
        </div>
      )}

      {/* Add padding-top when banner is visible */}
      <div className={showBanner ? "pt-12" : ""}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Match {match.matchNumber}</h3>
            <p className="text-sm text-muted-foreground">{match.court}</p>
          </div>
          <Badge
            variant={match.state === "IN_PROGRESS" ? "default" : "secondary"}
          >
            {getStateLabel(match.state)}
          </Badge>
        </div>

        <div className="space-y-3">
        {/* Display teams in batting order (umpire-selected sequence) */}
        {(match.battingOrder && match.battingOrder.length > 0 ? match.battingOrder : match.teamIds).map((teamId) => {
          const team = getTeam(teamId);
          const innings = match.innings.find((i) => i.teamId === teamId);

          // For IN_PROGRESS matches: only show teams that have started batting
          // For other matches (upcoming/completed): show all teams
          if (match.state === "IN_PROGRESS" && (!innings || !innings.overs || innings.overs.length === 0)) {
            return null;
          }

          return (
            <div
              key={teamId}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: team?.color }}
                />
                <div>
                  <span className="font-medium">{team?.name ?? "—"}</span>
                  {team?.players && team.players.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {team.players.map((p) => p.name).join(" • ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                {innings ? (
                  <>
                    <div className="text-xl font-bold">
                      {innings.totalRuns || 0}
                      <span className="text-sm text-muted-foreground ml-1">
                        /{innings.totalWickets || 0}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {(() => {
                        // Calculate overs bowled
                        if (!innings.overs || innings.overs.length === 0) {
                          return '0.0 ov';
                        }

                        // Check if innings is completed (all 3 overs bowled)
                        if (innings.state === "COMPLETED") {
                          return '3.0 ov';
                        }

                        // Find the current over (incomplete over)
                        const currentOverIndex = innings.overs.findIndex((over) => {
                          const isPowerplayOver = over.isPowerplay;
                          if (isPowerplayOver) {
                            const legalBallCount = over.balls.filter(b => !b.isWide && !b.isNoball).length;
                            return legalBallCount < 6;
                          } else {
                            return over.balls.length < 6;
                          }
                        });

                        // If no incomplete over found, all overs are complete
                        if (currentOverIndex < 0) {
                          return '3.0 ov';
                        }

                        // Use current over for in-progress innings
                        const currentOver = innings.overs[currentOverIndex];

                        // Count legal balls in current over for display
                        const legalBalls = currentOver.balls.filter(b => !b.isWide && !b.isNoball).length;

                        // Display as overNumber.ballNumber (0-indexed overs)
                        return `${currentOverIndex}.${legalBalls} ov`;
                      })()}
                    </div>
                  </>
                ) : (
                  <span className="text-muted-foreground">Waiting…</span>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </Card>
  );
}
