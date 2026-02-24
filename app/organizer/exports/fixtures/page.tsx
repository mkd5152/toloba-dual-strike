"use client";

import { useEffect, useRef, useMemo } from "react";
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

  // Group matches by stage and paginate - all in useMemo
  const leaguePages = useMemo(() => {
    const league = matches.filter(m => m.stage === "LEAGUE");
    const pages: typeof league[] = [];

    if (league.length === 0) {
      return pages;
    }

    // First page: exactly 4 matches (or less if total < 4)
    const firstPageCount = Math.min(4, league.length);
    pages.push(league.slice(0, firstPageCount));

    // Remaining pages: 7 matches each
    if (league.length > 4) {
      const remainingMatches = league.slice(4);
      for (let i = 0; i < remainingMatches.length; i += 7) {
        pages.push(remainingMatches.slice(i, i + 7));
      }
    }

    console.log('League pagination:', pages.map((p, i) => `Page ${i + 1}: ${p.length} matches`));
    console.log('Total league matches:', league.length);

    return pages;
  }, [matches]);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const jsPDF = (await import('jspdf')).default;

      // Create PDF with compression enabled
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = 297; // A4 landscape width in mm
      const pageHeight = 210; // A4 landscape height in mm

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

      pdf.save(`${tournament.name.replace(/\s+/g, '_')}_Fixtures.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
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

  const renderHeader = () => (
    <div className="relative mb-4 pb-2" style={{ borderBottom: '4px solid #9333ea', backgroundColor: '#ffffff', color: '#000000' }}>
      <div className="relative flex items-start justify-between p-4">
        {/* Left - Tournament Logo */}
        <div className="flex-1">
          <div className="relative w-56 h-56">
            <Image
              src="/logos/dual-strike-logo.png"
              alt="Tournament Logo"
              width={224}
              height={224}
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
        </div>

        {/* Right - Sponsor Logo */}
        <div className="flex-1 flex justify-end">
          <div className="relative w-56 h-56">
            <Image
              src="/logos/sponsor.png"
              alt="Sponsor Logo"
              width={224}
              height={224}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderMatchRow = (match: typeof matches[0], index: number) => {
    const isEven = index % 2 === 0;

    return (
      <tr
        key={match.id}
        style={{
          borderBottom: '2px solid #e5e7eb',
          backgroundColor: isEven ? 'rgba(249, 250, 251, 0.95)' : 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <td className="p-3" style={{ borderRight: '2px solid #e5e7eb', width: '100px', verticalAlign: 'middle' }}>
          <div className="flex items-center justify-center">
            <span
              className="text-xl font-black w-10 h-10 rounded-full flex items-center justify-center"
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
        <td className="p-3" style={{ borderRight: '2px solid #e5e7eb', width: '180px', verticalAlign: 'middle' }}>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" style={{ color: '#a855f7' }} />
            <p className="text-sm font-bold" style={{ color: '#111827' }}>{formatDate(match.startTime)}</p>
          </div>
        </td>
        <td className="p-3 text-center" style={{ borderRight: '2px solid #e5e7eb', width: '120px', verticalAlign: 'middle' }}>
          <p className="text-sm font-bold" style={{ color: '#9333ea' }}>{formatTime(match.startTime)}</p>
        </td>
        <td className="p-3" style={{ borderRight: '2px solid #e5e7eb', width: '100px', verticalAlign: 'middle' }}>
          <div className="text-center">
            <p className="text-lg font-black" style={{ color: '#ff9800' }}>{match.court}</p>
          </div>
        </td>
        <td className="p-3" style={{ verticalAlign: 'middle' }}>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getTeamColor(match.teamIds[0]),
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                }}
              ></div>
              <span className="text-sm font-bold" style={{ color: '#111827' }}>{getTeamName(match.teamIds[0])}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getTeamColor(match.teamIds[1]),
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                }}
              ></div>
              <span className="text-sm font-bold" style={{ color: '#111827' }}>{getTeamName(match.teamIds[1])}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getTeamColor(match.teamIds[2]),
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                }}
              ></div>
              <span className="text-sm font-bold" style={{ color: '#111827' }}>{getTeamName(match.teamIds[2])}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getTeamColor(match.teamIds[3]),
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                }}
              ></div>
              <span className="text-sm font-bold" style={{ color: '#111827' }}>{getTeamName(match.teamIds[3])}</span>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const renderLeagueStage = (pageMatches: typeof matches, isFirstPage: boolean) => (
    <div className={`px-8 mb-6 ${!isFirstPage ? 'pt-10' : ''}`} style={{ position: 'relative' }}>
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

      {isFirstPage && (
        <div className="p-3 rounded-t-2xl" style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)', color: '#ffffff' }}>
          <h2 className="text-2xl font-black tracking-wide flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            LEAGUE STAGE
          </h2>
        </div>
      )}
      <div className={isFirstPage ? "rounded-b-2xl overflow-hidden" : "rounded-2xl overflow-hidden"} style={{ border: '4px solid #a855f7', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <table className="w-full" style={{ backgroundColor: 'transparent' }}>
          {isFirstPage && (
            <thead>
              <tr style={{ background: 'linear-gradient(to right, #c084fc, #f472b6)' }}>
                <th className="p-2 text-center font-black text-sm" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)', width: '100px' }}>
                  MATCH #
                </th>
                <th className="p-2 text-left font-black text-sm" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)', width: '180px' }}>
                  DATE
                </th>
                <th className="p-2 text-center font-black text-sm" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)', width: '120px' }}>
                  TIME
                </th>
                <th className="p-2 text-center font-black text-sm" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)', width: '100px' }}>
                  COURT
                </th>
                <th className="p-2 text-center font-black text-sm" style={{ color: '#ffffff' }}>
                  TEAMS
                </th>
              </tr>
            </thead>
          )}
          <tbody style={{ backgroundColor: 'transparent' }}>
            {isFirstPage && (
              <tr style={{ background: 'linear-gradient(to right, #10b981, #059669)', borderBottom: '2px solid #e5e7eb' }}>
                <td colSpan={5} className="p-3" style={{ textAlign: 'center' }}>
                  <p className="text-base font-black flex items-center justify-center gap-2" style={{ color: '#ffffff' }}>
                    <span className="text-xl">📋</span>
                    REGISTRATION: 7:30 PM
                    <span className="text-xl">📋</span>
                  </p>
                </td>
              </tr>
            )}
            {pageMatches.map((match, idx) => renderMatchRow(match, idx))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPlayoffSchedule = () => {
    const playoffMatches = [
      {
        matchNumber: 26,
        stage: 'Q1',
        stageName: 'Qualifier 1',
        time: '8:00 PM - 8:40 PM',
        court: 'Court 1',
        teams: '🎯 The Wildcards',
        subtitle: 'League Positions: 5th • 6th • 11th • 12th'
      },
      {
        matchNumber: 27,
        stage: 'Q2',
        stageName: 'Qualifier 2',
        time: '8:00 PM - 8:40 PM',
        court: 'Court 2',
        teams: '🎯 Core Contenders',
        subtitle: 'League Positions: 7th • 8th • 9th • 10th'
      },
      {
        matchNumber: 28,
        stage: 'SF1',
        stageName: 'Semi-Final 1',
        time: '8:45 PM - 9:25 PM',
        court: 'Court 1',
        teams: '⚡ Elite Quartet',
        subtitle: 'Q2 Champions (Top 2) + League Leaders (Overall 1st & 2nd)'
      },
      {
        matchNumber: 29,
        stage: 'SF2',
        stageName: 'Semi-Final 2',
        time: '8:45 PM - 9:25 PM',
        court: 'Court 2',
        teams: '⚡ Power Pack',
        subtitle: 'Q1 Champions (Top 2) + League Bronze Medalists (Overall 3rd & 4th)'
      },
      {
        matchNumber: 30,
        stage: 'FINAL',
        stageName: 'Grand Finale',
        time: '9:40 PM - 10:20 PM',
        court: 'Court 1',
        teams: '🏆 Ultimate Showdown',
        subtitle: 'Semi-Final 1 Champions (Top 2) vs Semi-Final 2 Champions (Top 2)'
      }
    ];

    return (
      <div className="px-8 mb-6 pt-12" style={{ position: 'relative' }}>
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

        <div className="p-3 rounded-t-2xl" style={{ background: 'linear-gradient(to right, #f59e0b, #ef4444)', color: '#ffffff' }}>
          <h2 className="text-2xl font-black tracking-wide flex items-center gap-3">
            <CalendarIcon className="w-6 h-6" />
            Sunday, March 1, 2026 - PLAYOFFS
          </h2>
        </div>
        <div className="rounded-b-2xl overflow-hidden" style={{ border: '4px solid #f59e0b', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <table className="w-full" style={{ backgroundColor: 'transparent' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(to right, #fbbf24, #f87171)' }}>
                <th className="p-2 text-center font-black text-sm" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)', width: '100px' }}>
                  MATCH #
                </th>
                <th className="p-2 text-center font-black text-sm" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)', width: '140px' }}>
                  STAGE
                </th>
                <th className="p-2 text-center font-black text-sm" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)', width: '140px' }}>
                  TIME
                </th>
                <th className="p-2 text-center font-black text-sm" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)', width: '100px' }}>
                  COURT
                </th>
                <th className="p-2 text-center font-black text-sm" style={{ color: '#ffffff' }}>
                  TEAMS
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'transparent' }}>
              {playoffMatches.map((match, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <tr
                    key={match.matchNumber}
                    style={{
                      borderBottom: idx < playoffMatches.length - 1 ? '2px solid #e5e7eb' : 'none',
                      backgroundColor: isEven ? 'rgba(254, 243, 199, 0.95)' : 'rgba(255, 255, 255, 0.95)'
                    }}
                  >
                    <td className="p-3" style={{ borderRight: '2px solid #e5e7eb', width: '100px', verticalAlign: 'middle' }}>
                      <div className="flex items-center justify-center">
                        <span
                          className="text-xl font-black w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            color: '#f59e0b',
                            backgroundColor: '#fef3c7',
                            border: '2px solid #fbbf24'
                          }}
                        >
                          {match.matchNumber}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center" style={{ borderRight: '2px solid #e5e7eb', width: '140px', verticalAlign: 'middle' }}>
                      <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-black"
                        style={{
                          backgroundColor: match.stage === 'FINAL' ? '#ef4444' : '#f59e0b',
                          color: '#ffffff'
                        }}
                      >
                        {match.stageName}
                      </span>
                    </td>
                    <td className="p-3 text-center" style={{ borderRight: '2px solid #e5e7eb', width: '140px', verticalAlign: 'middle' }}>
                      <p className="text-xs font-bold" style={{ color: '#f59e0b' }}>{match.time}</p>
                    </td>
                    <td className="p-3" style={{ borderRight: '2px solid #e5e7eb', width: '100px', verticalAlign: 'middle' }}>
                      <div className="text-center">
                        <p className="text-lg font-black" style={{ color: '#ff9800' }}>{match.court}</p>
                      </div>
                    </td>
                    <td className="p-3" style={{ verticalAlign: 'middle' }}>
                      <div className="text-center">
                        <p className="text-base font-black mb-1" style={{ color: '#111827' }}>{match.teams}</p>
                        <p className="text-xs font-semibold" style={{ color: '#6b7280' }}>{match.subtitle}</p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: 'rgba(254, 243, 199, 0.95)', border: '2px solid #fbbf24' }}>
          <p className="text-xs font-bold text-center" style={{ color: '#92400e' }}>
            🏆 Closing Ceremony: 10:25 PM - 10:45 PM 🏆
          </p>
        </div>
      </div>
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

        {/* Fixtures Content - Multiple Pages */}
        <div ref={contentRef} style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
          {/* League Stage Pages */}
          {leaguePages.map((pageMatches, pageIndex) => (
            <div key={`league-${pageIndex}`} className="pdf-page" style={{ backgroundColor: '#ffffff', marginBottom: '20px' }}>
              {/* Header only on first page */}
              {pageIndex === 0 && renderHeader()}
              {renderLeagueStage(pageMatches, pageIndex === 0)}
            </div>
          ))}

          {/* Playoff Schedule - Sunday (Separate Page) */}
          <div
            className="pdf-page"
            style={{
              backgroundColor: '#ffffff',
              marginTop: '20px',
              pageBreakBefore: 'always'
            }}
          >
            {renderPlayoffSchedule()}
          </div>
        </div>
      </div>
    </div>
  );
}
