"use client";

import { Orb, type AgentState } from "@/components/ui/orb";
import { cn } from "@/lib/utils";

/**
 * Presentation-local orb. Wraps the ElevenLabs Orb (Three.js) with a stable
 * per-agent gradient and seed, and renders it with NO border, ring, or circular
 * outline of any kind, just the orb canvas. Sizing is controlled by the parent
 * via `className` (width/height); the canvas fills its box.
 *
 * This is intentionally separate from the shared `agents/agent-orb.tsx` so the
 * presentation can style and choreograph its orbs without touching other routes.
 */

/** Per-agent gradient pairs, assigned stably by order of first appearance. */
export const ORB_PALETTE: [string, string][] = [
  ["#93c5fd", "#3b82f6"], // blue
  ["#c4b5fd", "#8b5cf6"], // violet
  ["#fcd34d", "#f59e0b"], // amber
  ["#fda4af", "#f43f5e"], // rose
  ["#5eead4", "#14b8a6"], // teal
];

export function colorsForIndex(i: number): [string, string] {
  return ORB_PALETTE[i % ORB_PALETTE.length];
}

/** Deterministic 32-bit hash of an agent id, used as a stable orb seed. */
export function seedFromId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function PresentationOrb({
  colors,
  seed,
  agentState = null,
  className,
}: {
  colors: [string, string];
  seed: number;
  agentState?: AgentState;
  className?: string;
}) {
  return (
    <div className={cn("pointer-events-none select-none", className)}>
      <Orb
        colors={colors}
        seed={seed}
        agentState={agentState}
        className="h-full w-full"
      />
    </div>
  );
}
