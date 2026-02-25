"use client";

import { useEffect, useState } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { EditMatchDialog } from "@/components/organizer/edit-match-dialog";
import { AddMatchDialog } from "@/components/organizer/add-match-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, Calendar, Clock, Users } from "lucide-react";
import { deleteMatch } from "@/lib/api/matches";
import type { Match } from "@/lib/types";

export default function MatchManagementPage() {
  const { matches, teams, loadMatches, loadTeams } = useTournamentStore();
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadMatches(), loadTeams()]);
      setLoading(false);
    };
    loadData();
  }, [loadMatches, loadTeams]);

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || teamId;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const handleDeleteClick = (match: Match) => {
    setMatchToDelete(match);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!matchToDelete) return;

    setDeleting(true);
    try {
      await deleteMatch(matchToDelete.id);
      await loadMatches();
      setDeleteDialogOpen(false);
      setMatchToDelete(null);
    } catch (error) {
      console.error("Error deleting match:", error);
      alert("Failed to delete match. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const getStateColor = (state: Match["state"]) => {
    switch (state) {
      case "CREATED":
      case "READY":
        return "default";
      case "TOSS":
        return "secondary";
      case "IN_PROGRESS":
        return "destructive";
      case "COMPLETED":
        return "outline";
      default:
        return "default";
    }
  };

  // Group matches by date
  const matchesByDate = matches.reduce((acc, match) => {
    const dateKey = formatDate(match.startTime);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Management</h1>
          <p className="text-muted-foreground mt-1">
            Reschedule matches, swap teams, and manage your tournament fixtures
          </p>
        </div>
        <AddMatchDialog onAdd={() => loadMatches()}>
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Match
          </Button>
        </AddMatchDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tournament Schedule
          </CardTitle>
          <CardDescription>
            {matches.length} matches scheduled across {Object.keys(matchesByDate).length} days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.keys(matchesByDate).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No matches scheduled</p>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first match
              </p>
              <AddMatchDialog onAdd={() => loadMatches()}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Match
                </Button>
              </AddMatchDialog>
            </div>
          ) : (
            Object.entries(matchesByDate)
              .sort(([dateA], [dateB]) => {
                const matchA = matchesByDate[dateA][0];
                const matchB = matchesByDate[dateB][0];
                return matchA.startTime.getTime() - matchB.startTime.getTime();
              })
              .map(([date, dayMatches]) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <h3 className="text-lg font-semibold">{date}</h3>
                    <Badge variant="secondary">{dayMatches.length} matches</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">Match</TableHead>
                          <TableHead className="w-24">Time</TableHead>
                          <TableHead className="w-24">Court</TableHead>
                          <TableHead>Teams</TableHead>
                          <TableHead className="w-24">Stage</TableHead>
                          <TableHead className="w-24">Status</TableHead>
                          <TableHead className="w-32 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dayMatches
                          .sort((a, b) => a.matchNumber - b.matchNumber)
                          .map((match) => (
                            <TableRow key={match.id}>
                              <TableCell className="font-medium">#{match.matchNumber}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(match.startTime)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{match.court}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-start gap-1 text-sm">
                                  <Users className="h-3 w-3 mt-0.5 shrink-0" />
                                  <div className="space-y-0.5">
                                    {match.teamIds.map((teamId) => (
                                      <div key={teamId}>{getTeamName(teamId)}</div>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={match.stage !== "LEAGUE" ? "default" : "secondary"}>
                                  {match.stage}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStateColor(match.state)}>
                                  {match.state.replace("_", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                  <EditMatchDialog
                                    match={match}
                                    teams={teams}
                                    onUpdate={() => loadMatches()}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </EditMatchDialog>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteClick(match)}
                                    disabled={match.state !== "CREATED" && match.state !== "READY"}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Match?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Match #{matchToDelete?.matchNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
