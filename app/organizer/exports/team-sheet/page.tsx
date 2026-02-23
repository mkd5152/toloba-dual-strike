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

      // Clone the element and strip all className attributes to avoid Tailwind color functions
      const clone = contentRef.current.cloneNode(true) as HTMLElement;
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      // Remove all Tailwind classes that might use lab() colors
      const allElements = clone.getElementsByTagName('*');
      for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i] as HTMLElement;
        // Keep the classes but ensure no color functions are computed
        if (el.style) {
          // Force any color properties to use explicit values
          const computedStyle = window.getComputedStyle(el);
          if (computedStyle.color && computedStyle.color !== 'rgba(0, 0, 0, 0)') {
            el.style.color = computedStyle.color;
          }
          if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            el.style.backgroundColor = computedStyle.backgroundColor;
          }
        }
      }

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempContainer);

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
        <div ref={contentRef} style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
          {/* Header */}
          <div className="relative mb-8 pb-6" style={{ borderBottom: '4px solid #ff9800', backgroundColor: '#ffffff', color: '#000000' }}>
            <div className="relative flex items-start justify-between p-8">
              {/* Left - Tournament Logo */}
              <div className="flex-1">
                <div className="relative w-72 h-72">
                  <Image
                    src="/logos/dual-strike-logo.png"
                    alt="Tournament Logo"
                    width={288}
                    height={288}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Center - Title */}
              <div className="flex-1 text-center py-8">
                <h1 className="text-5xl font-black mb-3 tracking-tight" style={{ color: '#0d3944' }}>
                  TEAM ROSTER
                </h1>
                <div className="h-1 w-32 mx-auto mb-4" style={{ background: 'linear-gradient(to right, #ff9800, #ffb300)' }}></div>
                <p className="text-2xl font-bold" style={{ color: '#4a5568' }}>{tournament.name}</p>
                <p className="text-sm font-semibold mt-2" style={{ color: '#718096' }}>
                  Season 2 • {new Date().getFullYear()}
                </p>
              </div>

              {/* Right - Sponsor Logo */}
              <div className="flex-1 flex justify-end">
                <div className="relative w-72 h-72">
                  <Image
                    src="/logos/sponsor.png"
                    alt="Sponsor Logo"
                    width={288}
                    height={288}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Teams Table */}
          <div className="px-12 pb-12">
            <div className="rounded-2xl overflow-hidden" style={{ border: '4px solid #0d3944' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'linear-gradient(to right, #ff9800, #ffb300)' }}>
                    <th className="p-4 text-left font-black text-lg w-20" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                      SR. #
                    </th>
                    <th className="p-4 text-left font-black text-lg" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                      TEAM NAME
                    </th>
                    <th className="p-4 text-left font-black text-lg" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                      PLAYER 1
                    </th>
                    <th className="p-4 text-left font-black text-lg" style={{ color: '#ffffff' }}>
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
                        style={{
                          borderBottom: '2px solid #e5e7eb',
                          backgroundColor: isEven ? '#f9fafb' : '#ffffff'
                        }}
                      >
                        <td className="p-5" style={{ borderRight: '2px solid #e5e7eb' }}>
                          <div className="flex items-center justify-center">
                            <span
                              className="text-3xl font-black w-14 h-14 rounded-full flex items-center justify-center"
                              style={{
                                color: '#ff9800',
                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                border: '3px solid rgba(255, 152, 0, 0.3)'
                              }}
                            >
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="p-5" style={{ borderRight: '2px solid #e5e7eb' }}>
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: team.color,
                                border: '4px solid #ffffff',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            ></div>
                            <p className="text-xl font-black" style={{ color: '#0d3944' }}>
                              {team.name}
                            </p>
                          </div>
                        </td>
                        <td className="p-5" style={{ borderRight: '2px solid #e5e7eb' }}>
                          {player1 ? (
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
                                style={{
                                  background: 'linear-gradient(to bottom right, #ff9800, #ffb300)',
                                  color: '#ffffff',
                                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                }}
                              >
                                {player1.name.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-lg font-bold" style={{ color: '#111827' }}>
                                {player1.name}
                              </p>
                            </div>
                          ) : (
                            <p className="italic" style={{ color: '#9ca3af' }}>Not assigned</p>
                          )}
                        </td>
                        <td className="p-5">
                          {player2 ? (
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
                                style={{
                                  background: 'linear-gradient(to bottom right, #0d3944, #1a5568)',
                                  color: '#ffffff',
                                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                }}
                              >
                                {player2.name.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-lg font-bold" style={{ color: '#111827' }}>
                                {player2.name}
                              </p>
                            </div>
                          ) : (
                            <p className="italic" style={{ color: '#9ca3af' }}>Not assigned</p>
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
