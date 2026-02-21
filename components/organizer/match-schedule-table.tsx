"use client";

import { useState, useEffect } from "react";
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
import { formatDubaiTime } from "@/lib/utils/date-utils";
import Link from "next/link";
import { AssignUmpireDialog } from "./assign-umpire-dialog";
import { ScoreOverrideDialog } from "./score-override-dialog";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";

type DbMatch = Database["public"]["Tables"]["matches"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface MatchScheduleTableProps {
  matches: Match[];
}

export function MatchScheduleTable({ matches }: MatchScheduleTableProps) {
  const { getTeam } = useTournamentStore();
  const [dbMatches, setDbMatches] = useState<DbMatch[]>([]);
  const [umpires, setUmpires] = useState<Map<string, Profile>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchesAndUmpires();
  }, []);

  const fetchMatchesAndUmpires = async () => {
    try {
      // Fetch matches from database
      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .order("match_number");

      if (matchError) throw matchError;

      // Fetch all umpires
      // @ts-ignore - Supabase browser client type inference limitation
      const { data: umpireData, error: umpireError } = await supabase.from("profiles").select("*").eq("role", "umpire");

      if (umpireError) throw umpireError;

      setDbMatches(matchData || []);

      const umpireMap = new Map<string, Profile>();
      umpireData?.forEach((umpire: any) => {
        umpireMap.set(umpire.id, umpire);
      });
      setUmpires(umpireMap);
    } catch (err) {
      console.error("Error fetching matches/umpires:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDbMatchForStoreMatch = (storeMatch: Match): DbMatch | undefined => {
    return dbMatches.find((dm) => dm.match_number === storeMatch.matchNumber);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading matches...
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
          <TableHead>Time</TableHead>
          <TableHead>Teams</TableHead>
          <TableHead>Scorer</TableHead>
          <TableHead className="w-24">Status</TableHead>
          <TableHead className="w-40">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.map((match) => {
          const teams = match.teamIds.map((id) => getTeam(id));
          const dbMatch = getDbMatchForStoreMatch(match);
          const assignedUmpire = dbMatch?.umpire_id
            ? umpires.get(dbMatch.umpire_id)
            : null;

          const stageBadgeColor =
            match.stage === "LEAGUE" ? "bg-blue-100 text-blue-800" :
            match.stage === "SEMI" ? "bg-purple-100 text-purple-800" :
            "bg-yellow-100 text-yellow-800"

          return (
            <TableRow key={match.id}>
              <TableCell className="font-medium">{match.matchNumber}</TableCell>
              <TableCell>
                <Badge className={`text-xs font-bold ${stageBadgeColor}`}>
                  {match.stage}
                </Badge>
              </TableCell>
              <TableCell>{match.court}</TableCell>
              <TableCell>{formatDubaiTime(match.startTime, "MMM d, HH:mm")}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {teams.map(
                    (t) =>
                      t && (
                        <span
                          key={t.id}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${t.color}20`,
                            color: t.color,
                          }}
                        >
                          {t.name}
                        </span>
                      )
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {assignedUmpire ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-[#0d3944]">
                      {assignedUmpire.full_name || assignedUmpire.email}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">Not assigned</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    match.state === "IN_PROGRESS"
                      ? "default"
                      : match.state === "COMPLETED" || match.state === "LOCKED"
                        ? "secondary"
                        : "outline"
                  }
                  className={
                    match.state === "IN_PROGRESS"
                      ? "bg-[#ff9800] text-white"
                      : ""
                  }
                >
                  {match.state}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2 flex-wrap">
                  {dbMatch && (
                    <AssignUmpireDialog
                      match={dbMatch}
                      onAssigned={fetchMatchesAndUmpires}
                    />
                  )}
                  <Button
                    asChild
                    size="sm"
                    className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold hover:opacity-90"
                  >
                    <Link href={`/umpire/scoring/${match.id}`}>Start Scoring</Link>
                  </Button>
                  {(match.state === "COMPLETED" || match.state === "LOCKED") && (
                    <ScoreOverrideDialog match={match} />
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
