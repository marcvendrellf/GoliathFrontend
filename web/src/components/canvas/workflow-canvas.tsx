"use client";

import { useEffect, useMemo, useRef } from "react";
import ReactFlow, { Background, Controls, type ReactFlowInstance } from "reactflow";
import type { Run } from "@/lib/contract";
import { AgentNode } from "./agent-node";
import { graphFromRun } from "./graph-from-run";

const nodeTypes = {
  agent: AgentNode,
};

export function WorkflowCanvas({ run }: { run?: Run }) {
  const { nodes, edges } = useMemo(() => graphFromRun(run), [run]);
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      reactFlowRef.current?.fitView({ padding: 0.22, duration: 450 });
    });
  }, [nodes.length, run?.status]);

  return (
    <div className="workflow-container canvas-mode-hand h-full w-full bg-[var(--surface-3)]">
      <ReactFlow
        key={run?.id ?? "empty"}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          reactFlowRef.current = instance;
        }}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        minZoom={0.35}
        maxZoom={1.4}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="var(--workflow-edge)" gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
