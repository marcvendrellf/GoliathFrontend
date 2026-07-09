# Backend Contract

This is the proposed contract for Axel and Josep. It should be simplified if
backend time is tight.

## Endpoints

Minimum:

```txt
POST /api/runs
GET /api/runs/:runId
GET /api/reports
GET /api/reports/:runId
```

Optional streaming:

```txt
GET /api/runs/:runId/events
```

Polling `GET /api/runs/:runId` is acceptable if streaming is too slow to build.

## Core Types

```ts
export type RunStatus =
  | "awaiting_query"
  | "planning_agents"
  | "researching"
  | "synthesizing"
  | "complete"
  | "error";
```

```ts
export type Run = {
  id: string;
  status: RunStatus;
  query: string;
  agents: AgentPlan[];
  events: RunEvent[];
  opportunities: Opportunity[];
  finalReport?: FinalReport;
  createdAt: string;
  updatedAt: string;
};
```

```ts
export type AgentPlan = {
  id: string;
  name: string;
  role: string;
  purpose: string;
  voiceId?: string;
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
  prediction: string;
  goliathScore: number;
  status: "hot" | "warming" | "neutral" | "cooling" | "not_hot";
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  scoreReason: string;
  evidence: Evidence[];
};
```

```ts
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
};
```

```ts
export type PresentationSegment = {
  id: string;
  agentId: string;
  title: string;
  subtitle: string;
  script: string;
  audioUrl?: string;
  imageUrl?: string;
  evidenceIds: string[];
  durationMs?: number;
};
```

## Backend Responsibilities

- Produce subagent plan directly from the user query.
- Run subagents or mock them with credible structured output.
- Produce events for frontend animation.
- Produce final opportunities with evidence and predictions.
- Include `goliathScore`, `status`, `confidence`, `riskLevel`, and
  `scoreReason` for every opportunity.
- Generate or provide ElevenLabs audio URLs for final report segments.
- Avoid exposing ElevenLabs/Cala secrets to frontend.

## Frontend Responsibilities

- Animate based on `Run.status`, `AgentPlan.status`, and `RunEvent`.
- Render final report from `FinalReport`.
- Play `PresentationSegment.audioUrl` when available.
- Use text/subtitles if audio is missing.
