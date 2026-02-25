"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateMatchDetails } from "@/lib/api/matches";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import type { Match, Team, MatchStage } from "@/lib/types";
import { AlertTriangle, Clock, Users, MapPin } from "lucide-react";

interface EditMatchDialogProps {
  match: Match;
  teams: Team[];
  onUpdate: () => void;
  children: React.ReactNode;
}

export function EditMatchDialog({ match, teams, onUpdate, children }: EditMatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [matchNumber, setMatchNumber] = useState(match.matchNumber);
  const [court, setCourt] = useState(match.court);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [team1, setTeam1] = useState(match.teamIds[0]);
  const [team2, setTeam2] = useState(match.teamIds[1]);
  const [team3, setTeam3] = useState(match.teamIds[2]);
  const [team4, setTeam4] = useState(match.teamIds[3]);
  const [stage, setStage] = useState(match.stage || "LEAGUE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const matches = useTournamentStore(state => state.matches);

  // Initialize date and time when dialog opens
  useEffect(() => {
    if (open) {
      const matchDate = new Date(match.startTime);
      // Format date as YYYY-MM-DD for input
      const dateStr = matchDate.toISOString().split('T')[0];
      // Format time as HH:MM for input
      const hours = String(matchDate.getHours()).padStart(2, '0');
      const minutes = String(matchDate.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      setDate(dateStr);
      setTime(timeStr);
      setMatchNumber(match.matchNumber);
      setCourt(match.court);
      setTeam1(match.teamIds[0]);
      setTeam2(match.teamIds[1]);
      setTeam3(match.teamIds[2]);
      setTeam4(match.teamIds[3]);
      setStage(match.stage || "LEAGUE");
      setError(null);
      setConflicts([]);
    }
  }, [open, match]);

  // Check for conflicts whenever schedule details change
  useEffect(() => {
    if (!open || !date || !time) return;

    const newStartTime = new Date(`${date}T${time}`);
    const selectedTeams = [team1, team2, team3, team4];
    const foundConflicts: string[] = [];

    // Check for team conflicts
    matches.forEach(m => {
      if (m.id === match.id) return; // Skip current match

      const matchTime = new Date(m.startTime);
      const timeDiff = Math.abs(matchTime.getTime() - newStartTime.getTime());
      const isAtSameTime = timeDiff < 30 * 60 * 1000; // Within 30 minutes

      if (isAtSameTime) {
        // Check if any team is in both matches
        const overlappingTeams = m.teamIds.filter(tid => selectedTeams.includes(tid));
        if (overlappingTeams.length > 0) {
          const teamNames = overlappingTeams.map(tid => {
            const team = teams.find(t => t.id === tid);
            return team?.name || tid;
          });
          foundConflicts.push(
            `Match #${m.matchNumber}: ${teamNames.join(", ")} already playing at this time`
          );
        }

        // Check court conflict
        if (m.court === court) {
          foundConflicts.push(
            `Match #${m.matchNumber} is already scheduled on ${court} at this time`
          );
        }
      }
    });

    setConflicts(foundConflicts);
  }, [date, time, team1, team2, team3, team4, court, open, match, matches, teams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate teams are unique
    const selectedTeams = [team1, team2, team3, team4];
    const uniqueTeams = new Set(selectedTeams);
    if (uniqueTeams.size !== 4) {
      setError("Please select 4 different teams");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    console.log("Submitting match update:", {
      matchId: match.id,
      matchNumber,
      court,
      date,
      time,
      teams: [team1, team2, team3, team4],
      stage,
    });

    try {
      const startTime = new Date(`${date}T${time}`);

      console.log("Calling updateMatchDetails...");
      await updateMatchDetails(match.id, {
        matchNumber,
        court,
        startTime,
        teamIds: [team1, team2, team3, team4],
        stage,
      });

      console.log("Match updated successfully, reloading matches...");
      await onUpdate();

      console.log("Matches reloaded, closing dialog");
      setOpen(false);
    } catch (err) {
      console.error("Error updating match:", err);
      setError(err instanceof Error ? err.message : "Failed to update match");
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Edit Match #{match.matchNumber}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="matchNumber">Match Number</Label>
              <Input
                id="matchNumber"
                type="number"
                value={matchNumber}
                onChange={(e) => setMatchNumber(Number(e.target.value))}
                disabled={loading}
                required
                min={1}
              />
            </div>
            <div>
              <Label htmlFor="court">Court</Label>
              <Input
                id="court"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                placeholder="e.g. Court A"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div>
            <Label>Stage</Label>
            <Select value={stage} onValueChange={(v) => setStage(v as MatchStage)} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LEAGUE">League</SelectItem>
                <SelectItem value="QF">Quarter Final</SelectItem>
                <SelectItem value="SEMI">Semi Final</SelectItem>
                <SelectItem value="FINAL">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Teams (Select 4 different teams)
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: team1, setter: setTeam1, label: "Team 1" },
                { value: team2, setter: setTeam2, label: "Team 2" },
                { value: team3, setter: setTeam3, label: "Team 3" },
                { value: team4, setter: setTeam4, label: "Team 4" },
              ].map(({ value, setter, label }) => (
                <div key={label} className="space-y-1">
                  <Label className="text-sm text-muted-foreground">{label}</Label>
                  <Select value={value} onValueChange={setter} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {teams
                        .sort((a, b) => {
                          const numA = parseInt(a.id.split('-')[1]) || 0;
                          const numB = parseInt(b.id.split('-')[1]) || 0;
                          return numA - numB;
                        })
                        .map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {conflicts.length > 0 && (
            <Alert className="border-orange-400 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-900">
                <strong>Scheduling Conflicts:</strong>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {conflicts.map((conflict, i) => (
                    <li key={i} className="text-sm">{conflict}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setLoading(false);
                setError(null);
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || conflicts.length > 0}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
