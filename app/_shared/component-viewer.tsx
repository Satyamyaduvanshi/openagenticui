// app/_shared/component-viewer.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sun, Moon } from "lucide-react";
import { RegistryItem, REGISTRY, buildAIPrompt } from "@/lib/registry";
import { ReasoningTrace } from "@/components/reasoning/reasoning-trace";
import { ToolCallCard } from "@/components/tool-calling/tool-call-card";
import { HumanApprovalGate } from "@/components/approvals/human-approval-gate";
import { AgentTerminal } from "@/components/execution/agent-terminal";
import { ContextWindowMeter } from "@/components/telemetry/context-window-meter";

import { CodeBlock, InstallCommand } from "@/app/_shared/code-block";
import { CopyForAIButton } from "@/app/_shared/copy-for-ai";

const INSTALL_PACKAGES = "clsx tailwind-merge lucide-react";

const CN_HELPER_CODE = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`;

/* ------------------------------ live previews ------------------------------ */

function Preview({ slug }: { slug: string }) {
  switch (slug) {
    case "reasoning-trace":
      return (
        <ReasoningTrace
          isThinking={true}
          content={`1. Inspecting repository routes...\n2. Validating minimal paper-and-ink design tokens.\n3. Streaming deterministic TSX output...`}
        />
      );
    case "tool-call-card":
      return (
        <ToolCallCard
          toolName="search_codebase"
          args={{ query: "HumanApprovalGate", path: "components/agentic" }}
          result={{ matches: 1, file: "components/agentic/human-approval-gate.tsx", status: "ok" }}
        />
      );
    case "human-approval-gate":
      return (
        <HumanApprovalGate
          title="Production Database Schema Push"
          command="npx drizzle-kit push:pg --config=drizzle.config.ts"
          risk="high"
        />
      );
    case "agent-terminal":
      return (
        <AgentTerminal
          command="npm run verify:quick"
          logs={[
            "✔ ESLint passed with 0 warnings",
            "✔ TypeScript tsc --noEmit succeeded",
            "✔ Built 5 standalone OpenAgenticUI components",
          ]}
          isRunning={true}
          loop
        />
      );
    case "context-window-meter":
      return <ContextWindowMeter usedTokens={62400} maxTokens={128000} costUsd={0.021} />;
    default:
      return null;
  }
}

/* ------------------------------ quick-start steps ------------------------------ */

// Hand-drawn highlighter swipe behind the "Setup" heading (replaces the old squiggle).
const MARKER_CSS = `
@keyframes setup-marker { from { transform: scaleX(0) rotate(-1.2deg); } to { transform: scaleX(1) rotate(-1.2deg); } }
.setup-marker { transform-origin: left center; transform: rotate(-1.2deg); animation: setup-marker 700ms cubic-bezier(.22,1,.36,1) 150ms both; }
@media (prefers-reduced-motion: reduce) { .setup-marker { animation: none; } }
`;

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 py-6 first:pt-0 last:pb-0">
      <span aria-hidden="true" className="font-editorial text-[26px] leading-none text-zinc-300">
        {String(n).padStart(2, "0")}
      </span>
      <div className="min-w-0 space-y-3">
        <h4 className="text-[13px] font-semibold text-zinc-900">{title}</h4>
        {children}
      </div>
    </li>
  );
}

const stepText = "text-xs leading-relaxed text-zinc-500";
const inlineCode = "rounded bg-zinc-200/70 px-1.5 py-0.5 font-mono-code text-[11px] text-zinc-800";

/* ---------------------------------- viewer --------------------------------- */

export function ComponentViewer({ item, sourceCode }: { item: RegistryItem; sourceCode: string }) {
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const currentIndex = REGISTRY.findIndex((i) => i.slug === item.slug);
  const prevItem = currentIndex > 0 ? REGISTRY[currentIndex - 1] : null;
  const nextItem = currentIndex < REGISTRY.length - 1 ? REGISTRY[currentIndex + 1] : null;

  // Use the real exported symbol from the source (display names like "Agent Terminal Stream" differ).
  const componentTagName = useMemo(
    () =>
      sourceCode.match(/export\s+(?:const|function|class)\s+([A-Z]\w*)/)?.[1] ?? item.name.replace(/\s+/g, ""),
    [sourceCode, item.name]
  );
  const usageExample = `import { ${componentTagName} } from "@/${item.filePath.replace(".tsx", "")}";

export default function Example() {
  return <${componentTagName} />;
}`;

  return (
    <div className="space-y-14">
      {/* PREVIEW */}
      <section id="preview" className="scroll-mt-24 space-y-4">
        <h2 className="font-editorial text-2xl text-zinc-900">Preview</h2>

        <div
          className={`relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-2xl  sm:p-14 transition-colors duration-300 ${
            previewTheme === "dark" ? "dark border-white/5 bg-[#1c1c1c]" : "border-zinc-200 bg-white"
          }`}
        >
          {/* fine grid, faded toward the edges */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)] ${
              previewTheme === "dark"
                ? "[background-image:linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]"
                : "[background-image:linear-gradient(to_right,rgba(0,0,0,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.045)_1px,transparent_1px)]"
            }`}
          />

          <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono-code text-[10px] uppercase tracking-widest ${
                previewTheme === "dark" ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live preview
            </span>

            {/* Minimalist Theme Toggle */}
            <button
              onClick={() => setPreviewTheme(previewTheme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
              className={`flex size-8 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-all duration-300 ${
                previewTheme === "dark"
                  ? "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
                  : "border-zinc-200/50 bg-white/50 text-zinc-500 hover:bg-white hover:text-zinc-900"
              }`}
            >
              {previewTheme === "light" ? (
                <Moon className="size-[14px]" />
              ) : (
                <Sun className="size-[14px]" />
              )}
            </button>
          </div>

          <div className="relative z-10 flex w-full justify-center">
            <Preview slug={item.slug} />
          </div>
        </div>
      </section>

      {/* SETUP */}
      <section id="setup" className="scroll-mt-24 space-y-6">
        <style>{MARKER_CSS}</style>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="relative isolate inline-block font-editorial text-2xl text-zinc-900">
            <span
              aria-hidden="true"
              className="setup-marker absolute -inset-x-1.5 bottom-0.5 -z-10 h-3 rounded-sm bg-teal-300/50"
            />
            Setup
          </h2>

          <CopyForAIButton
            getPrompt={() => buildAIPrompt(item, sourceCode)}
            label="Copy for AI Agent"
            size="sm"
          />
        </div>

        {/* Quick start */}
        <div className="rounded-2xl bg-zinc-50 p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-[13px] font-semibold text-zinc-900">Quick start</h3>
            <p className={`mt-1 ${stepText}`}>
              MIT-licensed, so it&apos;s yours to ship in side projects or at work. Follow the four steps below, or
              paste the AI prompt into your coding assistant and let it do the wiring.
            </p>
          </div>

          <ol className="list-none">
            <Step n={1} title="Install the dependencies">
              <p className={stepText}>Class merging and icons are the only runtime requirements.</p>
              <InstallCommand packages={INSTALL_PACKAGES} />
            </Step>

            <Step n={2} title="Add the cn helper">
              <p className={stepText}>
                Create <code className={inlineCode}>lib/cn.ts</code> with the snippet below. Already exporting a{" "}
                <code className={inlineCode}>cn</code> function? Skip this step.
              </p>
              <CodeBlock code={CN_HELPER_CODE} filename="lib/cn.ts" collapsible={false} lineNumbers={false} />
            </Step>

            <Step n={3} title="Create the component">
              <p className={stepText}>
                Save the source below as{" "}
                <code className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono-code text-[11px] text-emerald-800">
                  {item.filePath}
                </code>
                .
              </p>
              <CodeBlock code={sourceCode} filename={item.filePath} collapsedLines={26} />
            </Step>

            <Step n={4} title="Use it in your app">
              <p className={stepText}>Import it wherever you need it:</p>
              <CodeBlock
                code={usageExample}
                filename="app/page.tsx"
                lineNumbers={false}
                collapsible={false}
                wrap
              />
            </Step>
          </ol>
        </div>

        {/* Prev / Next */}
        <nav aria-label="Pagination" className="grid gap-3 pt-8 sm:grid-cols-2">
          {prevItem && (
            <Link
              href={`/components/${prevItem.slug}`}
              className="group rounded-xl bg-zinc-50 p-4 transition-all duration-200 hover:bg-zinc-100"
            >
              <span className="flex items-center gap-1.5 font-mono-code text-[10.5px] uppercase tracking-widest text-zinc-400">
                <ArrowLeft className="size-3 transition-transform duration-200 group-hover:-translate-x-0.5" />
                Previous
              </span>
              <span className="mt-1.5 block text-[14px] font-medium text-zinc-900">{prevItem.name}</span>
            </Link>
          )}

          {nextItem && (
            <Link
              href={`/components/${nextItem.slug}`}
              className="group rounded-xl bg-zinc-50 p-4 text-right transition-all duration-200 hover:bg-zinc-100 sm:col-start-2"
            >
              <span className="flex items-center justify-end gap-1.5 font-mono-code text-[10.5px] uppercase tracking-widest text-zinc-400">
                Next
                <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
              <span className="mt-1.5 block text-[14px] font-medium text-zinc-900">{nextItem.name}</span>
            </Link>
          )}
        </nav>
      </section>
    </div>
  );
}