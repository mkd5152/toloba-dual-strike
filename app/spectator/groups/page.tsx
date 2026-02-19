"use client"

import { GroupsPlayoffsView } from "@/components/tournament/groups-playoffs-view"

export default function GroupStandingsPage() {
  return (
    <GroupsPlayoffsView
      branding={{
        primary: "#ff9800",
        secondary: "#ffb300",
        primaryLight: "from-[#ff9800]/10 to-[#ffb300]/10",
        primaryBorder: "border-[#ff9800]/30",
        textColor: "text-[#0d3944]",
      }}
      showPlayoffLink={false}
    />
  )
}
