"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface MatchTimerProps {
  startTime: Date;
  durationMinutes?: number;
  isLive?: boolean;
  className?: string;
}

export function MatchTimer({
  startTime,
  durationMinutes = 35,
  isLive = false,
  className = "",
}: MatchTimerProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const start = new Date(startTime);
  const elapsed = (now.getTime() - start.getTime()) / 60000;
  const remaining = Math.max(0, durationMinutes - elapsed);

  if (isLive) {
    return (
      <span className={className}>
        {remaining > 0
          ? `${Math.floor(remaining)}m left`
          : "Time up"}
      </span>
    );
  }

  return (
    <span className={className}>
      {formatDistanceToNow(start, { addSuffix: true })}
    </span>
  );
}
