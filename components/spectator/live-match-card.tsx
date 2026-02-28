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

  // Calculate match statistics with wicket breakdown by team
  const calculateMatchStats = () => {
    let fours = 0;
    let sixes = 0;
    const wicketsByTeam: Record<string, number> = {};

    match.innings.forEach(innings => {
      innings.overs.forEach(over => {
        over.balls.forEach(ball => {
          // Count boundaries (exclude wides and noballs from boundary count)
          if (!ball.isWide && !ball.isNoball) {
            if (ball.runs === 4) fours++;
            if (ball.runs === 6) sixes++;
          }
          // Count wickets by fielding team
          if (ball.isWicket && ball.fieldingTeamId) {
            wicketsByTeam[ball.fieldingTeamId] = (wicketsByTeam[ball.fieldingTeamId] || 0) + 1;
          }
        });
      });
    });

    const totalWickets = Object.values(wicketsByTeam).reduce((sum, w) => sum + w, 0);

    return { fours, sixes, totalWickets, wicketsByTeam };
  };

  // Find currently batting team (IN_PROGRESS innings)
  const getCurrentlyBattingTeamId = () => {
    const currentInnings = match.innings.find(inn => inn.state === "IN_PROGRESS");
    return currentInnings?.teamId || null;
  };

  // Find currently bowling team (from current over in IN_PROGRESS innings)
  const getCurrentlyBowlingTeamId = () => {
    const currentInnings = match.innings.find(inn => inn.state === "IN_PROGRESS");
    if (!currentInnings || !currentInnings.overs || currentInnings.overs.length === 0) {
      return null;
    }

    // Find the current incomplete over
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

  const stats = match.state === "IN_PROGRESS" ? calculateMatchStats() : null;
  const showBanner = match.state === "IN_PROGRESS" && stats && (stats.fours > 0 || stats.sixes > 0 || stats.totalWickets > 0);
  const battingTeamId = match.state === "IN_PROGRESS" ? getCurrentlyBattingTeamId() : null;
  const bowlingTeamId = match.state === "IN_PROGRESS" ? getCurrentlyBowlingTeamId() : null;

  return (
    <Card className="p-6 relative overflow-hidden">
      {/* Cricket Stats Banner - Only for LIVE matches */}
      {showBanner && stats && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#0d3944] via-[#1a5f7a] to-[#0d3944] h-12 flex items-center justify-center gap-6 shadow-lg z-10 animate-in slide-in-from-top duration-500">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>

          {/* Fours */}
          {stats.fours > 0 && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 backdrop-blur-sm rounded-full border-2 border-blue-400 shadow-xl animate-in zoom-in duration-300">
              <span className="text-white font-black text-2xl tabular-nums">4</span>
              <span className="text-blue-200 text-sm font-bold">FOUR{stats.fours !== 1 ? 'S' : ''}</span>
              {stats.fours > 1 && (
                <span className="text-white font-black text-lg">×{stats.fours}</span>
              )}
            </div>
          )}

          {/* Sixes */}
          {stats.sixes > 0 && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-500/20 backdrop-blur-sm rounded-full border-2 border-purple-400 shadow-xl animate-in zoom-in duration-300 delay-100">
              <span className="text-white font-black text-2xl tabular-nums">6</span>
              <span className="text-purple-200 text-sm font-bold">SIX{stats.sixes !== 1 ? 'ES' : ''}</span>
              {stats.sixes > 1 && (
                <span className="text-white font-black text-lg">×{stats.sixes}</span>
              )}
            </div>
          )}

          {/* Wickets - Show team breakdown if multiple teams */}
          {stats.totalWickets > 0 && (
            <div className="flex items-center gap-3 px-4 py-1.5 bg-red-500/20 backdrop-blur-sm rounded-full border-2 border-red-400 shadow-xl animate-in zoom-in duration-300 delay-200">
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-2xl tabular-nums">{stats.totalWickets}</span>
                <span className="text-red-200 text-sm font-bold">WICKET{stats.totalWickets !== 1 ? 'S' : ''}</span>
              </div>
              {Object.keys(stats.wicketsByTeam).length > 1 && (
                <div className="flex items-center gap-2 border-l border-red-300/30 pl-3">
                  {Object.entries(stats.wicketsByTeam).map(([teamId, count]) => {
                    const team = getTeam(teamId);
                    return (
                      <div key={teamId} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team?.color }}></div>
                        <span className="text-white text-xs font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
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

          const isBatting = battingTeamId === teamId;
          const isBowling = bowlingTeamId === teamId;

          return (
            <div
              key={teamId}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                isBatting
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 shadow-lg'
                  : isBowling
                  ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-500 shadow-lg'
                  : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: team?.color }}
                  />
                  {isBatting && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
                  )}
                  {isBowling && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{team?.name ?? "—"}</span>
                    {isBatting && (
                      <Badge className="bg-green-600 text-white text-[10px] px-2 py-0">BATTING</Badge>
                    )}
                    {isBowling && (
                      <Badge className="bg-orange-600 text-white text-[10px] px-2 py-0">BOWLING</Badge>
                    )}
                  </div>
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
