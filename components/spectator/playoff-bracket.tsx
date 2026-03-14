"use client";

import { Match, Team, StandingsEntry } from "@/lib/types";
import { Trophy, Crown, Swords, Zap, Star, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { getOverallStandingsForPlayoffs } from "@/lib/api/qualification";

interface PlayoffBracketProps {
  matches: Match[];
  teams: Team[];
}

export function PlayoffBracket({ matches, teams }: PlayoffBracketProps) {
  const [leagueStandings, setLeagueStandings] = useState<StandingsEntry[]>([]);

  // Load league standings using the same API as the standings page
  useEffect(() => {
    const loadStandings = async () => {
      try {
        const standings = await getOverallStandingsForPlayoffs("tdst-season-1");
        setLeagueStandings(standings);
      } catch (error) {
        console.error("Error loading standings for playoff bracket:", error);
      }
    };

    loadStandings();
  }, [matches]); // Reload when matches change

  const getTeam = (teamId: string | undefined) => {
    if (!teamId) return null;
    return teams.find(t => t.id === teamId) || null;
  };

  const getMatchWinners = (match: Match | undefined): string[] => {
    if (!match || match.state !== "COMPLETED" || !match.rankings) return [];
    return match.rankings
      .filter(r => r.rank <= 2)
      .sort((a, b) => a.rank - b.rank)
      .map(r => r.teamId);
  };

  // Get playoff matches
  const qf1Match = matches.find(m => m.matchNumber === 26); // Q1
  const qf2Match = matches.find(m => m.matchNumber === 27); // Q2
  const sf1Match = matches.find(m => m.matchNumber === 28); // SF1
  const sf2Match = matches.find(m => m.matchNumber === 29); // SF2
  const finalMatch = matches.find(m => m.matchNumber === 30); // Final

  // Get winners
  const qf1Winners = getMatchWinners(qf1Match);
  const qf2Winners = getMatchWinners(qf2Match);
  const sf1Winners = getMatchWinners(sf1Match);
  const sf2Winners = getMatchWinners(sf2Match);

  // Get QF teams (all 4 teams per match)
  const qf1Teams = qf1Match?.teamIds || [];
  const qf2Teams = qf2Match?.teamIds || [];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1f2e] via-[#0d3944] to-[#0a1f2e] p-1">
      {/* Animated stadium lights effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-40 h-40 bg-[#ffb300] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-red-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Card className="relative border-0 bg-gradient-to-br from-[#0d3944]/95 to-[#1a4a57]/95 backdrop-blur-sm shadow-2xl p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Trophy className="w-24 h-24 md:w-32 md:h-32 text-[#ffb300]" />
          </div>
          <div className="relative inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-[#ff9800] via-[#ffb300] to-[#ff9800] text-[#0d3944] shadow-2xl shadow-[#ffb300]/50 animate-pulse-glow mb-2 md:mb-3">
            <Trophy className="w-4 h-4 md:w-6 md:h-6 animate-bounce" />
            <span className="text-sm md:text-xl font-black uppercase tracking-wider md:tracking-widest">Playoff Bracket</span>
            <Trophy className="w-4 h-4 md:w-6 md:h-6 animate-bounce" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="text-white/80 text-xs md:text-base font-bold tracking-wide">🏆 Road to Championship 🏆</p>
        </div>

        {/* Bracket Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-4 items-center">

          {/* QUALIFIERS - Column 1 */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent blur-xl" />
              <Swords className="w-4 h-4 md:w-6 md:h-6 text-purple-400 animate-pulse relative z-10" />
              <h3 className="text-lg md:text-xl lg:text-2xl font-black text-white uppercase tracking-wide relative z-10 drop-shadow-lg">
                Qualifiers
              </h3>
              <Swords className="w-4 h-4 md:w-6 md:h-6 text-purple-400 animate-pulse relative z-10" />
            </div>

            {/* Q1 */}
            <div className="relative group">
              <div className="relative rounded-lg md:rounded-xl overflow-hidden border-2 border-purple-400 bg-gradient-to-br from-purple-600/30 via-purple-500/20 to-fuchsia-600/30 p-3 md:p-4 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 transition-all">
                {/* Stadium light effect */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-50" />

                <div className="text-center mb-2 md:mb-3 relative">
                  <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-purple-500/50 rounded-full text-xs md:text-sm font-black text-purple-200 uppercase tracking-wider border border-purple-300/50">
                    Q1 - Match #26
                  </span>
                </div>

                <div className="space-y-2">
                  {qf1Teams.map((teamId, idx) => {
                    const team = getTeam(teamId);
                    const isWinner = qf1Winners.includes(teamId);
                    const rank = qf1Winners.indexOf(teamId) + 1;
                    const leagueRank = leagueStandings.find(t => t.teamId === teamId)?.rank;

                    return (
                      <div
                        key={teamId || idx}
                        className={`relative rounded-lg p-2.5 text-center font-bold transition-all ${
                          isWinner
                            ? rank === 1
                              ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/50 scale-105'
                              : rank === 2
                              ? 'bg-gradient-to-r from-green-500/60 to-green-600/60 text-white'
                              : 'bg-white/10 text-white/90 hover:bg-white/20'
                            : 'bg-white/10 text-white/90 hover:bg-white/20'
                        }`}
                      >
                        {isWinner && rank === 1 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
                          </div>
                        )}
                        {isWinner && rank === 2 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Star className="w-3 h-3 text-gray-700 fill-gray-700" />
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2">
                          {team && (
                            <div
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: team.color }}
                            />
                          )}
                          <span className="text-sm truncate">{team?.name || 'Unknown'}</span>
                        </div>
                        {leagueRank && (
                          <div className="text-[10px] mt-0.5 text-purple-200/70">
                            League #{leagueRank}
                          </div>
                        )}
                        {isWinner && (
                          <div className="text-[10px] mt-0.5 text-green-200">
                            {rank === 1 ? '🥇 Winner' : rank === 2 ? '🥈 Runner-up' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Q2 */}
            <div className="relative group">
              <div className="relative rounded-lg md:rounded-xl overflow-hidden border-2 border-purple-400 bg-gradient-to-br from-purple-600/30 via-purple-500/20 to-fuchsia-600/30 p-3 md:p-4 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 transition-all">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-50" />

                <div className="text-center mb-2 md:mb-3">
                  <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-purple-500/50 rounded-full text-xs md:text-sm font-black text-purple-200 uppercase tracking-wider border border-purple-300/50">
                    Q2 - Match #27
                  </span>
                </div>

                <div className="space-y-2">
                  {qf2Teams.map((teamId, idx) => {
                    const team = getTeam(teamId);
                    const isWinner = qf2Winners.includes(teamId);
                    const rank = qf2Winners.indexOf(teamId) + 1;
                    const leagueRank = leagueStandings.find(t => t.teamId === teamId)?.rank;

                    return (
                      <div
                        key={teamId || idx}
                        className={`relative rounded-lg p-2.5 text-center font-bold transition-all ${
                          isWinner
                            ? rank === 1
                              ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/50 scale-105'
                              : rank === 2
                              ? 'bg-gradient-to-r from-green-500/60 to-green-600/60 text-white'
                              : 'bg-white/10 text-white/90 hover:bg-white/20'
                            : 'bg-white/10 text-white/90 hover:bg-white/20'
                        }`}
                      >
                        {isWinner && rank === 1 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
                          </div>
                        )}
                        {isWinner && rank === 2 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Star className="w-3 h-3 text-gray-700 fill-gray-700" />
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2">
                          {team && (
                            <div
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: team.color }}
                            />
                          )}
                          <span className="text-sm truncate">{team?.name || 'Unknown'}</span>
                        </div>
                        {leagueRank && (
                          <div className="text-[10px] mt-0.5 text-purple-200/70">
                            League #{leagueRank}
                          </div>
                        )}
                        {isWinner && (
                          <div className="text-[10px] mt-0.5 text-green-200">
                            {rank === 1 ? '🥇 Winner' : rank === 2 ? '🥈 Runner-up' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Connection Column */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="relative h-full flex flex-col items-center justify-around py-12">
              <div className="relative flex-1 flex items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-0.5 bg-gradient-to-r from-purple-400 to-amber-400" />
                  <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-amber-300 animate-pulse" />
                </div>
              </div>
              <div className="relative flex-1 flex items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-0.5 bg-gradient-to-r from-purple-400 to-amber-400" />
                  <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-amber-300 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* SEMI FINALS - Column 3 */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent blur-xl" />
              <Crown className="w-5 h-5 md:w-7 md:h-7 text-amber-400 animate-bounce relative z-10" />
              <h3 className="text-lg md:text-xl lg:text-2xl font-black text-white uppercase tracking-wide relative z-10 drop-shadow-lg">
                Semi Finals
              </h3>
              <Crown className="w-5 h-5 md:w-7 md:h-7 text-amber-400 animate-bounce relative z-10" style={{ animationDelay: '0.3s' }} />
            </div>

            {/* SF1: Q2 Top 2 + League 1st & 2nd */}
            <div className="relative group">
              <div className="relative rounded-lg md:rounded-xl overflow-hidden border-2 border-amber-400 bg-gradient-to-br from-amber-600/30 via-yellow-500/20 to-orange-600/30 p-3 md:p-4 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/50 transition-all">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-50" />

                <div className="text-center mb-2 md:mb-3">
                  <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-amber-500/50 rounded-full text-xs md:text-sm font-black text-amber-200 uppercase tracking-wider border border-amber-300/50">
                    SF1 - Match #28
                  </span>
                </div>

                <div className="space-y-2">
                  {/* League 1st & 2nd (Always show these teams) */}
                  {[1, 2].map((leagueRank) => {
                    const teamId = leagueStandings.find(t => t.rank === leagueRank)?.teamId;
                    const team = teamId ? getTeam(teamId) : null;
                    const isWinner = teamId && sf1Winners.includes(teamId);
                    const winnerRank = isWinner ? sf1Winners.indexOf(teamId) + 1 : 0;

                    return (
                      <div
                        key={`league-${leagueRank}`}
                        className={`relative rounded-lg p-2.5 text-center font-bold transition-all ${
                          team
                            ? isWinner
                              ? winnerRank === 1
                                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/50 scale-105'
                                : winnerRank === 2
                                ? 'bg-gradient-to-r from-green-500/60 to-green-600/60 text-white'
                                : 'bg-white/10 text-white/90 hover:bg-white/20'
                              : 'bg-white/10 text-white/90 hover:bg-white/20'
                            : 'bg-white/5 border-2 border-dashed border-white/20 text-white/40'
                        }`}
                      >
                        {isWinner && winnerRank === 1 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
                          </div>
                        )}
                        {isWinner && winnerRank === 2 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Star className="w-3 h-3 text-gray-700 fill-gray-700" />
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2">
                          {team && (
                            <div
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: team.color }}
                            />
                          )}
                          <span className="text-sm truncate">{team ? team.name : `League #${leagueRank}`}</span>
                        </div>
                        <div className="text-[10px] mt-0.5 text-amber-200/80">
                          League #{leagueRank}
                        </div>
                        {isWinner && (
                          <div className="text-[10px] mt-0.5 text-green-200">
                            {winnerRank === 1 ? '🥇 Winner' : winnerRank === 2 ? '🥈 Runner-up' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Q2 Winners (TBD or Confirmed) */}
                  {[0, 1].map((idx) => {
                    const teamId = qf2Winners[idx];
                    const team = getTeam(teamId);
                    const isWinner = teamId && sf1Winners.includes(teamId);
                    const winnerRank = isWinner ? sf1Winners.indexOf(teamId) + 1 : 0;

                    if (!team) {
                      return (
                        <div
                          key={`q2-${idx}`}
                          className="relative rounded-lg p-2.5 text-center font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-dashed border-amber-400/40 text-amber-200/70"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
                            <span className="text-sm">Q2 {idx === 0 ? 'Winner' : 'Runner-up'}</span>
                          </div>
                          <div className="text-[10px] mt-0.5 text-amber-300/60">To Be Decided</div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={teamId}
                        className={`relative rounded-lg p-2.5 text-center font-bold transition-all ${
                          isWinner
                            ? winnerRank === 1
                              ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/50 scale-105'
                              : winnerRank === 2
                              ? 'bg-gradient-to-r from-green-500/60 to-green-600/60 text-white'
                              : 'bg-white/10 text-white/90 hover:bg-white/20'
                            : 'bg-white/10 text-white/90 hover:bg-white/20'
                        }`}
                      >
                        {isWinner && winnerRank === 1 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
                          </div>
                        )}
                        {isWinner && winnerRank === 2 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Star className="w-3 h-3 text-gray-700 fill-gray-700" />
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="text-sm truncate">{team.name}</span>
                        </div>
                        <div className="text-[10px] mt-0.5 text-amber-200/80">
                          Q2 {idx === 0 ? 'Winner' : 'Runner-up'}
                        </div>
                        {isWinner && (
                          <div className="text-[10px] mt-0.5 text-green-200">
                            {winnerRank === 1 ? '🥇 Winner' : winnerRank === 2 ? '🥈 Runner-up' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SF2: Q1 Top 2 + League 3rd & 4th */}
            <div className="relative group">
              <div className="relative rounded-lg md:rounded-xl overflow-hidden border-2 border-amber-400 bg-gradient-to-br from-amber-600/30 via-yellow-500/20 to-orange-600/30 p-3 md:p-4 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-50" />

                <div className="text-center mb-2 md:mb-3">
                  <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-amber-500/50 rounded-full text-xs md:text-sm font-black text-amber-200 uppercase tracking-wider border border-amber-300/50">
                    SF2 - Match #29
                  </span>
                </div>

                <div className="space-y-2">
                  {/* League 3rd & 4th (Always show these teams) */}
                  {[3, 4].map((leagueRank) => {
                    const teamId = leagueStandings.find(t => t.rank === leagueRank)?.teamId;
                    const team = teamId ? getTeam(teamId) : null;
                    const isWinner = teamId && sf2Winners.includes(teamId);
                    const winnerRank = isWinner ? sf2Winners.indexOf(teamId) + 1 : 0;

                    return (
                      <div
                        key={`league-${leagueRank}`}
                        className={`relative rounded-lg p-2.5 text-center font-bold transition-all ${
                          team
                            ? isWinner
                              ? winnerRank === 1
                                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/50 scale-105'
                                : winnerRank === 2
                                ? 'bg-gradient-to-r from-green-500/60 to-green-600/60 text-white'
                                : 'bg-white/10 text-white/90 hover:bg-white/20'
                              : 'bg-white/10 text-white/90 hover:bg-white/20'
                            : 'bg-white/5 border-2 border-dashed border-white/20 text-white/40'
                        }`}
                      >
                        {isWinner && winnerRank === 1 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
                          </div>
                        )}
                        {isWinner && winnerRank === 2 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Star className="w-3 h-3 text-gray-700 fill-gray-700" />
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2">
                          {team && (
                            <div
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: team.color }}
                            />
                          )}
                          <span className="text-sm truncate">{team ? team.name : `League #${leagueRank}`}</span>
                        </div>
                        <div className="text-[10px] mt-0.5 text-amber-200/80">
                          League #{leagueRank}
                        </div>
                        {isWinner && (
                          <div className="text-[10px] mt-0.5 text-green-200">
                            {winnerRank === 1 ? '🥇 Winner' : winnerRank === 2 ? '🥈 Runner-up' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Q1 Winners (TBD or Confirmed) */}
                  {[0, 1].map((idx) => {
                    const teamId = qf1Winners[idx];
                    const team = getTeam(teamId);
                    const isWinner = teamId && sf2Winners.includes(teamId);
                    const winnerRank = isWinner ? sf2Winners.indexOf(teamId) + 1 : 0;

                    if (!team) {
                      return (
                        <div
                          key={`q1-${idx}`}
                          className="relative rounded-lg p-2.5 text-center font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-dashed border-amber-400/40 text-amber-200/70"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
                            <span className="text-sm">Q1 {idx === 0 ? 'Winner' : 'Runner-up'}</span>
                          </div>
                          <div className="text-[10px] mt-0.5 text-amber-300/60">To Be Decided</div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={teamId}
                        className={`relative rounded-lg p-2.5 text-center font-bold transition-all ${
                          isWinner
                            ? winnerRank === 1
                              ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/50 scale-105'
                              : winnerRank === 2
                              ? 'bg-gradient-to-r from-green-500/60 to-green-600/60 text-white'
                              : 'bg-white/10 text-white/90 hover:bg-white/20'
                            : 'bg-white/10 text-white/90 hover:bg-white/20'
                        }`}
                      >
                        {isWinner && winnerRank === 1 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
                          </div>
                        )}
                        {isWinner && winnerRank === 2 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Star className="w-3 h-3 text-gray-700 fill-gray-700" />
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="text-sm truncate">{team.name}</span>
                        </div>
                        <div className="text-[10px] mt-0.5 text-amber-200/80">
                          Q1 {idx === 0 ? 'Winner' : 'Runner-up'}
                        </div>
                        {isWinner && (
                          <div className="text-[10px] mt-0.5 text-green-200">
                            {winnerRank === 1 ? '🥇 Winner' : winnerRank === 2 ? '🥈 Runner-up' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Connection Column */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="relative h-full flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-0.5 bg-gradient-to-r from-amber-400 via-red-500 to-red-600" />
                <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-yellow-400 animate-pulse drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* GRAND FINALE - Column 5 (Centered) */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/30 to-transparent blur-xl" />
              <Trophy className="w-6 h-6 md:w-8 md:h-8 text-red-400 animate-spin-slow relative z-10" />
              <h3 className="text-lg md:text-xl lg:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 uppercase tracking-wide relative z-10 drop-shadow-2xl animate-pulse whitespace-nowrap">
                Grand Finale
              </h3>
              <Trophy className="w-6 h-6 md:w-8 md:h-8 text-red-400 animate-spin-slow relative z-10" />
            </div>

            <div className="relative rounded-lg md:rounded-xl overflow-hidden border-2 md:border-3 border-red-500 bg-gradient-to-br from-red-600/40 via-red-500/30 to-amber-600/40 p-4 md:p-6 shadow-2xl shadow-red-500/50 w-full max-w-md">
              {/* Epic background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-red-600/10" />
              <div className="absolute top-0 left-0 right-0 h-1 md:h-2 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-70 animate-pulse" />
              <div className="absolute bottom-0 left-0 right-0 h-1 md:h-2 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-70 animate-pulse" style={{ animationDelay: '1s' }} />

              <div className="relative text-center mb-3 md:mb-4">
                <span className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-red-600 to-red-500 rounded-full text-xs md:text-sm font-black text-red-100 uppercase tracking-wider md:tracking-widest border-2 border-red-300/50 shadow-lg">
                  🏆 Match #30 🏆
                </span>
              </div>

              <div className="relative space-y-2">
                {finalMatch && finalMatch.state === "COMPLETED" && finalMatch.rankings ? (
                  // Show completed final results
                  finalMatch.rankings
                    .slice(0, 4)
                    .sort((a, b) => a.rank - b.rank)
                    .map((ranking, idx) => {
                      const team = getTeam(ranking.teamId);
                      const isWinner = idx === 0;
                      const isRunnerUp = idx === 1;

                      return (
                        <div
                          key={ranking.teamId}
                          className={`relative rounded-lg p-3 text-center font-bold transition-all ${
                            isWinner
                              ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-yellow-900 shadow-2xl shadow-yellow-500/70 scale-105 border-2 border-yellow-300'
                              : isRunnerUp
                              ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/50'
                              : 'bg-white/10 text-white/90'
                          }`}
                        >
                          {isWinner && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-3xl animate-bounce">
                              👑
                            </div>
                          )}
                          <div className="flex items-center justify-center gap-2">
                            {team && (
                              <div
                                className={`w-5 h-5 rounded-full border-2 shadow-lg flex-shrink-0 ${
                                  isWinner ? 'border-yellow-900' : 'border-white'
                                }`}
                                style={{ backgroundColor: team.color }}
                              />
                            )}
                            <span className="text-sm truncate">{team?.name || 'Unknown'}</span>
                          </div>
                          {isWinner && (
                            <div className="text-xs mt-1 font-black uppercase tracking-wider">
                              🏆 Champion
                            </div>
                          )}
                          {isRunnerUp && (
                            <div className="text-xs mt-1 text-gray-200">
                              🥈 Runner-up
                            </div>
                          )}
                        </div>
                      );
                    })
                ) : finalMatch && finalMatch.state === "IN_PROGRESS" ? (
                  <div className="text-center py-6">
                    <div className="text-6xl animate-pulse mb-4">⚡</div>
                    <p className="text-xl font-bold text-white uppercase tracking-wide animate-pulse">
                      Epic Battle in Progress!
                    </p>
                  </div>
                ) : (
                  // Show all 4 teams (SF1 top 2 + SF2 top 2)
                  <div className="space-y-2">
                    {/* SF1 Top 2 */}
                    {[0, 1].map((idx) => {
                      const teamId = sf1Winners[idx];
                      const team = getTeam(teamId);

                      if (!team) {
                        return (
                          <div
                            key={`sf1-${idx}`}
                            className="relative rounded-lg p-2.5 text-center font-bold bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-dashed border-red-400/40 text-red-200/70"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Trophy className="w-4 h-4 text-red-300 animate-pulse" />
                              <span className="text-sm">SF1 {idx === 0 ? 'Winner' : 'Runner-up'}</span>
                            </div>
                            <div className="text-[10px] mt-0.5 text-red-300/60">To Be Decided</div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={teamId}
                          className="relative rounded-lg p-2.5 text-center font-bold transition-all bg-white/10 text-white/90 border-2 border-white/30 hover:bg-white/20"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: team.color }}
                            />
                            <span className="text-sm truncate">{team.name}</span>
                          </div>
                          <div className="text-[10px] mt-0.5 text-red-200/80">SF1 {idx === 0 ? 'Winner' : 'Runner-up'}</div>
                        </div>
                      );
                    })}

                    {/* SF2 Top 2 */}
                    {[0, 1].map((idx) => {
                      const teamId = sf2Winners[idx];
                      const team = getTeam(teamId);

                      if (!team) {
                        return (
                          <div
                            key={`sf2-${idx}`}
                            className="relative rounded-lg p-2.5 text-center font-bold bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-dashed border-red-400/40 text-red-200/70"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Trophy className="w-4 h-4 text-red-300 animate-pulse" />
                              <span className="text-sm">SF2 {idx === 0 ? 'Winner' : 'Runner-up'}</span>
                            </div>
                            <div className="text-[10px] mt-0.5 text-red-300/60">To Be Decided</div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={teamId}
                          className="relative rounded-lg p-2.5 text-center font-bold transition-all bg-white/10 text-white/90 border-2 border-white/30 hover:bg-white/20"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: team.color }}
                            />
                            <span className="text-sm truncate">{team.name}</span>
                          </div>
                          <div className="text-[10px] mt-0.5 text-red-200/80">SF2 {idx === 0 ? 'Winner' : 'Runner-up'}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-gradient-to-r from-green-600 to-green-500" />
            <span className="text-white/70">Winner</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-gradient-to-r from-green-500/60 to-green-600/60" />
            <span className="text-white/70">Runner-up</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-white/10 border-2 border-dashed border-white/20" />
            <span className="text-white/70">To be decided</span>
          </div>
        </div>
      </Card>

      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 40px rgba(255, 179, 0, 0.5);
          }
          50% {
            box-shadow: 0 0 60px rgba(255, 179, 0, 0.8);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
