"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExtrasRunSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectRuns: (runs: 0 | 1 | 2 | 3 | 4 | 6) => void;
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
  const handleSelect = (runs: 0 | 1 | 2 | 3 | 4 | 6) => {
    onSelectRuns(runs);
    onClose();
  };

  const displayName = extrasType === "noball" ? "No Ball" : "Wide";
  const totalColor = extrasType === "noball" ? "text-orange-600" : "text-blue-600";
  const bgGradient = extrasType === "noball"
    ? "from-orange-50 to-orange-100"
    : "from-blue-50 to-blue-100";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md p-0 gap-0 bg-gradient-to-br from-gray-50 to-white border-4 border-[#0d3944] rounded-2xl shadow-2xl">
        {/* Header Section */}
        <DialogHeader className={`bg-gradient-to-r ${bgGradient} border-b-4 border-[#0d3944]/20 p-4 sm:p-6 rounded-t-xl`}>
          <DialogTitle className="text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl sm:text-4xl font-black text-[#0d3944] tracking-tight">
                {displayName}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">
                Base: <span className="font-bold text-[#0d3944]">{baseRuns}</span> runs
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Body Section */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <p className="text-center text-sm sm:text-base text-gray-700 font-medium">
            How many runs were scored off this delivery?
          </p>

          {/* Run Selection Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {([0, 1, 2, 3, 4, 6] as const).map((runs) => {
              const total = baseRuns + runs;
              return (
                <Button
                  key={runs}
                  onClick={() => handleSelect(runs)}
                  size="lg"
                  className="h-20 sm:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2 bg-white border-3 border-[#0d3944]/30 hover:border-[#0d3944] hover:bg-gradient-to-br hover:from-[#ff9800]/10 hover:to-[#ff9800]/5 transition-all duration-200 active:scale-95 shadow-md hover:shadow-xl rounded-xl group"
                  variant="outline"
                >
                  <div className="text-3xl sm:text-4xl font-black text-[#0d3944] group-hover:text-[#ff9800] transition-colors">
                    {runs}
                  </div>
                  <div className={`text-xs sm:text-sm font-bold ${totalColor}`}>
                    Total: {total}
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-amber-900 font-medium text-center">
              💡 <strong>Total runs = {baseRuns}</strong> ({displayName}) + <strong>Runs scored</strong>
            </p>
          </div>

          {/* Cancel Button */}
          <Button
            onClick={onClose}
            variant="secondary"
            className="w-full h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
