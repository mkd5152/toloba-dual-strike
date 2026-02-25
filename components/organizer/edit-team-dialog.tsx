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
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { updateTeam } from "@/lib/api/teams";
import { updatePlayer } from "@/lib/api/players";
import { TEAM_COLORS } from "@/lib/constants";
import type { Team } from "@/lib/types";
import { Pencil } from "lucide-react";

interface EditTeamDialogProps {
  team: Team;
  trigger?: React.ReactNode;
}

export function EditTeamDialog({ team, trigger }: EditTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(team.name);
  const [color, setColor] = useState(team.color);
  const [player1, setPlayer1] = useState(team.players?.[0]?.name || "");
  const [player2, setPlayer2] = useState(team.players?.[1]?.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = useTournamentStore(state => state.loadTeams);

  // Reset form when team changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(team.name);
      setColor(team.color);
      setPlayer1(team.players?.[0]?.name || "");
      setPlayer2(team.players?.[1]?.name || "");
      setError(null);
    }
  }, [open, team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log("Starting team update...", { name, color, player1, player2 });

    try {
      // 1. Update team name and color if changed
      if (name !== team.name || color !== team.color) {
        console.log("Updating team name/color...");
        await updateTeam(team.id, {
          name,
          color,
        });
      }

      // 2. Update players if changed
      if (team.players && team.players.length >= 2) {
        if (player1 !== team.players[0].name) {
          console.log("Updating player 1:", team.players[0].id);
          await updatePlayer(team.players[0].id, { name: player1 });
        }
        if (player2 !== team.players[1].name) {
          console.log("Updating player 2:", team.players[1].id);
          await updatePlayer(team.players[1].id, { name: player2 });
        }
      }

      // 3. Reload teams to get updated data
      console.log("Reloading teams...");
      await loadTeams();

      console.log("Team update successful!");
      setOpen(false);
    } catch (err) {
      console.error("Error updating team:", err);
      setError(err instanceof Error ? err.message : "Failed to update team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Team
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="teamId">Team ID</Label>
            <Input
              id="teamId"
              value={team.id}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Team ID cannot be changed
            </p>
          </div>

          <div>
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MUSTABIZ"
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label>Team Color</Label>
            <Select value={color} onValueChange={setColor} disabled={loading}>
              <SelectTrigger>
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full inline-block"
                      style={{ backgroundColor: color }}
                    />
                    {color}
                  </span>
                </SelectValue>
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
              placeholder="Player 1 name"
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
              placeholder="Player 2 name"
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
