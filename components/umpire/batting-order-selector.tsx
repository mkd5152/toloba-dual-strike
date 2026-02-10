"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Check } from "lucide-react";
import type { Team } from "@/lib/types";

interface BattingOrderSelectorProps {
  teams: Team[];
  open: boolean;
  onConfirm: (battingOrder: string[]) => void;
  onCancel: () => void;
}

export function BattingOrderSelector({
  teams,
  open,
  onConfirm,
  onCancel,
}: BattingOrderSelectorProps) {
  const [battingOrder, setBattingOrder] = useState<string[]>(teams.map((t) => t.id));

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...battingOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setBattingOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === battingOrder.length - 1) return;
    const newOrder = [...battingOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setBattingOrder(newOrder);
  };

  const getTeamById = (teamId: string) => teams.find((t) => t.id === teamId);

  const positionLabels = ["1st to Bat", "2nd to Bat", "3rd to Bat", "4th to Bat"];
  const positionColors = [
    "bg-green-600",
    "bg-blue-600",
    "bg-purple-600",
    "bg-orange-600",
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-black text-[#0d3944]">
            🏏 Set Batting Order
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Arrange the teams in batting order (like a toss). The first team will bat in Innings
            1, second team in Innings 2, and so on.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 my-4 sm:my-6">
          {battingOrder.map((teamId, index) => {
            const team = getTeamById(teamId);
            if (!team) return null;

            return (
              <Card
                key={teamId}
                className="p-3 sm:p-4 border-2 hover:border-[#ff9800] transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <Badge className={`${positionColors[index]} text-white font-bold px-2 py-1 text-xs sm:text-sm whitespace-nowrap`}>
                      {index + 1}
                      <span className="hidden sm:inline">
                        {index === 0 ? "st" : index === 1 ? "nd" : index === 2 ? "rd" : "th"} to Bat
                      </span>
                    </Badge>
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-base sm:text-lg text-[#0d3944] truncate">{team.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Innings {index + 1} (Overs {index * 3 + 1}-{index * 3 + 3})
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 self-end sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="border-2 border-[#0d3944] h-10 w-10 sm:h-9 sm:w-auto touch-manipulation"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveDown(index)}
                      disabled={index === battingOrder.length - 1}
                      className="border-2 border-[#0d3944] h-10 w-10 sm:h-9 sm:w-auto touch-manipulation"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-blue-900 font-medium">
            📋 <strong>Note:</strong> Each team bats for 3 overs. During each team's innings, the
            OTHER 3 teams will each bowl 1 over.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-2 border-gray-300 h-11 sm:h-10 touch-manipulation"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(battingOrder)}
            className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold hover:opacity-90 h-11 sm:h-10 touch-manipulation"
          >
            <Check className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Confirm & Start Match</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
