"use client";

import { useEffect, useState, useRef } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Printer } from "lucide-react";
import Image from "next/image";

export default function TeamSheetPage() {
  const { teams, loadTeams, loadingTeams, tournament } = useTournamentStore();
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen tournament-bg-pattern p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Action Buttons - Hidden when printing */}
        <Card className="p-4 mb-6 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#0d3944]">Official Team Sheet</h1>
              <p className="text-sm text-gray-600 mt-1">{tournament.name}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handlePrint}
                className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print / Save as PDF
              </Button>
            </div>
          </div>
        </Card>

        {/* Printable Team Sheet */}
        <div ref={componentRef} className="bg-white">
          <TeamSheetDocument teams={teams} tournamentName={tournament.name} />
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

interface TeamSheetDocumentProps {
  teams: any[];
  tournamentName: string;
}

function TeamSheetDocument({ teams, tournamentName }: TeamSheetDocumentProps) {
  return (
    <div className="w-full bg-white p-12 print:p-8">
      {/* Header with Logos */}
      <div className="relative mb-12 pb-8 border-b-4 border-[#ff9800]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff9800] to-[#0d3944]"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,152,0,0.1) 35px, rgba(255,152,0,0.1) 70px)`
          }}></div>
        </div>

        <div className="relative flex items-start justify-between">
          {/* Left - Tournament Logo */}
          <div className="flex-1">
            <div className="relative w-48 h-48">
              <Image
                src="/logos/dual-strike-logo.png"
                alt="Tournament Logo"
                width={192}
                height={192}
                className="object-contain"
              />
            </div>
          </div>

          {/* Center - Title */}
          <div className="flex-1 text-center py-8">
            <div className="inline-block">
              <div className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-white px-8 py-3 rounded-full mb-4 shadow-lg">
                <p className="text-sm font-black tracking-widest">OFFICIAL DOCUMENT</p>
              </div>
              <h1 className="text-5xl font-black text-[#0d3944] mb-3 tracking-tight">
                TEAM ROSTER
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-[#ff9800] to-[#ffb300] mx-auto mb-4"></div>
              <p className="text-2xl font-bold text-gray-700">{tournamentName}</p>
              <p className="text-sm text-gray-500 mt-2 font-semibold">
                Season 2 • {new Date().getFullYear()}
              </p>
            </div>
          </div>

          {/* Right - Sponsor Logo */}
          <div className="flex-1 flex justify-end">
            <div className="relative w-48 h-48">
              <Image
                src="/logos/sponsor.png"
                alt="Sponsor Logo"
                width={192}
                height={192}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Cricket Ball Decorations */}
        <div className="absolute top-4 left-1/4 text-6xl opacity-10">🏏</div>
        <div className="absolute bottom-4 right-1/4 text-6xl opacity-10">🏆</div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="text-center p-6 bg-gradient-to-br from-[#ff9800]/10 to-[#ffb300]/10 rounded-2xl border-2 border-[#ff9800]/30">
          <p className="text-sm font-bold text-gray-600 mb-1">TOTAL TEAMS</p>
          <p className="text-5xl font-black text-[#ff9800]">{teams.length}</p>
        </div>
        <div className="text-center p-6 bg-gradient-to-br from-[#0d3944]/10 to-[#1a5568]/10 rounded-2xl border-2 border-[#0d3944]/30">
          <p className="text-sm font-bold text-gray-600 mb-1">TOTAL PLAYERS</p>
          <p className="text-5xl font-black text-[#0d3944]">
            {teams.reduce((sum, team) => sum + (team.players?.length || 0), 0)}
          </p>
        </div>
        <div className="text-center p-6 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl border-2 border-emerald-500/30">
          <p className="text-sm font-bold text-gray-600 mb-1">COMPETITION</p>
          <p className="text-3xl font-black text-emerald-600">DUAL STRIKE</p>
        </div>
      </div>

      {/* Teams Table */}
      <div className="mb-12">
        <div className="bg-gradient-to-r from-[#0d3944] to-[#1a5568] text-white p-4 rounded-t-2xl">
          <h2 className="text-2xl font-black tracking-wide flex items-center gap-3">
            <span className="text-3xl">🏏</span>
            REGISTERED TEAMS & PLAYERS
          </h2>
        </div>

        <div className="border-4 border-[#0d3944] rounded-b-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#ff9800] to-[#ffb300]">
                <th className="p-4 text-left font-black text-white text-lg border-r-2 border-white/30 w-20">
                  SR. #
                </th>
                <th className="p-4 text-left font-black text-white text-lg border-r-2 border-white/30">
                  TEAM NAME
                </th>
                <th className="p-4 text-left font-black text-white text-lg border-r-2 border-white/30">
                  PLAYER 1
                </th>
                <th className="p-4 text-left font-black text-white text-lg">
                  PLAYER 2
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => {
                const player1 = team.players?.[0];
                const player2 = team.players?.[1];
                const isEven = index % 2 === 0;

                return (
                  <tr
                    key={team.id}
                    className={`border-b-2 border-gray-200 ${
                      isEven ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-[#ff9800]/5 transition-colors`}
                  >
                    <td className="p-5 border-r-2 border-gray-200">
                      <div className="flex items-center justify-center">
                        <span className="text-3xl font-black text-[#ff9800] bg-[#ff9800]/10 w-14 h-14 rounded-full flex items-center justify-center border-3 border-[#ff9800]/30">
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 border-r-2 border-gray-200">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full border-4 border-white shadow-lg flex-shrink-0"
                          style={{ backgroundColor: team.color }}
                        ></div>
                        <div>
                          <p className="text-xl font-black text-[#0d3944] leading-tight">
                            {team.name}
                          </p>
                          <p className="text-xs text-gray-500 font-bold mt-1">
                            {team.players?.length || 0} Players Registered
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 border-r-2 border-gray-200">
                      {player1 ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff9800] to-[#ffb300] flex items-center justify-center text-white font-black text-lg shadow-md">
                            {player1.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              {player1.name}
                            </p>
                            {player1.role && player1.role !== 'none' && (
                              <p className="text-xs text-[#ff9800] font-bold uppercase tracking-wide">
                                {player1.role.replace('_', ' ')}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">Not assigned</p>
                      )}
                    </td>
                    <td className="p-5">
                      {player2 ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d3944] to-[#1a5568] flex items-center justify-center text-white font-black text-lg shadow-md">
                            {player2.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              {player2.name}
                            </p>
                            {player2.role && player2.role !== 'none' && (
                              <p className="text-xs text-[#0d3944] font-bold uppercase tracking-wide">
                                {player2.role.replace('_', ' ')}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">Not assigned</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t-4 border-[#ff9800]">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="h-px bg-gray-400 w-48 mx-auto mb-2"></div>
            <p className="text-sm font-bold text-gray-600">Tournament Director</p>
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
                Official Tournament Document
              </p>
            </div>
          </div>
          <div>
            <div className="h-px bg-gray-400 w-48 mx-auto mb-2"></div>
            <p className="text-sm font-bold text-gray-600">Match Commissioner</p>
            <p className="text-xs text-gray-500 mt-1">Signature & Date</p>
          </div>
        </div>

        {/* Watermark */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 font-bold">
            This is an official document of {tournamentName}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            🏏 Powered by Dual Strike Scoring System
          </p>
        </div>
      </div>

      {/* Print-only Page Break Styles */}
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
        }
      `}</style>
    </div>
  );
}
