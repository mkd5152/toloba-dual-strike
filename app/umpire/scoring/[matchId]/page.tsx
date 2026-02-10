"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScoringPanel } from "@/components/umpire/scoring-panel";
import { InningsHeader } from "@/components/umpire/innings-header";
import { BallLog } from "@/components/umpire/ball-log";
import { useMatchStore } from "@/lib/stores/match-store";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function ScoringPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

  const { setCurrentMatch, currentMatch } = useMatchStore();
  const { matches, loadMatches } = useTournamentStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMatchData();
  }, [matchId]);

  const loadMatchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all matches if not already loaded
      if (matches.length === 0) {
        await loadMatches();
      }

      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get the specific match
      const match = useTournamentStore.getState().getMatch(matchId);

      if (!match) {
        setError(`Match not found: ${matchId}`);
        setLoading(false);
        return;
      }

      console.log('Loading match for scoring:', match);
      setCurrentMatch(match);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading match:', err);
      setError(err.message || 'Failed to load match');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen tournament-bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#ff9800] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-bold text-lg">Loading match...</p>
        </div>
      </div>
    );
  }

  if (error || !currentMatch) {
    return (
      <div className="min-h-screen tournament-bg-pattern p-4 md:p-8">
        <div className="max-w-2xl mx-auto mt-12">
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Error:</strong> {error || 'Match not found'}
            </AlertDescription>
          </Alert>
          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-2 border-[#ff9800]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={loadMatchData}
              className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stageBadgeColor =
    currentMatch.stage === "LEAGUE" ? "bg-blue-600" :
    currentMatch.stage === "SEMI" ? "bg-purple-600" :
    "bg-yellow-600";

  return (
    <div className="min-h-screen tournament-bg-pattern">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <Card className="p-6 mb-6 border-2 border-[#0d3944]/20 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-[#0d3944]">
                  Match {currentMatch.matchNumber}
                </h1>
                <Badge className={`${stageBadgeColor} text-white font-bold`}>
                  {currentMatch.stage}
                </Badge>
              </div>
              <p className="text-gray-600 font-medium">{currentMatch.court}</p>
            </div>
            <div className="flex items-center gap-2">
              {currentMatch.state === "IN_PROGRESS" && (
                <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white font-bold animate-pulse">
                  🔴 LIVE
                </Badge>
              )}
              <Badge variant="outline" className="text-sm px-3 py-1.5 font-bold">
                {currentMatch.state}
              </Badge>
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="sm"
                className="border-2 border-[#ff9800]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </Card>

        <div className="mb-6">
          <InningsHeader />
        </div>

        <ScoringPanel />

        <div className="mt-6">
          <BallLog />
        </div>
      </div>
    </div>
  );
}
