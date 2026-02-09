"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Calendar, Trophy, LogOut } from "lucide-react";
import { TOURNAMENT_INFO } from "@/lib/constants";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, profile } = useAuthStore();

  const navItems = [
    { href: "/organizer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/organizer/teams", label: "Teams", icon: Users },
    { href: "/organizer/schedule", label: "Schedule", icon: Calendar },
    { href: "/organizer/matches", label: "Matches", icon: Trophy },
  ];

  return (
    <div className="min-h-screen tournament-bg-pattern">
      <nav className="bg-gradient-to-r from-[#0d3944]/95 to-[#1a4a57]/95 backdrop-blur-sm border-b-4 border-[#b71c1c] shadow-lg relative overflow-hidden">
        {/* Halftone pattern overlay */}
        <div className="absolute inset-0 opacity-10 cricket-pattern pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-8">
              <Link href="/organizer/dashboard" className="group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#b71c1c] to-[#c62828] rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-black text-white tracking-tight">
                      {TOURNAMENT_INFO.NAME}
                    </h1>
                    <p className="text-xs text-[#ffb300] font-semibold uppercase tracking-wide">
                      Organizer Portal
                    </p>
                  </div>
                </div>
              </Link>
              <div className="flex gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        isActive
                          ? "bg-[#b71c1c] text-white shadow-lg"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {profile && (
                <span className="text-white/80 text-sm font-medium">
                  {profile.full_name || profile.email}
                </span>
              )}
              <Button
                onClick={async () => {
                  await signOut();
                  router.push("/spectator/dashboard");
                }}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="relative">{children}</main>
    </div>
  );
}
