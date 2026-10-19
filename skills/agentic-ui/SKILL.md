---
name: agentic-ui
description: Standalone React and Tailwind components for AI agents (reasoning traces, tool calls, human-in-the-loop approvals, terminal streams).
---

# Agentic UI Skill Instructions

When the user asks to add an Agentic UI component to their project:
1. Ensure `clsx`, `tailwind-merge`, and `lucide-react` are installed.
2. Ensure `lib/cn.ts` exists.
3. Copy the requested component directly from `components/agentic/<component-name>.tsx` into the user's project and wire it to their streaming state. 