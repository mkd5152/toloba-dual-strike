"use client";

import { useEffect, useState } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { LiveMatchCard } from "@/components/spectator/live-match-card";
import { ScheduleTimeline } from "@/components/spectator/schedule-timeline";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Flame, TrendingUp, Activity, Radio, Calendar } from "lucide-react";
import { useRealtimeTournament } from "@/hooks/use-realtime-tournament";
import { supabase } from "@/lib/supabase/client";

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
  const { matches, teams, loadTeams, loadMatches, loading, getTeam, tournament } = useTournamentStore();
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);

  // Enable real-time updates for all tournament matches
  const { isMatchesSubscribed } = useRealtimeTournament({
    tournamentId: tournament.id,
    enabled: true,
    watchMatches: true,
    watchStandings: false,
  });

  // Fetch data every time component mounts
  useEffect(() => {
    const loadData = async () => {
      await loadTeams();
      await loadMatches();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to real-time ball and innings events
  useEffect(() => {
    console.log('🔴 Setting up live-balls-feed subscription');
    const channel = supabase
      .channel('live-balls-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'balls',
        },
        async (payload) => {
          console.log('🏏 Live ball recorded:', payload);

          // Get the ball data
          const ball = payload.new as any;

          // Fetch innings to get match and team info
          const { data: inningsData } = await supabase
            .from('innings')
            .select('match_id, team_id')
            .eq('id', ball.innings_id)
            .single() as any;

          if (!inningsData) return;

          // Get current matches and teams from store
          const { matches: currentMatches, getTeam: getCurrentTeam } = useTournamentStore.getState();

          // Find the match
          const match = currentMatches.find((m: any) => m.id === inningsData.match_id);
          if (!match || match.state !== 'IN_PROGRESS') return;

          // Get the team
          const team = getCurrentTeam(inningsData.team_id);
          if (!team) return;

          // Determine event type and icon
          let eventText = '';
          let icon = '';

          if (ball.is_wicket) {
            eventText = 'WICKET!';
            icon = '🎯';
          } else if (ball.runs === 6) {
            eventText = 'SIX!';
            icon = '🚀';
          } else if (ball.runs === 4) {
            eventText = 'FOUR!';
            icon = '🏏';
          } else if (ball.is_wide) {
            eventText = 'Wide';
            icon = '↔️';
          } else if (ball.is_no_ball) {
            eventText = 'No Ball';
            icon = '🚫';
          } else if (ball.runs === 0) {
            eventText = 'Dot Ball';
            icon = '⚫';
          } else {
            eventText = `${ball.runs} Run${ball.runs > 1 ? 's' : ''}`;
            icon = '🏃';
          }

          // Add to live events
          const newEvent: LiveEvent = {
            id: ball.id,
            matchNumber: match.matchNumber,
            teamName: team.name,
            event: eventText,
            icon: icon,
            time: new Date(ball.created_at),
            runs: ball.runs,
          };

          setLiveEvents(prev => [newEvent, ...prev].slice(0, 10)); // Keep latest 10
        }
      )
      // Listen to innings updates (totals) for score updates
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'innings',
        },
        (payload) => {
          console.log('📊 Live: Innings updated', payload);
          // Reload matches when innings totals are updated
          useTournamentStore.getState().loadMatches();
        }
      )
      .subscribe((status) => {
        console.log('🔴 Live page balls/innings subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to balls and innings changes');
        }
      });

    return () => {
      console.log('🔴 Unsubscribing from live-balls-feed channel');
      supabase.removeChannel(channel);
    };
  }, []); // Empty deps - subscribe once and never recreate

  const liveMatches = matches.filter((m) => m.state === "IN_PROGRESS");
  const upcomingMatches = matches.filter(
    (m) => m.state === "CREATED" || m.state === "READY" || m.state === "TOSS"
  );
  const completedMatches = matches.filter((m) => m.state === "COMPLETED" || m.state === "LOCKED");

  return (
    <div className="p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-block px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] text-xs font-bold uppercase tracking-wide">
          Match Center
        </div>
        <h1 className="text-4xl font-black text-white drop-shadow-lg">Live • Schedule • Results</h1>
        <p className="text-white/70 mt-2">Complete tournament coverage in one place</p>
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
              <p className="text-3xl md:text-4xl font-black text-white">{liveMatches.length}</p>
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
              <p className="text-3xl md:text-4xl font-black text-[#0d3944]">{upcomingMatches.length}</p>
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
              <p className="text-3xl md:text-4xl font-black text-white">{completedMatches.length}</p>
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
              <p className="text-3xl md:text-4xl font-black text-white">{matches.length}</p>
              <p className="text-white/80 font-bold text-xs md:text-sm">Total</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <div className="mb-12">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white text-sm font-black uppercase tracking-wide shadow-lg">
                <span className="w-3 h-3 bg-white rounded-full animate-ping absolute" />
                <span className="w-3 h-3 bg-white rounded-full" />
                Live Now
              </div>
              {isMatchesSubscribed && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Real-time updates
                </div>
              )}
            </div>
            <h2 className="text-3xl font-black text-white drop-shadow-lg">
              Matches in Progress
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveMatches.map((match) => (
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

      {/* Upcoming Matches Preview */}
      {upcomingMatches.length > 0 && (
        <div className="mb-12">
          <div className="mb-6">
            <div className="inline-block px-4 py-2 mb-3 rounded-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] text-sm font-black uppercase tracking-wide shadow-lg">
              Up Next
            </div>
            <h2 className="text-3xl font-black text-white drop-shadow-lg">
              Coming Up
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.slice(0, 3).map((match) => (
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

        <ScheduleTimeline matches={matches} showCompleted={true} />
      </div>

      {matches.length === 0 && (
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

// Add custom CSS for fade-in animation
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
  `;
  document.head.appendChild(style);
}
