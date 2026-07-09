"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChatPanel } from "@/components/chat";
import { WorkflowCanvas } from "@/components/canvas/workflow-canvas";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { Sidebar } from "@/components/workspace/sidebar";
import { createRun, getRun } from "@/lib/api";
import type { Run } from "@/lib/contract";

export default function HomePage() {
  const [run, setRun] = useState<Run | undefined>();
  const [chatKey, setChatKey] = useState(0);

  const submitQuery = useCallback(async (query: string) => {
    const created = await createRun(query);
    setRun(created);
    return created;
  }, []);

  const reset = useCallback(() => {
    setRun(undefined);
    setChatKey((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!run || run.status === "complete" || run.status === "error") return;
    const interval = window.setInterval(async () => {
      setRun(await getRun(run.id));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [run]);

  const workflowOpen = Boolean(
    run?.events.some((event) => event.type === "agent.spawned"),
  );

  return (
    <WorkspaceShell sidebar={<Sidebar onNewChat={reset} />}>
      <div className="flex h-full">
        <div
          className={
            workflowOpen
              ? "min-w-[480px] flex-1 border-[var(--border)] border-r"
              : "min-w-0 flex-1"
          }
        >
          <ChatPanel key={chatKey} run={run} onSubmitQuery={submitQuery} />
        </div>
        {workflowOpen && (
          <div className="relative h-full w-[48%] min-w-[520px] shrink-0 animate-slide-in-right">
            <WorkflowCanvas run={run} />
            {run?.status === "complete" && (
              <div className="absolute top-4 right-4 z-10 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-overlay">
                <p className="mb-2 text-[var(--text-secondary)] text-small">
                  Research complete
                </p>
                <Link
                  href={`/reports/${run.id}`}
                  className="inline-flex items-center rounded-[6px] bg-[var(--text-primary)] px-3 py-1.5 text-[var(--text-inverse)] text-small"
                >
                  Open final report
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
