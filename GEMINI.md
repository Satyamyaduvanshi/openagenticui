# Agentic UI — Developer Context for Gemini CLI

## Core Rules
1. **100% Standalone**: Never import shadcn, Radix UI, or Headless UI. Use pure React 19, TypeScript, Tailwind CSS, and `lucide-react`.
2. **Every new component requires 2 steps**:
   - Create the standalone component in `components/agentic/[slug].tsx`.
   - Register its metadata, raw code string, and `aiIntegrationGuide` in `lib/registry.ts`.
3. **Design Language**: Dark-first zinc palette (`bg-zinc-950`, `border-zinc-800/80`), crisp monospace logs (`font-mono text-xs`), and subtle state accents (`amber-400` for active/thinking, `emerald-400` for completed, `rose-400` for errors/rejections).