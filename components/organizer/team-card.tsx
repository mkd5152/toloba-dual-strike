"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Team } from "@/lib/types";

interface TeamCardProps {
  team: Team;
  onRemove?: (teamId: string) => void;
}

export function TeamCard({ team, onRemove }: TeamCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full shrink-0"
              style={{ backgroundColor: team.color }}
            />
            <div>
              <CardTitle className="text-lg">{team.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {team.players.length} players
              </p>
            </div>
          </div>
          {onRemove && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => onRemove(team.id)}
            >
              Remove
            </Badge>
          )}
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
