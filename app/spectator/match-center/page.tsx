"use client";

import { useEffect, useState, useRef } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { LiveMatchCard } from "@/components/spectator/live-match-card";
import { PlayoffMatchCard } from "@/components/spectator/playoff-match-card";
import { PlayoffBracket } from "@/components/spectator/playoff-bracket";
import { VictoryCelebration } from "@/components/spectator/victory-celebration";
import { ScheduleTimeline } from "@/components/spectator/schedule-timeline";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Flame, TrendingUp, Activity, Radio, Calendar, Volume2, VolumeX, Trophy, Crown, Swords } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { fetchMatchesWithDetails } from "@/lib/api/matches";
import { useMatchSounds } from "@/hooks/use-match-sounds";
import type { Match } from "@/lib/types";

export const dynamic = 'force-dynamic';

interface LiveEvent {
  id: string;
  matchNumber: number;
  teamName: string;
  event: string;
  icon: string;
  time: Date;
  runs: number;
}

export default function SpectatorLivePage() {
  const { loadTeams, tournament, teams } = useTournamentStore();
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [detailedMatches, setDetailedMatches] = useState<Match[]>([]);
  const detailedMatchesRef = useRef<Match[]>([]);
  const soundEnabledRef = useRef(false);
  const [showVictory, setShowVictory] = useState(false);
  const [championTeamId, setChampionTeamId] = useState<string | null>(null);

  // Initialize sound effects
  const { soundEnabled, setSoundEnabled, playFour, playSix, playWicket, playVictory } = useMatchSounds({
    enabled: false, // Default disabled, user can toggle
  });

  // Keep refs in sync with state
  useEffect(() => {
    detailedMatchesRef.current = detailedMatches;
  }, [detailedMatches]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Check if tournament is complete (Grand Finale completed)
  useEffect(() => {
    const finalMatch = detailedMatches.find(m => m.stage === "FINAL");
    if (finalMatch && (finalMatch.state === "COMPLETED" || finalMatch.state === "LOCKED") && finalMatch.rankings) {
      const champion = finalMatch.rankings.find(r => r.rank === 1);
      if (champion && !showVictory) {
        setChampionTeamId(champion.teamId);
        setShowVictory(true);
        if (soundEnabled) {
          setTimeout(() => playVictory(), 500);
        }
      }
    }
  }, [detailedMatches, showVictory, soundEnabled, playVictory]);

  // Fetch data every time component mounts
  useEffect(() => {
    const loadData = async () => {
      await loadTeams();
      // Load detailed matches with overs and balls for Match Center
      const matches = await fetchMatchesWithDetails(tournament.id);
      setDetailedMatches(matches);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to real-time ball and innings events
  useEffect(() => {
    if (!tournament.id) {
      console.log('⚠️ Tournament ID not available yet, skipping subscription setup');
      return;
    }

    console.log('🔴 Setting up live-balls-feed subscription for tournament:', tournament.id);

    const channel = supabase
      .channel('live-balls-feed', {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'balls',
        },
        async (payload) => {
          try {
            console.log('🏏 Live ball recorded:', payload);
            const newBall = payload.new as any;

            // Play sounds for significant events (use ref to get current value)
            if (soundEnabledRef.current) {
              console.log('   🔊 Playing sound for ball...');
              if (newBall.is_wicket) {
                console.log('   🎯 Playing wicket sound');
                playWicket();
              } else if (newBall.runs === 6 && !newBall.is_wide && !newBall.is_noball) {
                console.log('   🚀 Playing six sound');
                playSix();
              } else if (newBall.runs === 4 && !newBall.is_wide && !newBall.is_noball) {
                console.log('   🏏 Playing four sound');
                playFour();
              }
            } else {
              console.log('   🔇 Sounds are disabled');
            }

            // Add ball to local state directly - same as innings update
            setDetailedMatches(prev => prev.map(match => {
              if (match.state !== 'IN_PROGRESS') return match;

              return {
                ...match,
                innings: match.innings?.map(inn => {
                  if (inn.state !== 'IN_PROGRESS') return inn;

                  return {
                    ...inn,
                    overs: inn.overs?.map(over => {
                      if (over.id !== newBall.over_id) return over;

                      // Add ball to this over
                      const updatedBalls = [...(over.balls || []), {
                        id: newBall.id,
                        runs: newBall.runs,
                        isWicket: newBall.is_wicket,
                        wicketType: newBall.wicket_type,
                        isWide: newBall.is_wide,
                        isNoball: newBall.is_noball,
                        isFreeHit: newBall.is_free_hit,
                        misconduct: newBall.misconduct,
                        effectiveRuns: newBall.effective_runs,
                        timestamp: new Date(newBall.timestamp),
                        ballNumber: newBall.ball_number,
                        fieldingTeamId: newBall.fielding_team_id
                      }];

                      return {
                        ...over,
                        balls: updatedBalls
                      };
                    })
                  };
                })
              };
            }));

            console.log('   ✅ Added ball to local state (ball', newBall.ball_number, 'runs:', newBall.runs, ')');
          } catch (error) {
            console.error('❌ Error processing ball event:', error, error?.message, error?.stack);
          }
        }
      )
      // Listen to innings INSERT (when match starts and innings are created)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'innings',
        },
        async (payload) => {
          try {
            console.log('🆕 Live: New innings created', payload);
            console.log('   Fetching updated matches for tournament:', tournament.id);
            const matches = await fetchMatchesWithDetails(tournament.id);
            console.log('   Fetched', matches.length, 'matches');
            setDetailedMatches(matches);
            detailedMatchesRef.current = matches;
            console.log('   ✅ State updated');
          } catch (error) {
            console.error('❌ Error handling innings INSERT:', error, error?.message, error?.stack);
          }
        }
      )
      // Listen to innings UPDATE (totals) for score updates
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'innings',
        },
        async (payload) => {
          try {
            console.log('📊 Live: Innings updated', payload);
            const oldInnings = payload.old as any;
            const newInnings = payload.new as any;

            // Check if powerplay_over changed - update isPowerplay flags locally (DON'T refetch to avoid losing balls)
            if (oldInnings.powerplay_over !== newInnings.powerplay_over) {
              console.log('   ⚡ Powerplay changed from', oldInnings.powerplay_over, 'to', newInnings.powerplay_over);

              // Update isPowerplay flags in local state
              setDetailedMatches(prev => prev.map(match => {
                if (match.state !== 'IN_PROGRESS') return match;

                return {
                  ...match,
                  innings: match.innings?.map(inn => {
                    if (inn.id === newInnings.id) {
                      return {
                        ...inn,
                        powerplayOver: newInnings.powerplay_over,
                        totalRuns: newInnings.total_runs,
                        totalWickets: newInnings.total_wickets,
                        finalScore: newInnings.final_score,
                        overs: inn.overs?.map(over => ({
                          ...over,
                          isPowerplay: over.overNumber === newInnings.powerplay_over
                        }))
                      };
                    }
                    return inn;
                  })
                };
              }));

              console.log('   ✅ Updated powerplay flags locally (over', newInnings.powerplay_over, 'is now powerplay)');
              return;
            }

            // Otherwise just update totals locally (no refetch)
            setDetailedMatches(prev => prev.map(match => {
              if (match.state !== 'IN_PROGRESS') return match;

              return {
                ...match,
                innings: match.innings?.map(inn => {
                  if (inn.id === newInnings.id) {
                    return {
                      ...inn,
                      state: newInnings.state,
                      totalRuns: newInnings.total_runs,
                      totalWickets: newInnings.total_wickets,
                      finalScore: newInnings.final_score,
                      powerplayOver: newInnings.powerplay_over,
                      noWicketBonus: newInnings.no_wicket_bonus
                    };
                  }
                  return inn;
                })
              };
            }));

            console.log('   ✅ Updated innings locally (state:', newInnings.state, 'runs:', newInnings.total_runs, 'wickets:', newInnings.total_wickets, ')');
          } catch (error) {
            console.error('❌ Error handling innings UPDATE:', error, error?.message, error?.stack);
          }
        }
      )
      // Listen to match state changes (CREATED -> IN_PROGRESS, etc.)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
        },
        async (payload) => {
          try {
            console.log('🏆 Live: Match state updated', payload);
            console.log('   Old state:', (payload.old as any)?.state);
            console.log('   New state:', (payload.new as any)?.state);
            console.log('   Fetching updated matches for tournament:', tournament.id);
            const matches = await fetchMatchesWithDetails(tournament.id);
            console.log('   Fetched', matches.length, 'matches');
            setDetailedMatches(matches);
            detailedMatchesRef.current = matches;
            console.log('   ✅ State updated');
          } catch (error) {
            console.error('❌ Error handling matches UPDATE:', error, error?.message, error?.stack);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('🔴 Live page subscription status:', status);
        if (err) {
          console.error('❌ Subscription error:', err);
        }
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time events:');
          console.log('   - balls (INSERT)');
          console.log('   - innings (INSERT, UPDATE)');
          console.log('   - matches (UPDATE)');
          console.log('   Channel:', channel);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error - subscription failed');
        } else if (status === 'TIMED_OUT') {
          console.error('❌ Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('⚠️ Channel closed');
        }
      });

    return () => {
      console.log('🔴 Unsubscribing from live-balls-feed channel');
      supabase.removeChannel(channel);
    };
  }, [tournament.id]); // Only re-subscribe when tournament changes

  // Separate league and playoff matches
  const leagueMatches = detailedMatches.filter((m) => m.stage === "LEAGUE");
  const playoffMatches = detailedMatches.filter((m) => m.stage === "QF" || m.stage === "SEMI" || m.stage === "FINAL");

  // League matches by state
  const liveLeagueMatches = leagueMatches.filter((m) => m.state === "IN_PROGRESS");
  const upcomingLeagueMatches = leagueMatches.filter(
    (m) => m.state === "CREATED" || m.state === "READY" || m.state === "TOSS"
  );
  const completedLeagueMatches = leagueMatches.filter((m) => m.state === "COMPLETED" || m.state === "LOCKED");

  // Playoff matches by state
  const livePlayoffMatches = playoffMatches.filter((m) => m.state === "IN_PROGRESS");
  const upcomingPlayoffMatches = playoffMatches.filter(
    (m) => m.state === "CREATED" || m.state === "READY" || m.state === "TOSS"
  );
  const completedPlayoffMatches = playoffMatches.filter((m) => m.state === "COMPLETED" || m.state === "LOCKED");

  // Total counts for stats
  const totalLive = liveLeagueMatches.length + livePlayoffMatches.length;
  const totalUpcoming = upcomingLeagueMatches.length + upcomingPlayoffMatches.length;
  const totalCompleted = completedLeagueMatches.length + completedPlayoffMatches.length;

  return (
    <div className="p-4 md:p-8">
      {/* Victory Celebration Modal */}
      {showVictory && championTeamId && (() => {
        const finalMatch = detailedMatches.find(m => m.stage === "FINAL");
        const championTeam = teams.find(t => t.id === championTeamId);
        if (!finalMatch || !championTeam) return null;

        return (
          <VictoryCelebration
            match={finalMatch}
            championTeamName={championTeam.name}
            championTeamColor={championTeam.color}
            onClose={() => setShowVictory(false)}
          />
        );
      })()}

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-block px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] text-xs font-bold uppercase tracking-wide">
              Match Center
            </div>
            <h1 className="text-4xl font-black text-white drop-shadow-lg">Live • Schedule • Results</h1>
            <p className="text-white/70 mt-2">Complete tournament coverage in one place</p>
          </div>

          {/* Sound Toggle Button */}
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-2 border-[#ffb300] bg-[#0d3944] hover:bg-[#1a4a57]"
          >
            {soundEnabled ? (
              <Volume2 className="w-6 h-6 text-[#ffb300]" />
            ) : (
              <VolumeX className="w-6 h-6 text-white/50" />
            )}
          </Button>
        </div>
      </div>

      {/* Live Events Ticker - Real Data */}
      {liveEvents.length > 0 && (
        <Card className="mb-8 border-2 border-[#b71c1c] bg-gradient-to-r from-[#b71c1c] to-[#c62828] shadow-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                <Activity className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span className="text-white font-black text-sm uppercase">Live Updates</span>
              </div>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {liveEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-2xl">{event.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-black">
                      Match {event.matchNumber} • {event.teamName}
                    </p>
                    <p className="text-yellow-300 font-bold text-sm">{event.event}</p>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">
                    Just now
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-2 border-[#b71c1c] bg-gradient-to-br from-[#b71c1c] to-[#c62828] shadow-lg overflow-hidden">
          <div className="p-4 md:p-6 flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Flame className="w-6 h-6 md:w-8 md:h-8 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-white">{totalLive}</p>
              <p className="text-white/80 font-bold text-xs md:text-sm">Live</p>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-[#ff9800] bg-gradient-to-br from-[#ff9800] to-[#ffb300] shadow-lg overflow-hidden">
          <div className="p-4 md:p-6 flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-[#0d3944]" />
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-[#0d3944]">{totalUpcoming}</p>
              <p className="text-[#0d3944]/80 font-bold text-xs md:text-sm">Upcoming</p>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-green-600 bg-gradient-to-br from-green-600 to-green-700 shadow-lg overflow-hidden">
          <div className="p-4 md:p-6 flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-white">{totalCompleted}</p>
              <p className="text-white/80 font-bold text-xs md:text-sm">Completed</p>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-[#0d3944] bg-gradient-to-br from-[#0d3944] to-[#1a4a57] shadow-lg overflow-hidden">
          <div className="p-4 md:p-6 flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-[#ffb300]" />
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-white">{detailedMatches.length}</p>
              <p className="text-white/80 font-bold text-xs md:text-sm">Total</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Playoff Bracket - Show if any playoff matches exist */}
      {playoffMatches.length > 0 && (
        <div className="mb-12">
          <PlayoffBracket matches={playoffMatches} teams={teams} />
        </div>
      )}

      {/* Live PLAYOFF Matches Section */}
      {livePlayoffMatches.length > 0 && (
        <div className="mb-12">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#dc2626] to-[#fbbf24] text-white text-sm font-black uppercase tracking-wide shadow-lg">
                <span className="w-3 h-3 bg-white rounded-full animate-ping absolute" />
                <span className="w-3 h-3 bg-white rounded-full" />
                Playoff Live
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                <Radio className="w-3 h-3 animate-pulse" />
                Real-time updates
              </div>
            </div>
            <h2 className="text-3xl font-black text-white drop-shadow-lg flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Playoff Matches in Progress
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {livePlayoffMatches.map((match: Match) => (
              <div
                key={match.id}
                className="transform hover:scale-105 transition-transform duration-300 w-full"
              >
                <PlayoffMatchCard match={match} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live LEAGUE Matches Section */}
      {liveLeagueMatches.length > 0 && (
        <div className="mb-12">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white text-sm font-black uppercase tracking-wide shadow-lg">
                <span className="w-3 h-3 bg-white rounded-full animate-ping absolute" />
                <span className="w-3 h-3 bg-white rounded-full" />
                Live Now
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                <Radio className="w-3 h-3 animate-pulse" />
                Real-time updates
              </div>
            </div>
            <h2 className="text-3xl font-black text-white drop-shadow-lg">
              League Matches in Progress
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveLeagueMatches.map((match: Match) => (
              <div
                key={match.id}
                className="transform hover:scale-105 transition-transform duration-300"
              >
                <LiveMatchCard match={match} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming PLAYOFF Matches */}
      {upcomingPlayoffMatches.length > 0 && (
        <div className="mb-12">
          <div className="mb-6">
            <div className="inline-block px-4 py-2 mb-3 rounded-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white text-sm font-black uppercase tracking-wide shadow-lg">
              Playoffs Up Next
            </div>
            <h2 className="text-3xl font-black text-white drop-shadow-lg flex items-center gap-3">
              <Crown className="w-8 h-8 text-purple-400" />
              Upcoming Playoff Matches
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {upcomingPlayoffMatches.map((match: Match) => (
              <div
                key={match.id}
                className="transform hover:scale-105 transition-transform duration-300 w-full"
              >
                <PlayoffMatchCard match={match} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming LEAGUE Matches */}
      {upcomingLeagueMatches.length > 0 && (
        <div className="mb-12">
          <div className="mb-6">
            <div className="inline-block px-4 py-2 mb-3 rounded-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] text-sm font-black uppercase tracking-wide shadow-lg">
              Up Next
            </div>
            <h2 className="text-3xl font-black text-white drop-shadow-lg">
              Upcoming League Matches
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingLeagueMatches.map((match: Match) => (
              <div
                key={match.id}
                className="transform hover:scale-105 transition-transform duration-300"
              >
                <LiveMatchCard match={match} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed PLAYOFF Matches */}
      {completedPlayoffMatches.length > 0 && (
        <div className="mb-12">
          <div className="mb-6">
            <div className="inline-block px-4 py-2 mb-3 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-black uppercase tracking-wide shadow-lg">
              Playoffs Completed
            </div>
            <h2 className="text-3xl font-black text-white drop-shadow-lg flex items-center gap-3">
              <Swords className="w-8 h-8 text-green-400" />
              Finished Playoff Matches
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {completedPlayoffMatches.map((match: Match) => (
              <div
                key={match.id}
                className="transform hover:scale-105 transition-transform duration-300 w-full"
              >
                <PlayoffMatchCard match={match} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed LEAGUE Matches */}
      {completedLeagueMatches.length > 0 && (
        <div className="mb-12">
          <div className="mb-6">
            <div className="inline-block px-4 py-2 mb-3 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-black uppercase tracking-wide shadow-lg">
              Completed
            </div>
            <h2 className="text-3xl font-black text-white drop-shadow-lg">
              Finished League Matches
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedLeagueMatches.map((match: Match) => (
              <div
                key={match.id}
                className="transform hover:scale-105 transition-transform duration-300"
              >
                <LiveMatchCard match={match} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Schedule Timeline */}
      <div className="mb-8">
        <div className="mb-6">
          <div className="inline-block px-4 py-2 mb-3 rounded-full bg-gradient-to-r from-[#0d3944] to-[#1a4a57] text-white text-sm font-black uppercase tracking-wide shadow-lg">
            Full Schedule
          </div>
          <h2 className="text-3xl font-black text-white drop-shadow-lg">
            Tournament Calendar
          </h2>
          <p className="text-white/70 mt-2">
            All matches organized by date with live scores
          </p>
        </div>

        <ScheduleTimeline matches={detailedMatches} showCompleted={true} />
      </div>

      {detailedMatches.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-white/70 font-medium text-lg">
            No matches scheduled yet.
          </p>
          <p className="text-white/50 text-sm mt-2">Check back soon!</p>
        </div>
      )}
    </div>
  );
}

// Add custom CSS for animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in-up {
      animation: fade-in-up 0.5s ease-out forwards;
    }

    @keyframes pulse-glow {
      0%, 100% {
        box-shadow: 0 0 40px var(--glow-color), 0 20px 60px rgba(0,0,0,0.4);
      }
      50% {
        box-shadow: 0 0 60px var(--glow-color), 0 20px 60px rgba(0,0,0,0.4);
      }
    }

    @keyframes rotate-gradient {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes victory-pulse {
      0%, 100% {
        opacity: 0.3;
      }
      50% {
        opacity: 0.6;
      }
    }
  `;
  document.head.appendChild(style);
}
