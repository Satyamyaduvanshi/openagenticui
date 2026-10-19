// app/_shared/component-actions.tsx
"use client";

import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown, Copy, FileCode2 } from "lucide-react";
import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/*  Context: source code is sent to the client ONCE and shared by all consumers */
/* -------------------------------------------------------------------------- */

export type ComponentMeta = {
  name: string;
  description: string;
  category: string;
  filePath: string;
  sourceCode: string;
};

const MetaContext = createContext<ComponentMeta | null>(null);

export function ComponentMetaProvider({
  name,
  description,
  category,
  filePath,
  sourceCode,
  children,
}: ComponentMeta & { children: React.ReactNode }) {
  const value = useMemo(
    () => ({ name, description, category, filePath, sourceCode }),
    [name, description, category, filePath, sourceCode]
  );
  return <MetaContext.Provider value={value}>{children}</MetaContext.Provider>;
}

function useMeta() {
  const v = useContext(MetaContext);
  if (!v) throw new Error("Wrap in <ComponentMetaProvider>");
  return v;
}

/* -------------------------------------------------------------------------- */
/*  Copy hook (timer is always cleaned up)                                     */
/* -------------------------------------------------------------------------- */

function useCopy(resetMs = 1800) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Fallback for insecure contexts / older browsers
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
        } finally {
          document.body.removeChild(ta);
        }
      }
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetMs);
    },
    [resetMs]
  );

  return { copied, copy };
}

/* -------------------------------------------------------------------------- */
/*  AI logos (simplified marks — swap the SVG bodies for official assets if    */
/*  you need pixel-perfect brand rendering)                                    */
/* -------------------------------------------------------------------------- */

type LogoProps = { className?: string };

const CLAUDE_RAYS = Array.from({ length: 12 }, (_, i) => i);
const GPT_PETALS = [0, 60, 120, 180, 240, 300];

const ClaudeLogo = ({ className }: LogoProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#D97757" strokeWidth="2.2" strokeLinecap="round" className={className}>
    {CLAUDE_RAYS.map((i) => (
      <path key={i} d={i % 2 ? "M12 4.4v4.1" : "M12 2.4v6.1"} transform={`rotate(${i * 30} 12 12)`} />
    ))}
  </svg>
);

const ChatGPTLogo = ({ className }: LogoProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#10A37F" strokeWidth="1.5" className={className}>
    {GPT_PETALS.map((r) => (
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

/** Smoothly cross-fades Claude → ChatGPT → Gemini → Cursor (blur + scale + slide). */
const AiLogoRotator = memo(function AiLogoRotator() {
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
    <span aria-hidden="true" className="relative block size-4">
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
          <Logo className="size-4" />
        </span>
      ))}
    </span>
  );
});

/* -------------------------------------------------------------------------- */
/*  Buttons                                                                    */
/* -------------------------------------------------------------------------- */

function buildAiPrompt(m: ComponentMeta) {
  return [
    `Add the "${m.name}" component (${m.category}) to my Next.js + React + Tailwind CSS project.`,
    "",
    m.description,
    "",
    `File path: ${m.filePath}`,
    "",
    "```tsx",
    m.sourceCode.trimEnd(),
    "```",
    "",
    "Instructions:",
    "- Create the file at the path above (adapt import aliases to my project).",
    "- Keep \"use client\" if the code uses hooks or browser APIs.",
    "- List any packages I still need to install.",
    "- Finish with a minimal usage example.",
  ].join("\n");
}

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

export const CopyForAIButton = memo(function CopyForAIButton() {
  const meta = useMeta();
  const { copied, copy } = useCopy();

  return (
    <button
      type="button"
      onClick={() => copy(buildAiPrompt(meta))}
      className={cn(
        "inline-flex h-10 flex-1 items-center justify-center gap-2.5 rounded-xl bg-zinc-900 pl-2 pr-4 text-[13px] font-medium text-white",
        "shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_8px_18px_-8px_rgba(0,0,0,.5)]",
        "transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98] sm:min-w-[10rem] sm:flex-none",
        FOCUS
      )}
    >
      <span className="relative grid size-6 shrink-0 place-items-center rounded-lg bg-white">
        <span
          className={cn(
            "absolute inset-0 grid place-items-center transition-all duration-300",
            copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
          )}
        >
          <AiLogoRotator />
        </span>
        <Check
          strokeWidth={2.75}
          className={cn(
            "absolute size-3.5 text-emerald-600 transition-all duration-300",
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </span>
      <span>{copied ? "Copied!" : "Copy for AI"}</span>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Prompt copied to clipboard" : ""}
      </span>
    </button>
  );
});

export const CopyCodeButton = memo(function CopyCodeButton({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { sourceCode } = useMeta();
  const { copied, copy } = useCopy();
  const dark = variant === "dark";

  return (
    <button
      type="button"
      onClick={() => copy(sourceCode)}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.98]",
        dark
          ? "h-7 rounded-md px-2.5 text-[11.5px] text-zinc-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          : cn(
              "h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-4 text-[13px] text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 sm:flex-none",
              FOCUS
            )
      )}
    >
      <span className={cn("relative block", dark ? "size-3.5" : "size-4")}>
        <Copy
          className={cn(
            "absolute inset-0 size-full transition-all duration-300",
            copied ? "scale-50 opacity-0" : "scale-100 opacity-100"
          )}
        />
        <Check
          strokeWidth={2.5}
          className={cn(
            "absolute inset-0 size-full text-emerald-500 transition-all duration-300",
            copied ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </span>
      <span>{copied ? "Copied!" : "Copy code"}</span>
    </button>
  );
});

export function ComponentToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <CopyForAIButton />
      <CopyCodeButton />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Code panel                                                                 */
/* -------------------------------------------------------------------------- */

const COLLAPSE_AFTER_LINES = 24;

export const CodePanel = memo(function CodePanel() {
  const { sourceCode, filePath } = useMeta();
  const [open, setOpen] = useState(false);
  const lines = useMemo(() => sourceCode.split("\n").length, [sourceCode]);
  const collapsible = lines > COLLAPSE_AFTER_LINES;
  const collapsed = collapsible && !open;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-zinc-900/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2 text-zinc-400">
          <FileCode2 className="size-3.5 shrink-0" />
          <span className="truncate font-mono-code text-[11.5px]">{filePath}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="hidden font-mono-code text-[10.5px] text-zinc-500 sm:inline">{lines} lines</span>
          <CopyCodeButton variant="dark" />
        </div>
      </div>

      <div className="relative">
        <pre
          tabIndex={0}
          className={cn(
            "overflow-x-auto px-5 py-4 font-mono-code text-[12.5px] leading-6 text-zinc-300 transition-[max-height] duration-500 ease-out focus-visible:outline-none",
            collapsed ? "max-h-[26rem] overflow-y-hidden" : "max-h-[44rem] overflow-y-auto"
          )}
        >
          <code>{sourceCode}</code>
        </pre>

        {collapsed && (
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pb-4 pt-24">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[12px] font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              Show all {lines} lines
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {collapsible && open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-white/10 py-2 text-[12px] text-zinc-400 transition-colors hover:text-white"
        >
          Collapse
          <ChevronDown className="size-3.5 rotate-180" />
        </button>
      )}
    </div>
  );
});