"use client";

import { ArrowRight, Database, Search, ShieldCheck, Shuffle, Workflow } from "@sim/emcn/icons";

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
    <div className="pt-9">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" className="flex items-center gap-2 text-[var(--text-muted)] text-small">
          Suggested actions
        </button>
        <button type="button" className="flex items-center gap-2 text-[var(--text-muted)] text-small">
          Shuffle
          <Shuffle className="size-3.5" />
        </button>
      </div>
      <div className="flex flex-col">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onSelectPrompt(action.prompt)}
              className="flex min-h-[48px] items-center gap-3 border-[var(--divider)] border-b px-2 text-left transition-colors first:border-t hover-hover:bg-[var(--surface-5)]"
            >
              <Icon className="size-4 shrink-0 text-[var(--text-icon)]" />
              <span className="min-w-0 flex-1 truncate text-[var(--text-primary)] text-small">
                {action.label}
              </span>
              <ArrowRight className="size-4 shrink-0 text-[var(--text-icon)]" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
