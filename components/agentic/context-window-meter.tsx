"use client";

import React from "react";
import { Cpu } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ContextWindowMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  usedTokens: number;
  maxTokens: number;
  costUsd?: number;
  model?: string;
}

export const ContextWindowMeter = React.forwardRef<HTMLDivElement, ContextWindowMeterProps>(
  ({ usedTokens, maxTokens, costUsd = 0.018, model = "claude-4-sonnet", className, ...props }, ref) => {
    const pct = Math.min(100, Math.round((usedTokens / maxTokens) * 100));

    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-md rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-zinc-900">
            <Cpu className="h-4 w-4 text-[#FF4500]" />
            <span>{model}</span>
          </div>
          <span className="rounded bg-[#FFF3EE] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#FF4500]">
            ${costUsd.toFixed(3)}
          </span>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-[#FF4500] transition-all" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
          <span>
            {(usedTokens / 1000).toFixed(1)}k / {(maxTokens / 1000).toFixed(0)}k tokens
          </span>
          <span className="font-semibold text-zinc-900">{pct}% Context Used</span>
        </div>
      </div>
    );
  }
);
ContextWindowMeter.displayName = "ContextWindowMeter";