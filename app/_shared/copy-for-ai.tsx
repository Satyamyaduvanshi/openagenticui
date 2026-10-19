// app/_shared/copy-for-ai.tsx
"use client";

import React, { memo, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCopy } from "@/app/_shared/use-copy";

/* ------------------------------- logos -------------------------------- */
// Simplified marks. Swap the SVG bodies for official brand assets if you need exact artwork.

type LogoProps = { className?: string };
const RAYS = Array.from({ length: 12 }, (_, i) => i);
const PETALS = [0, 60, 120, 180, 240, 300];

const ClaudeLogo = ({ className }: LogoProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#D97757" strokeWidth="2.2" strokeLinecap="round" className={className}>
    {RAYS.map((i) => (
      <path key={i} d={i % 2 ? "M12 4.4v4.1" : "M12 2.4v6.1"} transform={`rotate(${i * 30} 12 12)`} />
    ))}
  </svg>
);

const ChatGPTLogo = ({ className }: LogoProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#10A37F" strokeWidth="1.5" className={className}>
    {PETALS.map((r) => (
      <rect key={r} x="9.2" y="2.2" width="5.6" height="10.6" rx="2.8" transform={`rotate(${r} 12 12)`} />
    ))}
  </svg>
);

const GeminiLogo = ({ className }: LogoProps) => (
  <svg viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="ai-gemini-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#4285F4" />
        <stop offset="0.55" stopColor="#9B72CB" />
        <stop offset="1" stopColor="#D96570" />
      </linearGradient>
    </defs>
    <path
      d="M12 1C12 7.1 16.9 12 23 12C16.9 12 12 16.9 12 23C12 16.9 7.1 12 1 12C7.1 12 12 7.1 12 1Z"
      fill="url(#ai-gemini-grad)"
    />
  </svg>
);

const CursorLogo = ({ className }: LogoProps) => (
  <svg viewBox="0 0 24 24" className={className} strokeLinejoin="round">
    <path d="M12 2 20.66 7 12 12 3.34 7Z" fill="#E4E4E7" stroke="#18181B" strokeWidth="0.8" />
    <path d="M3.34 7 12 12v10l-8.66-5Z" fill="#18181B" />
    <path d="M20.66 7 12 12v10l8.66-5Z" fill="#52525B" />
  </svg>
);

const AI_APPS = [
  { id: "claude", Logo: ClaudeLogo },
  { id: "chatgpt", Logo: ChatGPTLogo },
  { id: "gemini", Logo: GeminiLogo },
  { id: "cursor", Logo: CursorLogo },
] as const;

const AiLogoRotator = memo(function AiLogoRotator({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let id: ReturnType<typeof setInterval> | null = null;
    const stop = () => {
      if (id) clearInterval(id);
      id = null;
    };
    const start = () => {
      stop();
      id = setInterval(() => setIndex((i) => (i + 1) % AI_APPS.length), 2000);
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const prev = (index + AI_APPS.length - 1) % AI_APPS.length;

  return (
    <span aria-hidden="true" className={cn("relative block", className)}>
      {AI_APPS.map(({ id, Logo }, i) => (
        <span
          key={id}
          className={cn(
            "absolute inset-0 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
            i === index
              ? "translate-y-0 scale-100 opacity-100 blur-0"
              : i === prev
                ? "-translate-y-2 scale-50 opacity-0 blur-[3px]"
                : "translate-y-2 scale-50 opacity-0 blur-[3px]"
          )}
        >
          <Logo className="size-full" />
        </span>
      ))}
    </span>
  );
});

/* ------------------------------- button ------------------------------- */

export type CopyForAIButtonProps = {
  /** Called on click so the (large) prompt string is only built when needed. */
  getPrompt: () => string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

/** Single "Copy for AI" action. Use it in ONE place only (e.g. the Setup header inside ComponentViewer). */
export const CopyForAIButton = memo(function CopyForAIButton({
  getPrompt,
  label = "Copy for AI",
  size = "md",
  className,
}: CopyForAIButtonProps) {
  const { copied, copy } = useCopy();
  const sm = size === "sm";

  return (
    <button
      type="button"
      onClick={() => copy(getPrompt())}
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-zinc-900 font-medium text-white",
        "shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_8px_18px_-8px_rgba(0,0,0,.5)]",
        "transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
        sm ? "h-9 gap-2 pl-1.5 pr-3.5 text-[12.5px]" : "h-10 gap-2.5 pl-2 pr-4 text-[13px]",
        className
      )}
    >
      <span className={cn("relative grid shrink-0 place-items-center rounded-lg bg-white", "size-6")}>
        <span
          className={cn(
            "absolute inset-0 grid place-items-center transition-all duration-300",
            copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
          )}
        >
          <AiLogoRotator className="size-3.5" />
        </span>
        <Check
          strokeWidth={2.75}
          className={cn(
            "absolute size-3.5 text-emerald-600 transition-all duration-300",
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </span>
      <span>{copied ? "Copied!" : label}</span>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Prompt copied to clipboard" : ""}
      </span>
    </button>
  );
});