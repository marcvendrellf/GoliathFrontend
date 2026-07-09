# Backend Contract

Contract between the frontend (`web/`) and the backend repo (Axel and Josep).
The canonical, always-up-to-date version is the TypeScript file
`web/src/lib/contract.ts`; this page mirrors it. Change both together and tell
the team — no silent drift.

Mock data matching this contract lives in `web/src/lib/mock/mock-run.ts`, and
`web/src/lib/api.ts` falls back to it automatically when
`NEXT_PUBLIC_API_BASE_URL` is unset. Backend can validate against the mock.

## Endpoints

Minimum:

```txt
POST /api/runs                body: { query: string }   → Run
GET  /api/runs/:runId         → Run
GET  /api/reports             → ReportSummary[]
GET  /api/reports/:runId      → FinalReport
```

Optional streaming (only if backend has time):

```txt
GET /api/runs/:runId/events   → SSE stream of RunEvent
```

Frontend polls `GET /api/runs/:runId` every 1-2 seconds while the run is not
`complete`/`error`. Backend must allow CORS from `http://localhost:3000`.

## Core Types

```ts
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
```

```ts
export type AgentPlan = {
  id: string;
  name: string;      // display name, e.g. "Market Mapper"
  role: string;      // short role label
  purpose: string;   // one sentence: what this agent investigates
  voiceId?: string;  // ElevenLabs voice id (backend concern, informative)
  status: "pending" | "researching" | "speaking" | "done" | "error";
};
```

```ts
export type RunEvent = {
  id: string;
  timestamp: string;
  type:
    | "orchestrator.plan"
    | "agent.spawned"
    | "agent.message"
    | "agent.finding"
    | "report.segment_ready"
    | "run.complete";
  agentId?: string;
  title?: string;
  text: string;
};
```

```ts
export type Opportunity = {
  id: string;
  startupName: string;
  location?: string;
  sector?: string;
  stage?: string;
  summary: string;
  prediction: string;   // concise + precise
  goliathScore: number; // 0-100
  status: "hot" | "warming" | "neutral" | "cooling" | "not_hot";
  confidence: number;   // 0-1
  riskLevel: "low" | "medium" | "high";
  scoreReason: string;
  evidence: Evidence[];
};

export type Evidence = {
  id: string;
  source: "cala" | "news" | "web" | "manual";
  title: string;
  url?: string;
  snippet?: string;
};
```

```ts
export type FinalReport = {
  id: string;
  runId: string;
  title: string;
  executiveSummary: string;
  segments: PresentationSegment[];
  opportunities: Opportunity[];
  createdAt: string;
};

export type PresentationSegment = {
  id: string;
  agentId: string;      // which AgentPlan speaks this segment
  title: string;
  subtitle: string;
  script: string;       // full spoken text — used as subtitles
  audioUrl?: string;    // ElevenLabs mp3 URL; absent → silent + subtitles
  imageUrl?: string;
  evidenceIds: string[];
  durationMs?: number;  // fallback timing when audio is missing
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
```

## Backend Responsibilities

- Produce the subagent plan directly from the user query (target: 4 agents).
- Run subagents or mock them with credible structured output.
- Emit events for frontend animation (`agent.spawned` per agent matters most).
- Produce final opportunities with evidence and concise predictions.
- Include `goliathScore`, `status`, `confidence`, `riskLevel`, and
  `scoreReason` for every opportunity.
- Generate ElevenLabs audio per presentation segment and return public/
  proxied `audioUrl`s (mp3). One clip per segment, not one big file.
- Keep ElevenLabs/Cala secrets server-side.
- Allow CORS from the frontend origin.

## Frontend Responsibilities

- Animate from `Run.status`, `AgentPlan.status`, and `RunEvent`s.
- Render the final report from `FinalReport`.
- Play `PresentationSegment.audioUrl` when present; fall back to
  subtitles + `durationMs` timing when absent.
- Never call ElevenLabs or Cala directly.
