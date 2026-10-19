// app/_shared/open-menu.tsx
"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Link2, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCopy } from "@/app/_shared/use-copy";

/** "Open ▾" menu: hand this page to an AI assistant, or copy its link. */
export function OpenMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const { copied, copy } = useCopy(1600);

  const close = useCallback(() => setOpen(false), []);

  // close on outside click / Escape (listeners only exist while open)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const openIn = (base: string) => {
    const prompt = `Read ${window.location.href} and help me add the "${name}" component to my Next.js + Tailwind project.`;
    window.open(`${base}${encodeURIComponent(prompt)}`, "_blank", "noopener,noreferrer");
    close();
  };

  const item =
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 focus-visible:outline-none";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-2 rounded-xl bg-zinc-100 px-3.5 text-[12.5px] font-medium text-zinc-700 transition-all duration-200 hover:bg-zinc-200/70 hover:text-zinc-950 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
      >
        Open
        <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <div
        id={id}
        role="menu"
        aria-hidden={!open}
        className={cn(
          "absolute right-0 z-30 mt-2 w-52 origin-top-right rounded-2xl bg-white p-1.5 shadow-[0_18px_44px_-16px_rgba(0,0,0,0.3)] transition-all duration-200 ease-[cubic-bezier(.22,1,.36,1)]",
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-1 scale-95 opacity-0"
        )}
      >
        <button type="button" role="menuitem" tabIndex={open ? 0 : -1} className={item} onClick={() => openIn("https://chatgpt.com/?q=")}>
          <MessageSquare className="size-3.5 text-zinc-400" />
          Open in ChatGPT
        </button>
        <button type="button" role="menuitem" tabIndex={open ? 0 : -1} className={item} onClick={() => openIn("https://claude.ai/new?q=")}>
          <Sparkles className="size-3.5 text-zinc-400" />
          Open in Claude
        </button>
        <button
          type="button"
          role="menuitem"
          tabIndex={open ? 0 : -1}
          className={item}
          onClick={() => copy(window.location.href)}
        >
          {copied ? <Check strokeWidth={2.5} className="size-3.5 text-emerald-600" /> : <Link2 className="size-3.5 text-zinc-400" />}
          {copied ? "Link copied" : "Copy page link"}
        </button>
      </div>
    </div>
  );
}