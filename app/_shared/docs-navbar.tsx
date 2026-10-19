// app/_shared/docs-navbar.tsx
"use client";

import React, { memo, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site";
import { SearchDialog } from "@/app/_shared/search-dialog";
import { GITHUB_URL } from "@/app/_shared/links";

// Hide the page (window) scrollbar everywhere this navbar renders. Scrolling itself still works.
const PAGE_SCROLL_CSS = `
html { scrollbar-width: none; -ms-overflow-style: none; }
html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }
`;

export const DocsNavbar = memo(function DocsNavbar() {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent));

    const onKey = (e: KeyboardEvent) => {
      // Ctrl/⌘ + K toggles the palette from anywhere
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      // "/" opens it unless the user is typing somewhere
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

  return (
    <>
      <style>{PAGE_SCROLL_CSS}</style>
      <header className="sticky top-0 z-40 h-14 bg-[#F5F5F4]/85 backdrop-blur-md">
        <div className="relative flex h-full items-center justify-between gap-4 px-4 sm:px-6">
          {/* brand */}
          <Link href="/" className="flex items-center gap-2.5 text-[14px] font-semibold text-zinc-900">
            <img src="/logo.svg" alt="" width={20} height={20} decoding="async" className="size-5 shrink-0" />
            <span className="hidden sm:inline">{SITE_CONFIG.name}</span>
          </Link>

          {/* search trigger (centered on wide screens) */}
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

          {/* github */}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-white px-3 text-[13px] font-medium text-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:text-zinc-950 hover:shadow-[0_4px_14px_-6px_rgba(0,0,0,0.18)]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-4">
              <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      <SearchDialog open={open} onClose={close} />
    </>
  );
});