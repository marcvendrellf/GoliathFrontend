"use client";

import type { ComponentType } from "react";
import { useMemo } from "react";
import { Credit, Layout, Search, ShieldCheck, Workflow } from "@sim/emcn/icons";
import { SubBlockRowView, WorkflowBlockView } from "@sim/workflow-renderer";
import { Handle, Position, type NodeProps } from "reactflow";
import type { AgentStatus } from "@/lib/contract";
import { agentRoleLabel } from "@/lib/goliath/agent-labels";

/**
 * Agent-node data shape consumed by `AgentNode`. Built by
 * `graph-from-run.ts#buildGraph` from a Goliath `Run`.
 */
export type AgentNodeKind = "orchestrator" | "agent";

export interface AgentNodeData {
  kind: AgentNodeKind;
  /** Display name, e.g. "Market Mapper" or "Orchestrator". */
  name: string;
  /** Short role label rendered as the collapsed subblock row. */
  role: string;
  /** One-sentence purpose rendered as a muted caption. */
  purpose?: string;
  /** Drives the run-status ring: pending = dim/no ring, researching/speaking = pulsing, done = success ring. */
  status: AgentStatus;
}

/** Per-agent icon, keyed by `AgentPlan.id` from `mock-run.ts`. */
const AGENT_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "agent-market": Layout,
  "agent-scout": Search,
  "agent-funding": Credit,
  "agent-risk": ShieldCheck,
};

/** Per-agent icon tile background, keyed by `AgentPlan.id`. */
const AGENT_ICON_COLORS: Record<string, string> = {
  "agent-market": "#802fff",
  "agent-scout": "#2563eb",
  "agent-funding": "#16a34a",
  "agent-risk": "#dc2626",
};

const ORCHESTRATOR_ICON_COLOR = "#701ffc"; // matches --brand-agent

/**
 * Resolves the run-path ring, mirroring Sim's `getBlockRingStyles`
 * (reference/sim .../utils/block-ring-utils.ts) for the subset of states a
 * read-only agent graph needs: pulsing while active, static green when done,
 * red on error, no ring while pending.
 */
function ringStylesFor(status: AgentStatus): { hasRing: boolean; ringStyles: string } {
  if (status === "researching" || status === "speaking") {
    return {
      hasRing: true,
      ringStyles: "ring-[3.5px] ring-[var(--border-success)] animate-ring-pulse",
    };
  }
  if (status === "done") {
    return { hasRing: true, ringStyles: "ring-[1.75px] ring-[var(--border-success)]" };
  }
  if (status === "error") {
    return { hasRing: true, ringStyles: "ring-[1.75px] ring-[var(--text-error)]" };
  }
  return { hasRing: false, ringStyles: "" };
}

function statusLabelFor(status: AgentStatus): string {
  switch (status) {
    case "researching":
      return "Researching";
    case "speaking":
      return "Speaking";
    case "done":
      return "Complete";
    case "error":
      return "Needs attention";
    default:
      return "Queued";
  }
}

const noop = () => {};
const noConnectionCycle = () => false;

/**
 * ReactFlow node component rendering a Goliath agent (or the orchestrator) as
 * an authentic Sim workflow block: `WorkflowBlockView` from
 * `@sim/workflow-renderer`, fed pre-resolved visual props the way Sim's own
 * `workflow-block.tsx` container does via `useBlockVisual`.
 */
export function AgentNode({ id, data }: NodeProps<AgentNodeData>) {
  const { kind, name, role, purpose, status } = data;
  const { hasRing, ringStyles } = useMemo(() => ringStylesFor(status), [status]);
  const statusLabel = statusLabelFor(status);

  const Icon = kind === "orchestrator" ? Workflow : (AGENT_ICONS[id] ?? Search);
  const iconBgColor =
    kind === "orchestrator" ? ORCHESTRATOR_ICON_COLOR : (AGENT_ICON_COLORS[id] ?? "#802fff");

  const isEnabled = status !== "pending";

  return (
    <div className="relative animate-slide-in-right">
      {kind !== "orchestrator" && (
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          className="!left-[-8px] !top-[24px] !z-[0] !h-5 !w-[7px] !rounded-l-[2px] !rounded-r-none !border-none !bg-[var(--workflow-edge)]"
          isConnectableStart={false}
          isConnectableEnd
        />
      )}
      <WorkflowBlockView
        id={id}
        type={kind === "orchestrator" ? "orchestrator" : "agent"}
        name={name}
        isEnabled={isEnabled}
        isLocked={false}
        hasRing={hasRing}
        ringStyles={ringStyles}
        runPathStatus={status === "done" ? "success" : status === "error" ? "error" : undefined}
        Icon={Icon}
        iconBgColor={iconBgColor}
        horizontalHandles
        shouldShowDefaultHandles={false}
        hasContentBelowHeader
        conditionRows={[]}
        routerRows={[]}
        wouldCreateConnectionCycle={noConnectionCycle}
        onSelect={noop}
        rows={
          <>
            <SubBlockRowView title={agentRoleLabel(role)} />
            <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] text-xs">
              {(status === "researching" || status === "speaking") && (
                <span className="size-1.5 rounded-full bg-[var(--brand-accent)] animate-pulse" />
              )}
              <span>{statusLabel}</span>
            </div>
            {purpose && (
              <p className="line-clamp-2 text-[var(--text-tertiary)] text-xs leading-snug">
                {purpose}
              </p>
            )}
          </>
        }
      />
    </div>
  );
}
