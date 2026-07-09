import type {
  AgentPlan,
  Evidence,
  FinalReport,
  OpportunityStatus,
} from "@/lib/contract";
import { MOCK_AGENTS } from "@/lib/mock/mock-run";

/**
 * The FinalReport contract carries segments (each with an `agentId`) but not the
 * speaking agents' display metadata. We resolve names/roles from the known agent
 * roster when available and humanize the id as a graceful fallback so the stage
 * still renders sensibly against a real backend.
 */
const AGENT_META: Record<string, { name: string; role: string; purpose: string }> =
  Object.fromEntries(
    MOCK_AGENTS.map((a) => [a.id, { name: a.name, role: a.role, purpose: a.purpose }]),
  );

function humanize(id: string): string {
  return id
    .replace(/^agent-/, "")
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Ordered, de-duplicated list of the agents that speak in this report. */
export function deriveAgents(report: FinalReport): AgentPlan[] {
  const seen = new Set<string>();
  const agents: AgentPlan[] = [];
  for (const seg of report.segments) {
    if (seen.has(seg.agentId)) continue;
    seen.add(seg.agentId);
    const meta = AGENT_META[seg.agentId];
    agents.push({
      id: seg.agentId,
      name: meta?.name ?? humanize(seg.agentId),
      role: meta?.role ?? "Specialist",
      purpose: meta?.purpose ?? "",
      status: "pending",
    });
  }
  return agents;
}

/** Flatten every opportunity's evidence into a lookup keyed by evidence id. */
export function buildEvidenceMap(report: FinalReport): Map<string, Evidence> {
  const map = new Map<string, Evidence>();
  for (const opp of report.opportunities) {
    for (const ev of opp.evidence) map.set(ev.id, ev);
  }
  return map;
}

/** Tailwind classes for an opportunity status badge (light theme). */
export const STATUS_BADGE: Record<OpportunityStatus, string> = {
  hot: "border-red-200 bg-red-50 text-red-700",
  warming: "border-amber-200 bg-amber-50 text-amber-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  cooling: "border-sky-200 bg-sky-50 text-sky-700",
  not_hot: "border-slate-200 bg-slate-50 text-slate-500",
};

export const STATUS_LABEL: Record<OpportunityStatus, string> = {
  hot: "Hot",
  warming: "Warming",
  neutral: "Neutral",
  cooling: "Cooling",
  not_hot: "Not hot",
};
