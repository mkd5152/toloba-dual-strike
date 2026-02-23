"use client";

import { useEffect } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import Image from "next/image";

export default function TeamSheetExportPage() {
  const { teams, loadTeams, tournament } = useTournamentStore();

  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print button - hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <Button
          onClick={handlePrint}
          className="bg-[#8B1538] hover:bg-[#6B0F2A] text-white font-bold px-6 py-3 rounded-lg shadow-lg"
        >
          <Printer className="w-5 h-5 mr-2" />
          Print / Save as PDF
        </Button>
      </div>

      {/* Team Sheet Document */}
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 print:bg-white p-4 print:p-0">
        <div
          id="team-sheet-content"
          className="w-[210mm] bg-white shadow-2xl print:shadow-none"
          style={{ aspectRatio: '1 / 1.414' }}
        >
          {/* Header */}
          <div className="bg-[#1a2332] px-8 py-6 flex items-center justify-between border-b-4 border-white">
            {/* Left Logo */}
            <div className="w-32">
              <Image
                src="/logos/dual-strike-logo.png"
                alt="Toloba Sports"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>

            {/* Center Title */}
            <div className="flex-1 text-center">
              <h1
                className="font-black tracking-wider"
                style={{
                  fontSize: '4rem',
                  background: 'linear-gradient(135deg, #1e88e5 0%, #64b5f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 40px rgba(30, 136, 229, 0.3)'
                }}
              >
                TEAM SHEET
              </h1>
            </div>

            {/* Right Logo */}
            <div className="w-32 flex flex-col items-center">
              <Image
                src="/logos/sponsor.png"
                alt="Tournament Logo"
                width={100}
                height={100}
                className="object-contain"
              />
              <p className="text-white font-bold text-xs mt-1">TOURNAMENT '24</p>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 bg-gray-100 border-b-2 border-gray-300">
            <div className="col-span-1 px-3 py-3 font-bold text-center text-sm">Team #</div>
            <div className="col-span-3 px-3 py-3 font-bold text-sm">Team Name</div>
            <div className="col-span-6 px-3 py-3 font-bold text-sm">Player Names</div>
            <div className="col-span-2 px-3 py-3 font-bold text-center text-sm">Match #</div>
          </div>

          {/* Team Rows */}
          <div className="overflow-hidden">
            {teams.map((team, index) => {
              const player1 = team.players?.[0];
              const player2 = team.players?.[1];
              const player3 = team.players?.[2];

              // Get match numbers this team is playing in
              const matchNumbers = "D, F, M, O"; // Placeholder - would come from actual matches

              return (
                <div
                  key={team.id}
                  className="grid grid-cols-12 border-b border-gray-200 relative"
                  style={{ minHeight: '3.5rem' }}
                >
                  {/* Diagonal stripe background */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `repeating-linear-gradient(
                        45deg,
                        ${team.color},
                        ${team.color} 10px,
                        transparent 10px,
                        transparent 20px
                      )`
                    }}
                  />

                  {/* Team Number */}
                  <div className="col-span-1 px-3 py-3 font-bold text-center relative z-10 flex items-center justify-center">
                    T{index + 1}
                  </div>

                  {/* Team Name with color bar */}
                  <div className="col-span-3 px-3 py-3 relative z-10 flex items-center">
                    <div
                      className="w-2 h-full absolute left-0 top-0"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="font-bold ml-2">{team.name}</span>
                  </div>

                  {/* Player Names */}
                  <div className="col-span-6 px-3 py-3 relative z-10 flex items-center gap-4">
                    {player1 && (
                      <span className="font-medium">{player1.name}</span>
                    )}
                    {player2 && (
                      <span className="font-medium">{player2.name}</span>
                    )}
                    {player3 && (
                      <span className="font-medium">{player3.name}</span>
                    )}
                  </div>

                  {/* Match Numbers */}
                  <div className="col-span-2 px-3 py-3 font-bold text-center relative z-10 flex items-center justify-center">
                    {matchNumbers}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="bg-[#1a2332] px-8 py-3 mt-auto">
            <p className="text-white text-xs text-center font-medium">
              {tournament.name} • Season 2 • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          #team-sheet-content {
            width: 100%;
            height: 100%;
            box-shadow: none;
          }
        }
      `}</style>
    </>
  );
}
