"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface ContextWindowMeterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  usedTokens: number;
  maxTokens: number;
  costUsd?: number;
  model?: string;
}

export const ContextWindowMeter = React.forwardRef<
  HTMLDivElement,
  ContextWindowMeterProps
>(
  (
    {
      usedTokens,
      maxTokens,
      costUsd = 0.018,
      model = "claude-3.5-sonnet",
      className,
      ...props
    },
    ref
  ) => {
    // Calculate final percentage
    const targetPct = Math.min(
      100,
      Math.max(0, Math.round((usedTokens / maxTokens) * 100))
    );
    
    // State to handle the load-in animation
    const [pct, setPct] = useState(0);

    // Trigger the animation shortly after component mount
    useEffect(() => {
      const timer = setTimeout(() => {
        setPct(targetPct);
      }, 50);
      return () => clearTimeout(timer);
    }, [targetPct]);

    // Clean, high-contrast severity colors
    const isCritical = targetPct >= 90;
    const isWarning = targetPct >= 75 && targetPct < 90;

    const barColor = isCritical
      ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
      : isWarning
      ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
      : "bg-zinc-900 dark:bg-white shadow-[0_0_10px_rgba(0,0,0,0.15)] dark:shadow-[0_0_12px_rgba(255,255,255,0.3)]";

    const textColor = isCritical
      ? "text-red-600 dark:text-red-400"
      : isWarning
      ? "text-amber-600 dark:text-amber-400"
      : "text-zinc-900 dark:text-zinc-100";

    const formatTokens = (num: number) =>
      num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-2xl p-5",
          "transition-all duration-300 backdrop-blur-2xl",
          // Light mode: Bright, crisp frosted glass with white edge highlight
          "bg-white/70 border border-white/80 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)]",
          // Dark mode: Premium obsidian glass
          "dark:bg-[#09090b]/85 dark:border-white/10 dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]",
          className
        )}
        {...props}
      >
        {/* Subtle top glare for glass realism */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[13px] font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
            {model}
          </span>
          <span className="font-mono text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            ${costUsd.toFixed(3)}
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.05] shadow-inner dark:bg-black/40">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out",
              barColor
            )}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-[11px] font-semibold tracking-wide">
          <span className="tabular-nums text-zinc-400 dark:text-zinc-500">
            <span
              className={cn("transition-colors duration-1000", textColor)}
            >
              {formatTokens(usedTokens)}
            </span>{" "}
            / {formatTokens(maxTokens)}
          </span>

          <span
            className={cn("tabular-nums transition-colors duration-1000", textColor)}
          >
            {targetPct}%
          </span>
        </div>
      </div>
    );
  }
);

ContextWindowMeter.displayName = "ContextWindowMeter";