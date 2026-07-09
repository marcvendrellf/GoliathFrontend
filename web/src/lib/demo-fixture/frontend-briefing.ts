/**
 * The primary frontend demo is a checked-in copy of the backend's completed
 * Barcelona AI and deep-tech briefing. Its MP3 clips live in public/
 * demo-briefing, so it remains playable without a backend server.
 */

import type {
  AgentPlan,
  Evidence,
  FinalReport,
  Opportunity,
  PresentationSegment,
  Run,
  RunEvent,
  TranscriptWord,
} from "@/lib/contract";
import reportDump from "./report.json";
import runDump from "./run.json";
import partnerOpeningWords from "./0_partner.words.json";
import marketMapperWords from "./1_market_mapper.words.json";
import companyScoutWords from "./2_company_scout.words.json";
import currentOpportunitiesWords from "./3_current_opportunities.words.json";
import fundingAnalystWords from "./4_funding_analyst.words.json";
import partnerClosingWords from "./5_partner.words.json";

const T0 = "2026-07-09T20:04:17.665Z";
const WORD_TIMINGS: TranscriptWord[][] = [
  partnerOpeningWords,
  marketMapperWords,
  companyScoutWords,
  currentOpportunitiesWords,
  fundingAnalystWords,
  partnerClosingWords,
];
const AUDIO_FILES = [
  "0_partner.mp3",
  "1_market_mapper.mp3",
  "2_company_scout.mp3",
  "3_current_opportunities.mp3",
  "4_funding_analyst.mp3",
  "5_partner.mp3",
];

export const FRONTEND_DEMO_AGENTS: AgentPlan[] = runDump.agents.map((agent) => ({
  id: agent.id,
  name: agent.name,
  role: agent.role,
  purpose: agent.purpose,
  voiceId: agent.voiceId,
  status: "done",
}));

function asEvidence(raw: (typeof reportDump.opportunities)[number]["evidence"][number]): Evidence {
  return {
    id: raw.id,
    source: raw.source as Evidence["source"],
    title: raw.title,
    ...(raw.url ? { url: raw.url } : {}),
    ...(raw.snippet ? { snippet: raw.snippet } : {}),
  };
}

export const FRONTEND_DEMO_OPPORTUNITIES: Opportunity[] = reportDump.opportunities.map(
  (opportunity) => ({
    id: opportunity.id,
    startupName: opportunity.startupName,
    ...(opportunity.location ? { location: opportunity.location } : {}),
    ...(opportunity.sector ? { sector: opportunity.sector } : {}),
    ...(opportunity.stage ? { stage: opportunity.stage } : {}),
    summary: opportunity.summary,
    prediction: opportunity.prediction,
    goliathScore: opportunity.goliathScore,
    status: opportunity.status as Opportunity["status"],
    confidence: opportunity.confidence,
    riskLevel: opportunity.riskLevel as Opportunity["riskLevel"],
    scoreReason: opportunity.scoreReason,
    evidence: opportunity.evidence.map(asEvidence),
  }),
);

const agentById = new Map(FRONTEND_DEMO_AGENTS.map((agent) => [agent.id, agent]));

const segments: PresentationSegment[] = reportDump.segments.map((segment, index) => {
  const speaker = agentById.get(segment.agentId);
  const wordTimings = WORD_TIMINGS[index];

  if (!speaker || !wordTimings) {
    throw new Error("Frontend demo briefing has an incomplete segment fixture.");
  }

  return {
    id: segment.id,
    agentId: segment.agentId,
    speaker: {
      name: speaker.name,
      role: speaker.role,
      purpose: speaker.purpose,
    },
    title: segment.title,
    subtitle: segment.subtitle,
    script: segment.script,
    audioUrl: `/demo-briefing/${AUDIO_FILES[index]}`,
    evidenceIds: segment.evidenceIds,
    wordTimings,
    durationMs: wordTimings.at(-1)?.endMs,
  };
});

export const FRONTEND_DEMO_REPORT: FinalReport = {
  id: reportDump.id,
  runId: "run-demo-barcelona-ai",
  title: reportDump.title,
  executiveSummary: reportDump.executiveSummary,
  createdAt: reportDump.createdAt,
  opportunities: FRONTEND_DEMO_OPPORTUNITIES,
  segments,
};

const EVENT_TIMELINE: { atMs: number; event: RunEvent }[] = [
  {
    atMs: 500,
    event: {
      id: "demo-plan",
      timestamp: T0,
      type: "orchestrator.plan",
      title: "Research plan ready",
      text: "Planned 5 research agents: Partner, Market Mapper, Company Scout, Current Opportunities, Funding Analyst.",
    },
  },
  ...FRONTEND_DEMO_AGENTS.map((agent, index) => ({
    atMs: 1_200 + index * 650,
    event: {
      id: `demo-spawn-${agent.id}`,
      timestamp: T0,
      type: "agent.spawned" as const,
      agentId: agent.id,
      text: `${agent.name} joined the run.`,
    },
  })),
  {
    atMs: 6_000,
    event: {
      id: "demo-finding",
      timestamp: T0,
      type: "agent.finding",
      agentId: "agent-2-current_opportunities",
      title: "Top candidates",
      text: "Top candidates: SETT, SLNG, Seedtag.",
    },
  },
  {
    atMs: 12_000,
    event: {
      id: "demo-segment-ready",
      timestamp: T0,
      type: "report.segment_ready",
      text: "Six-part narrated briefing is ready.",
    },
  },
  {
    atMs: 15_000,
    event: {
      id: "demo-complete",
      timestamp: T0,
      type: "run.complete",
      text: "Research complete. 5 opportunities scored. Final briefing is ready.",
    },
  },
];

export function frontendDemoRunAt(elapsedMs: number): Run {
  const events = EVENT_TIMELINE.filter(({ atMs }) => atMs <= elapsedMs).map(
    ({ event }) => event,
  );
  const spawned = new Set(
    events.filter((event) => event.type === "agent.spawned").map((event) => event.agentId),
  );
  const complete = elapsedMs >= 15_000;

  return {
    id: "run-demo-barcelona-ai",
    query: runDump.query,
    status: complete ? "complete" : elapsedMs >= 12_000 ? "synthesizing" : elapsedMs >= 1_200 ? "researching" : "planning_agents",
    agents: FRONTEND_DEMO_AGENTS.map((agent) => ({
      ...agent,
      status: complete ? "done" : spawned.has(agent.id) ? "researching" : "pending",
    })),
    events,
    opportunities: complete ? FRONTEND_DEMO_OPPORTUNITIES : [],
    finalReport: complete ? FRONTEND_DEMO_REPORT : undefined,
    createdAt: T0,
    updatedAt: T0,
  };
}
