"use client";

import { useEffect, useState } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, Trophy, Download } from "lucide-react";
import Image from "next/image";
import type { Match } from "@/lib/types";

export default function ScorecardsPage() {
  const { matches, teams, loadMatches, loadTeams, tournament } = useTournamentStore();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    loadMatches();
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedMatches = matches.filter(m => m.state === "COMPLETED");

  const handlePrint = () => {
    window.print();
  };

  if (!selectedMatch) {
    return (
      <div className="min-h-screen tournament-bg-pattern p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-black text-[#0d3944] mb-2">Match Scorecards</h1>
              <p className="text-gray-600">Select a completed match to view its scorecard</p>
            </div>

            {completedMatches.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-semibold">No completed matches yet</p>
                <p className="text-gray-400 text-sm mt-2">Scorecards will appear here after matches are completed</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedMatches.map((match) => {
                  const getTeamName = (teamId: string) => {
                    const team = teams.find(t => t.id === teamId);
                    return team?.name || "Unknown";
                  };

                  return (
                    <Card
                      key={match.id}
                      className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-gray-200 hover:border-[#ff9800]"
                      onClick={() => setSelectedMatch(match)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-black text-[#ff9800]">Match #{match.matchNumber}</span>
                        <span className="text-xs font-bold text-gray-500">Court {match.court}</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-gray-700">{getTeamName(match.teamIds[0])} vs {getTeamName(match.teamIds[1])}</p>
                        <p className="font-semibold text-gray-700">{getTeamName(match.teamIds[2])} vs {getTeamName(match.teamIds[3])}</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          {match.startTime ? new Date(match.startTime).toLocaleDateString() : "Date TBD"}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen tournament-bg-pattern p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Action Buttons - Hidden when printing */}
        <Card className="p-4 mb-6 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <Button
                onClick={() => setSelectedMatch(null)}
                variant="outline"
                className="font-bold"
              >
                ← Back to Match List
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handlePrint}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print / Save as PDF
              </Button>
            </div>
          </div>
        </Card>

        {/* Printable Scorecard */}
        <div className="bg-white">
          <ScorecardDocument match={selectedMatch} teams={teams} tournamentName={tournament.name} />
        </div>
      </div>

      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
          .tournament-bg-pattern {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}

interface ScorecardDocumentProps {
  match: Match;
  teams: any[];
  tournamentName: string;
}

function ScorecardDocument({ match, teams, tournamentName }: ScorecardDocumentProps) {
  const getTeam = (teamId: string) => {
    return teams.find(t => t.id === teamId);
  };

  const team1 = getTeam(match.teamIds[0]);
  const team2 = getTeam(match.teamIds[1]);
  const team3 = getTeam(match.teamIds[2]);
  const team4 = getTeam(match.teamIds[3]);

  // Get rankings from match results
  const rankings = match.rankings || [];

  return (
    <div className="w-full bg-white p-12 print:p-8">
      {/* Header */}
      <div className="relative mb-10 pb-6 border-b-4 border-[#ff9800]">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600"></div>
        </div>

        <div className="relative flex items-start justify-between">
          {/* Left - Tournament Logo */}
          <div className="flex-1">
            <div className="relative w-32 h-32">
              <Image
                src="/logos/dual-strike-logo.png"
                alt="Tournament Logo"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
          </div>

          {/* Center - Title */}
          <div className="flex-1 text-center py-4">
            <div className="inline-block">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2 rounded-full mb-3 shadow-lg">
                <p className="text-xs font-black tracking-widest">OFFICIAL SCORECARD</p>
              </div>
              <h1 className="text-4xl font-black text-[#0d3944] mb-2 tracking-tight">
                MATCH #{match.matchNumber}
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto mb-2"></div>
              <p className="text-xl font-bold text-gray-700">{tournamentName}</p>
              <p className="text-sm text-gray-500 mt-1 font-semibold">
                Court {match.court} • {match.startTime ? new Date(match.startTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                }) : "Date TBD"}
              </p>
            </div>
          </div>

          {/* Right - Sponsor Logo */}
          <div className="flex-1 flex justify-end">
            <div className="relative w-32 h-32">
              <Image
                src="/logos/sponsor.png"
                alt="Sponsor Logo"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Match Details */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-[#0d3944] to-[#1a5568] text-white p-4 rounded-t-2xl">
          <h2 className="text-xl font-black tracking-wide flex items-center gap-3">
            <Trophy className="w-6 h-6" />
            MATCH DETAILS
          </h2>
        </div>
        <div className="border-4 border-[#0d3944] rounded-b-2xl p-6 bg-gray-50">
          <div className="grid grid-cols-2 gap-6">
            {/* First Battle */}
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">FIRST BATTLE</p>
              <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border-3 border-white shadow-md"
                    style={{ backgroundColor: team1?.color }}
                  ></div>
                  <span className="text-lg font-black text-gray-900">{team1?.name}</span>
                </div>
                <span className="text-2xl font-black text-gray-400">vs</span>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-gray-900">{team2?.name}</span>
                  <div
                    className="w-10 h-10 rounded-full border-3 border-white shadow-md"
                    style={{ backgroundColor: team2?.color }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Second Battle */}
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">SECOND BATTLE</p>
              <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border-3 border-white shadow-md"
                    style={{ backgroundColor: team3?.color }}
                  ></div>
                  <span className="text-lg font-black text-gray-900">{team3?.name}</span>
                </div>
                <span className="text-2xl font-black text-gray-400">vs</span>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-gray-900">{team4?.name}</span>
                  <div
                    className="w-10 h-10 rounded-full border-3 border-white shadow-md"
                    style={{ backgroundColor: team4?.color }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-t-2xl">
          <h2 className="text-xl font-black tracking-wide flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            FINAL STANDINGS
          </h2>
        </div>
        <div className="border-4 border-amber-500 rounded-b-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-amber-400 to-orange-500">
                <th className="p-4 text-center font-black text-white border-r-2 border-white/30 w-20">
                  RANK
                </th>
                <th className="p-4 text-left font-black text-white border-r-2 border-white/30">
                  TEAM
                </th>
                <th className="p-4 text-center font-black text-white border-r-2 border-white/30 w-32">
                  SCORE
                </th>
                <th className="p-4 text-center font-black text-white border-r-2 border-white/30 w-32">
                  WICKETS
                </th>
                <th className="p-4 text-center font-black text-white w-32">
                  POINTS
                </th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((ranking, index) => {
                const team = getTeam(ranking.teamId);
                const isWinner = index === 0;
                return (
                  <tr
                    key={ranking.teamId}
                    className={`border-b-2 border-gray-200 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } ${isWinner ? 'bg-amber-50' : ''}`}
                  >
                    <td className="p-4 border-r-2 border-gray-200">
                      <div className="flex items-center justify-center">
                        <span className={`text-2xl font-black ${
                          isWinner ? 'text-amber-600' : 'text-gray-600'
                        } ${isWinner ? 'bg-amber-100' : 'bg-gray-100'} w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                          isWinner ? 'border-amber-300' : 'border-gray-300'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 border-r-2 border-gray-200">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full border-3 border-white shadow-lg flex-shrink-0"
                          style={{ backgroundColor: team?.color }}
                        ></div>
                        <div>
                          <p className="text-lg font-black text-[#0d3944]">
                            {team?.name}
                          </p>
                          {isWinner && (
                            <p className="text-xs text-amber-600 font-bold uppercase">Winner</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center border-r-2 border-gray-200">
                      <span className="text-2xl font-black text-gray-900">{ranking.totalScore}</span>
                    </td>
                    <td className="p-4 text-center border-r-2 border-gray-200">
                      <span className="text-2xl font-black text-red-600">{ranking.totalDismissals}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-2xl font-black ${
                        isWinner ? 'text-amber-600' : 'text-[#0d3944]'
                      }`}>
                        {ranking.points}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Innings Summary */}
      {match.innings && match.innings.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#0d3944] to-[#1a5568] text-white p-4 rounded-t-2xl">
            <h2 className="text-xl font-black tracking-wide flex items-center gap-3">
              <span className="text-2xl">📊</span>
              INNINGS SUMMARY
            </h2>
          </div>
          <div className="border-4 border-[#0d3944] rounded-b-2xl p-6 bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              {match.innings.map((innings, idx) => {
                const team = getTeam(innings.teamId);
                const totalRuns = innings.totalRuns || 0;
                const totalWickets = innings.totalWickets || 0;
                const ballsFaced = innings.overs?.reduce((sum, over) => sum + (over.balls?.length || 0), 0) || 0;

                return (
                  <div key={innings.id} className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: team?.color }}
                      ></div>
                      <p className="text-lg font-black text-gray-900">{team?.name}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-600">Total Runs:</span>
                        <span className="text-2xl font-black text-[#ff9800]">{totalRuns}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-600">Wickets Lost:</span>
                        <span className="text-2xl font-black text-red-600">{totalWickets}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-600">Balls Faced:</span>
                        <span className="text-xl font-black text-gray-700">{ballsFaced}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 pt-6 border-t-4 border-[#ff9800]">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="h-px bg-gray-400 w-40 mx-auto mb-2"></div>
            <p className="text-sm font-bold text-gray-600">Umpire</p>
            <p className="text-xs text-gray-500 mt-1">Signature & Date</p>
          </div>
          <div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Generated on</p>
              <p className="text-lg font-black text-[#ff9800]">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-600 font-bold mt-2">
                Official Match Scorecard
              </p>
            </div>
          </div>
          <div>
            <div className="h-px bg-gray-400 w-40 mx-auto mb-2"></div>
            <p className="text-sm font-bold text-gray-600">Match Commissioner</p>
            <p className="text-xs text-gray-500 mt-1">Signature & Date</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 font-bold">
            This is an official document of {tournamentName}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            🏏 Powered by Dual Strike Scoring System
          </p>
        </div>
      </div>
    </div>
  );
}
