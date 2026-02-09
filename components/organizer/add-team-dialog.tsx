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
import type { Team, Player } from "@/lib/types";
import { TEAM_COLORS } from "@/lib/constants";

interface AddTeamDialogProps {
  onAdd: (team: Team) => void;
  trigger?: React.ReactNode;
}

export function AddTeamDialog({ onAdd, trigger }: AddTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(TEAM_COLORS[0]);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `team-${Date.now()}`;
    const players: Player[] = [
      {
        id: `${id}-p1`,
        name: player1 || "Player 1",
        teamId: id,
        isLateArrival: false,
      },
      {
        id: `${id}-p2`,
        name: player2 || "Player 2",
        teamId: id,
        isLateArrival: false,
      },
    ];
    onAdd({
      id,
      name: name || "New Team",
      color,
      players,
    });
    setName("");
    setColor(TEAM_COLORS[0]);
    setPlayer1("");
    setPlayer2("");
    setOpen(false);
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
            />
          </div>
          <div>
            <Label>Team color</Label>
            <Select value={color} onValueChange={setColor}>
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
            />
          </div>
          <div>
            <Label htmlFor="p2">Player 2</Label>
            <Input
              id="p2"
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              placeholder="Name"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Team</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
