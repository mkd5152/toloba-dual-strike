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
    const color = team?.color || "#cccccc";
    // Ensure color is a valid hex code
    if (!color.startsWith('#')) {
      return "#cccccc";
    }
    return color;
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
        style={{
          borderBottom: '2px solid #e5e7eb',
          backgroundColor: isEven ? '#f9fafb' : '#ffffff'
        }}
      >
        <td className="p-4" style={{ borderRight: '2px solid #e5e7eb' }}>
          <div className="flex items-center justify-center">
            <span
              className="text-2xl font-black w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                color: '#9333ea',
                backgroundColor: '#f3e8ff',
                border: '2px solid #d8b4fe'
              }}
            >
              {match.matchNumber}
            </span>
          </div>
        </td>
        <td className="p-4" style={{ borderRight: '2px solid #e5e7eb' }}>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" style={{ color: '#a855f7' }} />
            <div>
              <p className="text-lg font-bold" style={{ color: '#111827' }}>{formatDate(match.startTime)}</p>
              <p className="text-sm font-bold" style={{ color: '#9333ea' }}>{formatTime(match.startTime)}</p>
            </div>
          </div>
        </td>
        <td className="p-4" style={{ borderRight: '2px solid #e5e7eb' }}>
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: '#ff9800' }}>Court {match.court}</p>
          </div>
        </td>
        <td className="p-4">
          <div className="space-y-3">
            {/* Team 1 vs Team 2 */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: getTeamColor(match.teamIds[0]),
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                ></div>
                <span className="text-base font-bold" style={{ color: '#111827' }}>{getTeamName(match.teamIds[0])}</span>
              </div>
              <span className="text-xl font-black" style={{ color: '#9ca3af' }}>vs</span>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <span className="text-base font-bold" style={{ color: '#111827' }}>{getTeamName(match.teamIds[1])}</span>
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: getTeamColor(match.teamIds[1]),
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                ></div>
              </div>
            </div>
            {/* Team 3 vs Team 4 */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: getTeamColor(match.teamIds[2]),
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                ></div>
                <span className="text-base font-bold" style={{ color: '#111827' }}>{getTeamName(match.teamIds[2])}</span>
              </div>
              <span className="text-xl font-black" style={{ color: '#9ca3af' }}>vs</span>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <span className="text-base font-bold" style={{ color: '#111827' }}>{getTeamName(match.teamIds[3])}</span>
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: getTeamColor(match.teamIds[3]),
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
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
        <div ref={contentRef} style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
          {/* Header */}
          <div className="relative mb-8 pb-6" style={{ borderBottom: '4px solid #9333ea', backgroundColor: '#ffffff', color: '#000000' }}>
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
                <h1 className="text-5xl font-black mb-3 tracking-tight" style={{ color: '#0d3944' }}>
                  MATCH FIXTURES
                </h1>
                <div className="h-1 w-32 mx-auto mb-3" style={{ background: 'linear-gradient(to right, #9333ea, #ec4899)' }}></div>
                <p className="text-2xl font-bold" style={{ color: '#4a5568' }}>{tournament.name}</p>
                <p className="text-sm font-semibold mt-2" style={{ color: '#718096' }}>
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
              <div className="p-4 rounded-t-2xl" style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)', color: '#ffffff' }}>
                <h2 className="text-2xl font-black tracking-wide flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  LEAGUE STAGE
                </h2>
              </div>
              <div className="rounded-b-2xl overflow-hidden" style={{ border: '4px solid #a855f7' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'linear-gradient(to right, #c084fc, #f472b6)' }}>
                      <th className="p-3 text-left font-black w-24" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                        MATCH #
                      </th>
                      <th className="p-3 text-left font-black w-48" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                        DATE & TIME
                      </th>
                      <th className="p-3 text-center font-black w-32" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                        COURT
                      </th>
                      <th className="p-3 text-center font-black" style={{ color: '#ffffff' }}>
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
              <div className="p-4 rounded-t-2xl" style={{ background: 'linear-gradient(to right, #ff9800, #ffb300)', color: '#ffffff' }}>
                <h2 className="text-2xl font-black tracking-wide flex items-center gap-3">
                  <span className="text-3xl">🔥</span>
                  SEMI-FINALS
                </h2>
              </div>
              <div className="rounded-b-2xl overflow-hidden" style={{ border: '4px solid #ff9800' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'linear-gradient(to right, #ff9800, #ffb300)' }}>
                      <th className="p-3 text-left font-black w-24" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                        MATCH #
                      </th>
                      <th className="p-3 text-left font-black w-48" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                        DATE & TIME
                      </th>
                      <th className="p-3 text-center font-black w-32" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                        COURT
                      </th>
                      <th className="p-3 text-center font-black" style={{ color: '#ffffff' }}>
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
              <div className="p-4 rounded-t-2xl" style={{ background: 'linear-gradient(to right, #0d3944, #1a5568)', color: '#ffffff' }}>
                <h2 className="text-2xl font-black tracking-wide flex items-center gap-3">
                  <span className="text-3xl">🏆</span>
                  FINALS
                </h2>
              </div>
              <div className="rounded-b-2xl overflow-hidden" style={{ border: '4px solid #0d3944' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'linear-gradient(to right, #0d3944, #1a5568)' }}>
                      <th className="p-3 text-left font-black w-24" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                        MATCH #
                      </th>
                      <th className="p-3 text-left font-black w-48" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                        DATE & TIME
                      </th>
                      <th className="p-3 text-center font-black w-32" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                        COURT
                      </th>
                      <th className="p-3 text-center font-black" style={{ color: '#ffffff' }}>
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
