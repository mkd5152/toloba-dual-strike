"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExtrasRunSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectRuns: (runs: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void;
  extrasType: "noball" | "wide";
  baseRuns: number;
}

export function ExtrasRunSelector({
  open,
  onClose,
  onSelectRuns,
  extrasType,
  baseRuns,
}: ExtrasRunSelectorProps) {
  const handleSelect = (runs: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
    onSelectRuns(runs);
    onClose();
  };

  const displayName = extrasType === "noball" ? "No Ball" : "Wide";
  const totalColor = extrasType === "noball" ? "text-orange-700" : "text-blue-700";
  const bgGradient = extrasType === "noball"
    ? "from-orange-100 via-orange-50 to-white"
    : "from-blue-100 via-blue-50 to-white";
  const accentColor = extrasType === "noball" ? "border-orange-400" : "border-blue-400";
  const buttonHover = extrasType === "noball"
    ? "hover:border-orange-500 hover:bg-gradient-to-br hover:from-orange-100/50 hover:to-orange-50"
    : "hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-100/50 hover:to-blue-50";

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent className="w-[95vw] max-w-lg p-0 gap-0 bg-white border-4 border-[#0d3944] rounded-3xl shadow-2xl">
        {/* Header Section */}
        <DialogHeader className={`bg-gradient-to-br ${bgGradient} border-b-4 ${accentColor} p-4 sm:p-6 rounded-t-2xl`}>
          <DialogTitle className="text-center">
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0d3944] tracking-tight drop-shadow-sm">
                {displayName}
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white/80 rounded-full border-2 border-[#0d3944]/20">
                <span className="text-xs sm:text-sm text-gray-600 font-medium">Base Penalty:</span>
                <span className="text-base sm:text-lg font-black text-[#0d3944]">+{baseRuns}</span>
                <span className="text-xs sm:text-sm text-gray-600 font-medium">runs</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Body Section */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="text-center space-y-1">
            <p className="text-base sm:text-lg text-[#0d3944] font-bold">
              Select runs scored by batsman
            </p>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              (Will be added to base penalty)
            </p>
          </div>

          {/* Run Selection Grid - 3 columns on mobile, looks clean */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
            {([0, 1, 2, 3, 4, 5, 6] as const).map((runs) => {
              const total = baseRuns + runs;
              // Special styling for boundaries
              const isBoundary = runs === 4 || runs === 6;
              const borderStyle = isBoundary
                ? "border-[#ff9800] shadow-lg"
                : "border-[#0d3944]/30";

              return (
                <Button
                  key={runs}
                  onClick={() => handleSelect(runs)}
                  size="lg"
                  className={`h-20 sm:h-24 md:h-28 flex flex-col items-center justify-center gap-1 sm:gap-2 bg-white border-[3px] ${borderStyle} ${buttonHover} transition-all duration-200 active:scale-[0.92] shadow-md hover:shadow-2xl rounded-2xl group relative overflow-hidden`}
                  variant="outline"
                >
                  {/* Cricket ball icon for boundaries */}
                  {isBoundary && (
                    <div className="absolute top-1 right-1 text-xs opacity-50">
                      {runs === 6 ? "🏏" : "📍"}
                    </div>
                  )}
                  <div className={`text-3xl sm:text-4xl md:text-5xl font-black ${isBoundary ? 'text-[#ff9800]' : 'text-[#0d3944]'} group-hover:scale-110 transition-transform`}>
                    {runs}
                  </div>
                  <div className={`text-xs sm:text-sm font-bold ${totalColor} bg-gray-50/80 px-2 py-0.5 rounded-full`}>
                    = {total}
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Info Box */}
          <div className={`bg-gradient-to-r ${bgGradient} border-2 ${accentColor} rounded-xl p-3 sm:p-4 shadow-sm`}>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-lg sm:text-xl">⚡</span>
              <p className="text-xs sm:text-sm text-[#0d3944] font-bold text-center">
                Total runs = <span className={totalColor}>{baseRuns}</span> ({displayName}) + Batsman runs
              </p>
            </div>
          </div>

          {/* Cancel Button */}
          <Button
            onClick={onClose}
            variant="secondary"
            className="w-full h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            ✕ Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
