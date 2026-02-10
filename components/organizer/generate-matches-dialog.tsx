"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { generateMatches } from "@/lib/utils/tournament-matches";
import { bulkCreateMatches } from "@/lib/api/matches";
import { AlertCircle, Calendar, Zap } from "lucide-react";

interface GenerateMatchesDialogProps {
  trigger?: React.ReactNode;
}

export function GenerateMatchesDialog({ trigger }: GenerateMatchesDialogProps) {
  const [open, setOpen] = useState(false);
  const [matchCount, setMatchCount] = useState("25");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { tournament, teams, loadMatches } = useTournamentStore();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      if (teams.length < 4) {
        throw new Error("You need at least 4 teams to generate matches");
      }

      const count = parseInt(matchCount);
      if (isNaN(count) || count < 1 || count > 100) {
        throw new Error("Match count must be between 1 and 100");
      }

      // Generate matches using the algorithm
      const matches = generateMatches(teams, tournament, count);

      // Save to database
      await bulkCreateMatches(matches);

      // Reload matches from database
      await loadMatches();

      setOpen(false);
      setMatchCount("25");
    } catch (err) {
      console.error("Error generating matches:", err);
      setError(err instanceof Error ? err.message : "Failed to generate matches");
    } finally {
      setLoading(false);
    }
  };

  const estimatedMatchesPerTeam = teams.length > 0
    ? Math.floor((parseInt(matchCount) || 25) * 4 / teams.length)
    : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold hover:opacity-90">
            <Calendar className="w-4 h-4 mr-2" />
            Generate Matches
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#ff9800]" />
            Generate Tournament Matches
          </DialogTitle>
          <DialogDescription>
            Automatically create matches for all teams in the tournament
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Team Count Info */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>{teams.length} teams</strong> registered
              <br />
              Each match requires 4 teams
            </AlertDescription>
          </Alert>

          {/* Match Count Input */}
          <div>
            <Label htmlFor="matchCount">Number of matches to generate</Label>
            <Input
              id="matchCount"
              type="number"
              min="1"
              max="100"
              value={matchCount}
              onChange={(e) => setMatchCount(e.target.value)}
              disabled={loading}
              className="mt-2"
            />
            <p className="text-sm text-gray-600 mt-2">
              Estimated: ~{estimatedMatchesPerTeam} matches per team
            </p>
          </div>

          {/* Preview Info */}
          <div className="p-4 bg-gradient-to-r from-[#0d3944]/5 to-[#ff9800]/5 rounded-lg border border-[#0d3944]/10">
            <h4 className="font-bold text-[#0d3944] mb-2">What will happen:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Teams will be distributed evenly across matches</li>
              <li>• Each match will have 4 teams competing</li>
              <li>• Matches will be scheduled from {new Date(tournament.startDate).toLocaleDateString()}</li>
              <li>• Courts will be assigned automatically</li>
            </ul>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading || teams.length < 4}
            className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold hover:opacity-90"
          >
            {loading ? "Generating..." : "Generate Matches"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
