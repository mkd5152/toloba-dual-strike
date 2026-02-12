"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { CompletedMatchesTable } from "@/components/organizer/completed-matches-table";
import { Trophy, CheckCircle, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrganizerMatchesPage() {
  const { matches, teams, loadTeams, loadMatches, loading } = useTournamentStore();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      const loadData = async () => {
        await loadTeams();
        await loadMatches();
        setInitialLoadComplete(true);
      };
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const completedMatches = matches.filter(
    (m) => m.state === "COMPLETED" || m.state === "LOCKED"
  );

  const exportAllResultsToCSV = () => {
    const rows = [
      ["Match #", "Court", "Stage", "Date", "Rank", "Team", "Runs", "Points"],
    ];

    completedMatches.forEach((match) => {
      match.rankings.forEach((ranking, index) => {
        const team = teams.find((t) => t.id === ranking.teamId);
        rows.push([
          match.matchNumber.toString(),
          match.court,
          match.stage,
          match.startTime.toISOString(),
          (index + 1).toString(),
          team?.name || "Unknown",
          ranking.totalRuns.toString(),
          ranking.points.toString(),
        ]);
      });
    });

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all-match-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!initialLoadComplete || loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-[#b71c1c] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-bold">Loading match results...</p>
        </div>
      </div>
    );
  }

  const leagueMatches = completedMatches.filter((m) => m.stage === "LEAGUE");
  const semiMatches = completedMatches.filter((m) => m.stage === "SEMI");
  const finalMatches = completedMatches.filter((m) => m.stage === "FINAL");

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <div className="inline-block px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white text-xs font-bold uppercase tracking-wide">
          Match Results
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black text-white drop-shadow-lg">Completed Matches</h1>
            <p className="text-white/80 font-medium mt-2">
              View and export match results
            </p>
          </div>
          {completedMatches.length > 0 && (
            <Button
              onClick={exportAllResultsToCSV}
              className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold hover:opacity-90"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All Results
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-bold uppercase">League</p>
                <p className="text-3xl font-black text-blue-900 mt-1">
                  {leagueMatches.length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-bold uppercase">Semi-Finals</p>
                <p className="text-3xl font-black text-purple-900 mt-1">
                  {semiMatches.length}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-bold uppercase">Final</p>
                <p className="text-3xl font-black text-yellow-900 mt-1">
                  {finalMatches.length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Matches Table */}
      <Card className="border-2 border-[#0d3944]/10 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#0d3944] to-[#1a4a57] text-white">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Match Results ({completedMatches.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <CompletedMatchesTable matches={matches} />
        </CardContent>
      </Card>
    </div>
  );
}
