"use client";

import { useEffect, useState } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileSpreadsheet, CheckCircle } from "lucide-react";
import type { Match } from "@/lib/types";

export default function BallByBallExportPage() {
  const { matches, teams, loadMatches, loadTeams, tournament } = useTournamentStore();
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "success">("idle");

  useEffect(() => {
    loadMatches();
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedMatches = matches.filter(m => m.state === "COMPLETED");

  const toggleMatch = (matchId: string) => {
    const newSelected = new Set(selectedMatches);
    if (newSelected.has(matchId)) {
      newSelected.delete(matchId);
    } else {
      newSelected.add(matchId);
    }
    setSelectedMatches(newSelected);
  };

  const selectAll = () => {
    if (selectedMatches.size === completedMatches.length) {
      setSelectedMatches(new Set());
    } else {
      setSelectedMatches(new Set(completedMatches.map(m => m.id)));
    }
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || "Unknown";
  };

  const handleExportCSV = () => {
    if (selectedMatches.size === 0) return;

    setExportStatus("exporting");

    // CSV headers
    const headers = [
      "Match Number",
      "Court",
      "Date",
      "Innings",
      "Batting Team",
      "Bowling Team",
      "Over Number",
      "Ball Number",
      "Runs",
      "Is Wicket",
      "Is No Ball",
      "Is Wide",
      "Is Powerplay",
      "Effective Runs",
      "Wicket Type",
      "Timestamp"
    ];

    const rows: string[][] = [];

    // Get selected match data
    const selectedMatchData = matches.filter(m => selectedMatches.has(m.id));

    selectedMatchData.forEach(match => {
      match.innings?.forEach((innings, inningsIndex) => {
        const battingTeam = getTeamName(innings.teamId);
        const bowlingTeamId = inningsIndex === 0 ? match.teamIds[2] : match.teamIds[0];
        const bowlingTeam = getTeamName(bowlingTeamId);

        innings.overs?.forEach(over => {
          over.balls?.forEach(ball => {
            const wicketType = ball.isWicket
              ? ball.isNoball
                ? "Run Out (No Ball)"
                : ball.runs === 0
                ? "Dot Ball Wicket"
                : ball.runs === 4
                ? "Caught Out"
                : "Run Out"
              : "";

            rows.push([
              match.matchNumber.toString(),
              match.court.toString(),
              match.startTime ? new Date(match.startTime).toLocaleDateString() : "N/A",
              (inningsIndex + 1).toString(),
              battingTeam,
              bowlingTeam,
              over.overNumber.toString(),
              ball.ballNumber.toString(),
              ball.runs.toString(),
              ball.isWicket ? "Yes" : "No",
              ball.isNoball ? "Yes" : "No",
              ball.isWide ? "Yes" : "No",
              over.isPowerplay ? "Yes" : "No",
              ball.effectiveRuns.toString(),
              wicketType,
              ball.timestamp ? new Date(ball.timestamp).toISOString() : "N/A"
            ]);
          });
        });
      });
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);

    const filename = selectedMatches.size === 1
      ? `Match_${selectedMatchData[0].matchNumber}_BallByBall.csv`
      : `${tournament.name.replace(/\s+/g, '_')}_BallByBall_Data.csv`;

    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportStatus("success");
    setTimeout(() => setExportStatus("idle"), 3000);
  };

  return (
    <div className="min-h-screen tournament-bg-pattern p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <FileSpreadsheet className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-black text-[#0d3944]">Ball-by-Ball Data Export</h1>
            </div>
            <p className="text-gray-600">
              Select matches to export detailed ball-by-ball data in CSV format (Excel compatible)
            </p>
          </div>

          {/* Export Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-rose-600/10 rounded-xl border-2 border-red-500/30">
              <p className="text-xs font-bold text-gray-600 mb-1">COMPLETED MATCHES</p>
              <p className="text-4xl font-black text-red-600">{completedMatches.length}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-[#ff9800]/10 to-[#ffb300]/10 rounded-xl border-2 border-[#ff9800]/30">
              <p className="text-xs font-bold text-gray-600 mb-1">SELECTED</p>
              <p className="text-4xl font-black text-[#ff9800]">{selectedMatches.size}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-xl border-2 border-emerald-500/30">
              <p className="text-xs font-bold text-gray-600 mb-1">FORMAT</p>
              <p className="text-2xl font-black text-emerald-600">CSV</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <Button
              onClick={selectAll}
              variant="outline"
              className="font-bold"
              disabled={completedMatches.length === 0}
            >
              {selectedMatches.size === completedMatches.length ? "Deselect All" : "Select All"}
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={selectedMatches.size === 0 || exportStatus === "exporting"}
              className={`font-bold transition-all ${
                exportStatus === "success"
                  ? "bg-gradient-to-r from-emerald-500 to-green-600"
                  : "bg-gradient-to-r from-red-500 to-rose-600"
              } text-white`}
            >
              {exportStatus === "success" ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Downloaded Successfully!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {exportStatus === "exporting" ? "Exporting..." : `Export ${selectedMatches.size} Match${selectedMatches.size !== 1 ? 'es' : ''}`}
                </>
              )}
            </Button>
          </div>

          {/* Match Selection */}
          {completedMatches.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold">No completed matches yet</p>
              <p className="text-gray-400 text-sm mt-2">Ball-by-ball data will be available after matches are completed</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-600 mb-3">SELECT MATCHES TO EXPORT:</p>
              {completedMatches.map((match) => {
                const isSelected = selectedMatches.has(match.id);
                const ballCount = match.innings?.reduce(
                  (sum, innings) =>
                    sum + (innings.overs?.reduce((oSum, over) => oSum + (over.balls?.length || 0), 0) || 0),
                  0
                ) || 0;

                return (
                  <Card
                    key={match.id}
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      isSelected
                        ? "border-red-500 bg-red-50 shadow-lg"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                    onClick={() => toggleMatch(match.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-red-500 bg-red-500"
                            : "border-gray-300"
                        }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl font-black text-red-600">Match #{match.matchNumber}</span>
                            <span className="text-xs font-bold text-gray-500 px-2 py-1 bg-gray-100 rounded">
                              Court {match.court}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 px-2 py-1 bg-emerald-100 rounded">
                              {ballCount} balls recorded
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                            <p className="font-semibold text-gray-700">
                              {getTeamName(match.teamIds[0])} vs {getTeamName(match.teamIds[1])}
                            </p>
                            <p className="font-semibold text-gray-700">
                              {getTeamName(match.teamIds[2])} vs {getTeamName(match.teamIds[3])}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {match.startTime
                              ? new Date(match.startTime).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                              : "Date TBD"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* CSV Format Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-black text-gray-900 mb-3">CSV Format Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 mb-3 font-semibold">
                The exported CSV file contains the following columns:
              </p>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                <p>• Match Number, Court, Date</p>
                <p>• Innings, Batting Team, Bowling Team</p>
                <p>• Over Number, Ball Number</p>
                <p>• Runs, Is Wicket, Wicket Type</p>
                <p>• Is No Ball, Is Wide</p>
                <p>• Is Powerplay, Effective Runs</p>
                <p>• Timestamp (ISO 8601 format)</p>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Compatible with Microsoft Excel, Google Sheets, and all major spreadsheet applications
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
