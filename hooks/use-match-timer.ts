"use client";

import { useEffect, useState } from "react";

export function useMatchTimer(
  startTime: Date,
  durationMinutes: number = 35,
  isLive: boolean = false
) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const start = new Date(startTime);
  const elapsed = (now.getTime() - start.getTime()) / 60000;
  const remaining = Math.max(0, durationMinutes - elapsed);

  return { now, elapsed, remaining, isComplete: remaining <= 0 };
}
