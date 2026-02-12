"use client"

import { useEffect, useState, useRef } from "react"
import { GroupStandings } from "@/components/spectator/group-standings"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Users, AlertCircle } from "lucide-react"
import { getQualifiedTeamsForSemis } from "@/lib/api/qualification"
import type { StandingsEntry } from "@/lib/types"

export default function OrganizerGroupsPage() {
  const [groupStandings, setGroupStandings] = useState<{
    group1: StandingsEntry[]
    group2: StandingsEntry[]
    group3: StandingsEntry[]
    group4: StandingsEntry[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasLoaded = useRef(false)

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true
      loadGroupStandings()
    }
  }, [])

  const loadGroupStandings = async () => {
    try {
      setError(null)
      const standings = await getQualifiedTeamsForSemis("tdst-season-1")
      setGroupStandings(standings)
    } catch (err) {
      console.error("Error loading group standings:", err)
      setError(err instanceof Error ? err.message : "Failed to load group standings")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-[#b71c1c] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-bold">Loading group standings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error:</strong> {error}
            <br />
            <button
              onClick={loadGroupStandings}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <div className="inline-block px-3 py-1 mb-2 rounded-full bg-gradient-to-r from-[#b71c1c] to-[#c62828] text-white text-xs font-bold uppercase tracking-wide">
          League Stage
        </div>
        <h1 className="text-4xl font-black text-white drop-shadow-lg">Group Standings</h1>
        <p className="text-white/80 font-medium mt-2">
          Top 2 teams from each group qualify for semifinals
        </p>
      </div>

      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Users className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Qualification:</strong> The top 2 teams from each group will advance to the semifinals.
          <br />
          <Badge className="bg-green-600 text-white text-xs mt-1">Q</Badge> indicates qualified teams.
        </AlertDescription>
      </Alert>

      {groupStandings && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GroupStandings group={1} standings={groupStandings.group1} showQualified={true} />
          <GroupStandings group={2} standings={groupStandings.group2} showQualified={true} />
          <GroupStandings group={3} standings={groupStandings.group3} showQualified={true} />
          <GroupStandings group={4} standings={groupStandings.group4} showQualified={true} />
        </div>
      )}

      {groupStandings && (
        <div className="mt-8 p-6 bg-gradient-to-r from-[#0d3944] to-[#1a4a57] rounded-lg border-2 border-[#b71c1c]">
          <div className="flex items-start gap-3">
            <Trophy className="w-6 h-6 text-[#b71c1c] mt-1" />
            <div>
              <h3 className="text-xl font-black text-white mb-2">Playoff Format</h3>
              <div className="space-y-2 text-white/90 font-medium">
                <p>🥇 <strong className="text-[#b71c1c]">Semi-Final 1:</strong> G1-1st, G2-2nd, G3-1st, G4-2nd</p>
                <p>🥈 <strong className="text-[#b71c1c]">Semi-Final 2:</strong> G1-2nd, G2-1st, G3-2nd, G4-1st</p>
                <p>🏆 <strong className="text-[#b71c1c]">Final:</strong> Top 2 from each semi (4 teams)</p>
              </div>
              <p className="mt-3 text-sm text-white/70">
                ⚡ Scoring resets fresh at each stage - League points don't carry over!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
