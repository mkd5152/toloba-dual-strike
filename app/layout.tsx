import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TDST – Season 1 | Toloba Dual Strike Tournament",
  description: "Official scoring and management platform for Toloba Dual Strike Tournament Season 1. High-energy cricket, fierce competition, and true sportsmanship. Feb 26 - Mar 1, 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${rajdhani.variable} antialiased font-sans`}
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
