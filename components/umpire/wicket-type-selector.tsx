"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { WicketType } from "@/lib/types";

interface WicketTypeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectWicket: (wicketType: WicketType, fieldingTeamId?: string) => void;
  bowlingTeamId: string;
  bowlingTeamName: string;
  fieldingTeams: { id: string; name: string; color: string }[]; // The 2 non-batting, non-bowling teams
}

export function WicketTypeSelector({
  open,
  onClose,
  onSelectWicket,
  bowlingTeamId,
  bowlingTeamName,
  fieldingTeams,
}: WicketTypeSelectorProps) {
  const [stage, setStage] = useState<"wicketType" | "fieldingTeam">("wicketType");
  const [selectedWicketType, setSelectedWicketType] = useState<"CATCH_OUT" | "RUN_OUT" | null>(null);

  const handleWicketTypeSelect = (type: "BOWLING_TEAM" | "CATCH_OUT" | "RUN_OUT") => {
    if (type === "BOWLING_TEAM") {
      // Direct selection - bowling team gets credit
      onSelectWicket(type);
      handleClose();
    } else {
      // Need to select which fielding team
      setSelectedWicketType(type);
      setStage("fieldingTeam");
    }
  };

  const handleFieldingTeamSelect = (teamId: string) => {
    if (selectedWicketType) {
      onSelectWicket(selectedWicketType, teamId);
      handleClose();
    }
  };

  const handleClose = () => {
    setStage("wicketType");
    setSelectedWicketType(null);
    onClose();
  };

  const handleBack = () => {
    setStage("wicketType");
    setSelectedWicketType(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} modal={true}>
      <DialogContent className="w-[95vw] max-w-lg p-0 gap-0 bg-white border-4 border-red-600 rounded-3xl shadow-2xl">
        {stage === "wicketType" ? (
          <>
            {/* Wicket Type Selection */}
            <DialogHeader className="bg-gradient-to-br from-red-100 via-red-50 to-white border-b-4 border-red-400 p-4 sm:p-6 rounded-t-2xl">
              <DialogTitle className="text-center">
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black text-red-700 tracking-tight drop-shadow-sm">
                    🏏 WICKET!
                  </div>
                  <div className="text-xs sm:text-sm text-gray-700 font-medium">
                    Select wicket type to award credit
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="text-center mb-2">
                <p className="text-sm sm:text-base text-gray-700 font-bold">
                  Who gets the wicket credit?
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  (Winner receives +5 runs bonus)
                </p>
              </div>

              {/* Bowling Team Option */}
              <Button
                onClick={() => handleWicketTypeSelect("BOWLING_TEAM")}
                className="w-full h-auto py-4 sm:py-5 flex flex-col items-center gap-2 bg-gradient-to-br from-green-50 to-green-100 border-[3px] border-green-600 hover:border-green-700 hover:from-green-100 hover:to-green-200 transition-all duration-200 active:scale-[0.97] shadow-lg hover:shadow-xl rounded-2xl group"
                variant="outline"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">⚾</span>
                  <div className="text-left">
                    <div className="text-base sm:text-lg font-black text-green-800 group-hover:text-green-900">
                      Bowling Team Wicket
                    </div>
                    <div className="text-xs sm:text-sm text-green-700 font-medium">
                      Bowler or Wicket Keeper
                    </div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-bold text-green-900 bg-green-200/80 px-3 py-1 rounded-full">
                  Credit: {bowlingTeamName} (+5 runs)
                </div>
              </Button>

              {/* Catch Out Option */}
              <Button
                onClick={() => handleWicketTypeSelect("CATCH_OUT")}
                className="w-full h-auto py-4 sm:py-5 flex flex-col items-center gap-2 bg-gradient-to-br from-orange-50 to-orange-100 border-[3px] border-orange-600 hover:border-orange-700 hover:from-orange-100 hover:to-orange-200 transition-all duration-200 active:scale-[0.97] shadow-lg hover:shadow-xl rounded-2xl group"
                variant="outline"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">🧤</span>
                  <div className="text-left">
                    <div className="text-base sm:text-lg font-black text-orange-800 group-hover:text-orange-900">
                      Catch Out
                    </div>
                    <div className="text-xs sm:text-sm text-orange-700 font-medium">
                      Fielding team caught the ball
                    </div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-bold text-orange-900 bg-orange-200/80 px-3 py-1 rounded-full">
                  Select fielding team →
                </div>
              </Button>

              {/* Run Out Option */}
              <Button
                onClick={() => handleWicketTypeSelect("RUN_OUT")}
                className="w-full h-auto py-4 sm:py-5 flex flex-col items-center gap-2 bg-gradient-to-br from-blue-50 to-blue-100 border-[3px] border-blue-600 hover:border-blue-700 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 active:scale-[0.97] shadow-lg hover:shadow-xl rounded-2xl group"
                variant="outline"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">🏃</span>
                  <div className="text-left">
                    <div className="text-base sm:text-lg font-black text-blue-800 group-hover:text-blue-900">
                      Run Out
                    </div>
                    <div className="text-xs sm:text-sm text-blue-700 font-medium">
                      Fielding team ran out batsman
                    </div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-bold text-blue-900 bg-blue-200/80 px-3 py-1 rounded-full">
                  Select fielding team →
                </div>
              </Button>

              <Button
                onClick={handleClose}
                variant="secondary"
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-bold rounded-xl hover:bg-gray-200 transition-colors mt-2"
              >
                ✕ Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Fielding Team Selection */}
            <DialogHeader className={`${selectedWicketType === "CATCH_OUT" ? "bg-gradient-to-br from-orange-100 via-orange-50 to-white border-b-4 border-orange-400" : "bg-gradient-to-br from-blue-100 via-blue-50 to-white border-b-4 border-blue-400"} p-4 sm:p-6 rounded-t-2xl`}>
              <DialogTitle className="text-center">
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className={`text-3xl sm:text-4xl font-black ${selectedWicketType === "CATCH_OUT" ? "text-orange-700" : "text-blue-700"} tracking-tight drop-shadow-sm`}>
                    {selectedWicketType === "CATCH_OUT" ? "🧤 Catch Out" : "🏃 Run Out"}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-700 font-medium">
                    Which fielding team gets the credit?
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="text-center mb-2">
                <p className="text-sm sm:text-base text-gray-700 font-bold">
                  Select the fielding team
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  (They will receive +5 runs bonus)
                </p>
              </div>

              {fieldingTeams.map((team) => (
                <Button
                  key={team.id}
                  onClick={() => handleFieldingTeamSelect(team.id)}
                  className={`w-full h-auto py-4 sm:py-5 flex items-center justify-between gap-3 bg-white border-[3px] ${selectedWicketType === "CATCH_OUT" ? "border-orange-400 hover:border-orange-600 hover:bg-orange-50" : "border-blue-400 hover:border-blue-600 hover:bg-blue-50"} transition-all duration-200 active:scale-[0.97] shadow-md hover:shadow-xl rounded-2xl group`}
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 border-2 border-gray-300 group-hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: team.color }}
                    />
                    <div className="text-left">
                      <div className="text-lg sm:text-xl font-black text-[#0d3944]">
                        {team.name}
                      </div>
                      <div className={`text-xs sm:text-sm font-bold ${selectedWicketType === "CATCH_OUT" ? "text-orange-700" : "text-blue-700"}`}>
                        +5 runs bonus
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl">→</div>
                </Button>
              ))}

              <Button
                onClick={handleBack}
                variant="outline"
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-bold rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-colors mt-2"
              >
                ← Back
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
