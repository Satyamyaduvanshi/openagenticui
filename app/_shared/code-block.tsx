// app/_shared/code-block.tsx
"use client";

import React, { memo, useMemo, useState } from "react";
import { Check, ChevronDown, Copy, FileCode2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { highlightLines } from "@/app/_shared/highlight";
import { useCopy } from "@/app/_shared/use-copy";

/* ----------------------------- icon button ----------------------------- */

/** Small square copy button. Icon swaps with a scale/fade animation. */
export const CopyIconButton = memo(function CopyIconButton({
  text,
  tone = "light",
}: {
  text: string;
  tone?: "light" | "dark";
}) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      title={copied ? "Copied!" : "Copy"}
      className={cn(
        "relative inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors duration-200",
        tone === "dark"
          ? "text-zinc-400 hover:bg-white/10 hover:text-white"
          : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
      )}
    >
      <Copy
        className={cn(
          "absolute size-3.5 transition-all duration-300",
          copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
        )}
      />
      <Check
        strokeWidth={2.5}
        className={cn(
          "absolute size-3.5 text-emerald-500 transition-all duration-300",
          copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
        )}
      />
    </button>
  );
});

/* --------------------------- install command tabs ------------------------- */

const PACKAGE_MANAGERS = [
  { id: "npm", cmd: "npm install" },
  { id: "pnpm", cmd: "pnpm add" },
  { id: "yarn", cmd: "yarn add" },
  { id: "bun", cmd: "bun add" },
] as const;

type PackageManagerId = (typeof PACKAGE_MANAGERS)[number]["id"];

export const InstallCommand = memo(function InstallCommand({ packages }: { packages: string }) {
  const [pm, setPm] = useState<PackageManagerId>("npm");
  const full = `${PACKAGE_MANAGERS.find((p) => p.id === pm)!.cmd} ${packages}`;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <div
        role="tablist"
        aria-label="Package manager"
        className="flex items-center gap-0.5 px-2 pt-1.5"
      >
        {PACKAGE_MANAGERS.map((p) => {
          const active = p.id === pm;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPm(p.id)}
              className={cn(
                "relative px-2.5 py-1.5 font-mono-code text-[11px] transition-colors duration-200",
                "after:absolute after:inset-x-1.5 after:-bottom-px after:h-px after:origin-center after:bg-zinc-900 after:transition-transform after:duration-300",
                active ? "text-zinc-900 after:scale-x-100" : "text-zinc-400 after:scale-x-0 hover:text-zinc-700"
              )}
            >
              {p.id}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 py-1.5 pl-3.5 pr-1.5 font-mono-code text-[11.5px] text-zinc-700">
        <span className="min-w-0 overflow-x-auto whitespace-nowrap py-1 [scrollbar-width:none]">
          <span aria-hidden="true" className="mr-2 select-none text-zinc-300">
            $
          </span>
          {full}
        </span>
        <CopyIconButton text={full} />
      </div>
    </div>
  );
});

/* ------------------------------- code block ------------------------------ */

const LINE_HEIGHT_REM = 1.5; // leading-6
const CHROME_REM = 3; // py-4 (2rem) + slack for a horizontal scrollbar
const MAX_LINES = 44;

export const CodeBlock = memo(function CodeBlock({
  code,
  filename,
  lang = "tsx",
  lineNumbers = true,
  collapsible = true,
  collapsedLines = 22,
  wrap = false,
  className,
}: {
  code: string;
  filename: string;
  lang?: string;
  lineNumbers?: boolean;
  collapsible?: boolean;
  collapsedLines?: number;
  /** Soft-wrap long lines instead of scrolling sideways (good for short snippets). */
  wrap?: boolean;
  className?: string;
}) {
  const { copied, copy } = useCopy();
  const [open, setOpen] = useState(false);

  const trimmed = useMemo(() => code.replace(/\s+$/, ""), [code]);
  const lines = useMemo(() => highlightLines(trimmed), [trimmed]);

  const total = lines.length;
  const canCollapse = collapsible && total > collapsedLines + 6;
  const collapsed = canCollapse && !open;

  // Only constrain height when we actually need to (collapsed, or very long files).
  // Short blocks get NO max-height, so no stray vertical scrollbar can appear.
  let maxHeight: string | undefined;
  if (collapsed) maxHeight = `${collapsedLines * LINE_HEIGHT_REM + CHROME_REM}rem`;
  else if (total > MAX_LINES) maxHeight = `${MAX_LINES * LINE_HEIGHT_REM + CHROME_REM}rem`;

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-2xl bg-[#1D1D1D] text-[#D8D6CE]",
        "shadow-[0_12px_32px_-14px_rgba(0,0,0,0.45)]",
        className
      )}
    >
      {/* header */}
      <figcaption className="flex items-center justify-between gap-3 bg-[#232323] py-2 pl-4 pr-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <FileCode2 aria-hidden="true" className="size-3.5 shrink-0 text-[#77776F]" />
          <span className="truncate font-mono-code text-[11.5px] text-[#A5A39A]">{filename}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono-code text-[10px] uppercase tracking-wider text-[#77776F] sm:inline">
            {lang}
          </span>

          <button
            type="button"
            onClick={() => copy(trimmed)}
            aria-label={copied ? "Copied" : `Copy ${filename}`}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11.5px] font-medium transition-all duration-200 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
              copied ? "bg-[#A9D6A0]/15 text-[#A9D6A0]" : "text-[#C9C7BE] hover:bg-white/10 hover:text-white"
            )}
          >
            <span className="relative block size-3.5">
              <Copy
                className={cn(
                  "absolute inset-0 size-full transition-all duration-300",
                  copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
                )}
              />
              <Check
                strokeWidth={2.5}
                className={cn(
                  "absolute inset-0 size-full transition-all duration-300",
                  copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
                )}
              />
            </span>
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </figcaption>

      {/* body */}
      <div className="relative">
        <pre
          tabIndex={0}
          style={maxHeight ? { maxHeight } : undefined}
          className={cn(
            "py-4 font-mono-code text-[12.5px] leading-6 transition-[max-height] duration-500 ease-out focus-visible:outline-none",
            // scrolling still works (trackpad / touch / shift+wheel) but the bars are hidden
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            wrap ? "overflow-x-hidden" : "overflow-x-auto",
            collapsed ? "overflow-y-hidden" : "overflow-y-auto"
          )}
        >
          <code className={cn("block [counter-reset:line]", wrap ? "whitespace-pre-wrap break-words" : "min-w-max")}>
            {lines.map((line, li) => (
              <span
                key={li}
                className={cn(
                  "block min-h-[1.5rem] px-4",
                  lineNumbers &&
                    "before:mr-5 before:inline-block before:w-6 before:select-none before:text-right before:text-[#55554F] before:content-[counter(line)] before:[counter-increment:line]"
                )}
              >
                {line.map((tok, k) =>
                  tok.c ? (
                    <span key={k} className={tok.c}>
                      {tok.t}
                    </span>
                  ) : (
                    tok.t
                  )
                )}
              </span>
            ))}
          </code>
        </pre>

        {collapsed && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-[#1D1D1D] via-[#1D1D1D]/90 to-transparent pb-4 pt-24">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[12px] font-medium text-[#EFEDE4] backdrop-blur transition-colors hover:bg-white/20"
            >
              Show all {total} lines
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {canCollapse && open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex w-full items-center justify-center gap-1.5 bg-[#202020] py-2 text-[12px] text-[#77776F] transition-colors hover:text-white"
        >
          Collapse
          <ChevronDown className="size-3.5 rotate-180" />
        </button>
      )}
    </figure>
  );
});