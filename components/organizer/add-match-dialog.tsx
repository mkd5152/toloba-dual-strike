"use client";

import { useState } from "react";
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
import { createMatch } from "@/lib/api/matches";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Plus, Users } from "lucide-react";
import type { MatchStage } from "@/lib/types";

interface AddMatchDialogProps {
  onAdd: () => void;
  children: React.ReactNode;
}

export function AddMatchDialog({ onAdd, children }: AddMatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [matchNumber, setMatchNumber] = useState("");
  const [court, setCourt] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [team3, setTeam3] = useState("");
  const [team4, setTeam4] = useState("");
  const [stage, setStage] = useState<MatchStage>("LEAGUE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teams = useTournamentStore(state => state.teams);
  const tournament = useTournamentStore(state => state.tournament);

  const resetForm = () => {
    setMatchNumber("");
    setCourt("");
    setDate("");
    setTime("");
    setTeam1("");
    setTeam2("");
    setTeam3("");
    setTeam4("");
    setStage("LEAGUE");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate teams are unique
    const selectedTeams = [team1, team2, team3, team4];
    const uniqueTeams = new Set(selectedTeams);
    if (uniqueTeams.size !== 4) {
      setError("Please select 4 different teams");
      return;
    }

    if (!matchNumber || !court || !date || !time) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startTime = new Date(`${date}T${time}`);

      await createMatch({
        tournamentId: tournament.id,
        matchNumber: Number(matchNumber),
        court,
        startTime,
        teamIds: [team1, team2, team3, team4] as [string, string, string, string],
        stage,
        state: "CREATED",
        umpireId: null,
        umpireName: null,
        battingOrder: [],
        rankings: [],
      });

      onAdd();
      resetForm();
      setOpen(false);
    } catch (err) {
      console.error("Error creating match:", err);
      setError(err instanceof Error ? err.message : "Failed to create match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Match
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
                onChange={(e) => setMatchNumber(e.target.value)}
                placeholder="e.g. 1"
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
                      <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
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

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Match"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
