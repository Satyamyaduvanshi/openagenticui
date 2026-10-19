// app/_shared/docs-navbar.tsx
"use client";

import React, { memo, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site";
import { SearchDialog } from "@/app/_shared/search-dialog";

// Hide the page scrollbar and define the bouncy thought-bubble keyframes
const STYLES = `
html { scrollbar-width: none; -ms-overflow-style: none; }
html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }

@keyframes thought-grow {
  0% { opacity: 0; transform: scale(0.6) translateY(-10px); }
  10% { opacity: 1; transform: scale(1.05) translateY(0); }
  15% { transform: scale(1) translateY(0); }
  85% { opacity: 1; transform: scale(1) translateY(0); }
  100% { opacity: 0; transform: scale(0.8) translateY(-10px); }
}

.animate-thought-bubble {
  transform-origin: 80% -20px;
  animation: thought-grow 6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
`;

// Helper component to animate the number rolling up
const AnimatedCounter = memo(function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const startTime = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      
      setCount(Math.floor(ease * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{count.toLocaleString()}</>;
});

export const DocsNavbar = memo(function DocsNavbar() {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [stars, setStars] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Fetch actual GitHub stars in real-time
  useEffect(() => {
    fetch("https://api.github.com/repos/Satyamyaduvanshi/openagenticui")
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count);
        }
      })
      .catch((err) => console.error("Failed to fetch GitHub stars:", err));
  }, []);

  // Keyboard shortcuts and OS detection
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent));

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = e.target as HTMLElement | null;
        const typing = el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
        if (!typing) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Trigger the thought bubble animation automatically on page load
  useEffect(() => {
    const showTimer = setTimeout(() => setShowTooltip(true), 1500);
    const hideTimer = setTimeout(() => setShowTooltip(false), 8000);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      <header className="sticky top-0 z-40 h-14 bg-[#F5F5F4]/85 backdrop-blur-md">
        <div className="relative flex h-full items-center justify-between gap-4 px-4 sm:px-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 text-[14px] font-semibold text-zinc-900">
            <img src="/logo.svg" alt="" width={20} height={20} decoding="async" className="size-5 shrink-0" />
            <span className="hidden sm:inline">{SITE_CONFIG.name}</span>
          </Link>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Search components"
            aria-haspopup="dialog"
            className="group flex h-9 w-full max-w-md items-center gap-2.5 rounded-xl bg-white px-3 text-left text-[13px] text-zinc-400 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:text-zinc-600 hover:shadow-[0_4px_14px_-6px_rgba(0,0,0,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F5F4] md:absolute md:left-1/2 md:-translate-x-1/2"
          >
            <Search aria-hidden="true" className="size-4 shrink-0" />
            <span className="flex-1 truncate">Search components…</span>
            <kbd className="hidden items-center gap-0.5 rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono-code text-[10.5px] text-zinc-500 sm:inline-flex">
              {isMac ? "⌘" : "Ctrl"} K
            </kbd>
          </button>

          {/* GitHub Split Button & Thought Bubble */}
          <div className="relative flex items-center">
            <a
              href="https://github.com/Satyamyaduvanshi/openagenticui"
              target="_blank"
              rel="noreferrer noopener"
              className="group flex h-9 shrink-0 items-center overflow-hidden rounded-xl bg-white text-[13px] font-medium text-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-[0_4px_14px_-6px_rgba(0,0,0,0.18)]"
            >
              {/* Left Side: GitHub Text */}
              <div className="flex h-full items-center gap-2 px-3 transition-colors hover:bg-zinc-50 group-hover:text-zinc-950">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                  <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
                </svg>
                <span className="hidden sm:inline">GitHub</span>
              </div>
              
              {/* Vertical Divider */}
              <div className="h-full w-[1px] bg-zinc-200/60" />
              
              {/* Right Side: Animated Star Count */}
              <div className="flex h-full items-center gap-1.5 bg-zinc-50/50 px-2.5 text-[12.5px] text-zinc-600 transition-colors hover:bg-zinc-100 group-hover:text-zinc-900">
                <Star 
                  aria-hidden="true" 
                  className="size-[14px] text-amber-400 fill-amber-400 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]" 
                />
                <span className="min-w-[1.5rem] text-center font-semibold tabular-nums">
                  {stars !== null ? <AnimatedCounter value={stars} /> : "..."}
                </span>
              </div>
            </a>

            {/* Floating Scalloped Thought Bubble with perfectly unified drop-shadow */}
            {showTooltip && (
              <div className="pointer-events-none absolute right-2 top-[calc(100%+6px)] z-50 flex flex-col items-end gap-1.5 animate-thought-bubble drop-shadow-[0_6px_12px_rgba(0,0,0,0.2)]">
                
                {/* The Bubble Trail */}
                <div className="mr-8 flex flex-col items-end gap-1">
                  <div className="mr-1 size-1.5 rounded-full bg-[#1C1C1C]" />
                  <div className="size-2.5 rounded-full bg-[#1C1C1C]" />
                </div>
                
                {/* The Main Cloud Bubble */}
                <div className="relative mt-0.5 flex items-center justify-center rounded-[22px] bg-[#1C1C1C] px-5 py-3">
                  
                  {/* CSS Shapes fused seamlessly using identical bg color and parent drop-shadow */}
                  <div className="absolute -top-2 left-3.5 size-5 rounded-full bg-[#1C1C1C]" />
                  <div className="absolute -top-3.5 left-1/2 size-8 -translate-x-1/2 rounded-full bg-[#1C1C1C]" />
                  <div className="absolute -top-1.5 right-4 size-4 rounded-full bg-[#1C1C1C]" />
                  <div className="absolute -bottom-1.5 left-4 size-4 rounded-full bg-[#1C1C1C]" />
                  <div className="absolute -bottom-2.5 right-5 size-6 rounded-full bg-[#1C1C1C]" />
                  
                  {/* Bubble Content */}
                  <p className="relative z-20 text-center text-[12px] font-medium leading-snug text-white">
                    Find it useful? <br />
                    <span className="text-amber-400">Drop us a star!</span>
                  </p>
                </div>

              </div>
            )}
          </div>
        </div>
      </header>

      <SearchDialog open={open} onClose={close} />
    </>
  );
});