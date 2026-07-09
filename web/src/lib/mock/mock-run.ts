/**
 * Mock demo data for the query:
 *   "Show me startup opportunities of investment in Barcelona related to AI."
 *
 * `MOCK_RUN` is the finished run (status "complete", finalReport attached).
 * `mockRunAt(elapsedMs)` returns a snapshot of the same run as it would look
 * mid-flight, so the live research UI can be built and demoed without the
 * backend: it replays agent statuses and events on a fixed timeline.
 */

import type {
  AgentPlan,
  Evidence,
  FinalReport,
  Opportunity,
  ReportSummary,
  Run,
  RunEvent,
} from "@/lib/contract";

const QUERY =
  "Show me startup opportunities of investment in Barcelona related to AI.";

const T0 = "2026-07-09T18:00:00.000Z";

export const MOCK_AGENTS: AgentPlan[] = [
  {
    id: "agent-market",
    name: "Market Mapper",
    role: "Market analysis",
    purpose: "Map the Barcelona AI ecosystem and rank its hottest segments.",
    status: "done",
  },
  {
    id: "agent-scout",
    name: "Company Scout",
    role: "Startup discovery",
    purpose: "Find AI startups in Barcelona with fresh traction signals.",
    status: "done",
  },
  {
    id: "agent-funding",
    name: "Funding Analyst",
    role: "Funding analysis",
    purpose: "Inspect round history and predict the next raise windows.",
    status: "done",
  },
  {
    id: "agent-risk",
    name: "Risk Analyst",
    role: "Risk assessment",
    purpose: "Stress-test each opportunity and calibrate confidence.",
    status: "done",
  },
];

// Offsets (ms from run start) used by mockRunAt to replay the timeline.
const EVENT_TIMELINE: { atMs: number; event: RunEvent }[] = [
  {
    atMs: 500,
    event: {
      id: "ev-1",
      timestamp: T0,
      type: "orchestrator.plan",
      title: "Research plan ready",
      text: "Query needs 4 specialists: market mapping, company scouting, funding analysis, and risk assessment. Spawning the team.",
    },
  },
  {
    atMs: 1500,
    event: {
      id: "ev-2",
      timestamp: T0,
      type: "agent.spawned",
      agentId: "agent-market",
      text: "Market Mapper joined the run.",
    },
  },
  {
    atMs: 2100,
    event: {
      id: "ev-3",
      timestamp: T0,
      type: "agent.spawned",
      agentId: "agent-scout",
      text: "Company Scout joined the run.",
    },
  },
  {
    atMs: 2700,
    event: {
      id: "ev-4",
      timestamp: T0,
      type: "agent.spawned",
      agentId: "agent-funding",
      text: "Funding Analyst joined the run.",
    },
  },
  {
    atMs: 3300,
    event: {
      id: "ev-5",
      timestamp: T0,
      type: "agent.spawned",
      agentId: "agent-risk",
      text: "Risk Analyst joined the run.",
    },
  },
  {
    atMs: 5000,
    event: {
      id: "ev-6",
      timestamp: T0,
      type: "agent.message",
      agentId: "agent-market",
      text: "Barcelona AI activity clusters in three segments: applied LLM tooling, health AI, and industrial computer vision.",
    },
  },
  {
    atMs: 7000,
    event: {
      id: "ev-7",
      timestamp: T0,
      type: "agent.message",
      agentId: "agent-scout",
      text: "Shortlisted 6 startups with hiring spikes or new enterprise customers in the last two quarters.",
    },
  },
  {
    atMs: 9000,
    event: {
      id: "ev-8",
      timestamp: T0,
      type: "agent.finding",
      agentId: "agent-funding",
      title: "Raise window detected",
      text: "Neurodesk's seed was 14 months ago with 3x ARR growth since, a classic pre-Series-A profile.",
    },
  },
  {
    atMs: 11000,
    event: {
      id: "ev-9",
      timestamp: T0,
      type: "agent.message",
      agentId: "agent-risk",
      text: "Flagging Voltaflow: strong demo, but two direct competitors raised larger rounds this quarter.",
    },
  },
  {
    atMs: 13000,
    event: {
      id: "ev-10",
      timestamp: T0,
      type: "agent.finding",
      agentId: "agent-scout",
      title: "Momentum signal",
      text: "Cala data shows Parlem AI doubled its engineering team and landed a top-3 Spanish bank pilot.",
    },
  },
  {
    atMs: 15000,
    event: {
      id: "ev-11",
      timestamp: T0,
      type: "report.segment_ready",
      text: "Synthesis started: ranking opportunities and writing the final briefing.",
    },
  },
  {
    atMs: 18000,
    event: {
      id: "ev-12",
      timestamp: T0,
      type: "run.complete",
      text: "Research complete. 3 opportunities scored. Final briefing is ready.",
    },
  },
];

const EVIDENCE: Evidence[] = [
  {
    id: "evd-1",
    source: "cala",
    title: "Neurodesk funding history",
    snippet: "Seed €2.1M (May 2025), led by Nauta Capital. ARR up 3x since.",
  },
  {
    id: "evd-2",
    source: "news",
    title: "Parlem AI lands banking pilot",
    url: "https://example.com/parlem-ai-bank-pilot",
    snippet: "Barcelona NLP startup signs conversational-AI pilot with a top-3 Spanish bank.",
  },
  {
    id: "evd-3",
    source: "web",
    title: "Voltaflow competitor raises",
    snippet: "Two direct competitors closed $15M+ rounds in Q2 2026.",
  },
  {
    id: "evd-4",
    source: "cala",
    title: "Barcelona AI hiring index",
    snippet: "AI engineering openings in Barcelona up 42% year over year.",
  },
];

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-1",
    startupName: "Neurodesk",
    location: "Barcelona",
    sector: "Health AI",
    stage: "Seed",
    summary:
      "Clinical-notes copilot for hospitals, deployed in 4 Catalan clinics.",
    prediction: "Likely raises a Series A within 6-9 months.",
    goliathScore: 87,
    status: "hot",
    confidence: 0.82,
    riskLevel: "medium",
    scoreReason:
      "Strong ARR growth, clear raise window, and rising sector demand; medium risk from hospital sales cycles.",
    evidence: [EVIDENCE[0], EVIDENCE[3]],
  },
  {
    id: "opp-2",
    startupName: "Parlem AI",
    location: "Barcelona",
    sector: "LLM tooling",
    stage: "Pre-seed",
    summary: "Catalan/Spanish-first conversational AI for regulated industries.",
    prediction: "Bank pilot converts to contract; seed round opens this year.",
    goliathScore: 78,
    status: "warming",
    confidence: 0.71,
    riskLevel: "medium",
    scoreReason:
      "Team doubling and a marquee pilot signal momentum, but revenue is not yet proven.",
    evidence: [EVIDENCE[1], EVIDENCE[3]],
  },
  {
    id: "opp-3",
    startupName: "Voltaflow",
    location: "Barcelona",
    sector: "Industrial CV",
    stage: "Seed",
    summary: "Computer-vision quality control for automotive plants.",
    prediction: "Needs differentiation before its next raise; watch, don't lead.",
    goliathScore: 54,
    status: "cooling",
    confidence: 0.64,
    riskLevel: "high",
    scoreReason:
      "Solid tech but better-funded direct competitors compress its window.",
    evidence: [EVIDENCE[2]],
  },
];

export const MOCK_FINAL_REPORT: FinalReport = {
  id: "report-mock-1",
  runId: "run-mock-1",
  title: "AI Investment Opportunities in Barcelona",
  executiveSummary:
    "Barcelona's AI scene is concentrating around health AI and applied LLM tooling. Neurodesk is the standout: a clear pre-Series-A profile with real hospital deployments. Parlem AI is one contract away from hot. Voltaflow is cooling under competitive pressure.",
  createdAt: T0,
  opportunities: MOCK_OPPORTUNITIES,
  segments: [
    {
      id: "seg-1",
      agentId: "agent-market",
      title: "The Barcelona AI landscape",
      subtitle: "Where the momentum is",
      script:
        "Barcelona's AI activity clusters in three segments: applied LLM tooling, health AI, and industrial computer vision. Health AI shows the strongest demand signals, with hiring up forty-two percent year over year.",
      evidenceIds: ["evd-4"],
      durationMs: 12000,
    },
    {
      id: "seg-2",
      agentId: "agent-scout",
      title: "Who we found",
      subtitle: "Three startups worth your attention",
      script:
        "From six shortlisted companies, three stand out. Neurodesk is live in four Catalan clinics. Parlem AI just landed a pilot with a top-three Spanish bank. Voltaflow has strong tech but a crowded lane.",
      evidenceIds: ["evd-1", "evd-2"],
      durationMs: 13000,
    },
    {
      id: "seg-3",
      agentId: "agent-funding",
      title: "Timing the rounds",
      subtitle: "When the windows open",
      script:
        "Neurodesk raised its seed fourteen months ago and has tripled revenue since, and that is a classic pre-Series-A profile. Expect a round within six to nine months. Parlem AI's seed likely opens once the bank pilot converts.",
      evidenceIds: ["evd-1"],
      durationMs: 13000,
    },
    {
      id: "seg-4",
      agentId: "agent-risk",
      title: "What could go wrong",
      subtitle: "Risk and final ranking",
      script:
        "Main risks: hospital sales cycles for Neurodesk and unproven revenue for Parlem AI. Voltaflow faces two better-funded competitors. Final ranking: Neurodesk scores eighty-seven and is hot. Parlem AI, seventy-eight and warming. Voltaflow, fifty-four and cooling.",
      evidenceIds: ["evd-3"],
      durationMs: 15000,
    },
  ],
};

export const MOCK_RUN: Run = {
  id: "run-mock-1",
  status: "complete",
  query: QUERY,
  agents: MOCK_AGENTS,
  events: EVENT_TIMELINE.map((e) => e.event),
  opportunities: MOCK_OPPORTUNITIES,
  finalReport: MOCK_FINAL_REPORT,
  createdAt: T0,
  updatedAt: T0,
};

export const MOCK_REPORT_SUMMARIES: ReportSummary[] = [
  {
    runId: MOCK_RUN.id,
    title: MOCK_FINAL_REPORT.title,
    query: QUERY,
    status: "complete",
    createdAt: T0,
    opportunityCount: MOCK_OPPORTUNITIES.length,
    topOpportunities: MOCK_OPPORTUNITIES.slice(0, 3).map((o) => ({
      id: o.id,
      startupName: o.startupName,
      goliathScore: o.goliathScore,
      status: o.status,
    })),
  },
];

/**
 * Snapshot of MOCK_RUN as it would look `elapsedMs` after POST /api/runs —
 * poll this from the live view to animate agent spawn/research without a
 * backend. The run completes at 18s.
 */
export function mockRunAt(elapsedMs: number): Run {
  const events = EVENT_TIMELINE.filter((e) => e.atMs <= elapsedMs).map(
    (e) => e.event,
  );
  const spawned = new Set(
    events.filter((e) => e.type === "agent.spawned").map((e) => e.agentId),
  );
  const complete = elapsedMs >= 18000;
  const synthesizing = !complete && elapsedMs >= 15000;

  const agents: AgentPlan[] = MOCK_AGENTS.map((a) => ({
    ...a,
    status: complete
      ? "done"
      : spawned.has(a.id)
        ? "researching"
        : "pending",
  }));

  return {
    ...MOCK_RUN,
    status: complete
      ? "complete"
      : synthesizing
        ? "synthesizing"
        : elapsedMs >= 1500
          ? "researching"
          : "planning_agents",
    agents,
    events,
    opportunities: complete ? MOCK_OPPORTUNITIES : [],
    finalReport: complete ? MOCK_FINAL_REPORT : undefined,
  };
}
