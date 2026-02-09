"use client";

import { Button } from "@/components/ui/button";

interface BallButtonProps {
  runs: 0 | 1 | 2 | 3 | 4 | 6;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
}

export function BallButton({
  runs,
  onClick,
  variant = "outline",
  className = "",
}: BallButtonProps) {
  return (
    <Button
      variant={variant}
      size="lg"
      className={`h-16 text-2xl font-bold ${className}`}
      onClick={onClick}
    >
      {runs}
    </Button>
  );
}
