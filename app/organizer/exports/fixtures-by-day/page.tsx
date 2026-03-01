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

      // Create temporary container for this day's content - match contentRef styling exactly
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.isolation = 'isolate';
      tempContainer.style.maxWidth = '80rem'; // max-w-7xl
      tempContainer.style.width = '100%';
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

          // CRITICAL: Remove pt-12 padding from first page content div since it now has logo header
          // Target the specific content div with px-8 class
          const allDivs = clonedDiv.querySelectorAll('div');
          allDivs.forEach(div => {
            if (div.classList.contains('pt-12')) {
              div.classList.remove('pt-12');
              div.style.paddingTop = '0';
            }
          });
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

      // Wait for all images to load
      const images = tempContainer.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      // Additional wait to ensure layout is stable
      await new Promise(resolve => setTimeout(resolve, 300));

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

    // Generate separate PDF for Sunday Playoffs
    const allPageDivs = Array.from(contentRef.current.querySelectorAll('.pdf-page')) as HTMLElement[];
    const playoffPageDiv = allPageDivs[allPageDivs.length - 1]; // Last page is playoffs

    if (playoffPageDiv) {
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.isolation = 'isolate';
      tempContainer.style.maxWidth = '80rem';
      tempContainer.style.width = '100%';
      document.body.appendChild(tempContainer);

      const clonedDiv = playoffPageDiv.cloneNode(true) as HTMLElement;

      // Add header for playoff page
      const existingHeader = clonedDiv.querySelector('[class*="relative mb-4"]')?.parentElement;
      if (!existingHeader) {
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

      tempContainer.appendChild(clonedDiv);

      // Wait for images to load
      const images = tempContainer.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate PDF for playoffs
      const elements = Array.from(tempContainer.querySelectorAll('.pdf-page')) as HTMLElement[];
      const pdf = await generatePDFFromElements(elements, html2canvas, jsPDF);
      pdf.save(`${tournament.name.replace(/\s+/g, '_')}_Sunday_Playoffs.pdf`);

      // Cleanup
      document.body.removeChild(tempContainer);
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

  const renderDayMatches = (pageMatches: typeof matches, isFirstPage: boolean, dayLabel: string, isNewDayStart: boolean = false, isThursday: boolean = false) => (
    <div className={`px-8 mb-6 ${!isFirstPage || isNewDayStart ? 'pt-10' : ''}`} style={{ position: 'relative' }}>
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
            <CalendarIcon className="w-6 h-6" />
            {dayLabel}
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
            {isThursday && isFirstPage && (
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

  // Helper to get playoff teams dynamically
  const getPlayoffTeams = () => {
    // Get completed league matches to calculate standings
    const leagueMatches = matches.filter(m => m.stage === "LEAGUE" && (m.state === "COMPLETED" || m.state === "LOCKED"));

    // Calculate standings
    const standingsMap = new Map<string, { teamId: string; points: number; totalRuns: number; rank: number }>();

    teams.forEach(team => {
      standingsMap.set(team.id, { teamId: team.id, points: 0, totalRuns: 0, rank: 0 });
    });

    leagueMatches.forEach(match => {
      match.rankings?.forEach(ranking => {
        const entry = standingsMap.get(ranking.teamId);
        if (entry) {
          entry.points += ranking.points || 0;
          entry.totalRuns += ranking.totalScore || ranking.totalRuns || 0;
        }
      });
    });

    const sorted = Array.from(standingsMap.values())
      .filter(entry => entry.points > 0)
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.totalRuns - a.totalRuns;
      });

    sorted.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Get playoff match results
    const qf1Match = matches.find(m => m.matchNumber === 26);
    const qf2Match = matches.find(m => m.matchNumber === 27);
    const sf1Match = matches.find(m => m.matchNumber === 28);
    const sf2Match = matches.find(m => m.matchNumber === 29);

    // QF1 teams: League positions 5, 6, 11, 12
    const qf1Teams = [5, 6, 11, 12].map(rank => sorted.find(t => t.rank === rank)?.teamId).filter(Boolean);

    // QF2 teams: League positions 7, 8, 9, 10
    const qf2Teams = [7, 8, 9, 10].map(rank => sorted.find(t => t.rank === rank)?.teamId).filter(Boolean);

    // SF1 teams: QF2 top 2 + League 1st & 2nd
    let sf1Teams: string[] = [];
    if (qf2Match && (qf2Match.state === "COMPLETED" || qf2Match.state === "LOCKED") && qf2Match.rankings) {
      const qf2Top2 = qf2Match.rankings.filter(r => r.rank <= 2).map(r => r.teamId);
      const leagueTop2 = [1, 2].map(rank => sorted.find(t => t.rank === rank)?.teamId).filter(Boolean);
      sf1Teams = [...qf2Top2, ...leagueTop2];
    }

    // SF2 teams: QF1 top 2 + League 3rd & 4th
    let sf2Teams: string[] = [];
    if (qf1Match && (qf1Match.state === "COMPLETED" || qf1Match.state === "LOCKED") && qf1Match.rankings) {
      const qf1Top2 = qf1Match.rankings.filter(r => r.rank <= 2).map(r => r.teamId);
      const league3rd4th = [3, 4].map(rank => sorted.find(t => t.rank === rank)?.teamId).filter(Boolean);
      sf2Teams = [...qf1Top2, ...league3rd4th];
    }

    // Final teams: SF1 top 2 + SF2 top 2
    let finalTeams: string[] = [];
    if (sf1Match && (sf1Match.state === "COMPLETED" || sf1Match.state === "LOCKED") && sf1Match.rankings &&
        sf2Match && (sf2Match.state === "COMPLETED" || sf2Match.state === "LOCKED") && sf2Match.rankings) {
      const sf1Top2 = sf1Match.rankings.filter(r => r.rank <= 2).map(r => r.teamId);
      const sf2Top2 = sf2Match.rankings.filter(r => r.rank <= 2).map(r => r.teamId);
      finalTeams = [...sf1Top2, ...sf2Top2];
    }

    return { qf1Teams, qf2Teams, sf1Teams, sf2Teams, finalTeams, sorted };
  };

  const renderPlayoffSchedule = (includeHeader: boolean = false) => {
    const { qf1Teams, qf2Teams, sf1Teams, sf2Teams, finalTeams, sorted } = getPlayoffTeams();

    const playoffMatches = [
      {
        matchNumber: 26,
        stage: 'Q1',
        stageName: 'Qualifier 1',
        time: '8:00 PM - 8:40 PM',
        court: 'Court 1',
        teamIds: qf1Teams,
        dynamicTeams: true,
        ranks: [5, 6, 11, 12]
      },
      {
        matchNumber: 27,
        stage: 'Q2',
        stageName: 'Qualifier 2',
        time: '8:00 PM - 8:40 PM',
        court: 'Court 2',
        teamIds: qf2Teams,
        dynamicTeams: true,
        ranks: [7, 8, 9, 10]
      },
      {
        matchNumber: 28,
        stage: 'SF1',
        stageName: 'Semi-Final 1',
        time: '8:45 PM - 9:25 PM',
        court: 'Court 1',
        teamIds: sf1Teams,
        hybridTeams: true,
        leagueTeams: [1, 2], // League 1st & 2nd - we know these
        qfSource: 'Q2',
        subtitle: 'Q2 Champions (Top 2) + League Leaders (Overall 1st & 2nd)'
      },
      {
        matchNumber: 29,
        stage: 'SF2',
        stageName: 'Semi-Final 2',
        time: '8:45 PM - 9:25 PM',
        court: 'Court 2',
        teamIds: sf2Teams,
        hybridTeams: true,
        leagueTeams: [3, 4], // League 3rd & 4th - we know these
        qfSource: 'Q1',
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
      <>
        {includeHeader && renderHeader()}
        <div className="px-8 mb-6" style={{ position: 'relative' }}>
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
                  const isFinal = match.stage === 'FINAL';
                  const isDynamic = !!match.teamIds && !match.hybridTeams;
                  const teamNames = match.teamIds?.map(id => getTeamName(id)) || [];
                  const teamColors = match.teamIds?.map(id => getTeamColor(id)) || [];
                  const hasTBD = isDynamic && (teamNames.length === 0 || teamNames.some(name => name === "TBD"));

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
                              color: isFinal ? '#ef4444' : '#f59e0b',
                              backgroundColor: isFinal ? '#fee2e2' : '#fef3c7',
                              border: `2px solid ${isFinal ? '#fca5a5' : '#fbbf24'}`,
                              boxShadow: isFinal ? '0 0 15px rgba(239, 68, 68, 0.5)' : '0 0 10px rgba(245, 158, 11, 0.3)'
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
                            background: isFinal
                              ? 'linear-gradient(to right, #ef4444, #dc2626)'
                              : 'linear-gradient(to right, #f59e0b, #d97706)',
                            color: '#ffffff',
                            boxShadow: isFinal ? '0 4px 10px rgba(239, 68, 68, 0.4)' : '0 4px 10px rgba(245, 158, 11, 0.3)'
                          }}
                        >
                          {isFinal && '🏆 '}{match.stageName}
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
                        {match.hybridTeams ? (
                          <div className="grid grid-cols-2 gap-1.5">
                            {/* League qualifiers - we know these teams */}
                            {match.leagueTeams!.map((rank, idx) => {
                              const teamId = sorted.find(t => t.rank === rank)?.teamId;
                              const teamName = teamId ? getTeamName(teamId) : 'TBD';
                              const teamColor = teamId ? getTeamColor(teamId) : '#cccccc';

                              if (!teamId) {
                                return (
                                  <div key={idx} className="flex items-center justify-center p-2 rounded-lg" style={{
                                    background: 'rgba(156, 163, 175, 0.1)',
                                    border: '2px dashed #9ca3af'
                                  }}>
                                    <p className="text-xs font-bold" style={{ color: '#9ca3af' }}>TBD</p>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1.5 p-1 rounded-lg"
                                  style={{
                                    background: `linear-gradient(135deg, ${teamColor}15, ${teamColor}25)`,
                                    border: `2px solid ${teamColor}`,
                                    boxShadow: `0 0 8px ${teamColor}40`
                                  }}
                                >
                                  <div
                                    className="w-5 h-5 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor: teamColor,
                                      border: '2px solid #ffffff',
                                      boxShadow: `0 0 6px ${teamColor}60`
                                    }}
                                  ></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black truncate leading-tight" style={{ color: '#111827' }}>
                                      {teamName}
                                    </p>
                                    <p className="text-[9px] font-bold leading-tight" style={{
                                      color: teamColor,
                                      opacity: 0.8
                                    }}>
                                      League #{rank}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}

                            {/* QF Winners - Mystery boxes */}
                            {[0, 1].map((slot) => {
                              // Check if QF match is completed
                              const qfMatch = matches.find(m => m.matchNumber === (match.qfSource === 'Q1' ? 26 : 27));
                              const isQFComplete = qfMatch && (qfMatch.state === "COMPLETED" || qfMatch.state === "LOCKED");

                              if (isQFComplete && qfMatch.rankings) {
                                // Show actual QF winner
                                const winner = qfMatch.rankings.filter(r => r.rank <= 2)[slot];
                                if (winner) {
                                  const teamName = getTeamName(winner.teamId);
                                  const teamColor = getTeamColor(winner.teamId);
                                  return (
                                    <div
                                      key={`qf-${slot}`}
                                      className="flex items-center gap-1.5 p-1 rounded-lg"
                                      style={{
                                        background: `linear-gradient(135deg, ${teamColor}15, ${teamColor}25)`,
                                        border: `2px solid ${teamColor}`,
                                        boxShadow: `0 0 8px ${teamColor}40`
                                      }}
                                    >
                                      <div
                                        className="w-5 h-5 rounded-full flex-shrink-0"
                                        style={{
                                          backgroundColor: teamColor,
                                          border: '2px solid #ffffff',
                                          boxShadow: `0 0 6px ${teamColor}60`
                                        }}
                                      ></div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black truncate leading-tight" style={{ color: '#111827' }}>
                                          {teamName}
                                        </p>
                                        <p className="text-[9px] font-bold leading-tight" style={{
                                          color: teamColor,
                                          opacity: 0.8
                                        }}>
                                          {match.qfSource} Winner
                                        </p>
                                      </div>
                                    </div>
                                  );
                                }
                              }

                              // Mystery box for QF winners not yet determined
                              return (
                                <div
                                  key={`mystery-${slot}`}
                                  className="flex items-center gap-1.5 p-1 rounded-lg"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.95) 0%, rgba(245, 158, 11, 0.85) 50%, rgba(217, 119, 6, 0.95) 100%)',
                                    border: '3px solid #f59e0b',
                                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.8), 0 0 40px rgba(251, 191, 36, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.2)'
                                  }}
                                >
                                  <div
                                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                                    style={{
                                      backgroundColor: '#ffffff',
                                      border: '2px solid #fbbf24',
                                      boxShadow: '0 0 8px rgba(251, 191, 36, 0.8)'
                                    }}
                                  >
                                    <span className="text-xs">👑</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black truncate leading-tight" style={{
                                      color: '#ffffff',
                                      textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)'
                                    }}>
                                      {match.qfSource} Champion
                                    </p>
                                    <p className="text-[9px] font-bold leading-tight" style={{
                                      color: '#fef3c7',
                                      opacity: 0.9,
                                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                                    }}>
                                      To Be Decided
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : !isDynamic ? (
                          <div className="text-center">
                            <p className="text-base font-black mb-1" style={{ color: '#111827' }}>{match.teams}</p>
                            <p className="text-xs font-semibold" style={{ color: '#6b7280' }}>{match.subtitle}</p>
                          </div>
                        ) : hasTBD ? (
                          <div className="text-center py-2">
                            <p className="text-sm font-bold mb-1" style={{
                              color: '#9ca3af',
                              opacity: 0.7
                            }}>
                              ⏳ Teams To Be Determined
                            </p>
                            <p className="text-xs font-semibold" style={{ color: '#6b7280' }}>
                              {match.subtitle || (match.ranks ? `League Ranks: ${match.ranks.join(' • ')}` : '')}
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-1.5">
                            {teamNames.map((teamName, teamIdx) => {
                              const leagueRank = sorted.find(t => t.teamId === match.teamIds![teamIdx])?.rank;
                              return (
                                <div
                                  key={teamIdx}
                                  className="flex items-center gap-1.5 p-1 rounded-lg"
                                  style={{
                                    background: `linear-gradient(135deg, ${teamColors[teamIdx]}15, ${teamColors[teamIdx]}25)`,
                                    border: `2px solid ${teamColors[teamIdx]}`,
                                    boxShadow: `0 0 8px ${teamColors[teamIdx]}40`
                                  }}
                                >
                                  <div
                                    className="w-5 h-5 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor: teamColors[teamIdx],
                                      border: '2px solid #ffffff',
                                      boxShadow: `0 0 6px ${teamColors[teamIdx]}60`
                                    }}
                                  ></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black truncate leading-tight" style={{ color: '#111827' }}>
                                      {teamName}
                                    </p>
                                    {leagueRank && match.ranks && (
                                      <p className="text-[9px] font-bold leading-tight" style={{
                                        color: teamColors[teamIdx],
                                        opacity: 0.8
                                      }}>
                                        League #{leagueRank}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
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
      </>
    );
  };

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
                Separate Files ({dayWisePages.length + 1})
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
            {isGenerating ? 'Generating...' : `Download ${separateFiles ? `${dayWisePages.length + 1} PDFs` : 'PDF'}`}
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
              const isThursday = dayIndex === 0; // First day is Thursday

              return (
                <div
                  key={`${day.date}-${pageIndex}`}
                  className="pdf-page"
                  style={{ backgroundColor: '#ffffff', marginBottom: isLastPage ? '0' : '20px' }}
                >
                  {/* Header only on very first page */}
                  {isVeryFirstPage && renderHeader()}
                  {renderDayMatches(pageMatches, isFirstPageOfDay, day.displayDate, isNewDayStart, isThursday && isFirstPageOfDay)}
                </div>
              );
            })
          )}

          {/* Playoff Schedule - Sunday (Separate Page) */}
          <div
            className="pdf-page"
            style={{
              backgroundColor: '#ffffff',
              marginTop: '20px',
              pageBreakBefore: 'always'
            }}
          >
            {renderPlayoffSchedule(false)}
          </div>
        </div>
      </div>
    </div>
  );
}
