// app/_shared/docs-right-sidebar.tsx
"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Heart, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { SPONSOR_URL, X_URL } from "@/app/_shared/links";

export interface TocItem {
  id: string;
  title: string;
  subtitle: string;
}

// Soft highlighter swipe behind the heading word (same idea as the "Setup" heading).
const TOC_CSS = `
@keyframes toc-marker { from { transform: scaleX(0) rotate(-1.5deg); } to { transform: scaleX(1) rotate(-1.5deg); } }
.toc-marker { transform-origin: left center; transform: rotate(-1.5deg); animation: toc-marker 700ms cubic-bezier(.22,1,.36,1) 120ms both; }
@media (prefers-reduced-motion: reduce) { .toc-marker { animation: none; } }
`;

// Navbar (60px) + breathing room. A section becomes "active" once its top passes this line.
const OFFSET = 96;

export const DocsRightSidebar = memo(function DocsRightSidebar({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [bar, setBar] = useState<{ top: number; height: number } | null>(null);
  const [animate, setAnimate] = useState(false);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const idsKey = items.map((i) => i.id).join("|"); // stable dep even if parent passes a new array each render

  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const listRef = useRef<HTMLUListElement>(null);
  const lockUntil = useRef(0);

  /* ---- scroll spy (rAF-throttled) ---- */
  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;

      if (performance.now() < lockUntil.current) return; // a click-scroll is in flight

      const found = itemsRef.current
        .map((i) => ({ id: i.id, el: document.getElementById(i.id) }))
        .filter((x): x is { id: string; el: HTMLElement } => x.el !== null);
      if (found.length === 0) return;

      let current = found[0].id;
      if (max > 0 && y >= max - 4) {
        current = found[found.length - 1].id; // bottom of page => last section
      } else {
        for (const { id, el } of found) {
          if (el.getBoundingClientRect().top <= OFFSET + 8) current = id;
        }
      }
      setActiveId((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [idsKey]);

  /* ---- sliding indicator: measure active link, re-measure when the list resizes ---- */
  useEffect(() => {
    const measure = () => {
      const el = linkRefs.current[activeId];
      if (!el) return;
      setBar((prev) =>
        prev && prev.top === el.offsetTop && prev.height === el.offsetHeight
          ? prev
          : { top: el.offsetTop, height: el.offsetHeight }
      );
    };

    measure();
    // enable the transition only after the first measurement so it doesn't slide in from 0
    const raf = requestAnimationFrame(() => setAnimate(true));

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro && listRef.current) ro.observe(listRef.current);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [activeId, idsKey]);

  /* ---- smooth jump that respects the sticky navbar ---- */
  const jump = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return; // fall back to native hash navigation
    e.preventDefault();

    lockUntil.current = performance.now() + 900;
    setActiveId(id);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - OFFSET + 8,
      behavior: reduce ? "auto" : "smooth",
    });
    history.replaceState(null, "", `#${id}`);
  }, []);

  return (
    <aside className="sticky top-[3.75rem] hidden h-[calc(100dvh-3.75rem)] w-80 shrink-0 flex-col self-start overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-8 xl:flex">
      <div>
        <style>{TOC_CSS}</style>
        <div className="font-mono-code text-[10px] uppercase tracking-[0.18em] text-zinc-400">On this</div>
        <h2 className="relative isolate mt-1 inline-block font-editorial text-[19px] leading-none text-zinc-900">
          <span
            aria-hidden="true"
            className="toc-marker absolute -inset-x-1 bottom-0 -z-10 h-2 rounded-sm bg-amber-300/60"
          />
          page
        </h2>
        <p className="mt-2.5 text-[12.5px] text-zinc-400">Jump to a section.</p>

        <nav aria-label="On this page" className="relative mt-6">
          {/* rail */}
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-zinc-300/60" />
          {/* sliding indicator */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute left-0 top-0 w-[2px] rounded-full bg-zinc-900",
              bar ? "opacity-100" : "opacity-0",
              animate && "transition-[transform,height] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
            )}
            style={{ height: bar?.height ?? 0, transform: `translateY(${bar?.top ?? 0}px)` }}
          />

          <ul ref={listRef} className="relative space-y-1">
            {items.map((item) => {
              const active = item.id === activeId;
              return (
                <li key={item.id}>
                  <a
                    ref={(el) => {
                      linkRefs.current[item.id] = el;
                    }}
                    href={`#${item.id}`}
                    onClick={(e) => jump(e, item.id)}
                    aria-current={active ? "location" : undefined}
                    className={cn(
                      "block py-2 pl-4 pr-1 transition-[color,transform] duration-300 ease-out",
                      active ? "text-zinc-900" : "text-zinc-500 hover:translate-x-0.5 hover:text-zinc-900"
                    )}
                  >
                    <span
                      className={cn(
                        "block text-[13.5px] transition-[font-weight] duration-300",
                        active ? "font-semibold" : "font-normal"
                      )}
                    >
                      {item.title}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block whitespace-pre-line text-[12px] leading-snug transition-colors duration-300",
                        active ? "text-zinc-500" : "text-zinc-400"
                      )}
                    >
                      {item.subtitle}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* sponsor + credit */}
      <div className="mt-auto space-y-4 pt-8">
        <a
          href={SPONSOR_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="group block rounded-2xl bg-zinc-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-100/80 hover:shadow-[0_14px_30px_-18px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[13px] font-semibold text-zinc-900">
              <Heart aria-hidden="true" className="size-3.5 transition-all duration-200 group-hover:fill-current" />
              Sponsor us
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-3.5 text-zinc-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-700"
            />
          </div>

          {/* logo slot */}
          <div className="mt-3 flex h-12 items-center justify-center gap-1.5 rounded-xl bg-white text-[12px] font-medium text-zinc-400 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors group-hover:text-zinc-600">
            <Plus aria-hidden="true" className="size-3.5" />
            Your logo here
          </div>

          <p className="mt-3 text-[12px] leading-snug text-zinc-500">
            Sponsor the project and your logo and link show up right here, on every page.
          </p>
        </a>

        <a
          href={X_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="group inline-flex items-center gap-2 text-[12px] text-zinc-400 transition-colors hover:text-zinc-900"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-3">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
          </svg>
          <span>
            by <span className="font-medium text-zinc-600 transition-colors group-hover:text-zinc-900">Satyam Yadav</span>
          </span>
        </a>
      </div>
    </aside>
  );
});