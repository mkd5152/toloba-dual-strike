"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScoringPanel } from "@/components/umpire/scoring-panel";
import { InningsHeader } from "@/components/umpire/innings-header";
import { BallLog } from "@/components/umpire/ball-log";
import { BattingOrderSelector } from "@/components/umpire/batting-order-selector";
import { useMatchStore } from "@/lib/stores/match-store";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import type { Team } from "@/lib/types";
import { fetchPlayersByTeams } from "@/lib/api/players";
import { initializeMatchInnings, fetchMatchInnings } from "@/lib/api/innings";
import { updateMatch } from "@/lib/api/matches";

export default function ScoringPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

  const { setCurrentMatch, currentMatch, currentInningsIndex } = useMatchStore();
  const { matches, teams, loadMatches, loadTeams, getTeam } = useTournamentStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBattingOrderSelector, setShowBattingOrderSelector] = useState(false);
  const [matchTeams, setMatchTeams] = useState<Team[]>([]);
  const [initializingMatch, setInitializingMatch] = useState(false);

  // Prevent multiple initializations
  const isInitializingRef = useRef(false);
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    // Only load once per mount
    if (!hasLoadedOnceRef.current) {
      hasLoadedOnceRef.current = true;
      loadMatchData();
    }
  }, [matchId]);

  // Bowling order is now automatic - no manual selection needed

  const loadMatchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all matches and teams if not already loaded
      if (matches.length === 0) {
        await loadMatches();
      }
      if (teams.length === 0) {
        await loadTeams();
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


      // Get teams for this match
      const allTeams = useTournamentStore.getState().teams;
      const teamsInMatch = allTeams.filter(t => match.teamIds.includes(t.id));
      setMatchTeams(teamsInMatch);

      // CRITICAL: Check if innings exist in database FIRST
      // This is the source of truth - if innings exist, use them
      const innings = await fetchMatchInnings(matchId);

      if (innings && innings.length > 0) {
        // Innings exist - match is already initialized
        const matchWithInnings = {
          ...match,
          innings,
        };
        setCurrentMatch(matchWithInnings);
        setLoading(false);
        return;
      }

      // No innings found - need to initialize
      // Show batting order selector ONLY if not already shown
      setShowBattingOrderSelector(true);
      setCurrentMatch(match);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading match:', err);
      setError(err.message || 'Failed to load match');
      setLoading(false);
    }
  };

  const handleBattingOrderConfirm = async (battingOrder: string[]) => {
    // Prevent double-initialization from React Strict Mode using ref
    if (isInitializingRef.current) {
      return;
    }

    try {
      isInitializingRef.current = true;
      setInitializingMatch(true);
      setError(null);

      if (!currentMatch) {
        throw new Error("No match loaded");
      }

      // 1. Update match with batting order
      await updateMatch(matchId, {
        battingOrder,
        state: "IN_PROGRESS",
      });

      // 2. Fetch players for all teams (already grouped by team)
      const playersByTeamFull = await fetchPlayersByTeams(battingOrder);

      // Transform to simpler format needed by initializeMatchInnings
      const playersByTeam: Record<string, { id: string; name: string }[]> = {};
      for (const teamId of Object.keys(playersByTeamFull)) {
        playersByTeam[teamId] = playersByTeamFull[teamId].map(player => ({
          id: player.id,
          name: player.name,
        }));
      }

      // 3. Initialize innings with proper bowling rotation

      await initializeMatchInnings(
        matchId,
        battingOrder as [string, string, string, string],
        playersByTeam
      );


      // 4. Close batting order selector
      setShowBattingOrderSelector(false);
      setInitializingMatch(false);

      // Wait a moment for database to propagate
      await new Promise(resolve => setTimeout(resolve, 500));

      // Reset refs for next time
      hasLoadedOnceRef.current = false;
      isInitializingRef.current = false;

      // Reload match data (will fetch innings from database)
      await loadMatchData();
    } catch (err: any) {
      console.error('Error initializing match:', err);
      setError(err.message || 'Failed to initialize match');
      setInitializingMatch(false);
      isInitializingRef.current = false;
    }
  };


  const handleResetMatch = async () => {
    if (!confirm('Are you sure you want to reset this match? This will clear all innings and scores.')) {
      return;
    }

    try {
      setLoading(true);

      // Update match to reset state
      await updateMatch(matchId, {
        battingOrder: [],
        state: 'CREATED',
      });

      // Reset refs so batting order selector can be shown again
      hasLoadedOnceRef.current = false;
      isInitializingRef.current = false;

      // Reload to show batting order selector
      await loadMatchData();
    } catch (err: any) {
      console.error('Error resetting match:', err);
      setError(err.message || 'Failed to reset match');
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

  if (initializingMatch) {
    return (
      <div className="min-h-screen tournament-bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#ff9800] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-bold text-lg">Initializing match...</p>
          <p className="text-white text-sm mt-2">Setting up innings and bowling rotation</p>
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

  // Get current innings
  const currentInnings = currentMatch?.innings?.[currentInningsIndex];

  return (
    <div className="min-h-screen tournament-bg-pattern">
      <BattingOrderSelector
        teams={matchTeams}
        open={showBattingOrderSelector}
        onConfirm={handleBattingOrderConfirm}
        onCancel={() => router.back()}
      />

      <div className="p-3 sm:p-4 md:p-8 max-w-7xl mx-auto">
        <Card className="p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 border-2 border-[#0d3944]/20 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0d3944] whitespace-nowrap">
                  Match {currentMatch.matchNumber}
                </h1>
                <Badge className={`${stageBadgeColor} text-white font-bold text-xs sm:text-sm`}>
                  {currentMatch.stage}
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-gray-600 font-medium truncate">{currentMatch.court}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {currentMatch.state === "IN_PROGRESS" && (
                <Badge className="text-sm sm:text-base md:text-lg px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white font-bold animate-pulse whitespace-nowrap">
                  🔴 LIVE
                </Badge>
              )}
              <Badge variant="outline" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 font-bold whitespace-nowrap">
                {currentMatch.state}
              </Badge>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleResetMatch}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none border-2 border-red-500 text-red-600 hover:bg-red-50 h-9 text-xs sm:text-sm touch-manipulation"
                >
                  Reset
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none border-2 border-[#ff9800] h-9 text-xs sm:text-sm touch-manipulation"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Back
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {!showBattingOrderSelector && (
          <>
            <div className="mb-4 sm:mb-6">
              <InningsHeader />
            </div>

            {/* Show scoring panel if match is not completed */}
            {currentMatch.state !== "COMPLETED" && currentInnings && (
              <>
                <ScoringPanel />
                <div className="mt-4 sm:mt-6">
                  <BallLog />
                </div>
              </>
            )}

            {/* Show match results when completed */}
            {currentMatch.state === "COMPLETED" && currentMatch.rankings && (
              <Card className="p-4 sm:p-6 md:p-8 border-2 border-green-600 bg-gradient-to-br from-green-50 to-white">
                <div className="text-center mb-6">
                  <h2 className="text-3xl sm:text-4xl font-black text-green-700 mb-2">
                    🏆 MATCH COMPLETE!
                  </h2>
                  <p className="text-green-600 font-medium">All 4 innings have been completed</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-[#0d3944] mb-4">Final Rankings:</h3>
                  {currentMatch.rankings
                    .sort((a, b) => a.rank - b.rank)
                    .map((ranking) => {
                      const team = useTournamentStore.getState().getTeam(ranking.teamId);
                      const medals = ['🥇', '🥈', '🥉', ''];
                      const bgColors = [
                        'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-400',
                        'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-400',
                        'bg-gradient-to-r from-orange-100 to-orange-50 border-orange-400',
                        'bg-gray-50 border-gray-300'
                      ];

                      return (
                        <Card
                          key={ranking.teamId}
                          className={`p-4 border-2 ${bgColors[ranking.rank - 1]}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-3xl">{medals[ranking.rank - 1]}</span>
                              <div
                                className="w-8 h-8 rounded-full flex-shrink-0"
                                style={{ backgroundColor: team?.color ?? "#ccc" }}
                              />
                              <div className="flex-1">
                                <p className="font-bold text-lg text-[#0d3944]">
                                  {team?.name ?? "Unknown Team"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Rank #{ranking.rank}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-[#0d3944]">
                                {ranking.totalScore || ranking.totalRuns}
                              </p>
                              <p className="text-sm text-gray-600">runs</p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-[#ff9800] text-white font-bold text-lg px-4 py-2">
                                {ranking.points % 1 === 0 ? ranking.points : ranking.points.toFixed(1)} pts
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>

                <div className="mt-6 flex gap-3 justify-center">
                  <Button
                    onClick={() => router.push('/spectator/standings')}
                    className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold"
                  >
                    View Tournament Standings
                  </Button>
                  <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="border-2 border-[#0d3944]"
                  >
                    Back to Matches
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
