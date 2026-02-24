"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Trophy, Menu, X, Layers } from "lucide-react";
import { TOURNAMENT_INFO } from "@/lib/constants";
import { useState } from "react";
import Image from "next/image";

export default function SpectatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/spectator/dashboard", label: "Dashboard", icon: Trophy },
    { href: "/spectator/match-center", label: "Match Center", icon: Activity },
    { href: "/spectator/standings", label: "Standings", icon: Layers },
  ];

  return (
    <div className="min-h-screen tournament-bg-pattern">
      <nav className="bg-gradient-to-r from-[#0d3944]/95 to-[#1a4a57]/95 backdrop-blur-sm border-b-4 border-[#b71c1c] shadow-lg relative overflow-hidden">
        {/* Halftone pattern overlay */}
        <div className="absolute inset-0 opacity-10 cricket-pattern pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Desktop Navigation */}
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - Always visible */}
            <Link href="/spectator/match-center" className="flex items-center gap-2 md:gap-3 group flex-shrink-0">
              <Image
                src="/logos/dual-strike-logo.png"
                alt="Dual Strike Logo"
                width={50}
                height={50}
                className="object-contain w-12 h-12 md:w-14 md:h-14 group-hover:scale-110 transition-transform"
                priority
              />
              <div className="hidden sm:block">
                <h1 className="text-sm md:text-lg font-black text-white tracking-tight">
                  {TOURNAMENT_INFO.NAME}
                </h1>
                <p className="text-[10px] md:text-xs text-[#ffb300] font-semibold uppercase tracking-wide">
                  Spectator View
                </p>
              </div>
            </Link>

            {/* Desktop Nav Items - Hidden on mobile */}
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

            {/* Right side buttons */}
            <div className="flex items-center gap-3">
              {/* Sponsor Logos */}
              {/* Mobile: Show all 6 logos in horizontal scroll */}
              <div className="md:hidden flex items-center gap-2 overflow-x-auto scrollbar-hide max-w-[200px]">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div key={num} className="flex-shrink-0">
                    <Image
                      src={`/logos/header-sponsor-${num}.png`}
                      alt={`Sponsor ${num}`}
                      width={40}
                      height={40}
                      className="object-contain w-8 h-8"
                    />
                  </div>
                ))}
              </div>

              {/* Desktop: Show only SFB logo */}
              <div className="hidden md:flex items-center justify-center">
                <Image
                  src="/logos/header-sponsor-6.png"
                  alt="SFB Group of Companies"
                  width={80}
                  height={80}
                  className="object-contain w-16 h-16"
                  priority
                />
              </div>

              <Link
                href="/auth/login"
                className="text-xs md:text-sm bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold px-3 py-2 md:px-4 md:py-2 rounded-lg hover:opacity-90 transition-opacity shadow-lg"
              >
                Login
              </Link>

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
                          ? "bg-[#b71c1c] text-white shadow-lg"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="relative w-full overflow-x-hidden">{children}</main>
    </div>
  );
}
