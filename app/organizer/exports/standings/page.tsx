"use client";

import { useEffect } from "react";
import { useStandingsStore } from "@/lib/stores/standings-store";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, Download } from "lucide-react";
import Image from "next/image";

export default function StandingsExportPage() {
  const { standings, loadStandings } = useStandingsStore();
  const { teams, tournament } = useTournamentStore();

  useEffect(() => {
    loadStandings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    // Create CSV content
    const headers = ["Rank", "Team", "Matches Played", "Points", "Total Runs", "Total Wickets", "Net Run Rate"];
    const rows = standings.map((standing, index) => {
      const team = teams.find(t => t.id === standing.teamId);
      const netRunRate = standing.matchesPlayed > 0
        ? ((standing.totalRuns - standing.totalDismissals * 5) / standing.matchesPlayed).toFixed(2)
        : "0.00";

      return [
        index + 1,
        team?.name || "Unknown",
        standing.matchesPlayed,
        standing.points,
        standing.totalRuns,
        standing.totalDismissals,
        netRunRate
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${tournament.name.replace(/\s+/g, '_')}_Standings.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen tournament-bg-pattern p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Action Buttons - Hidden when printing */}
        <Card className="p-4 mb-6 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#0d3944]">Tournament Standings</h1>
              <p className="text-sm text-gray-600 mt-1">{tournament.name}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleDownloadCSV}
                variant="outline"
                className="font-bold border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
              <Button
                onClick={handlePrint}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print / Save as PDF
              </Button>
            </div>
          </div>
        </Card>

        {/* Printable Standings Document */}
        <div className="bg-white">
          <StandingsDocument standings={standings} teams={teams} tournamentName={tournament.name} />
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

interface StandingsDocumentProps {
  standings: any[];
  teams: any[];
  tournamentName: string;
}

function StandingsDocument({ standings, teams, tournamentName }: StandingsDocumentProps) {
  const getTeam = (teamId: string) => {
    return teams.find(t => t.id === teamId);
  };

  return (
    <div className="w-full bg-white p-12 print:p-8">
      {/* Header with Logos */}
      <div className="relative mb-10 pb-6 border-b-4 border-emerald-500">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(16,185,129,0.1) 35px, rgba(16,185,129,0.1) 70px)`
          }}></div>
        </div>

        <div className="relative flex items-start justify-between">
          {/* Left - Tournament Logo */}
          <div className="flex-1">
            <div className="relative w-40 h-40">
              <Image
                src="/logos/dual-strike-logo.png"
                alt="Tournament Logo"
                width={160}
                height={160}
                className="object-contain"
              />
            </div>
          </div>

          {/* Center - Title */}
          <div className="flex-1 text-center py-6">
            <div className="inline-block">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2 rounded-full mb-3 shadow-lg">
                <p className="text-xs font-black tracking-widest">OFFICIAL STANDINGS</p>
              </div>
              <h1 className="text-5xl font-black text-[#0d3944] mb-3 tracking-tight">
                POINTS TABLE
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-emerald-500 to-green-600 mx-auto mb-3"></div>
              <p className="text-2xl font-bold text-gray-700">{tournamentName}</p>
              <p className="text-sm text-gray-500 mt-2 font-semibold">
                Season 2 • {new Date().getFullYear()}
              </p>
            </div>
          </div>

          {/* Right - Sponsor Logo */}
          <div className="flex-1 flex justify-end">
            <div className="relative w-40 h-40">
              <Image
                src="/logos/sponsor.png"
                alt="Sponsor Logo"
                width={160}
                height={160}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Decorations */}
        <div className="absolute top-4 left-1/4 text-5xl opacity-10">🏆</div>
        <div className="absolute bottom-4 right-1/4 text-5xl opacity-10">📊</div>
      </div>

      {/* Tournament Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-xl border-2 border-emerald-500/30">
          <p className="text-xs font-bold text-gray-600 mb-1">TOTAL TEAMS</p>
          <p className="text-4xl font-black text-emerald-600">{teams.length}</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-[#ff9800]/10 to-[#ffb300]/10 rounded-xl border-2 border-[#ff9800]/30">
          <p className="text-xs font-bold text-gray-600 mb-1">MATCHES PLAYED</p>
          <p className="text-4xl font-black text-[#ff9800]">
            {standings.reduce((sum, s) => sum + s.matchesPlayed, 0) / 4}
          </p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-[#0d3944]/10 to-[#1a5568]/10 rounded-xl border-2 border-[#0d3944]/30">
          <p className="text-xs font-bold text-gray-600 mb-1">TOTAL RUNS</p>
          <p className="text-4xl font-black text-[#0d3944]">
            {standings.reduce((sum, s) => sum + s.totalRuns, 0)}
          </p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-rose-600/10 rounded-xl border-2 border-red-500/30">
          <p className="text-xs font-bold text-gray-600 mb-1">TOTAL WICKETS</p>
          <p className="text-4xl font-black text-red-600">
            {standings.reduce((sum, s) => sum + s.totalWickets, 0)}
          </p>
        </div>
      </div>

      {/* Standings Table */}
      <div className="mb-10">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-4 rounded-t-2xl">
          <h2 className="text-2xl font-black tracking-wide flex items-center gap-3">
            <span className="text-3xl">📊</span>
            TOURNAMENT STANDINGS
          </h2>
        </div>

        <div className="border-4 border-emerald-500 rounded-b-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-400 to-green-500">
                <th className="p-4 text-center font-black text-white text-lg border-r-2 border-white/30 w-20">
                  RANK
                </th>
                <th className="p-4 text-left font-black text-white text-lg border-r-2 border-white/30">
                  TEAM
                </th>
                <th className="p-4 text-center font-black text-white text-lg border-r-2 border-white/30 w-28">
                  PLAYED
                </th>
                <th className="p-4 text-center font-black text-white text-lg border-r-2 border-white/30 w-28">
                  POINTS
                </th>
                <th className="p-4 text-center font-black text-white text-lg border-r-2 border-white/30 w-28">
                  RUNS
                </th>
                <th className="p-4 text-center font-black text-white text-lg border-r-2 border-white/30 w-28">
                  WICKETS
                </th>
                <th className="p-4 text-center font-black text-white text-lg w-32">
                  NRR
                </th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing, index) => {
                const team = getTeam(standing.teamId);
                const isTopThree = index < 3;
                const netRunRate = standing.matchesPlayed > 0
                  ? ((standing.totalRuns - standing.totalDismissals * 5) / standing.matchesPlayed).toFixed(2)
                  : "0.00";

                const rankColors = [
                  "from-amber-500 to-yellow-500", // 1st
                  "from-gray-400 to-gray-500", // 2nd
                  "from-orange-600 to-amber-700", // 3rd
                ];

                return (
                  <tr
                    key={standing.teamId}
                    className={`border-b-2 border-gray-200 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } ${isTopThree ? 'bg-emerald-50/50' : ''}`}
                  >
                    <td className="p-5 border-r-2 border-gray-200">
                      <div className="flex items-center justify-center">
                        <span className={`text-2xl font-black ${
                          isTopThree
                            ? `bg-gradient-to-r ${rankColors[index]} text-white`
                            : 'bg-gray-100 text-gray-600'
                        } w-14 h-14 rounded-full flex items-center justify-center border-3 ${
                          isTopThree ? 'border-white shadow-lg' : 'border-gray-300'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 border-r-2 border-gray-200">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full border-4 border-white shadow-lg flex-shrink-0"
                          style={{ backgroundColor: team?.color }}
                        ></div>
                        <div>
                          <p className="text-xl font-black text-[#0d3944] leading-tight">
                            {team?.name}
                          </p>
                          {index === 0 && (
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mt-1">
                              🏆 Leader
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center border-r-2 border-gray-200">
                      <span className="text-2xl font-black text-gray-700">{standing.matchesPlayed}</span>
                    </td>
                    <td className="p-5 text-center border-r-2 border-gray-200">
                      <span className="text-2xl font-black text-emerald-600">{standing.points}</span>
                    </td>
                    <td className="p-5 text-center border-r-2 border-gray-200">
                      <span className="text-2xl font-black text-[#ff9800]">{standing.totalRuns}</span>
                    </td>
                    <td className="p-5 text-center border-r-2 border-gray-200">
                      <span className="text-2xl font-black text-red-600">{standing.totalDismissals}</span>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`text-xl font-black ${
                        parseFloat(netRunRate) > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {netRunRate}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Points Calculation Guide */}
      <div className="mb-10">
        <div className="bg-gradient-to-r from-[#0d3944] to-[#1a5568] text-white p-4 rounded-t-2xl">
          <h2 className="text-xl font-black tracking-wide">POINTS CALCULATION</h2>
        </div>
        <div className="border-4 border-[#0d3944] rounded-b-2xl p-6 bg-gray-50">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-emerald-500/30">
              <p className="text-sm font-bold text-gray-600 mb-2">RUNS SCORED</p>
              <p className="text-3xl font-black text-emerald-600 mb-1">+1 pt</p>
              <p className="text-xs text-gray-500">per run scored</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-red-500/30">
              <p className="text-sm font-bold text-gray-600 mb-2">WICKETS LOST</p>
              <p className="text-3xl font-black text-red-600 mb-1">-5 pts</p>
              <p className="text-xs text-gray-500">per wicket lost</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-[#ff9800]/30">
              <p className="text-sm font-bold text-gray-600 mb-2">NET RUN RATE</p>
              <p className="text-xl font-black text-[#ff9800] mb-1">(Runs - Wickets×5)</p>
              <p className="text-xs text-gray-500">divided by matches played</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t-4 border-emerald-500">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="h-px bg-gray-400 w-40 mx-auto mb-2"></div>
            <p className="text-sm font-bold text-gray-600">Tournament Director</p>
            <p className="text-xs text-gray-500 mt-1">Signature & Date</p>
          </div>
          <div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Generated on</p>
              <p className="text-lg font-black text-emerald-600">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-600 font-bold mt-2">
                Official Tournament Standings
              </p>
            </div>
          </div>
          <div>
            <div className="h-px bg-gray-400 w-40 mx-auto mb-2"></div>
            <p className="text-sm font-bold text-gray-600">Match Commissioner</p>
            <p className="text-xs text-gray-500 mt-1">Signature & Date</p>
          </div>
        </div>

        {/* Watermark */}
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
