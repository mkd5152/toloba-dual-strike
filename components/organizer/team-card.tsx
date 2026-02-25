"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { EditTeamDialog } from "@/components/organizer/edit-team-dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { Team } from "@/lib/types";

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Card className="group relative overflow-visible hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-full shrink-0"
              style={{ backgroundColor: team.color }}
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{team.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                ID: {team.id} • {team.players.length} players
              </p>
            </div>
          </div>
          <EditTeamDialog
            team={team}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="text-sm text-muted-foreground space-y-1">
          {team.players.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
