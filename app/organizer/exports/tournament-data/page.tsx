"use client";

import { useEffect, useState } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { useStandingsStore } from "@/lib/stores/standings-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileJson, CheckCircle, Database } from "lucide-react";

export default function TournamentDataExportPage() {
  const { matches, teams, tournament, loadMatches, loadTeams } = useTournamentStore();
  const { standings, loadStandings } = useStandingsStore();
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "success">("idle");
  const [includeOptions, setIncludeOptions] = useState({
    teams: true,
    matches: true,
    standings: true,
    tournament: true,
  });

  useEffect(() => {
    loadMatches();
    loadTeams();
    loadStandings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExportJSON = () => {
    setExportStatus("exporting");

    // Build export data based on selected options
    const exportData: any = {
      exportedAt: new Date().toISOString(),
      exportVersion: "1.0",
    };

    if (includeOptions.tournament) {
      exportData.tournament = tournament;
    }

    if (includeOptions.teams) {
      exportData.teams = teams;
    }

    if (includeOptions.matches) {
      exportData.matches = matches;
    }

    if (includeOptions.standings) {
      exportData.standings = standings;
    }

    // Create JSON content
    const jsonContent = JSON.stringify(exportData, null, 2);

    // Create download
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${tournament.name.replace(/\s+/g, '_')}_Complete_Data_${new Date().toISOString().split('T')[0]}.json`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportStatus("success");
    setTimeout(() => setExportStatus("idle"), 3000);
  };

  const toggleOption = (option: keyof typeof includeOptions) => {
    setIncludeOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  // Calculate data sizes
  const dataStats = {
    teams: teams.length,
    matches: matches.length,
    completedMatches: matches.filter(m => m.state === "COMPLETED").length,
    totalBalls: matches.reduce(
      (sum, match) =>
        sum +
        (match.innings?.reduce(
          (iSum, innings) =>
            iSum + (innings.overs?.reduce((oSum, over) => oSum + (over.balls?.length || 0), 0) || 0),
          0
        ) || 0),
      0
    ),
    standings: standings.length,
  };

  const estimatedSize = JSON.stringify({
    tournament: includeOptions.tournament ? tournament : undefined,
    teams: includeOptions.teams ? teams : undefined,
    matches: includeOptions.matches ? matches : undefined,
    standings: includeOptions.standings ? standings : undefined,
  }).length;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="min-h-screen tournament-bg-pattern p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <FileJson className="w-8 h-8 text-slate-600" />
              <h1 className="text-3xl font-black text-[#0d3944]">Tournament Data Export (JSON)</h1>
            </div>
            <p className="text-gray-600">
              Export complete tournament data in JSON format for backup, analysis, or migration
            </p>
          </div>

          {/* Data Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 rounded-xl border-2 border-blue-500/30">
              <p className="text-xs font-bold text-gray-600 mb-1">TEAMS</p>
              <p className="text-4xl font-black text-blue-600">{dataStats.teams}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-xl border-2 border-purple-500/30">
              <p className="text-xs font-bold text-gray-600 mb-1">MATCHES</p>
              <p className="text-4xl font-black text-purple-600">{dataStats.matches}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-xl border-2 border-emerald-500/30">
              <p className="text-xs font-bold text-gray-600 mb-1">TOTAL BALLS</p>
              <p className="text-4xl font-black text-emerald-600">{dataStats.totalBalls}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-slate-500/10 to-gray-600/10 rounded-xl border-2 border-slate-500/30">
              <p className="text-xs font-bold text-gray-600 mb-1">EST. SIZE</p>
              <p className="text-2xl font-black text-slate-600">{formatBytes(estimatedSize)}</p>
            </div>
          </div>

          {/* Export Options */}
          <div className="mb-6">
            <h3 className="text-lg font-black text-gray-900 mb-3">Select Data to Export</h3>
            <div className="space-y-3">
              <Card
                className={`p-4 cursor-pointer transition-all border-2 ${
                  includeOptions.tournament
                    ? "border-[#ff9800] bg-[#ff9800]/5 shadow-lg"
                    : "border-gray-200 hover:border-[#ff9800]/50"
                }`}
                onClick={() => toggleOption("tournament")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      includeOptions.tournament ? "border-[#ff9800] bg-[#ff9800]" : "border-gray-300"
                    }`}>
                      {includeOptions.tournament && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="text-lg font-black text-gray-900">Tournament Information</p>
                      <p className="text-sm text-gray-600">Name, season, format, and configuration</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer transition-all border-2 ${
                  includeOptions.teams
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => toggleOption("teams")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      includeOptions.teams ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    }`}>
                      {includeOptions.teams && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="text-lg font-black text-gray-900">Teams & Players</p>
                      <p className="text-sm text-gray-600">
                        {dataStats.teams} teams with complete player rosters and details
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer transition-all border-2 ${
                  includeOptions.matches
                    ? "border-purple-500 bg-purple-50 shadow-lg"
                    : "border-gray-200 hover:border-purple-300"
                }`}
                onClick={() => toggleOption("matches")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      includeOptions.matches ? "border-purple-500 bg-purple-500" : "border-gray-300"
                    }`}>
                      {includeOptions.matches && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="text-lg font-black text-gray-900">Match Data (Complete)</p>
                      <p className="text-sm text-gray-600">
                        All {dataStats.matches} matches with innings, overs, balls, and scores ({dataStats.totalBalls} balls total)
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer transition-all border-2 ${
                  includeOptions.standings
                    ? "border-emerald-500 bg-emerald-50 shadow-lg"
                    : "border-gray-200 hover:border-emerald-300"
                }`}
                onClick={() => toggleOption("standings")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      includeOptions.standings ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                    }`}>
                      {includeOptions.standings && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="text-lg font-black text-gray-900">Standings & Statistics</p>
                      <p className="text-sm text-gray-600">
                        Points table with calculated statistics for all teams
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleExportJSON}
              disabled={
                (!includeOptions.tournament &&
                  !includeOptions.teams &&
                  !includeOptions.matches &&
                  !includeOptions.standings) ||
                exportStatus === "exporting"
              }
              className={`font-bold transition-all text-lg px-8 py-6 ${
                exportStatus === "success"
                  ? "bg-gradient-to-r from-emerald-500 to-green-600"
                  : "bg-gradient-to-r from-slate-500 to-gray-600"
              } text-white`}
            >
              {exportStatus === "success" ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Downloaded Successfully!
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  {exportStatus === "exporting" ? "Exporting..." : "Export Tournament Data"}
                </>
              )}
            </Button>
          </div>

          {/* Use Cases */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-black text-gray-900 mb-4">Use Cases for JSON Export</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 p-4 rounded-lg border-2 border-blue-500/30">
                <Database className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-sm font-black text-gray-900 mb-1">Data Backup</p>
                <p className="text-xs text-gray-600">
                  Complete backup of all tournament data for archival or disaster recovery
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 p-4 rounded-lg border-2 border-purple-500/30">
                <FileJson className="w-8 h-8 text-purple-600 mb-2" />
                <p className="text-sm font-black text-gray-900 mb-1">API Integration</p>
                <p className="text-xs text-gray-600">
                  Import into external systems, analytics platforms, or custom applications
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 p-4 rounded-lg border-2 border-emerald-500/30">
                <CheckCircle className="w-8 h-8 text-emerald-600 mb-2" />
                <p className="text-sm font-black text-gray-900 mb-1">Data Analysis</p>
                <p className="text-xs text-gray-600">
                  Advanced statistical analysis using Python, R, or other data science tools
                </p>
              </div>
            </div>
          </div>

          {/* JSON Structure Info */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-black text-gray-900 mb-2">JSON Structure</h4>
            <pre className="text-xs text-gray-700 overflow-x-auto">
{`{
  "exportedAt": "2026-02-23T10:30:00.000Z",
  "exportVersion": "1.0",
  "tournament": { /* tournament metadata */ },
  "teams": [ /* array of team objects with players */ ],
  "matches": [ /* array of match objects with complete data */ ],
  "standings": [ /* array of team standings */ ]
}`}
            </pre>
            <p className="text-xs text-gray-500 mt-2">
              Each section contains complete, structured data with all relationships preserved
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
