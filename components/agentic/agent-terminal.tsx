"use client";

import React from "react";
import { Terminal, Copy, Check, X, AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export interface AgentTerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  command: string;
  logs: string[];
  /** When true the terminal "works live": lines are typed out one by one with a status indicator. */
  isRunning?: boolean;
  /** Replay the typing sequence forever while running (nice for demos / docs previews). */
  loop?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Log parsing: a leading ✔ ✖ ⚠ → › > becomes a status icon           */
/* ------------------------------------------------------------------ */

type Kind = "success" | "error" | "warn" | "info" | "plain";

// Monochrome: hierarchy comes from brightness and icon shape, never from hue.
const KIND_TEXT: Record<Kind, string> = {
  success: "text-[#F4F2EA]",
  error: "text-[#F4F2EA]",
  warn: "text-[#B8B6AC]",
  info: "text-[#B8B6AC]",
  plain: "text-[#A5A39A]",
};

function parseLine(line: string): { kind: Kind; text: string } {
  const m = line.match(/^\s*(✔|✓|√|✖|✗|×|⚠|›|→|>)\s*(.*)$/);
  if (!m) return { kind: "plain", text: line };
  const g = m[1];
  const kind: Kind = "✔✓√".includes(g) ? "success" : "✖✗×".includes(g) ? "error" : g === "⚠" ? "warn" : "info";
  return { kind, text: m[2] };
}

function StatusIcon({ kind }: { kind: Kind }) {
  const cls = "size-3.5 shrink-0";
  switch (kind) {
    case "success":
      return <Check strokeWidth={2.75} className={cls} />;
    case "error":
      return <X strokeWidth={2.75} className={cls} />;
    case "warn":
      return <AlertTriangle strokeWidth={2.25} className={cls} />;
    case "info":
      return <ChevronRight strokeWidth={2.5} className={cls} />;
    default:
      return <span aria-hidden="true" className="mx-[5px] size-1 shrink-0 rounded-full bg-current opacity-50" />;
  }
}

const PHASES = ["Thinking", "Reading files", "Running checks", "Verifying output"];

const CSS = `
@keyframes agt-line { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
@keyframes agt-shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
@keyframes agt-caret { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes agt-pop { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.25); opacity: 1; } 100% { transform: scale(1); } }
@keyframes agt-phase { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
@keyframes agt-dots { 0%, 20% { content: ""; } 40% { content: "."; } 60% { content: ".."; } 80%, 100% { content: "..."; } }
.agt-line { animation: agt-line 380ms cubic-bezier(.22,1,.36,1) both; }
.agt-shimmer { animation: agt-shimmer 1.6s linear infinite; }
.agt-caret { animation: agt-caret 1s steps(1) infinite; }
.agt-pop { animation: agt-pop 360ms cubic-bezier(.22,1,.36,1) both; }
.agt-phase { animation: agt-phase 420ms cubic-bezier(.22,1,.36,1) both; }
.agt-dots::after { content: ""; animation: agt-dots 1.4s steps(1) infinite; }
@media (prefers-reduced-motion: reduce) {
  .agt-line, .agt-shimmer, .agt-caret, .agt-pop, .agt-phase, .agt-dots::after { animation: none; }
}
`;

const pad = (n: number) => String(n).padStart(2, "0");

const CHAR_DELAY_MS = 22; // typing speed
const LINE_PAUSE_MS = 380; // pause after a line finishes
const LOOP_PAUSE_MS = 2600; // pause before replaying

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const AgentTerminal = React.forwardRef<HTMLDivElement, AgentTerminalProps>(
  ({ command, logs, isRunning = false, loop = false, className, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);
    const [elapsed, setElapsed] = React.useState(0);
    const [phase, setPhase] = React.useState(0);
    const [typed, setTyped] = React.useState({ line: 0, chars: 0 });
    const [reduced, setReduced] = React.useState(false);
    const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const bodyRef = React.useRef<HTMLDivElement>(null);

    const parsed = React.useMemo(() => logs.map(parseLine), [logs]);
    const typing = isRunning && !reduced;

    React.useEffect(() => {
      setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }, []);

    // restart the sequence whenever a run begins
    React.useEffect(() => {
      if (isRunning) setTyped({ line: 0, chars: 0 });
    }, [isRunning]);

    // typewriter state machine (one timeout at a time, always cleaned up)
    React.useEffect(() => {
      if (!typing) return;
      const { line, chars } = typed;

      if (line >= parsed.length) {
        if (!loop) return;
        const t = setTimeout(() => setTyped({ line: 0, chars: 0 }), LOOP_PAUSE_MS);
        return () => clearTimeout(t);
      }

      const target = parsed[line].text.length;
      const step = target > 60 ? 3 : 2;
      const t = setTimeout(
        () => setTyped(chars < target ? { line, chars: Math.min(target, chars + step) } : { line: line + 1, chars: 0 }),
        chars < target ? CHAR_DELAY_MS : LINE_PAUSE_MS
      );
      return () => clearTimeout(t);
    }, [typing, typed, parsed, loop]);

    // elapsed clock + rotating "what the agent is doing" label
    React.useEffect(() => {
      if (!isRunning) return;
      setElapsed(0);
      const clock = setInterval(() => setElapsed((s) => s + 1), 1000);
      const words = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), 2400);
      return () => {
        clearInterval(clock);
        clearInterval(words);
      };
    }, [isRunning]);

    // keep the newest output in view while typing
    React.useEffect(() => {
      const el = bodyRef.current;
      if (typing && el) el.scrollTop = el.scrollHeight;
    }, [typing, typed]);

    React.useEffect(
      () => () => {
        if (copyTimer.current) clearTimeout(copyTimer.current);
      },
      []
    );

    const copyLogs = async () => {
      try {
        await navigator.clipboard.writeText([`$ ${command}`, ...logs].join("\n"));
      } catch {
        return;
      }
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1800);
    };

    const clock = `${pad(Math.floor(elapsed / 60))}:${pad(elapsed % 60)}`;
    const lastShown = typing ? Math.min(typed.line, parsed.length - 1) : parsed.length - 1;
    const step = Math.min(typed.line + 1, parsed.length);

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full max-w-xl overflow-hidden rounded-2xl bg-[#1D1D1D] text-[#D8D6CE]",
          "shadow-[0_24px_50px_-28px_rgba(0,0,0,0.55)] transition-shadow duration-500",
          isRunning && "ring-1 ring-white/10",
          className
        )}
        {...props}
      >
        <style>{CSS}</style>

        {/* working shimmer */}
        {isRunning && (
          <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-[2px] overflow-hidden">
            <div className="agt-shimmer h-full w-full bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          </div>
        )}

        {/* title bar */}
        <div className="flex items-center justify-between gap-3 bg-[#232323] py-2.5 pl-4 pr-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
              <span className={cn("size-2.5 rounded-full", isRunning ? "animate-pulse bg-[#D8D6CE]" : "bg-[#3A3A36]")} />
              <span className="size-2.5 rounded-full bg-[#3A3A36]" />
              <span className="size-2.5 rounded-full bg-[#3A3A36]" />
            </span>

            <span className="flex min-w-0 items-center gap-2 rounded-md bg-[#1D1D1D] px-2.5 py-1">
              <Terminal className="size-3.5 shrink-0 text-[#A5A39A]" />
              <span className="truncate font-mono text-[11.5px] font-medium text-[#C9C7BE]">{command}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={copyLogs}
            aria-label={copied ? "Logs copied" : "Copy logs"}
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[11.5px] font-medium transition-all duration-200 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
              copied ? "bg-white/10 text-white" : "text-[#C9C7BE] hover:bg-white/10 hover:text-white"
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

        {/* output */}
        <div
          ref={bodyRef}
          role="log"
          aria-live="off"
          aria-busy={isRunning}
          className="max-h-72 min-h-[11rem] space-y-1.5 overflow-y-auto px-4 py-4 font-mono text-[12px] leading-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* prompt */}
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="w-5 shrink-0" />
            <span className="min-w-0 break-all">
              <span aria-hidden="true" className="mr-2 select-none font-semibold text-[#F4F2EA]">❯</span>
              <span className="text-[#F4F2EA]">{command}</span>
            </span>
          </div>

          {parsed.slice(0, lastShown + 1).map((line, idx) => {
            const inProgress = typing && idx === typed.line && typed.line < parsed.length;
            const text = inProgress ? line.text.slice(0, typed.chars) : line.text;
            return (
              <div
                key={idx}
                className="agt-line flex items-start gap-3"
                style={!isRunning ? { animationDelay: `${Math.min(idx, 12) * 90}ms` } : undefined}
              >
                <span aria-hidden="true" className="w-5 shrink-0 select-none text-right text-[#55554F]">
                  {pad(idx + 1)}
                </span>
                <span
                  className={cn(
                    "flex min-w-0 items-start gap-2 transition-colors duration-300",
                    inProgress ? "text-[#8F8D84]" : KIND_TEXT[line.kind]
                  )}
                >
                  <span className="mt-[5px] flex h-3.5 items-center">
                    {inProgress ? (
                      <StatusIcon kind="plain" />
                    ) : (
                      <span className={cn("flex", isRunning && "agt-pop")}>
                        <StatusIcon kind={line.kind} />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 break-words">
                    {text}
                    {inProgress && (
                      <span
                        aria-hidden="true"
                        className="agt-caret ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-[#F4F2EA]"
                      />
                    )}
                  </span>
                </span>
              </div>
            );
          })}

          {/* "agent is working" line */}
          {isRunning && (
            <div className="flex items-center gap-3 pt-1.5">
              <span aria-hidden="true" className="w-5 shrink-0" />
              <span className="flex items-center gap-2 text-[#C9C7BE]">
                <Loader2 className="size-3.5 animate-spin" />
                <span key={phase} className="agt-phase agt-dots font-medium">
                  {PHASES[phase]}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* status bar */}
        <div className="flex items-center justify-between gap-3 bg-[#202020] px-4 py-2 font-mono text-[10.5px] text-[#77776F]">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn("size-1.5 rounded-full", isRunning ? "animate-pulse bg-[#F4F2EA]" : "bg-[#77776F]")}
            />
            {isRunning ? "Agent working" : "Completed"}
          </span>
          <span className="flex items-center gap-3 tabular-nums">
            <span>{isRunning ? `Step ${Math.max(step, 1)}/${Math.max(parsed.length, 1)}` : `${logs.length} lines`}</span>
            <span aria-hidden="true" className="h-3 w-px bg-white/10" />
            <span>{isRunning ? clock : "exit 0"}</span>
          </span>
        </div>
      </div>
    );
  }
);
AgentTerminal.displayName = "AgentTerminal";