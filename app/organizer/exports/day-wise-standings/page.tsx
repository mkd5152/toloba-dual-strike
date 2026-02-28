"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import Image from "next/image";
import type { Match, StandingsEntry } from "@/lib/types";

export default function DayWiseStandingsPage() {
  const { teams, matches, loadTeams, loadMatches, tournament } = useTournamentStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("2026-02-26"); // Day 1
  const contentRef = useRef<HTMLDivElement>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([loadTeams(), loadMatches()]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [loadTeams, loadMatches]);

  // Group matches by day
  const matchesByDay = useMemo(() => {
    return matches.reduce((acc, match) => {
      const dateStr = match.startTime.toISOString().split("T")[0];
      if (!acc.has(dateStr)) {
        acc.set(dateStr, []);
      }
      acc.get(dateStr)!.push(match);
      return acc;
    }, new Map<string, Match[]>());
  }, [matches]);

  // Calculate standings for a specific day
  const dayStandings = useMemo(() => {
    const dayMatches = matchesByDay.get(selectedDay) || [];
    const standingsMap = new Map<string, StandingsEntry>();

    // Initialize all teams
    teams.forEach((team) => {
      standingsMap.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        matchesPlayed: 0,
        points: 0,
        totalRuns: 0,
        totalDismissals: 0,
        rank: 0,
      });
    });

    console.log("Total teams initialized:", teams.length);
    console.log("Day matches (completed/locked):", dayMatches.filter((m) => m.state === "COMPLETED" || m.state === "LOCKED").length);

    // Process only completed matches from this day
    const completedMatches = dayMatches.filter((m) => m.state === "COMPLETED" || m.state === "LOCKED");
    completedMatches.forEach((match) => {
      console.log(`Match ${match.matchNumber}: ${match.rankings.length} rankings`);
      match.rankings.forEach((ranking) => {
        const entry = standingsMap.get(ranking.teamId);
        if (entry) {
          entry.matchesPlayed += 1;
          entry.points += ranking.points || 0;
          entry.totalRuns += ranking.totalScore || ranking.totalRuns || 0;
          entry.totalDismissals += ranking.totalDismissals || 0;
          console.log(`  Team ${entry.teamName}: +${ranking.points} pts, +${ranking.totalScore || ranking.totalRuns} runs`);
        } else {
          console.warn(`  Team ID ${ranking.teamId} not found in teams list!`);
        }
      });
    });

    // Sort by points, then runs, then dismissals
    const sorted = Array.from(standingsMap.values())
      .filter(entry => entry.matchesPlayed > 0) // Only show teams that played
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.totalRuns !== a.totalRuns) return b.totalRuns - a.totalRuns;
        return a.totalDismissals - b.totalDismissals;
      });

    console.log("Teams with matches played:", sorted.length);
    console.log("Teams without matches:", teams.length - sorted.length);

    // Assign ranks
    sorted.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return sorted;
  }, [teams, matchesByDay, selectedDay]);

  // Split standings into pages: 12 teams per page
  const standingsPages = useMemo(() => {
    const pages: StandingsEntry[][] = [];

    if (dayStandings.length === 0) return pages;

    // Split into pages of 12 teams each
    for (let i = 0; i < dayStandings.length; i += 12) {
      pages.push(dayStandings.slice(i, i + 12));
    }

    console.log('Standings pagination:', pages.map((p, i) => `Page ${i + 1}: ${p.length} teams`));
    console.log('Total teams in standings:', dayStandings.length);
    return pages;
  }, [dayStandings]);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const jsPDF = (await import('jspdf')).default;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = 210;

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

      const dayDate = new Date(selectedDay);
      const dayNum = Array.from(matchesByDay.keys()).sort().indexOf(selectedDay) + 1;
      const dayStr = dayDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).replace(/ /g, "-");

      pdf.save(`Day_${dayNum}_${dayStr}_Standings.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const renderHeader = () => {
    const dayDate = new Date(selectedDay);
    const dayNum = Array.from(matchesByDay.keys()).sort().indexOf(selectedDay) + 1;

    return (
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
              DAY {dayNum} STANDINGS
            </h1>
            <div className="h-1 w-32 mx-auto mb-4" style={{ background: 'linear-gradient(to right, #ff9800, #ffb300)' }}></div>
            <p className="text-2xl font-bold mb-2" style={{ color: '#4a5568' }}>{tournament.name}</p>
            <p className="text-lg font-semibold" style={{ color: '#6b7280' }}>
              {dayDate.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
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
    );
  };

  const renderStandingRow = (entry: StandingsEntry, index: number) => {
    const team = teams.find((t) => t.id === entry.teamId);
    const isEven = index % 2 === 0;
    const isTopThree = entry.rank <= 3;

    // Medal colors for top 3
    const getMedalStyle = (rank: number) => {
      if (rank === 1) return { bg: '#ffd700', color: '#78350f' }; // Gold
      if (rank === 2) return { bg: '#c0c0c0', color: '#1f2937' }; // Silver
      if (rank === 3) return { bg: '#cd7f32', color: '#ffffff' }; // Bronze
      return { bg: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' };
    };

    const medalStyle = getMedalStyle(entry.rank);

    return (
      <tr
        key={entry.teamId}
        style={{
          borderBottom: '2px solid #e5e7eb',
          backgroundColor: isEven ? 'rgba(249, 250, 251, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          fontWeight: isTopThree ? '700' : '400',
        }}
      >
        {/* Rank */}
        <td className="p-5" style={{ borderRight: '2px solid #e5e7eb' }}>
          <div className="flex items-center justify-center">
            <span
              className="text-2xl font-black w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: medalStyle.bg,
                color: medalStyle.color,
                border: `3px solid ${isTopThree ? medalStyle.bg : 'rgba(255, 152, 0, 0.3)'}`,
                boxShadow: isTopThree ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : 'none',
              }}
            >
              {entry.rank}
            </span>
          </div>
        </td>

        {/* Team Name */}
        <td className="p-5" style={{ borderRight: '2px solid #e5e7eb' }}>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex-shrink-0"
              style={{
                backgroundColor: team?.color || '#gray',
                border: '4px solid #ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            ></div>
            <p className="text-xl font-black" style={{ color: '#0d3944' }}>
              {entry.teamName}
            </p>
          </div>
        </td>

        {/* Matches Played */}
        <td className="p-5 text-center" style={{ borderRight: '2px solid #e5e7eb' }}>
          <p className="text-lg font-bold" style={{ color: '#111827' }}>
            {entry.matchesPlayed}
          </p>
        </td>

        {/* Points */}
        <td className="p-5 text-center" style={{ borderRight: '2px solid #e5e7eb' }}>
          <p className="text-xl font-black" style={{ color: '#ff9800' }}>
            {entry.points.toFixed(1)}
          </p>
        </td>

        {/* Runs */}
        <td className="p-5 text-center" style={{ borderRight: '2px solid #e5e7eb' }}>
          <p className="text-lg font-bold" style={{ color: '#111827' }}>
            {entry.totalRuns}
          </p>
        </td>

        {/* Wickets */}
        <td className="p-5 text-center">
          <p className="text-lg font-bold" style={{ color: '#111827' }}>
            {entry.totalDismissals}
          </p>
        </td>
      </tr>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-muted-foreground">Loading matches...</span>
        </div>
      </div>
    );
  }

  if (matchesByDay.size === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">No matches found</p>
      </div>
    );
  }

  if (standingsPages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold">Select Day:</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {Array.from(matchesByDay.keys())
                  .sort()
                  .map((date) => {
                    const dateObj = new Date(date);
                    const dayNum = Array.from(matchesByDay.keys()).sort().indexOf(date) + 1;
                    const dayMatchesCount = matchesByDay.get(date)?.length || 0;
                    const completedCount = matchesByDay.get(date)?.filter(m => m.state === "COMPLETED" || m.state === "LOCKED").length || 0;
                    return (
                      <option key={date} value={date}>
                        Day {dayNum} - {dateObj.toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })} ({completedCount}/{dayMatchesCount} completed)
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No completed matches on this day</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold">Select Day:</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {Array.from(matchesByDay.keys())
                .sort()
                .map((date) => {
                  const dateObj = new Date(date);
                  const dayNum = Array.from(matchesByDay.keys()).sort().indexOf(date) + 1;
                  const dayMatchesCount = matchesByDay.get(date)?.length || 0;
                  const completedCount = matchesByDay.get(date)?.filter(m => m.state === "COMPLETED" || m.state === "LOCKED").length || 0;
                  return (
                    <option key={date} value={date}>
                      Day {dayNum} - {dateObj.toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })} ({completedCount}/{dayMatchesCount} completed)
                    </option>
                  );
                })}
            </select>
            <span className="text-sm text-muted-foreground">
              {dayStandings.length} team{dayStandings.length !== 1 ? 's' : ''} played • {standingsPages.length} page{standingsPages.length !== 1 ? 's' : ''}
            </span>
          </div>

          <Button
            onClick={handleDownloadPDF}
            disabled={dayStandings.length === 0}
            className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-white font-bold hover:opacity-90"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Standings Content - Multiple Pages */}
        <div ref={contentRef} style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
          {standingsPages.map((pageStandings, pageIndex) => (
            <div
              key={pageIndex}
              className="pdf-page"
              style={{
                backgroundColor: '#ffffff',
                marginBottom: pageIndex < standingsPages.length - 1 ? '20px' : '0'
              }}
            >
              {/* Show header only on first page */}
              {pageIndex === 0 && renderHeader()}

              {/* Standings Table */}
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
                          <th className="p-4 text-center font-black text-lg w-20" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                            RANK
                          </th>
                          <th className="p-4 text-left font-black text-lg" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                            TEAM NAME
                          </th>
                          <th className="p-4 text-center font-black text-lg w-32" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                            PLAYED
                          </th>
                          <th className="p-4 text-center font-black text-lg w-32" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                            POINTS
                          </th>
                          <th className="p-4 text-center font-black text-lg w-32" style={{ color: '#ffffff', borderRight: '2px solid rgba(255, 255, 255, 0.3)' }}>
                            RUNS
                          </th>
                          <th className="p-4 text-center font-black text-lg w-32" style={{ color: '#ffffff' }}>
                            WICKETS
                          </th>
                        </tr>
                      </thead>
                    )}
                    <tbody style={{ backgroundColor: 'transparent' }}>
                      {pageStandings.map((entry) => renderStandingRow(entry, entry.rank - 1))}
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
