"use client";

import { useEffect, useRef } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Button } from "@/components/ui/button";
import { Download, CalendarIcon } from "lucide-react";
import Image from "next/image";

export default function FixturesExportPage() {
  const { matches, teams, loadMatches, loadTeams, tournament } = useTournamentStore();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMatches();
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${tournament.name.replace(/\s+/g, '_')}_Fixtures.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || "TBD";
  };

  const getTeamColor = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.color || "#cccccc";
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "TBD";
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "TBD";
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Group matches by stage
  const leagueMatches = matches.filter(m => m.stage === "LEAGUE");
  const semiMatches = matches.filter(m => m.stage === "SEMI");
  const finalMatches = matches.filter(m => m.stage === "FINAL");

  const renderMatchRow = (match: typeof matches[0], index: number) => {
    const isEven = index % 2 === 0;

    return (
      <tr
        key={match.id}
        className={`border-b-2 border-gray-200 ${isEven ? 'bg-gray-50' : 'bg-white'}`}
      >
        <td className="p-4 border-r-2 border-gray-200">
          <div className="flex items-center justify-center">
            <span className="text-2xl font-black text-purple-600 bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center border-2 border-purple-300">
              {match.matchNumber}
            </span>
          </div>
        </td>
        <td className="p-4 border-r-2 border-gray-200">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-lg font-bold text-gray-900">{formatDate(match.startTime)}</p>
              <p className="text-sm text-purple-600 font-bold">{formatTime(match.startTime)}</p>
            </div>
          </div>
        </td>
        <td className="p-4 border-r-2 border-gray-200">
          <div className="text-center">
            <p className="text-xl font-black text-[#ff9800]">Court {match.court}</p>
          </div>
        </td>
        <td className="p-4">
          <div className="space-y-3">
            {/* Team 1 vs Team 2 */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-8 h-8 rounded-full border-3 border-white shadow-lg flex-shrink-0"
                  style={{ backgroundColor: getTeamColor(match.teamIds[0]) }}
                ></div>
                <span className="text-base font-bold text-gray-900">{getTeamName(match.teamIds[0])}</span>
              </div>
              <span className="text-xl font-black text-gray-400">vs</span>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <span className="text-base font-bold text-gray-900">{getTeamName(match.teamIds[1])}</span>
                <div
                  className="w-8 h-8 rounded-full border-3 border-white shadow-lg flex-shrink-0"
                  style={{ backgroundColor: getTeamColor(match.teamIds[1]) }}
                ></div>
              </div>
            </div>
            {/* Team 3 vs Team 4 */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-8 h-8 rounded-full border-3 border-white shadow-lg flex-shrink-0"
                  style={{ backgroundColor: getTeamColor(match.teamIds[2]) }}
                ></div>
                <span className="text-base font-bold text-gray-900">{getTeamName(match.teamIds[2])}</span>
              </div>
              <span className="text-xl font-black text-gray-400">vs</span>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <span className="text-base font-bold text-gray-900">{getTeamName(match.teamIds[3])}</span>
                <div
                  className="w-8 h-8 rounded-full border-3 border-white shadow-lg flex-shrink-0"
                  style={{ backgroundColor: getTeamColor(match.teamIds[3]) }}
                ></div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Download Button */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={handleDownloadPDF}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold hover:opacity-90"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Fixtures Content */}
        <div ref={contentRef} className="bg-white shadow-2xl">
          {/* Header */}
          <div className="relative mb-8 pb-6 border-b-4 border-purple-600">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600"></div>
            </div>

            <div className="relative flex items-start justify-between p-8">
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
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-full mb-3 shadow-lg inline-block">
                  <p className="text-xs font-black tracking-widest">OFFICIAL SCHEDULE</p>
                </div>
                <h1 className="text-5xl font-black text-[#0d3944] mb-3 tracking-tight">
                  MATCH FIXTURES
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-600 mx-auto mb-3"></div>
                <p className="text-2xl font-bold text-gray-700">{tournament.name}</p>
                <p className="text-sm text-gray-500 mt-2 font-semibold">
                  Season 2 • {new Date().getFullYear()}
                </p>
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
          </div>

          {/* League Stage */}
          {leagueMatches.length > 0 && (
            <div className="px-8 mb-8">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-t-2xl">
                <h2 className="text-2xl font-black tracking-wide flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  LEAGUE STAGE
                </h2>
              </div>
              <div className="border-4 border-purple-500 rounded-b-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-400 to-pink-500">
                      <th className="p-3 text-left font-black text-white border-r-2 border-white/30 w-24">
                        MATCH #
                      </th>
                      <th className="p-3 text-left font-black text-white border-r-2 border-white/30 w-48">
                        DATE & TIME
                      </th>
                      <th className="p-3 text-center font-black text-white border-r-2 border-white/30 w-32">
                        COURT
                      </th>
                      <th className="p-3 text-center font-black text-white">
                        TEAMS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leagueMatches.map((match, idx) => renderMatchRow(match, idx))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Semi-Finals */}
          {semiMatches.length > 0 && (
            <div className="px-8 mb-8">
              <div className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-white p-4 rounded-t-2xl">
                <h2 className="text-2xl font-black tracking-wide flex items-center gap-3">
                  <span className="text-3xl">🔥</span>
                  SEMI-FINALS
                </h2>
              </div>
              <div className="border-4 border-[#ff9800] rounded-b-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#ff9800] to-[#ffb300]">
                      <th className="p-3 text-left font-black text-white border-r-2 border-white/30 w-24">
                        MATCH #
                      </th>
                      <th className="p-3 text-left font-black text-white border-r-2 border-white/30 w-48">
                        DATE & TIME
                      </th>
                      <th className="p-3 text-center font-black text-white border-r-2 border-white/30 w-32">
                        COURT
                      </th>
                      <th className="p-3 text-center font-black text-white">
                        TEAMS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {semiMatches.map((match, idx) => renderMatchRow(match, idx))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Finals */}
          {finalMatches.length > 0 && (
            <div className="px-8 pb-8">
              <div className="bg-gradient-to-r from-[#0d3944] to-[#1a5568] text-white p-4 rounded-t-2xl">
                <h2 className="text-2xl font-black tracking-wide flex items-center gap-3">
                  <span className="text-3xl">🏆</span>
                  FINALS
                </h2>
              </div>
              <div className="border-4 border-[#0d3944] rounded-b-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#0d3944] to-[#1a5568]">
                      <th className="p-3 text-left font-black text-white border-r-2 border-white/30 w-24">
                        MATCH #
                      </th>
                      <th className="p-3 text-left font-black text-white border-r-2 border-white/30 w-48">
                        DATE & TIME
                      </th>
                      <th className="p-3 text-center font-black text-white border-r-2 border-white/30 w-32">
                        COURT
                      </th>
                      <th className="p-3 text-center font-black text-white">
                        TEAMS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalMatches.map((match, idx) => renderMatchRow(match, idx))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
