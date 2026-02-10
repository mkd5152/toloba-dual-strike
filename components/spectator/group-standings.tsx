"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { StandingsEntry } from "@/lib/types"

interface GroupStandingsProps {
  group: number
  standings: StandingsEntry[]
  showQualified?: boolean
}

export function GroupStandings({ group, standings, showQualified = false }: GroupStandingsProps) {
  const groupName = ["A-E", "F-J", "K-O", "P-T"][group - 1]

  return (
    <Card className="border-2 border-[#0d3944]/10">
      <CardHeader className="bg-gradient-to-r from-[#0d3944] to-[#1a4a57] text-white pb-3">
        <CardTitle className="text-lg font-black flex items-center gap-2">
          <span>Group {group}</span>
          <span className="text-sm font-medium opacity-80">({groupName})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Rank</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Team</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">MP</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">Pts</th>
              <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">Runs</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((entry, idx) => {
              const isQualified = showQualified && idx < 2
              return (
                <tr
                  key={entry.teamId}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isQualified ? "bg-green-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0d3944]">{entry.rank}</span>
                      {isQualified && (
                        <Badge className="bg-green-600 text-white text-[10px] px-1.5 py-0">
                          Q
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#0d3944]">{entry.teamName}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{entry.matchesPlayed}</td>
                  <td className="px-4 py-3 text-center font-bold text-[#ff9800]">{entry.points}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{entry.totalRuns}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
