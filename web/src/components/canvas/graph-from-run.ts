import type { Edge, Node } from "reactflow";
import type { Run } from "@/lib/contract";
import type { AgentNodeData } from "./agent-node";

const ORCHESTRATOR_ID = "orchestrator";

export function graphFromRun(run?: Run): {
  nodes: Node<AgentNodeData>[];
  edges: Edge[];
} {
  const spawnedAgentIds = new Set(
    run?.events
      .filter((event) => event.type === "agent.spawned" && event.agentId)
      .map((event) => event.agentId) ?? [],
  );
  const agents =
    run?.agents.filter(
      (agent) => run.status === "complete" || spawnedAgentIds.has(agent.id),
    ) ?? [];
  const status = run?.status ?? "awaiting_query";
  const active =
    status === "planning_agents" ||
    status === "researching" ||
    status === "synthesizing";

  const nodes: Node<AgentNodeData>[] = [
    {
      id: ORCHESTRATOR_ID,
      type: "agent",
      position: { x: 40, y: 160 },
      data: {
        kind: "orchestrator",
        name: "Goliath Partner",
        role: "Orchestrator",
        purpose: run?.query ?? "Translate the user query into a specialist research team.",
        status: run
          ? status === "complete"
            ? "done"
            : active
              ? "researching"
              : "pending"
          : "pending",
      },
    },
  ];

  agents.forEach((agent, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    nodes.push({
      id: agent.id,
      type: "agent",
      position: {
        x: 370 + column * 300,
        y: 70 + row * 190,
      },
      data: {
        kind: "agent",
        name: agent.name,
        role: agent.role,
        purpose: agent.purpose,
        status: agent.status,
      },
    });
  });

  const edges: Edge[] = agents.map((agent) => ({
    id: `${ORCHESTRATOR_ID}-${agent.id}`,
    source: ORCHESTRATOR_ID,
    sourceHandle: "source",
    target: agent.id,
    targetHandle: "target",
    type: "smoothstep",
    animated:
      agent.status === "researching" ||
      agent.status === "speaking" ||
      status === "planning_agents",
    style: {
      stroke: "var(--workflow-edge)",
      strokeWidth: 1.5,
    },
  }));

  return { nodes, edges };
}
