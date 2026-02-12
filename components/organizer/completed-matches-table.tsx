"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Match } from "@/lib/types";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { format } from "date-fns";
import { Trophy, Download } from "lucide-react";

interface CompletedMatchesTableProps {
  matches: Match[];
}

export function CompletedMatchesTable({ matches }: CompletedMatchesTableProps) {
  const { getTeam } = useTournamentStore();

  const completedMatches = matches.filter(
    (m) => m.state === "COMPLETED" || m.state === "LOCKED"
  );

  const exportMatchToCSV = (match: Match) => {
    const teams = match.teamIds.map((id) => getTeam(id));
    const rows = [
      ["Match Number", "Court", "Stage", "Date", "Rank", "Team", "Runs", "Points"],
    ];

    match.rankings.forEach((ranking, index) => {
      const team = teams.find((t) => t?.id === ranking.teamId);
      rows.push([
        match.matchNumber.toString(),
        match.court,
        match.stage,
        format(match.startTime, "yyyy-MM-dd HH:mm"),
        (index + 1).toString(),
        team?.name || "Unknown",
        ranking.totalRuns.toString(),
        ranking.points.toString(),
      ]);
    });

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `match-${match.matchNumber}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };


  if (completedMatches.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-semibold">No completed matches yet</p>
        <p className="text-sm mt-2">Completed matches will appear here with full results</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">#</TableHead>
          <TableHead className="w-20">Stage</TableHead>
          <TableHead>Court</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Winner</TableHead>
          <TableHead>Top 4 Results</TableHead>
          <TableHead className="w-24">Export</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {completedMatches.map((match) => {
          const teams = match.teamIds.map((id) => getTeam(id));
          const winner = match.rankings[0];
          const winnerTeam = teams.find((t) => t?.id === winner?.teamId);

          const stageBadgeColor =
            match.stage === "LEAGUE"
              ? "bg-blue-100 text-blue-800"
              : match.stage === "SEMI"
                ? "bg-purple-100 text-purple-800"
                : "bg-yellow-100 text-yellow-800";

          return (
            <TableRow key={match.id}>
              <TableCell className="font-bold text-[#0d3944]">
                {match.matchNumber}
              </TableCell>
              <TableCell>
                <Badge className={`text-xs font-bold ${stageBadgeColor}`}>
                  {match.stage}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{match.court}</TableCell>
              <TableCell className="text-sm text-gray-600">
                {format(match.startTime, "MMM d, HH:mm")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <div>
                    <div
                      className="font-bold text-sm"
                      style={{ color: winnerTeam?.color }}
                    >
                      {winnerTeam?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {winner?.totalRuns} runs • {winner?.points} pts
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {match.rankings.slice(0, 4).map((ranking, index) => {
                    const team = teams.find((t) => t?.id === ranking.teamId);
                    return (
                      <div
                        key={ranking.teamId}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className="font-bold text-gray-500 w-4">
                          {index + 1}.
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: team?.color }}
                        >
                          {team?.name}
                        </span>
                        <span className="text-gray-400">-</span>
                        <span className="text-gray-600">
                          {ranking.totalRuns}r
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="font-bold text-[#ff9800]">
                          {ranking.points}p
                        </span>
                      </div>
                    );
                  })}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportMatchToCSV(match)}
                  className="text-xs px-2 py-1 h-7"
                  title="Export as CSV"
                >
                  <Download className="w-3 h-3 mr-1" />
                  CSV
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
