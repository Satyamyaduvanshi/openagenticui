// app/_shared/search-dialog.tsx
"use client";

import React, { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search, SearchX, X } from "lucide-react";
import { REGISTRY } from "@/lib/registry";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/*  Static data + ranking (computed once, pure functions)              */
/* ------------------------------------------------------------------ */

const TINTS = [
  "bg-sky-50 text-sky-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-violet-50 text-violet-700",
  "bg-rose-50 text-rose-700",
] as const;

const CATEGORY_LIST: string[] = Array.from(new Set(REGISTRY.map((i) => i.category)));
const tintFor = (category: string) => TINTS[Math.max(0, CATEGORY_LIST.indexOf(category)) % TINTS.length];

// Pre-lowercased haystacks so typing never re-lowercases the whole registry.
const INDEX = REGISTRY.map((item) => ({
  item,
  name: item.name.toLowerCase(),
  slug: item.slug.toLowerCase(),
  category: item.category.toLowerCase(),
  description: item.description.toLowerCase(),
}));

type Hit = { item: (typeof REGISTRY)[number]; score: number };

function search(query: string): Hit[] {
  const q = query.trim().toLowerCase();
  if (!q) return REGISTRY.map((item) => ({ item, score: 0 }));

  const tokens = q.split(/\s+/).filter(Boolean);
  const hits: Hit[] = [];

  for (const row of INDEX) {
    let total = 0;
    let ok = true;
    for (const t of tokens) {
      let s = 0;
      if (row.name === t) s = 100;
      else if (row.name.startsWith(t)) s = 80;
      else if (row.name.split(/[\s-]+/).some((w) => w.startsWith(t))) s = 65;
      else if (row.name.includes(t)) s = 50;
      else if (row.slug.includes(t)) s = 40;
      else if (row.category.includes(t)) s = 30;
      else if (row.description.includes(t)) s = 15;
      if (!s) {
        ok = false;
        break;
      }
      total += s;
    }
    if (ok) hits.push({ item: row.item, score: total });
  }
  return hits.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase().split(/\s+/)[0];
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-amber-200/70 px-0.5 text-inherit">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

const CSS = `
@keyframes sd-overlay { from { opacity: 0; } to { opacity: 1; } }
@keyframes sd-panel { from { opacity: 0; transform: translateY(-8px) scale(.98); } to { opacity: 1; transform: none; } }
.sd-overlay { animation: sd-overlay 160ms ease-out both; }
.sd-panel { animation: sd-panel 220ms cubic-bezier(.22,1,.36,1) both; }
@media (prefers-reduced-motion: reduce) { .sd-overlay, .sd-panel { animation: none; } }
`;

/* ------------------------------------------------------------------ */
/*  Dialog                                                             */
/* ------------------------------------------------------------------ */

export const SearchDialog = memo(function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const uid = useId();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => setMounted(true), []);

  const results = useMemo(() => search(query), [query]);

  // reset when opened; lock page scroll while open
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // keep the highlighted row in view
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const go = useCallback(
    (slug: string) => {
      onClose();
      router.push(`/components/${slug}`);
    },
    [onClose, router]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active];
      if (hit) go(hit.item.slug);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      e.preventDefault(); // keep focus inside the dialog
    }
  };

  if (!mounted || !open) return null;

  const listId = `${uid}-list`;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]" onKeyDown={onKeyDown}>
      <style>{CSS}</style>

      <div
        aria-hidden="true"
        onClick={onClose}
        className="sd-overlay absolute inset-0 bg-zinc-950/35 backdrop-blur-[3px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search components"
        className="sd-panel relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]"
      >
        {/* input */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Search aria-hidden="true" className="size-4 shrink-0 text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${uid}-opt-${active}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Search components…"
            className="min-w-0 flex-1 bg-transparent text-[14.5px] text-zinc-900 outline-none placeholder:text-zinc-400"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActive(0);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="flex size-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono-code text-[10.5px] text-zinc-500">Esc</kbd>
          )}
        </div>

        {/* results */}
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {results.length > 0 ? (
            <>
              <div className="px-2.5 pb-1.5 pt-1 font-mono-code text-[10px] uppercase tracking-widest text-zinc-400">
                {query.trim() ? `${results.length} result${results.length === 1 ? "" : "s"}` : "All components"}
              </div>
              <ul ref={listRef} id={listId} role="listbox" aria-label="Components" className="space-y-0.5">
                {results.map(({ item }, i) => {
                  const isActive = i === active;
                  return (
                    <li
                      key={item.slug}
                      id={`${uid}-opt-${i}`}
                      role="option"
                      aria-selected={isActive}
                      data-index={i}
                      onMouseMove={() => active !== i && setActive(i)}
                      onClick={() => go(item.slug)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 transition-colors duration-100",
                        isActive ? "bg-zinc-100" : "bg-transparent"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-semibold",
                          tintFor(item.category)
                        )}
                      >
                        {item.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-zinc-900">
                          <Highlight text={item.name} query={query} />
                        </span>
                        <span className="block truncate text-[12px] text-zinc-500">
                          {item.category} · {item.description}
                        </span>
                      </span>
                      <CornerDownLeft
                        aria-hidden="true"
                        className={cn(
                          "size-3.5 shrink-0 text-zinc-400 transition-opacity duration-150",
                          isActive ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                <SearchX className="size-4" />
              </span>
              <p className="text-[14px] font-medium text-zinc-900">No results for “{query.trim()}”</p>
              <p className="text-[12.5px] text-zinc-500">Try a component name or a category.</p>
            </div>
          )}
        </div>

        {/* hints */}
        <div className="hidden items-center justify-between gap-3 bg-zinc-50 px-4 py-2 text-[11px] text-zinc-500 sm:flex">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-white px-1.5 py-0.5 font-mono-code shadow-sm">↑</kbd>
              <kbd className="rounded bg-white px-1.5 py-0.5 font-mono-code shadow-sm">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded bg-white px-1.5 py-0.5 font-mono-code shadow-sm">↵</kbd>
              open
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-white px-1.5 py-0.5 font-mono-code shadow-sm">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
});