"use client";

import { Match, Team } from "@/lib/types";
import { Trophy, Crown, Swords } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PlayoffBracketProps {
  matches: Match[];
  teams: Team[];
}

export function PlayoffBracket({ matches, teams }: PlayoffBracketProps) {
  // Group matches by stage
  const qfMatches = matches.filter(m => m.stage === "QF");
  const sfMatches = matches.filter(m => m.stage === "SEMI");
  const finalMatch = matches.find(m => m.stage === "FINAL");

  const getTeamName = (teamId: string | undefined) => {
    if (!teamId) return "TBD";
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : "TBD";
  };

  const getMatchWinners = (match: Match | undefined): string[] => {
    if (!match || match.state !== "COMPLETED" || !match.rankings) return [];
    return match.rankings
      .filter(r => r.rank <= 2)
      .sort((a, b) => a.rank - b.rank)
      .map(r => r.teamId);
  };

  const qf1Winners = getMatchWinners(qfMatches.find(m => m.matchNumber === 26));
  const qf2Winners = getMatchWinners(qfMatches.find(m => m.matchNumber === 27));
  const sf1Winners = getMatchWinners(sfMatches.find(m => m.matchNumber === 28));
  const sf2Winners = getMatchWinners(sfMatches.find(m => m.matchNumber === 29));

  return (
    <Card className="border-2 border-[#ffb300] bg-gradient-to-br from-[#0d3944] to-[#1a4a57] shadow-2xl p-6">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] text-sm font-black uppercase tracking-wide shadow-lg mb-2">
          <Trophy className="w-4 h-4" />
          Playoff Bracket
        </div>
        <p className="text-white/70 text-sm">Tournament progression tree</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Quarter Finals Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Swords className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-black text-white uppercase">Quarter Finals</h3>
          </div>

          {/* QF1 */}
          <div className="relative">
            <div className="absolute -right-3 top-1/2 w-3 h-0.5 bg-gradient-to-r from-purple-400 to-transparent hidden md:block" />
            <div className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-2 border-purple-400 rounded-lg p-3 space-y-2">
              <div className="text-center mb-2">
                <span className="text-xs font-bold text-purple-300">QF1</span>
              </div>
              {qf1Winners.length > 0 ? (
                qf1Winners.map((teamId, idx) => (
                  <div
                    key={teamId}
                    className={`text-sm font-bold text-white px-2 py-1 rounded ${
                      idx === 0 ? 'bg-green-600/50' : 'bg-green-500/30'
                    }`}
                  >
                    {idx + 1}. {getTeamName(teamId)}
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/50 text-center py-2">
                  Awaiting results
                </div>
              )}
            </div>
          </div>

          {/* QF2 */}
          <div className="relative">
            <div className="absolute -right-3 top-1/2 w-3 h-0.5 bg-gradient-to-r from-purple-400 to-transparent hidden md:block" />
            <div className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-2 border-purple-400 rounded-lg p-3 space-y-2">
              <div className="text-center mb-2">
                <span className="text-xs font-bold text-purple-300">QF2</span>
              </div>
              {qf2Winners.length > 0 ? (
                qf2Winners.map((teamId, idx) => (
                  <div
                    key={teamId}
                    className={`text-sm font-bold text-white px-2 py-1 rounded ${
                      idx === 0 ? 'bg-green-600/50' : 'bg-green-500/30'
                    }`}
                  >
                    {idx + 1}. {getTeamName(teamId)}
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/50 text-center py-2">
                  Awaiting results
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Semi Finals Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white uppercase">Semi Finals</h3>
          </div>

          {/* SF1 */}
          <div className="relative">
            <div className="absolute -right-3 top-1/2 w-3 h-0.5 bg-gradient-to-r from-amber-400 to-transparent hidden md:block" />
            <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-2 border-amber-400 rounded-lg p-3 space-y-2">
              <div className="text-center mb-2">
                <span className="text-xs font-bold text-amber-300">SF1</span>
              </div>
              {sf1Winners.length > 0 ? (
                sf1Winners.map((teamId, idx) => (
                  <div
                    key={teamId}
                    className={`text-sm font-bold text-white px-2 py-1 rounded ${
                      idx === 0 ? 'bg-green-600/50' : 'bg-green-500/30'
                    }`}
                  >
                    {idx + 1}. {getTeamName(teamId)}
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/50 text-center py-2">
                  Awaiting results
                </div>
              )}
            </div>
          </div>

          {/* SF2 */}
          <div className="relative">
            <div className="absolute -right-3 top-1/2 w-3 h-0.5 bg-gradient-to-r from-amber-400 to-transparent hidden md:block" />
            <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-2 border-amber-400 rounded-lg p-3 space-y-2">
              <div className="text-center mb-2">
                <span className="text-xs font-bold text-amber-300">SF2</span>
              </div>
              {sf2Winners.length > 0 ? (
                sf2Winners.map((teamId, idx) => (
                  <div
                    key={teamId}
                    className={`text-sm font-bold text-white px-2 py-1 rounded ${
                      idx === 0 ? 'bg-green-600/50' : 'bg-green-500/30'
                    }`}
                  >
                    {idx + 1}. {getTeamName(teamId)}
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/50 text-center py-2">
                  Awaiting results
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Final Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-black text-white uppercase">Grand Finale</h3>
          </div>

          <div className="bg-gradient-to-br from-red-600/30 to-amber-500/30 border-2 border-red-500 rounded-lg p-4">
            <div className="text-center mb-3">
              <span className="text-xs font-bold text-red-300">CHAMPIONSHIP</span>
            </div>

            {finalMatch && finalMatch.state === "COMPLETED" && finalMatch.rankings ? (
              <div className="space-y-2">
                {finalMatch.rankings
                  .slice(0, 2)
                  .sort((a, b) => a.rank - b.rank)
                  .map((ranking, idx) => (
                    <div
                      key={ranking.teamId}
                      className={`text-sm font-bold text-white px-3 py-2 rounded-lg text-center ${
                        idx === 0
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500 shadow-lg shadow-yellow-500/50'
                          : 'bg-gray-600/50'
                      }`}
                    >
                      {idx === 0 && <span className="mr-1">🏆</span>}
                      {getTeamName(ranking.teamId)}
                      {idx === 0 && <span className="block text-xs mt-1">CHAMPION</span>}
                    </div>
                  ))}
              </div>
            ) : finalMatch && finalMatch.state === "IN_PROGRESS" ? (
              <div className="text-sm text-white text-center py-4">
                <span className="text-2xl animate-pulse">⚡</span>
                <p className="mt-2 font-bold">Battle in Progress</p>
              </div>
            ) : (
              <div className="text-sm text-white/50 text-center py-4">
                Awaiting Finalists
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
