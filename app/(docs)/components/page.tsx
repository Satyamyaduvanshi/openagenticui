// app/(docs)/components/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, SearchX, X } from "lucide-react";
import { REGISTRY } from "@/lib/registry";
import { cn } from "@/lib/cn";
import { DocsNavbar } from "@/app/_shared/docs-navbar";
import { DocsLeftSidebar } from "@/app/_shared/docs-left-sidebar";
import { DocsRightSidebar } from "@/app/_shared/docs-right-sidebar";
import { InkTitle } from "@/app/_shared/ink-title";

/* ------------------------------------------------------------------ */
/*  Static data (computed once at module load, never per render)       */
/* ------------------------------------------------------------------ */

const TINTS = [
  "bg-sky-50 text-sky-700 ring-sky-100",
  "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "bg-amber-50 text-amber-700 ring-amber-100",
  "bg-violet-50 text-violet-700 ring-violet-100",
  "bg-rose-50 text-rose-700 ring-rose-100",
] as const;

const CATEGORIES = Array.from(new Set(REGISTRY.map((i) => i.category)));
const TINT_BY_CATEGORY = new Map(CATEGORIES.map((c, i) => [c, TINTS[i % TINTS.length]]));
const COUNT_BY_CATEGORY = new Map(
  CATEGORIES.map((c) => [c, REGISTRY.filter((i) => i.category === c).length])
);

const TOC_ITEMS = [
  { id: "overview", title: "Overview", subtitle: "Open source library intro" },
  { id: "directory", title: "Components", subtitle: `${REGISTRY.length} available to open` },
];

const CSS = `
@keyframes idx-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.idx-card { animation: idx-in 520ms cubic-bezier(.22,1,.36,1) both; }
@media (prefers-reduced-motion: reduce) { .idx-card { animation: none; } }
`;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ComponentsIndexPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");

  const query = search.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      REGISTRY.filter(
        (item) =>
          (category === "All" || item.category === category) &&
          (!query ||
            item.name.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query))
      ),
    [query, category]
  );

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#171717]">
      <DocsNavbar />

      <div className="flex">
        <DocsLeftSidebar />

        <main className="mb-3 min-w-0 flex-1 rounded-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_50px_-30px_rgba(0,0,0,0.2)]">
        <div className="mx-auto w-full max-w-5xl space-y-12 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <style>{CSS}</style>

          {/* INTRO */}
          <div id="overview" className="relative isolate scroll-mt-24 space-y-5">
            <div
              aria-hidden="true"
              className="absolute -inset-x-6 -top-8 -z-10 h-56 [background-image:radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
            />

            <div className="font-mono-code text-[10.5px] uppercase tracking-widest text-zinc-400">
              Components / Docs
            </div>

            <InkTitle
              text="All available components"
              className="font-editorial text-[38px] leading-[1.1] text-zinc-900 sm:text-[48px]"
            />

            <p className="max-w-xl text-[15px] leading-relaxed text-zinc-500">
              Explore <strong className="font-semibold text-zinc-900">{REGISTRY.length}</strong> polished React and
              Next.js agentic components. Pick what you need,{" "}
              <span className="relative isolate whitespace-nowrap text-zinc-800">
                <span
                  aria-hidden="true"
                  className="absolute -inset-x-1 bottom-0.5 -z-10 h-2.5 -rotate-1 rounded-sm bg-rose-300/50"
                />
                copy the code
              </span>
              , and make it yours.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono-code text-[10.5px] uppercase tracking-widest text-zinc-500">
              {[
                `${REGISTRY.length} components`,
                `${CATEGORIES.length} categories`,
                "MIT licensed",
              ].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1"
                >
                  <span aria-hidden="true" className="size-1 rounded-full bg-zinc-400" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* DIRECTORY */}
          <section id="directory" className="scroll-mt-24 space-y-5">
            <header className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="relative isolate inline-block font-editorial text-2xl text-zinc-900">
                <span
                  aria-hidden="true"
                  className="absolute -inset-x-1.5 bottom-0.5 -z-10 h-3 -rotate-1 rounded-sm bg-teal-300/50"
                />
                Components
              </h2>

              <div className="flex items-center gap-2 text-[12px] text-zinc-400" aria-live="polite">
                <span>
                  Showing <span className="font-medium text-zinc-700">{filtered.length}</span> of {REGISTRY.length}
                </span>
                {query && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 transition-colors hover:bg-zinc-200/70 hover:text-zinc-900"
                  >
                    “{search.trim()}”
                    <X className="size-3" />
                  </button>
                )}
              </div>
            </header>

            {/* filter input */}
            <label className="group flex h-10 items-center gap-2.5 rounded-xl bg-zinc-100/80 px-3.5 text-zinc-400 transition-all duration-200 focus-within:bg-white focus-within:text-zinc-700 focus-within:shadow-[0_0_0_2px_rgba(24,24,27,0.12)]">
              <Search aria-hidden="true" className="size-4 shrink-0" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter components…"
                aria-label="Filter components"
                className="min-w-0 flex-1 bg-transparent text-[13.5px] text-zinc-900 outline-none placeholder:text-zinc-400 [&::-webkit-search-cancel-button]:hidden"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear filter"
                  className="flex size-5 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </label>

            {/* category filter */}
            <div
              role="group"
              aria-label="Filter by category"
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {["All", ...CATEGORIES].map((c) => {
                const active = c === category;
                const count = c === "All" ? REGISTRY.length : COUNT_BY_CATEGORY.get(c);
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(c)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all duration-200 active:scale-95",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
                      active
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-900"
                    )}
                  >
                    {c}
                    <span
                      className={cn(
                        "font-mono-code text-[10.5px] transition-colors",
                        active ? "text-white/60" : "text-zinc-300"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* cards */}
            {filtered.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.map((item, i) => {
                  const tint = TINT_BY_CATEGORY.get(item.category) ?? TINTS[0];
                  return (
                    <Link
                      key={item.slug}
                      href={`/components/${item.slug}`}
                      style={{ animationDelay: `${Math.min(i, 10) * 45}ms` }}
                      className={cn(
                        "idx-card group relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-zinc-50 p-4",
                        "transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-100/80 hover:shadow-[0_14px_30px_-18px_rgba(0,0,0,0.3)]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />

                      <div className="relative flex items-start justify-between">
                        <span
                          className={cn(
                            "flex size-9 items-center justify-center rounded-xl text-[14px] font-semibold ring-1 ring-inset",
                            tint
                          )}
                        >
                          {item.name.charAt(0).toUpperCase()}
                        </span>
                        <ArrowUpRight className="size-4 text-zinc-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-800" />
                      </div>

                      <div className="relative space-y-1">
                        <h3 className="text-[14.5px] font-semibold text-zinc-900">{item.name}</h3>
                        <p className="line-clamp-2 text-[12.5px] leading-relaxed text-zinc-500">{item.description}</p>
                      </div>

                      <span className="relative mt-auto pt-1 font-mono-code text-[10px] uppercase tracking-widest text-zinc-400">
                        {item.category}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-zinc-50 px-6 py-14 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-white text-zinc-400">
                  <SearchX className="size-4" />
                </span>
                <div>
                  <p className="text-[14px] font-medium text-zinc-900">No components match</p>
                  <p className="mt-1 text-[12.5px] text-zinc-500">Try a different keyword or category.</p>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full bg-zinc-900 px-3.5 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-zinc-800"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </div>
        </main>

        <DocsRightSidebar items={TOC_ITEMS} />
      </div>
    </div>
  );
}