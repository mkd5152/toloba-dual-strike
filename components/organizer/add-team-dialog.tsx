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
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { createPlayers } from "@/lib/api/players";
import { TEAM_COLORS } from "@/lib/constants";
import type { Player } from "@/lib/types";

interface AddTeamDialogProps {
  trigger?: React.ReactNode;
}

export function AddTeamDialog({ trigger }: AddTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(TEAM_COLORS[0]);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTeam = useTournamentStore(state => state.addTeam);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create team in database
      const team = await addTeam({
        name: name || "New Team",
        color,
        players: [], // Will be added separately
      });

      // Create players for the team
      const playersToCreate: Omit<Player, "id" | "createdAt" | "updatedAt">[] = [
        {
          teamId: team.id,
          name: player1 || "Player 1",
          role: "none",
          isLateArrival: false,
        },
        {
          teamId: team.id,
          name: player2 || "Player 2",
          role: "none",
          isLateArrival: false,
        },
      ];

      await createPlayers(playersToCreate);

      // Reload teams to get the updated data with players
      await useTournamentStore.getState().loadTeams();

      // Reset form
      setName("");
      setColor(TEAM_COLORS[0]);
      setPlayer1("");
      setPlayer2("");
      setOpen(false);
    } catch (err) {
      console.error("Error adding team:", err);
      setError(err instanceof Error ? err.message : "Failed to add team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>Add Team</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Team name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chennai Kings"
              disabled={loading}
              required
            />
          </div>
          <div>
            <Label>Team color</Label>
            <Select value={color} onValueChange={setColor} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM_COLORS.map((c) => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full inline-block"
                        style={{ backgroundColor: c }}
                      />
                      {c}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="p1">Player 1</Label>
            <Input
              id="p1"
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              placeholder="Name"
              disabled={loading}
              required
            />
          </div>
          <div>
            <Label htmlFor="p2">Player 2</Label>
            <Input
              id="p2"
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              placeholder="Name"
              disabled={loading}
              required
            />
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
              {loading ? "Adding..." : "Add Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
