"use client";

import { useEffect, useRef } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, Calendar as CalendarIcon } from "lucide-react";
import Image from "next/image";
import type { Match } from "@/lib/types";

export default function FixturesPage() {
  const { matches, teams, loadMatches, loadTeams, tournament } = useTournamentStore();
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMatches();
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Group matches by stage
  const leagueMatches = matches.filter(m => m.stage === "LEAGUE");
  const semiMatches = matches.filter(m => m.stage === "SEMI");
  const finalMatches = matches.filter(m => m.stage === "FINAL");

  return (
    <div className="min-h-screen tournament-bg-pattern p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Action Buttons - Hidden when printing */}
        <Card className="p-4 mb-6 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#0d3944]">Match Fixtures</h1>
              <p className="text-sm text-gray-600 mt-1">{tournament.name}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handlePrint}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print / Save as PDF
              </Button>
            </div>
          </div>
        </Card>

        {/* Printable Fixtures Document */}
        <div ref={componentRef} className="bg-white">
          <FixturesDocument
            leagueMatches={leagueMatches}
            semiMatches={semiMatches}
            finalMatches={finalMatches}
            teams={teams}
            tournamentName={tournament.name}
          />
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
            size: A4 landscape;
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

interface FixturesDocumentProps {
  leagueMatches: Match[];
  semiMatches: Match[];
  finalMatches: Match[];
  teams: any[];
  tournamentName: string;
}

function FixturesDocument({
  leagueMatches,
  semiMatches,
  finalMatches,
  teams,
  tournamentName,
}: FixturesDocumentProps) {
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

  const renderMatchRow = (match: Match, index: number) => {
    const isEven = index % 2 === 0;

    return (
      <tr
        key={match.id}
        className={`border-b-2 border-gray-200 ${
          isEven ? 'bg-gray-50' : 'bg-white'
        } hover:bg-purple-50/30 transition-colors`}
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
    <div className="w-full bg-white p-12 print:p-8">
      {/* Header with Logos */}
      <div className="relative mb-10 pb-6 border-b-4 border-purple-600">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(168,85,247,0.1) 35px, rgba(168,85,247,0.1) 70px)`
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
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-full mb-3 shadow-lg">
                <p className="text-xs font-black tracking-widest">OFFICIAL SCHEDULE</p>
              </div>
              <h1 className="text-5xl font-black text-[#0d3944] mb-3 tracking-tight">
                MATCH FIXTURES
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-600 mx-auto mb-3"></div>
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
        <div className="absolute top-4 left-1/4 text-5xl opacity-10">📅</div>
        <div className="absolute bottom-4 right-1/4 text-5xl opacity-10">🏏</div>
      </div>

      {/* Tournament Stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-xl border-2 border-purple-500/30">
          <p className="text-xs font-bold text-gray-600 mb-1">LEAGUE MATCHES</p>
          <p className="text-4xl font-black text-purple-600">{leagueMatches.length}</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-[#ff9800]/10 to-[#ffb300]/10 rounded-xl border-2 border-[#ff9800]/30">
          <p className="text-xs font-bold text-gray-600 mb-1">SEMI-FINALS</p>
          <p className="text-4xl font-black text-[#ff9800]">{semiMatches.length}</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-[#0d3944]/10 to-[#1a5568]/10 rounded-xl border-2 border-[#0d3944]/30">
          <p className="text-xs font-bold text-gray-600 mb-1">FINALS</p>
          <p className="text-4xl font-black text-[#0d3944]">{finalMatches.length}</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl border-2 border-emerald-500/30">
          <p className="text-xs font-bold text-gray-600 mb-1">TOTAL MATCHES</p>
          <p className="text-4xl font-black text-emerald-600">
            {leagueMatches.length + semiMatches.length + finalMatches.length}
          </p>
        </div>
      </div>

      {/* League Stage */}
      {leagueMatches.length > 0 && (
        <div className="mb-10">
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
        <div className="mb-10">
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
        <div className="mb-10">
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

      {/* Footer */}
      <div className="mt-10 pt-6 border-t-4 border-purple-600">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="h-px bg-gray-400 w-40 mx-auto mb-2"></div>
            <p className="text-sm font-bold text-gray-600">Tournament Director</p>
            <p className="text-xs text-gray-500 mt-1">Signature & Date</p>
          </div>
          <div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Generated on</p>
              <p className="text-lg font-black text-purple-600">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-600 font-bold mt-2">
                Official Tournament Schedule
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
