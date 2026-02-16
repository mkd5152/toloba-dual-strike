"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/lib/stores/auth-store";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import type { Database } from "@/lib/types/database";

type DbMatch = Database["public"]["Tables"]["matches"]["Row"];

export default function UmpireMatchesPage() {
  const { user, profile } = useAuthStore();
  const [matches, setMatches] = useState<DbMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always reload matches when navigating to this page
    // This ensures fresh data after scoring
    if (user && profile) {
      fetchMyMatches();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run on every mount to get fresh data

  const fetchMyMatches = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("umpire_id", user.id)
        .order("start_time");

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      console.error("Error fetching assigned matches:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner only if we have no matches yet
  if (loading && matches.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-[#ff9800] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-bold">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <div className="inline-block px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] text-xs font-bold uppercase tracking-wide">
          Your Schedule
        </div>
        <h1 className="text-4xl font-black text-white drop-shadow-lg">My Matches</h1>
        <p className="text-white/80 font-medium mt-2">
          {matches.length} match{matches.length !== 1 ? "es" : ""} assigned to you
        </p>
      </div>

      {matches.length === 0 ? (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>No matches assigned yet.</strong>
            <br />
            Contact the tournament organizer to get matches assigned to you.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="border-2 border-[#0d3944]/10 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#0d3944] to-[#1a4a57] text-white">
            <CardTitle className="text-xl font-black">
              All Matches {loading && <span className="text-sm font-normal opacity-70">(updating...)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-[#ff9800] transition-colors"
                >
                  <div>
                    <span className="font-bold text-[#0d3944]">
                      Match {match.match_number}
                    </span>
                    <span className="text-gray-600 ml-2 font-medium">
                      {match.court} • {format(new Date(match.start_time), "MMM d, HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={match.state === "IN_PROGRESS" ? "default" : "secondary"}
                      className={match.state === "IN_PROGRESS" ? "bg-[#b71c1c] text-white font-bold" : "bg-gray-100 text-gray-700 font-bold"}
                    >
                      {match.state}
                    </Badge>
                    <Button
                      asChild
                      size="sm"
                      className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold hover:opacity-90"
                    >
                      <Link href={`/umpire/scoring/${match.id}`}>
                        Start Scoring
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
