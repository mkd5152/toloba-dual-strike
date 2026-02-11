"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface BowlingTeamSelectorProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (bowlingTeamIds: [string, string, string]) => void;
  availableTeams: { id: string; name: string; color: string }[]; // 3 non-batting teams
  battingTeamName: string;
}

export function BowlingTeamSelector({
  open,
  onClose,
  onConfirm,
  availableTeams,
  battingTeamName,
}: BowlingTeamSelectorProps) {
  const [selectedTeams, setSelectedTeams] = useState<(string | null)[]>([null, null, null]);
  const [currentOver, setCurrentOver] = useState(0);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedTeams([null, null, null]);
      setCurrentOver(0);
    }
  }, [open]);

  const handleTeamSelect = (teamId: string) => {
    const newSelections = [...selectedTeams];
    newSelections[currentOver] = teamId;
    setSelectedTeams(newSelections);

    // Auto-advance to next over
    if (currentOver < 2) {
      setCurrentOver(currentOver + 1);
    }
  };

  const handleBack = () => {
    if (currentOver > 0) {
      // Clear the current selection before going back
      const newSelections = [...selectedTeams];
      newSelections[currentOver] = null;
      setSelectedTeams(newSelections);

      // Move back to previous over
      setCurrentOver(currentOver - 1);
    }
  };

  const handleConfirm = () => {
    if (selectedTeams.every((t) => t !== null)) {
      onConfirm(selectedTeams as [string, string, string]);
      // Reset state after confirmation
      setSelectedTeams([null, null, null]);
      setCurrentOver(0);
      onClose();
    }
  };

  const handleClose = () => {
    // Don't allow closing if dialog must be completed
    // User must either complete selection or explicitly cancel
    return;
  };

  const handleCancel = () => {
    // Reset state
    setSelectedTeams([null, null, null]);
    setCurrentOver(0);
    onClose();
  };

  const isTeamAlreadySelected = (teamId: string) => {
    return selectedTeams.slice(0, currentOver).includes(teamId);
  };

  const allSelected = selectedTeams.every((t) => t !== null);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()} modal={true}>
      <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
      <DialogContent className="w-[95vw] max-w-xl p-0 gap-0 bg-white border-4 border-green-600 rounded-3xl shadow-2xl">
        <DialogHeader className="bg-gradient-to-br from-green-100 via-green-50 to-white border-b-4 border-green-400 p-4 sm:p-6 rounded-t-2xl">
          <DialogTitle className="text-center">
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-green-700 tracking-tight drop-shadow-sm">
                ⚾ Bowling Order
              </div>
              <div className="text-xs sm:text-sm text-gray-700 font-medium">
                Select teams to bowl against {battingTeamName}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Progress Indicator */}
          <div className="flex justify-center gap-3 sm:gap-4 pb-2">
            {[0, 1, 2].map((over) => (
              <div
                key={over}
                className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 font-bold text-sm sm:text-base transition-all duration-300 ${
                  selectedTeams[over]
                    ? "bg-green-500 border-green-600 text-white scale-110"
                    : over === currentOver
                    ? "bg-white border-green-500 text-green-700 scale-110 ring-4 ring-green-200"
                    : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                {selectedTeams[over] ? <Check className="w-5 h-5" /> : `${over}`}
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-base sm:text-lg font-black text-gray-800">
              Select team for Over {currentOver}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Choose which team will bowl this over
            </p>
          </div>

          {/* Team Selection */}
          <div className="space-y-3">
            {availableTeams.map((team) => {
              const alreadySelected = isTeamAlreadySelected(team.id);
              const isCurrentSelection = selectedTeams[currentOver] === team.id;

              return (
                <Button
                  key={team.id}
                  onClick={() => !alreadySelected && handleTeamSelect(team.id)}
                  disabled={alreadySelected}
                  className={`w-full h-auto py-4 sm:py-5 flex items-center justify-between gap-3 transition-all duration-200 rounded-2xl shadow-lg ${
                    isCurrentSelection
                      ? "bg-gradient-to-r from-green-500 to-green-600 border-[3px] border-green-700 text-white scale-[1.02] shadow-xl"
                      : alreadySelected
                      ? "bg-gray-100 border-[3px] border-gray-300 opacity-50 cursor-not-allowed"
                      : "bg-white border-[3px] border-green-400 hover:border-green-600 hover:bg-green-50 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                  }`}
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 border-2 transition-all ${
                        isCurrentSelection
                          ? "border-white"
                          : alreadySelected
                          ? "border-gray-400"
                          : "border-gray-300 group-hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: team.color }}
                    />
                    <div className="text-left">
                      <div
                        className={`text-lg sm:text-xl font-black ${
                          isCurrentSelection ? "text-white" : "text-[#0d3944]"
                        }`}
                      >
                        {team.name}
                      </div>
                      {alreadySelected && (
                        <div className="text-xs sm:text-sm font-bold text-gray-500">
                          Already selected ✓
                        </div>
                      )}
                      {!alreadySelected && !isCurrentSelection && (
                        <div className="text-xs sm:text-sm font-bold text-green-700">
                          Tap to select →
                        </div>
                      )}
                    </div>
                  </div>
                  {isCurrentSelection && (
                    <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full">
                      <Check className="w-5 h-5 text-green-600 font-black" />
                    </div>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 pt-2">
            {currentOver > 0 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-colors"
              >
                ← Back
              </Button>
            )}
            {allSelected && (
              <Button
                onClick={handleConfirm}
                className="flex-1 h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all shadow-lg hover:shadow-xl"
              >
                Confirm Bowling Order ✓
              </Button>
            )}
          </div>

          <Button
            onClick={handleCancel}
            variant="secondary"
            className="w-full h-11 sm:h-12 text-sm sm:text-base font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            ✕ Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
