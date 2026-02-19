"use client"

import { GroupsPlayoffsView } from "@/components/tournament/groups-playoffs-view"

export default function OrganizerGroupsPage() {
  return (
    <GroupsPlayoffsView
      branding={{
        primary: "#b71c1c",
        secondary: "#c62828",
        primaryLight: "from-[#b71c1c]/10 to-[#c62828]/10",
        primaryBorder: "border-[#b71c1c]/30",
        textColor: "text-white",
      }}
      showPlayoffLink={true}
    />
  )
}
