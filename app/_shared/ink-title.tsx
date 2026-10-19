// app/_shared/ink-title.tsx
// Server component, pure CSS. Words bleed in like wet ink (keeps kerning intact),
// then a pen stroke is wiped in underneath with a clip-path (no dash tricks).
import React from "react";
import { cn } from "@/lib/cn";

const START_MS = 60;
const WORD_STEP_MS = 85;

const CSS = `
@keyframes ink-word {
  0%   { opacity: 0; filter: blur(8px); transform: translateY(.18em); }
  100% { opacity: 1; filter: blur(0);   transform: none; }
}
@keyframes ink-wipe {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0 0 0); }
}
.ink-word { display: inline-block; animation: ink-word 650ms cubic-bezier(.22,1,.36,1) both; }
.ink-line { clip-path: inset(0 100% 0 0); animation: ink-wipe 800ms cubic-bezier(.65,0,.35,1) forwards; }
@media (prefers-reduced-motion: reduce) {
  .ink-word { animation: none; }
  .ink-line { animation: none; clip-path: none; }
}
`;

export function InkTitle({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  const lineDelay = START_MS + words.length * WORD_STEP_MS + 120;

  return (
    <h1 aria-label={text} className={cn("relative inline-block pb-3", className)}>
      <style>{CSS}</style>

      <span aria-hidden="true">
        {words.map((word, i) => (
          <React.Fragment key={i}>
            {i > 0 && " "}
            <span className="ink-word" style={{ animationDelay: `${START_MS + i * WORD_STEP_MS}ms` }}>
              {word}
            </span>
          </React.Fragment>
        ))}
      </span>

      <svg
        aria-hidden="true"
        viewBox="0 0 300 12"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-0.5 left-0 h-2.5 w-full"
      >
        <path
          className="ink-line"
          d="M2 8 C 40 2, 70 12, 110 6 S 190 2, 230 8 S 280 10, 298 4"
          fill="none"
          stroke="#171717"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ animationDelay: `${lineDelay}ms` }}
        />
      </svg>
    </h1>
  );
}