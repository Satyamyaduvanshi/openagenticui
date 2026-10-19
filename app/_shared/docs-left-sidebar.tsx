// app/_shared/docs-left-sidebar.tsx
"use client";

import React, { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, LayoutGrid, MessageCircle, type LucideIcon } from "lucide-react";
import { getGroupedCategories } from "@/lib/registry";
import { SITE_CONFIG } from "@/lib/site";
import { cn } from "@/lib/cn";
import { REACH_URL, SPONSOR_URL } from "@/app/_shared/links";

// Computed once at module load; route changes never re-run grouping.
const CATEGORIES = getGroupedCategories();

// Static data, created once (no per-render allocations).
// Both icons come from the same icon set => same grid, same stroke, same optical size.
const GETTING_STARTED: ReadonlyArray<{ href: string; label: string; Icon: LucideIcon }> = [
  { href: "/", label: "Home", Icon: House },
  { href: "/components", label: "All components", Icon: LayoutGrid },
];

// The scrollbar is invisible until you hover the sidebar, then it fades in as a slim rounded pill.
const SCROLL_CSS = `
.sb-scroll::-webkit-scrollbar { width: 10px; }
.sb-scroll::-webkit-scrollbar-track { background: transparent; }
.sb-scroll::-webkit-scrollbar-thumb {
  background-color: transparent; border-radius: 9999px;
  border: 3px solid transparent; background-clip: padding-box;
  transition: background-color .25s ease;
}
.sb-scroll:hover::-webkit-scrollbar-thumb { background-color: rgba(24,24,27,.22); }
.sb-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(24,24,27,.45); }
@supports (-moz-appearance: none) {
  .sb-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
  .sb-scroll:hover { scrollbar-color: rgba(24,24,27,.3) transparent; }
}
`;

const NavLink = memo(function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        // fixed height + items-center => icon and text share the same center line
        "group -mx-2.5 flex h-8 items-center gap-2.5 rounded-lg px-2.5 transition-all duration-200 ease-out",
        active
          ? "bg-white font-semibold text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
          : "font-normal text-zinc-500 hover:bg-white/70 hover:text-zinc-800"
      )}
    >
      {/* Fixed 16x16 slot + 16px line-height label => identical heights, centered together */}
      <Icon
        size={16}
        strokeWidth={1.75}
        aria-hidden="true"
        className={cn(
          "shrink-0 transition-transform duration-200 group-hover:scale-105",
          active ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-700"
        )}
      />
      <span className="truncate text-[13.5px] leading-4">{label}</span>
    </Link>
  );
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-zinc-400/75">
    {children}
  </div>
);

export const DocsLeftSidebar = memo(function DocsLeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-72 shrink-0 flex-col justify-between select-none md:flex lg:w-80">
      <style>{SCROLL_CSS}</style>
      {/* Scrollable navigation */}
      <div className="sb-scroll flex-1 space-y-7 overflow-y-auto overscroll-contain px-6 py-6 lg:px-7">
        {/* GETTING STARTED */}
        <div>
          <SectionLabel>Getting Started</SectionLabel>
          <nav aria-label="Getting started" className="mt-3 space-y-0.5">
            {GETTING_STARTED.map(({ href, label, Icon }) => (
              <NavLink key={href} href={href} label={label} Icon={Icon} active={pathname === href} />
            ))}
          </nav>
        </div>

        {/* COMPONENTS */}
        <div>
          <SectionLabel>Components</SectionLabel>

          <div className="mt-3.5 space-y-6">
            {CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between text-[13.5px] font-medium text-zinc-500">
                  <span>{cat.name}</span>
                  <span className="font-mono text-[11px] font-normal text-zinc-300/90">
                    {cat.items.length}
                  </span>
                </div>

                <ul className="mt-2 space-y-0.5">
                  {cat.items.map((item) => {
                    const href = `/components/${item.slug}`;
                    const active = pathname === href;

                    return (
                      <li key={item.slug}>
                        <Link
                          href={href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "-mx-2.5 block rounded-lg px-2.5 py-1.5 text-[13px] leading-snug transition-all duration-200 ease-out",
                            active
                              ? "bg-white font-semibold text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                              : "font-normal text-zinc-500 hover:bg-white/70 hover:text-zinc-800"
                          )}
                        >
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-3.5 px-6 pb-5 pt-3 text-[12px] lg:px-7">
        <div className="space-y-1.5">
          <p className="leading-relaxed text-zinc-600">
            Yours to use at home or at work. MIT licensed, no attribution needed.
          </p>
          <p className="leading-relaxed text-zinc-400">
            Made by hand, one component at a time. If it saves you an afternoon, I&apos;d love to hear about it.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={REACH_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-white text-[12px] font-medium text-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-200 hover:text-zinc-950 hover:shadow-[0_6px_16px_-8px_rgba(0,0,0,0.25)] active:scale-[0.98]"
          >
            <MessageCircle aria-hidden="true" className="size-3.5" />
            Reach us
          </a>
          <a
            href={SPONSOR_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#262626] text-[12px] font-medium text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98]"
          >
            <Heart aria-hidden="true" className="size-3.5 transition-all duration-200 group-hover:fill-current" />
            Sponsor us
          </a>
        </div>

        <div className="text-[11px] text-zinc-400/80">© 2026 {SITE_CONFIG.name}</div>
      </div>
    </aside>
  );
});