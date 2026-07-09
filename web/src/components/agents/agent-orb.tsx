"use client";

import { Persona } from "@/components/ai-elements/persona";
import type { AgentPlan } from "@/lib/contract";
import { cn } from "@/lib/utils";

/**
 * Shared agent orb used by both the live research view (Felipe) and the final
 * presentation (Marc). Wraps the AI Elements Persona (Rive/WebGL2 animated
 * orb) and maps our AgentPlan.status to its animation state.
 *
 * Note: Persona streams its .riv animation from a Vercel blob URL, so it
 * needs network at demo time.
 */

const VARIANTS = ["mana", "opal", "halo", "glint", "command", "obsidian"] as const;

type PersonaState = "idle" | "listening" | "thinking" | "speaking" | "asleep";

const STATUS_TO_STATE: Record<AgentPlan["status"], PersonaState> = {
  pending: "asleep",
  researching: "thinking",
  speaking: "speaking",
  done: "idle",
  error: "idle",
};

export function AgentOrb({
  agent,
  index = 0,
  size = "md",
  showLabel = true,
  className,
}: {
  agent: AgentPlan;
  /** Stable index within the run — picks a consistent orb variant per agent. */
  index?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}) {
  const sizeClass = { sm: "size-16", md: "size-28", lg: "size-44" }[size];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Persona
        state={STATUS_TO_STATE[agent.status]}
        variant={VARIANTS[index % VARIANTS.length]}
        className={sizeClass}
      />
      {showLabel && (
        <div className="text-center">
          <p className="text-sm font-medium">{agent.name}</p>
          <p className="text-xs text-muted-foreground">{agent.role}</p>
        </div>
      )}
    </div>
  );
}
