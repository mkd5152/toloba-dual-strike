"use client";

import { useEffect, useRef, useMemo } from "react";
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

  // Split teams: 12 teams per page
  const teamPages = useMemo(() => {
    const pages: any[][] = [];

    if (teams.length === 0) return pages;

    // Sort teams by ID (team-1, team-2, etc.) to maintain consistent ordering
    const sortedTeams = [...teams].sort((a, b) => {
      // Extract numeric part from team IDs (e.g., "team-1" -> 1, "team-14" -> 14)
      const numA = parseInt(a.id.split('-')[1] || '0');
      const numB = parseInt(b.id.split('-')[1] || '0');
      return numA - numB;
    });

    // Split into pages of 12 teams each
    for (let i = 0; i < sortedTeams.length; i += 12) {
      pages.push(sortedTeams.slice(i, i + 12));
    }

    console.log('Team pagination:', pages.map((p, i) => `Page ${i + 1}: ${p.length} teams`));
    console.log('Total teams:', sortedTeams.length);
    return pages;
  }, [teams]);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const jsPDF = (await import('jspdf')).default;

      // Create PDF with compression enabled
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm

      // Get all page divs
      const pageDivs = contentRef.current.querySelectorAll('.pdf-page');

      for (let i = 0; i < pageDivs.length; i++) {
        const pageDiv = pageDivs[i] as HTMLElement;

        // Render each page to canvas with high quality settings
        const canvas = await html2canvas(pageDiv, {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: pageDiv.scrollWidth,
          windowHeight: pageDiv.scrollHeight,
        });

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
        const imgData = canvas.toDataURL('image/jpeg', 0.94);

        // Add new page for subsequent pages
        if (i > 0) {
          pdf.addPage();
        }

        // Add image to PDF
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save(`${tournament.name.replace(/\s+/g, '_')}_Team_Sheet.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const renderHeader = () => (
    <div className="relative mb-4 pb-3" style={{ borderBottom: '4px solid #ff9800', backgroundColor: '#ffffff', color: '#000000' }}>
      <div className="relative flex items-start justify-between p-4">
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
  );

  const renderTeamRow = (team: any, index: number) => {
    const player1 = team.players?.[0];
    const player2 = team.players?.[1];
    const isEven = index % 2 === 0;

    return (
      <tr
        key={team.id}
        style={{
          borderBottom: '2px solid #e5e7eb',
          backgroundColor: isEven ? 'rgba(249, 250, 251, 0.95)' : 'rgba(255, 255, 255, 0.95)'
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
              {teams.indexOf(team) + 1}
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

        {/* Team Sheet Content - Multiple Pages */}
        <div ref={contentRef} style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
          {teamPages.map((pageTeams, pageIndex) => (
            <div
              key={pageIndex}
              className="pdf-page"
              style={{
                backgroundColor: '#ffffff',
                marginBottom: pageIndex < teamPages.length - 1 ? '20px' : '0'
              }}
            >
              {/* Show header only on first page */}
              {pageIndex === 0 && renderHeader()}

              {/* Teams Table */}
              <div className={`px-12 pb-12 ${pageIndex > 0 ? 'pt-12' : ''}`} style={{ position: 'relative' }}>
                {/* Watermark */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '500px',
                    height: '500px',
                    opacity: 0.08,
                    zIndex: 0,
                    pointerEvents: 'none',
                  }}
                >
                  <Image
                    src="/logos/tkmi-watermark.png"
                    alt="TKMI Watermark"
                    width={500}
                    height={500}
                    className="object-contain"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>

                <div
                  className="overflow-hidden"
                  style={{
                    border: '4px solid #0d3944',
                    borderRadius: pageIndex === 0 ? '1rem' : '1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                  }}
                >
                  <table className="w-full" style={{ backgroundColor: 'transparent' }}>
                    {/* Show table headers only on first page */}
                    {pageIndex === 0 && (
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
                    )}
                    <tbody style={{ backgroundColor: 'transparent' }}>
                      {pageTeams.map((team, index) => renderTeamRow(team, pageIndex * 12 + index))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
