"use client";

import { useEffect, useRef } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Image from "next/image";

export default function TeamSheetExportPage() {
  const { teams, loadTeams, tournament } = useTournamentStore();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${tournament.name.replace(/\s+/g, '_')}_Team_Sheet.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Download Button */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={handleDownloadPDF}
            className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-white font-bold hover:opacity-90"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Team Sheet Content */}
        <div ref={contentRef} className="bg-white shadow-2xl">
          {/* Header */}
          <div className="relative mb-8 pb-6 border-b-4 border-[#ff9800]">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff9800] to-[#0d3944]"></div>
            </div>

            <div className="relative flex items-start justify-between p-8">
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
                <div className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-white px-8 py-3 rounded-full mb-4 shadow-lg inline-block">
                  <p className="text-sm font-black tracking-widest">OFFICIAL DOCUMENT</p>
                </div>
                <h1 className="text-5xl font-black text-[#0d3944] mb-3 tracking-tight">
                  TEAM ROSTER
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-[#ff9800] to-[#ffb300] mx-auto mb-4"></div>
                <p className="text-2xl font-bold text-gray-700">{tournament.name}</p>
                <p className="text-sm text-gray-500 mt-2 font-semibold">
                  Season 2 • {new Date().getFullYear()}
                </p>
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
          </div>

          {/* Teams Table */}
          <div className="px-12 pb-12">
            <div className="border-4 border-[#0d3944] rounded-2xl overflow-hidden">
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
                        }`}
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
                            <p className="text-xl font-black text-[#0d3944]">
                              {team.name}
                            </p>
                          </div>
                        </td>
                        <td className="p-5 border-r-2 border-gray-200">
                          {player1 ? (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff9800] to-[#ffb300] flex items-center justify-center text-white font-black text-lg shadow-md">
                                {player1.name.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-lg font-bold text-gray-900">
                                {player1.name}
                              </p>
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
                              <p className="text-lg font-bold text-gray-900">
                                {player2.name}
                              </p>
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
        </div>
      </div>
    </div>
  );
}
