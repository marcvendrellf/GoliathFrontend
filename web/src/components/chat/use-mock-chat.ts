"use client";

import { useEffect, useMemo, useState } from "react";
import type { Run, RunEvent } from "@/lib/contract";
import { MOCK_AGENTS, MOCK_RUN } from "@/lib/mock/mock-run";
import { agentRoleLabel } from "@/lib/goliath/agent-labels";
import type { ChatMessage, ContentBlock } from "./types";

const DEMO_QUERY =
  "Show me startup opportunities of investment in Barcelona related to AI.";

function toolStatusFor(run?: Run) {
  if (!run || run.status === "planning_agents") return "executing";
  if (run.status === "error") return "error";
  return "success";
}

function agentDisplayName(run: Run | undefined, agentId: string): string {
  const agent = run?.agents.find((candidate) => candidate.id === agentId);
  return agent?.name ?? agentRoleLabel(agentId.replace(/^agent-\d+-/, ""));
}

function eventToBlock(event: RunEvent, run?: Run): ContentBlock | null {
  if (event.type === "orchestrator.plan") {
    return {
      type: "tool_call",
      toolCall: {
        id: event.id,
        name: "plan_agents",
        displayTitle: event.title ?? "Planning specialist agents",
        status: toolStatusFor(run),
      },
    };
  }

  if (event.type === "agent.spawned" && event.agentId) {
    return {
      type: "subagent",
      content: agentDisplayName(run, event.agentId),
      spanId: event.agentId,
      endedAt: run?.agents.find((agent) => agent.id === event.agentId)?.status === "done"
        ? Date.now()
        : undefined,
    };
  }

  if ((event.type === "agent.message" || event.type === "agent.finding") && event.agentId) {
    return {
      type: "subagent_text",
      subagent: event.agentId,
      spanId: event.agentId,
      content: event.title ? `${event.title}: ${event.text}` : event.text,
    };
  }

  if (event.type === "report.segment_ready") {
    return {
      type: "tool_call",
      toolCall: {
        id: event.id,
        name: "synthesize_report",
        displayTitle: "Synthesizing the investment briefing",
        status: run?.status === "complete" ? "success" : "executing",
      },
    };
  }

  if (event.type === "run.complete") {
    return {
      type: "text",
      content:
        "\nResearch complete. I found 3 Barcelona AI opportunities and ranked them by Goliath Score.",
    };
  }

  return null;
}

function blocksFromRun(run?: Run): ContentBlock[] {
  if (!run) {
    return [
      {
        type: "text",
        content:
          "I can assemble a focused VC research team, scan the market, and produce a scored shortlist.",
      },
      {
        type: "options",
        options: [
          { id: DEMO_QUERY, label: "Run Barcelona AI scan" },
          { id: "Show me AI infrastructure opportunities in Spain.", label: "AI infra in Spain" },
        ],
      },
    ];
  }

  const blocks: ContentBlock[] = [];
  if (run.events.length === 0) {
    blocks.push({ type: "thinking", content: "Planning agents" });
  }

  run.events.forEach((event) => {
    const block = eventToBlock(event, run);
    if (block) blocks.push(block);
  });

  if (run.status === "complete") {
    run.agents.forEach((agent) => {
      blocks.push({ type: "subagent_end", spanId: agent.id });
    });
    blocks.push({
      type: "options",
      options: [
        { id: `/reports/${run.id}`, label: "Open final report" },
        { id: DEMO_QUERY, label: "Replay the demo run" },
      ],
    });
  }

  return blocks;
}

function seedMessages(): ChatMessage[] {
  return [];
}

export function useMockChat({
  run,
  onSubmitQuery,
}: {
  run?: Run;
  onSubmitQuery: (query: string) => Promise<Run>;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [isSending, setIsSending] = useState(false);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  useEffect(() => {
    if (!run || !lastQuery) return;
    setMessages((current) => {
      const assistant: ChatMessage = {
        id: `assistant-${run.id}`,
        role: "assistant",
        content: "",
        contentBlocks: blocksFromRun(run),
      };
      const existingIndex = current.findIndex((message) => message.id === assistant.id);
      const startingIndex = current.findIndex((message) => message.id === "assistant-starting");
      if (existingIndex === -1 && startingIndex === -1) return [...current, assistant];
      const next = [...current];
      next[existingIndex === -1 ? startingIndex : existingIndex] = assistant;
      return next.filter(
        (message, index) =>
          message.id !== "assistant-starting" &&
          (message.id !== assistant.id || index === next.findIndex((item) => item.id === assistant.id)),
      );
    });
    setIsSending(run.status !== "complete" && run.status !== "error");
  }, [lastQuery, run]);

  async function submit(text: string) {
    if (text.startsWith("/reports/")) {
      window.location.href = text;
      return;
    }

    const query = text.trim();
    if (!query) return;
    setLastQuery(query);
    setIsSending(true);
    setMessages([
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: query,
      },
      {
        id: "assistant-starting",
        role: "assistant",
        content: "",
        contentBlocks: [
          {
            type: "thinking",
            content: "Planning specialist agents",
          },
        ],
      },
    ]);

    await onSubmitQuery(query);
  }

  function stop() {
    setIsSending(false);
  }

  function reset() {
    setMessages(seedMessages());
    setLastQuery(null);
    setIsSending(false);
  }

  const agents = useMemo(() => run?.agents ?? MOCK_AGENTS, [run]);
  const completeRun = run?.status === "complete" ? run : MOCK_RUN;

  return {
    agents,
    completeRun,
    isSending,
    messages,
    reset,
    stop,
    submit,
  };
}
