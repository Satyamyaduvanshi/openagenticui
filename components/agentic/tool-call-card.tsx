"use client";

import React, { useState } from "react";
import { Wrench, Check, Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ToolCallCardProps extends React.HTMLAttributes<HTMLDivElement> {
  toolName: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
  status?: "running" | "completed";
}

export const ToolCallCard = React.forwardRef<HTMLDivElement, ToolCallCardProps>(
  ({ toolName, args, result, status = "completed", className, ...props }, ref) => {
    const [open, setOpen] = useState(true);

    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-xl rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden",
          className
        )}
        {...props}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3 text-xs hover:bg-zinc-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FFF3EE] text-[#FF4500] border border-[#FFD5C2]">
              <Wrench className="h-3.5 w-3.5" />
            </span>
            <span className="font-mono font-semibold text-zinc-900">{toolName}()</span>
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
              {status === "running" ? "Running" : "200 OK"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {status === "running" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FF4500]" />
            ) : (
              <Check className="h-3.5 w-3.5 text-[#FF4500]" />
            )}
            <ChevronRight className={cn("h-4 w-4 text-zinc-400 transition-transform", open && "rotate-90")} />
          </div>
        </button>

        {open && (
          <div className="divide-y divide-zinc-100 border-t border-zinc-200 bg-zinc-50/60 font-mono text-[11px]">
            <div className="p-3">
              <div className="mb-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Arguments
              </div>
              <pre className="overflow-x-auto text-zinc-700">{JSON.stringify(args, null, 2)}</pre>
            </div>
            {result && (
              <div className="bg-white p-3">
                <div className="mb-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Response Payload
                </div>
                <pre className="overflow-x-auto text-zinc-900">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
ToolCallCard.displayName = "ToolCallCard";