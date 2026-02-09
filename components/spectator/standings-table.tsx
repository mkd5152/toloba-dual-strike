"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StandingsEntry } from "@/lib/types";

interface StandingsTableProps {
  standings: StandingsEntry[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-center">Played</TableHead>
          <TableHead className="text-center">Points</TableHead>
          <TableHead className="text-center">Total Runs</TableHead>
          <TableHead className="text-center">Dismissals</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.map((entry) => (
          <TableRow key={entry.teamId}>
            <TableCell className="font-bold">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  entry.rank <= 4
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                    : "bg-muted"
                }`}
              >
                {entry.rank}
              </div>
            </TableCell>
            <TableCell className="font-medium">{entry.teamName}</TableCell>
            <TableCell className="text-center">
              {entry.matchesPlayed}
            </TableCell>
            <TableCell className="text-center font-bold">
              {entry.points}
            </TableCell>
            <TableCell className="text-center">{entry.totalRuns}</TableCell>
            <TableCell className="text-center">
              {entry.totalDismissals}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
