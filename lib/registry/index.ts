export interface RegistryItem {
  slug: string;
  name: string;
  category: "Reasoning" | "Tool Calling" | "Safety & HITL" | "Execution" | "Telemetry";
  isNew?: boolean;
  description: string;
  filePath: string;
  aiIntegrationSteps: string;
}

// 1. Explicitly type the array literal here so TypeScript knows 
// 'category' must match the strict union type.
const ITEMS: RegistryItem[] = [
  {
    slug: "agent-terminal",
    name: "Agent Terminal Stream",
    category: "Execution",
    isNew: true,
    description: "Light-mode sandboxed stdout/stderr log viewer for code-execution agents.",
    filePath: "components/agentic/agent-terminal.tsx",
    aiIntegrationSteps:
      "Pass live stdout lines from your sandboxed runner or WebSocket stream into `logs` and set `isRunning` while the child process is active.",
  },
  {
    slug: "context-window-meter",
    name: "Context Window Meter",
    category: "Telemetry",
    isNew: true,
    description: "Token utilization bar and real-time session cost badge with #FF4500 progress indicator.",
    filePath: "components/agentic/context-window-meter.tsx",
    aiIntegrationSteps:
      "Connect `usedTokens` to `usage.totalTokens` returned from your AI SDK `onFinish` callback.",
  },
  {
    slug: "human-approval-gate",
    name: "Human Approval Gate",
    category: "Safety & HITL",
    isNew: true,
    description: "Inline human-in-the-loop confirmation gate before an agent executes high-risk commands.",
    filePath: "components/agentic/human-approval-gate.tsx",
    aiIntegrationSteps:
      "Render `<HumanApprovalGate />` when a tool call requires explicit confirmation before execution.",
  },
  {
    slug: "reasoning-trace",
    name: "Reasoning Trace",
    category: "Reasoning",
    isNew: false,
    description: "Collapsible chain-of-thought streaming box with live second counter.",
    filePath: "components/agentic/reasoning-trace.tsx",
    aiIntegrationSteps:
      "Bind `content` to the streaming reasoning delta and set `isThinking={true}` until the final answer starts.",
  },
  {
    slug: "tool-call-card",
    name: "Tool Call Card",
    category: "Tool Calling",
    isNew: true,
    description: "Collapsible function invocation inspector showing JSON arguments and return payloads.",
    filePath: "components/agentic/tool-call-card.tsx",
    aiIntegrationSteps:
      "Map `message.toolInvocations` to `<ToolCallCard />` and pass `toolName`, `args`, and `result`.",
  },
];

// 2. Sort the strictly-typed array and export it
export const REGISTRY: RegistryItem[] = ITEMS.sort((a, b) => a.name.localeCompare(b.name));

export function getGroupedCategories() {
  const groups = new Map<string, { name: string; items: RegistryItem[]; hasNew: boolean }>();
  for (const item of REGISTRY) {
    const group = groups.get(item.category) ?? { name: item.category, items: [], hasNew: false };
    group.items.push(item);
    if (item.isNew) group.hasNew = true;
    groups.set(item.category, group);
  }
  return Array.from(groups.values());
}

export function buildAIPrompt(item: RegistryItem, rawSourceCode: string): string {
  return `# OpenAgenticUI — AI Integration Task: \`${item.name}\`

Integrate the standalone **${item.name}** component into my project.
- Architecture: 100% Standalone React + Tailwind CSS (Light Theme, #FF4500 accent). Do NOT install shadcn/ui or Radix.
- Required packages: 
\`npm install lucide-react clsx tailwind-merge\`

## 1. Create \`${item.filePath}\`
\`\`\`tsx
${rawSourceCode}
\`\`\`

## 2. Wire into Agent State
${item.aiIntegrationSteps}`;
}