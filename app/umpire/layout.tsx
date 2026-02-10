"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gavel, List, LogOut } from "lucide-react";
import { TOURNAMENT_INFO } from "@/lib/constants";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";

export default function UmpireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, profile } = useAuthStore();

  const navItems = [
    { href: "/umpire/matches", label: "My Matches", icon: List },
  ];

  return (
    <div className="min-h-screen tournament-bg-pattern">
      <nav className="bg-gradient-to-r from-[#0d3944]/95 to-[#1a4a57]/95 backdrop-blur-sm border-b-4 border-[#ff9800] shadow-lg relative overflow-hidden">
        {/* Halftone pattern overlay */}
        <div className="absolute inset-0 opacity-10 cricket-pattern pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-8">
              <Link href="/umpire/matches" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ff9800] to-[#ffb300] rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Gavel className="w-5 h-5 text-[#0d3944]" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-white tracking-tight">
                    {TOURNAMENT_INFO.NAME}
                  </h1>
                  <p className="text-xs text-[#ffb300] font-semibold uppercase tracking-wide">
                    Umpire Portal
                  </p>
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
                          ? "bg-[#ff9800] text-[#0d3944] shadow-lg"
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
                  window.location.href = "/spectator/dashboard";
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
