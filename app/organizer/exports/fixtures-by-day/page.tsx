"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Button } from "@/components/ui/button";
import { Download, CalendarIcon, FileText, Files } from "lucide-react";
import Image from "next/image";

export default function FixturesExportPage() {
  const { matches, teams, loadMatches, loadTeams, tournament } = useTournamentStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [separateFiles, setSeparateFiles] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Helper function to generate PDF from HTML elements
  const generatePDFFromElements = async (
    elements: HTMLElement[],
    html2canvas: any,
    jsPDF: any
  ) => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 297; // A4 landscape width in mm

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      // Render each page to canvas with high quality settings
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
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

    return pdf;
  };

  // Generate single PDF with all days
  const generateSinglePDF = async (html2canvas: any, jsPDF: any) => {
    if (!contentRef.current) return;

    const pageDivs = Array.from(contentRef.current.querySelectorAll('.pdf-page')) as HTMLElement[];
    const pdf = await generatePDFFromElements(pageDivs, html2canvas, jsPDF);
    pdf.save(`${tournament.name.replace(/\s+/g, '_')}_Day_Wise_Fixtures.pdf`);
  };

  // Generate separate PDFs for each day
  const generateSeparatePDFs = async (html2canvas: any, jsPDF: any) => {
    if (!contentRef.current) return;

    for (let dayIndex = 0; dayIndex < dayWisePages.length; dayIndex++) {
      const day = dayWisePages[dayIndex];

      // Create temporary container for this day's content
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.backgroundColor = '#ffffff';
      document.body.appendChild(tempContainer);

      // Get all page divs for this specific day
      const allPageDivs = Array.from(contentRef.current.querySelectorAll('.pdf-page')) as HTMLElement[];

      // Find the start and end indices for this day's pages
      let startIndex = 0;
      for (let i = 0; i < dayIndex; i++) {
        startIndex += dayWisePages[i].pages.length;
      }

      const endIndex = startIndex + day.pages.length;
      const dayPageDivs = allPageDivs.slice(startIndex, endIndex);

      // Process each page for this day
      dayPageDivs.forEach((pageDiv, pageIndex) => {
        const clonedDiv = pageDiv.cloneNode(true) as HTMLElement;

        // First page: Keep header if it exists from main render, otherwise add it
        if (pageIndex === 0) {
          const existingHeader = clonedDiv.querySelector('[class*="relative mb-4"]')?.parentElement;

          if (!existingHeader) {
            // Add header for first page
            const headerContent = document.createElement('div');
            headerContent.innerHTML = `
              <div class="relative mb-4 pb-2" style="border-bottom: 4px solid #9333ea; background-color: #ffffff; color: #000000;">
                <div class="relative flex items-start justify-between p-4">
                  <div class="flex-1">
                    <div class="relative w-56 h-56">
                      <img src="/logos/dual-strike-logo.png" alt="Tournament Logo" width="224" height="224" style="object-fit: contain;" />
                    </div>
                  </div>
                  <div class="flex-1 text-center py-6">
                    <h1 class="text-5xl font-black mb-3 tracking-tight" style="color: #0d3944;">DAY-WISE FIXTURES</h1>
                    <div class="h-1 w-32 mx-auto mb-3" style="background: linear-gradient(to right, #9333ea, #ec4899);"></div>
                    <p class="text-2xl font-bold" style="color: #4a5568;">${tournament.name}</p>
                  </div>
                  <div class="flex-1 flex justify-end">
                    <div class="relative w-56 h-56">
                      <img src="/logos/sponsor.png" alt="Sponsor Logo" width="224" height="224" style="object-fit: contain;" />
                    </div>
                  </div>
                </div>
              </div>
            `;
            clonedDiv.insertBefore(headerContent, clonedDiv.firstChild);
          }
        } else {
          // Subsequent pages: Remove header if exists and ensure pt-12 margin
          const headerInPage = clonedDiv.querySelector('[class*="relative mb-4"]')?.parentElement;
          if (headerInPage) {
            headerInPage.remove();
          }

          // Ensure top margin on subsequent pages
          const content = clonedDiv.querySelector('div') as HTMLElement;
          if (content && !content.classList.contains('pt-12')) {
            content.style.paddingTop = '3rem'; // pt-12
          }
        }

        tempContainer.appendChild(clonedDiv);
      });

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate PDF for this day
      const elements = Array.from(tempContainer.querySelectorAll('.pdf-page')) as HTMLElement[];
      const pdf = await generatePDFFromElements(elements, html2canvas, jsPDF);

      // Clean filename for this day
      const cleanDayName = day.displayDate.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`${tournament.name.replace(/\s+/g, '_')}_${cleanDayName}.pdf`);

      // Cleanup
      document.body.removeChild(tempContainer);

      // Add small delay between downloads to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current || isGenerating) return;

    setIsGenerating(true);

    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const jsPDF = (await import('jspdf')).default;

      if (separateFiles) {
        // Generate separate PDF for each day
        await generateSeparatePDFs(html2canvas, jsPDF);
      } else {
        // Generate single PDF with all days
        await generateSinglePDF(html2canvas, jsPDF);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
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
        {/* Download Controls */}
        <div className="mb-6 flex items-center justify-between gap-4">
          {/* Toggle Button */}
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-md border-2 border-indigo-200">
            <span className="text-sm font-bold text-gray-700">Download Mode:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSeparateFiles(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  !separateFiles
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Single File
              </button>
              <button
                onClick={() => setSeparateFiles(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  separateFiles
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Files className="w-4 h-4" />
                Separate Files ({dayWisePages.length})
              </button>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : `Download ${separateFiles ? `${dayWisePages.length} PDFs` : 'PDF'}`}
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
