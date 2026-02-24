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

  // Group matches by day and paginate - all in useMemo
  const dayWisePages = useMemo(() => {
    // Group matches by date (day only, not time)
    const matchesByDay = new Map<string, typeof matches>();

    matches.forEach(match => {
      if (!match.startTime) return;
      const date = new Date(match.startTime);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (!matchesByDay.has(dayKey)) {
        matchesByDay.set(dayKey, []);
      }
      matchesByDay.get(dayKey)!.push(match);
    });

    // Sort days chronologically
    const sortedDays = Array.from(matchesByDay.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    // For each day, paginate matches (4 on first page, 7 on rest)
    const result: Array<{ date: string, displayDate: string, pages: typeof matches[] }> = [];

    sortedDays.forEach(([dayKey, dayMatches]) => {
      const date = new Date(dayKey);
      const displayDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      const pages: typeof matches[] = [];

      if (dayMatches.length === 0) return;

      // First page: 4 matches (or less if total < 4)
      const firstPageCount = Math.min(4, dayMatches.length);
      pages.push(dayMatches.slice(0, firstPageCount));

      // Remaining pages: 7 matches each
      if (dayMatches.length > 4) {
        const remainingMatches = dayMatches.slice(4);
        for (let i = 0; i < remainingMatches.length; i += 7) {
          pages.push(remainingMatches.slice(i, i + 7));
        }
      }

      result.push({ date: dayKey, displayDate, pages });
    });

    console.log('Day-wise pagination:', result.map(d => `${d.displayDate}: ${d.pages.length} pages`));

    return result;
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

      pdf.save(`${tournament.name.replace(/\s+/g, '_')}_Day_Wise_Fixtures.pdf`);
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
            DAY-WISE FIXTURES
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
          backgroundColor: isEven ? '#f9fafb' : '#ffffff'
        }}
      >
        <td className="p-4" style={{ borderRight: '2px solid #e5e7eb', width: '100px', verticalAlign: 'middle' }}>
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
        <td className="p-4" style={{ borderRight: '2px solid #e5e7eb', width: '180px', verticalAlign: 'middle' }}>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" style={{ color: '#a855f7' }} />
            <p className="text-base font-bold" style={{ color: '#111827' }}>{formatDate(match.startTime)}</p>
          </div>
        </td>
        <td className="p-4 text-center" style={{ borderRight: '2px solid #e5e7eb', width: '120px', verticalAlign: 'middle' }}>
          <p className="text-base font-bold" style={{ color: '#9333ea' }}>{formatTime(match.startTime)}</p>
        </td>
        <td className="p-4" style={{ borderRight: '2px solid #e5e7eb', width: '100px', verticalAlign: 'middle' }}>
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: '#ff9800' }}>{match.court}</p>
          </div>
        </td>
        <td className="p-4" style={{ verticalAlign: 'middle' }}>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getTeamColor(match.teamIds[1]),
                  border: '3px solid #ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              ></div>
              <span className="text-base font-bold" style={{ color: '#111827' }}>{getTeamName(match.teamIds[1])}</span>
            </div>
            <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getTeamColor(match.teamIds[3]),
                  border: '3px solid #ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              ></div>
              <span className="text-base font-bold" style={{ color: '#111827' }}>{getTeamName(match.teamIds[3])}</span>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const renderDayMatches = (pageMatches: typeof matches, isFirstPage: boolean, dayLabel: string, isNewDayStart: boolean = false) => (
    <div className={`px-8 mb-8 ${!isFirstPage || isNewDayStart ? 'pt-12' : ''}`}>
      {isFirstPage && (
        <div className="p-4 rounded-t-2xl" style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)', color: '#ffffff' }}>
          <h2 className="text-2xl font-black tracking-wide flex items-center gap-3">
            <CalendarIcon className="w-7 h-7" />
            {dayLabel}
          </h2>
        </div>
      )}
      <div className={isFirstPage ? "rounded-b-2xl overflow-hidden" : "rounded-2xl overflow-hidden"} style={{ border: '4px solid #a855f7', backgroundColor: '#ffffff' }}>
        <table className="w-full" style={{ backgroundColor: '#ffffff' }}>
          {isFirstPage && (
            <thead>
              <tr style={{ background: 'linear-gradient(to right, #c084fc, #f472b6)' }}>
                <th className="p-3 text-center font-black" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)', width: '100px' }}>
                  MATCH #
                </th>
                <th className="p-3 text-left font-black" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)', width: '180px' }}>
                  DATE
                </th>
                <th className="p-3 text-center font-black" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)', width: '120px' }}>
                  TIME
                </th>
                <th className="p-3 text-center font-black" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)', width: '100px' }}>
                  COURT
                </th>
                <th className="p-3 text-center font-black" style={{ color: '#ffffff' }}>
                  TEAMS
                </th>
              </tr>
            </thead>
          )}
          <tbody style={{ backgroundColor: '#ffffff' }}>
            {pageMatches.map((match, idx) => renderMatchRow(match, idx))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Download Button */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={handleDownloadPDF}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:opacity-90"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Fixtures Content - Multiple Pages */}
        <div ref={contentRef} style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
          {dayWisePages.flatMap((day, dayIndex) =>
            day.pages.map((pageMatches, pageIndex) => {
              const isVeryFirstPage = dayIndex === 0 && pageIndex === 0;
              const isFirstPageOfDay = pageIndex === 0;
              const isLastPage = dayIndex === dayWisePages.length - 1 && pageIndex === day.pages.length - 1;
              const isNewDayStart = dayIndex > 0 && pageIndex === 0; // New day starting (not the very first page)

              return (
                <div
                  key={`${day.date}-${pageIndex}`}
                  className="pdf-page"
                  style={{ backgroundColor: '#ffffff', marginBottom: isLastPage ? '0' : '20px' }}
                >
                  {/* Header only on very first page */}
                  {isVeryFirstPage && renderHeader()}
                  {renderDayMatches(pageMatches, isFirstPageOfDay, day.displayDate, isNewDayStart)}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
