"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gavel, List, LogOut, Menu, X } from "lucide-react";
import { TOURNAMENT_INFO } from "@/lib/constants";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function UmpireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { signOut, profile } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/umpire/matches", label: "My Matches", icon: List },
  ];

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/spectator/dashboard";
  };

  return (
    <div className="min-h-screen tournament-bg-pattern">
      <nav className="bg-gradient-to-r from-[#0d3944]/95 to-[#1a4a57]/95 backdrop-blur-sm border-b-4 border-[#ff9800] shadow-lg relative overflow-hidden">
        {/* Halftone pattern overlay */}
        <div className="absolute inset-0 opacity-10 cricket-pattern pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Desktop Navigation */}
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - Always visible */}
            <Link href="/umpire/matches" className="flex items-center gap-2 md:gap-3 group flex-shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#ff9800] to-[#ffb300] rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Gavel className="w-4 h-4 md:w-5 md:h-5 text-[#0d3944]" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm md:text-lg font-black text-white tracking-tight">
                  {TOURNAMENT_INFO.NAME}
                </h1>
                <p className="text-[10px] md:text-xs text-[#ffb300] font-semibold uppercase tracking-wide">
                  Umpire Portal
                </p>
              </div>
            </Link>

            {/* Desktop Nav Items - Hidden on mobile (only 1 item though) */}
            <div className="hidden lg:flex gap-2">
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

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {profile && (
                <span className="hidden md:inline text-white/80 text-xs md:text-sm font-medium truncate max-w-[150px]">
                  {profile.full_name || profile.email}
                </span>
              )}
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="hidden md:flex text-white/70 hover:text-white hover:bg-white/10 text-xs md:text-sm px-2 md:px-4"
                size="sm"
              >
                <LogOut className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                        isActive
                          ? "bg-[#ff9800] text-[#0d3944] shadow-lg"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}

                {/* Mobile logout button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                  {profile && (
                    <span className="text-xs text-white/60 ml-auto truncate max-w-[150px]">
                      ({profile.full_name || profile.email})
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="relative">{children}</main>
    </div>
  );
}
