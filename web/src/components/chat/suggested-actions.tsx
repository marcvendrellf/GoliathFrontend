"use client";

import { Database, Search, ShieldCheck, Workflow } from "@sim/emcn/icons";

const ACTIONS = [
  {
    id: "barcelona-ai",
    label: "Find Barcelona AI opportunities",
    prompt: "Show me startup opportunities of investment in Barcelona related to AI.",
    icon: Search,
  },
  {
    id: "funding-window",
    label: "Prioritize likely raises",
    prompt: "Which Barcelona AI startups are likely to raise in the next 6 months?",
    icon: Database,
  },
  {
    id: "risk-first",
    label: "Stress-test the shortlist",
    prompt: "Stress-test Barcelona AI investment opportunities by risk and confidence.",
    icon: ShieldCheck,
  },
  {
    id: "memo",
    label: "Prepare an IC memo",
    prompt: "Create an investment committee memo for the top Barcelona AI opportunities.",
    icon: Workflow,
  },
];

export function SuggestedActions({
  onSelectPrompt,
}: {
  onSelectPrompt: (prompt: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onSelectPrompt(action.prompt)}
            className="flex min-h-[42px] items-center gap-2 rounded-[8px] border border-[var(--divider)] bg-[var(--bg)] px-3 py-2 text-left transition-colors hover-hover:bg-[var(--surface-5)]"
          >
            <Icon className="size-4 shrink-0 text-[var(--text-icon)]" />
            <span className="truncate text-[var(--text-primary)] text-small">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

