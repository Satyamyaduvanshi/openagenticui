"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, ChevronDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ReasoningTraceProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  isThinking?: boolean;
  durationSeconds?: number;
  defaultExpanded?: boolean;
}

export const ReasoningTrace = React.forwardRef<HTMLDivElement, ReasoningTraceProps>(
  ({ content, isThinking = false, durationSeconds, defaultExpanded = true, className, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [elapsed, setElapsed] = useState(durationSeconds ?? 1);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (durationSeconds !== undefined) {
        setElapsed(durationSeconds);
        return;
      }
      if (!isThinking) return;
      const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
      return () => clearInterval(timer);
    }, [isThinking, durationSeconds]);

    useEffect(() => {
      if (isThinking && isExpanded && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [content, isThinking, isExpanded]);

    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-xl rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
          className
        )}
        {...props}
      >
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            {isThinking ? (
              <span className="relative flex h-4 w-4 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF4500]/30" />
                <Sparkles className="relative h-3.5 w-3.5 text-[#FF4500]" />
              </span>
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-[#FF4500]" />
            )}
            <span className={cn("text-zinc-900 font-medium", isThinking && "text-[#FF4500] font-semibold")}>
              {isThinking ? `Reasoning... (${elapsed}s)` : `Thought for ${elapsed}s`}
            </span>
          </div>
          <ChevronDown
            className={cn("h-4 w-4 text-zinc-400 transition-transform duration-200", isExpanded && "rotate-180")}
          />
        </button>

        {isExpanded && (
          <div className="border-t border-zinc-100 bg-zinc-50/70 px-4 py-3 rounded-b-xl">
            <div
              ref={scrollRef}
              className="max-h-48 overflow-y-auto font-mono text-xs leading-relaxed text-zinc-600 whitespace-pre-wrap"
            >
              {content}
              {isThinking && (
                <span className="ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-[#FF4500]" />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);
ReasoningTrace.displayName = "ReasoningTrace";