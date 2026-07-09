/**
 * Goliath shared frontend/backend contract.
 *
 * This file is the single source of truth for the data shapes exchanged with
 * the backend repo (Axel & Josep). It mirrors `llm-wiki/backend-contract.md`.
 * If a field needs to change, change it here AND in the wiki, and tell the
 * backend team. Do not let shapes drift silently.
 *
 * Endpoints the backend must provide (JSON over HTTP):
 *
 *   POST /api/runs                    body: CreateRunRequest  → Run
 *   GET  /api/runs/:runId             → Run (poll every 1-2s while running)
 *   GET  /api/reports                 → ReportSummary[]
 *   GET  /api/reports/:runId          → FinalReport
 *
 * Optional (only if backend has time):
 *
 *   GET  /api/runs/:runId/events      → SSE stream of RunEvent
 */

// ---------------------------------------------------------------------------
// Run lifecycle
// ---------------------------------------------------------------------------

export type RunStatus =
  | "awaiting_query"
  | "planning_agents"
  | "researching"
  | "synthesizing"
  | "complete"
  | "error";

export type Run = {
  id: string;
  status: RunStatus;
  query: string;
  agents: AgentPlan[];
  events: RunEvent[];
  opportunities: Opportunity[];
  finalReport?: FinalReport;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};

export type CreateRunRequest = {
  query: string;
};

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

export type AgentStatus =
  | "pending"
  | "researching"
  | "speaking"
  | "done"
  | "error";

export type AgentPlan = {
  id: string;
  name: string; // display name, e.g. "Market Mapper"
  role: string; // short role label, e.g. "Market analysis"
  purpose: string; // one sentence: what this agent investigates for this run
  voiceId?: string; // ElevenLabs voice id (backend-only concern, informative)
  status: AgentStatus;
};

// ---------------------------------------------------------------------------
// Events (drive Felipe's research animation + activity feed)
// ---------------------------------------------------------------------------

export type RunEventType =
  | "orchestrator.plan"
  | "agent.spawned"
  | "agent.message"
  | "agent.finding"
  | "report.segment_ready"
  | "run.complete";

export type RunEvent = {
  id: string;
  timestamp: string; // ISO 8601
  type: RunEventType;
  agentId?: string; // present for agent.* events
  title?: string;
  text: string;
};

// ---------------------------------------------------------------------------
// Opportunities
// ---------------------------------------------------------------------------

export type OpportunityStatus =
  | "hot"
  | "warming"
  | "neutral"
  | "cooling"
  | "not_hot";

export type Opportunity = {
  id: string;
  startupName: string;
  location?: string;
  sector?: string;
  stage?: string; // e.g. "Seed", "Series A"
  summary: string;
  prediction: string; // concise, precise, e.g. "Likely raises Series A within 9 months"
  goliathScore: number; // 0-100, explainable custom score
  status: OpportunityStatus;
  confidence: number; // 0-1
  riskLevel: "low" | "medium" | "high";
  scoreReason: string; // natural-language explanation of the score
  evidence: Evidence[];
};

export type Evidence = {
  id: string;
  source: "cala" | "news" | "web" | "manual";
  title: string;
  url?: string;
  snippet?: string;
};

// ---------------------------------------------------------------------------
// Final report + narrated presentation (Marc's views)
// ---------------------------------------------------------------------------

export type FinalReport = {
  id: string;
  runId: string;
  title: string;
  executiveSummary: string;
  segments: PresentationSegment[];
  opportunities: Opportunity[];
  createdAt: string; // ISO 8601
};

export type PresentationSegment = {
  id: string;
  agentId: string; // which AgentPlan speaks this segment
  title: string;
  subtitle: string;
  script: string; // full spoken text used as subtitles
  audioUrl?: string; // ElevenLabs mp3 URL; frontend falls back to silent+subtitles
  imageUrl?: string; // optional supporting chart/image
  evidenceIds: string[]; // references Opportunity.evidence ids
  durationMs?: number; // fallback segment length when audio is missing
};

export type ReportSummary = {
  runId: string;
  title: string;
  query: string;
  status: RunStatus;
  createdAt: string;
  opportunityCount: number;
  topOpportunities: Pick<
    Opportunity,
    "id" | "startupName" | "goliathScore" | "status"
  >[];
};
