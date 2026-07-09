/**
 * Goliath API client.
 *
 * Set NEXT_PUBLIC_API_BASE_URL (e.g. http://localhost:8000) to talk to the
 * real backend. When it is unset, every call is served from the mock data in
 * `src/lib/mock/mock-run.ts`, so both frontend flows are demoable with no
 * backend running.
 */

import type { FinalReport, ReportSummary, Run } from "@/lib/contract";
import {
  MOCK_FINAL_REPORT,
  MOCK_REPORT_SUMMARIES,
  mockRunAt,
} from "@/lib/mock/mock-run";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const usingMockApi = !BASE_URL;

// Tracks when each mock run "started" so mockRunAt can replay the timeline.
const mockRunStarts = new Map<string, number>();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function createRun(query: string): Promise<Run> {
  if (usingMockApi) {
    const id = `run-mock-${mockRunStarts.size + 1}`;
    mockRunStarts.set(id, Date.now());
    return { ...mockRunAt(0), id, query };
  }
  return request<Run>("/api/runs", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export async function getRun(runId: string): Promise<Run> {
  if (usingMockApi) {
    const startedAt = mockRunStarts.get(runId);
    // Unknown id (e.g. after a page refresh) → replay from the beginning.
    if (startedAt === undefined) {
      mockRunStarts.set(runId, Date.now());
      return { ...mockRunAt(0), id: runId };
    }
    return { ...mockRunAt(Date.now() - startedAt), id: runId };
  }
  return request<Run>(`/api/runs/${runId}`);
}

export async function getReports(): Promise<ReportSummary[]> {
  if (usingMockApi) return MOCK_REPORT_SUMMARIES;
  return request<ReportSummary[]>("/api/reports");
}

export async function getReport(runId: string): Promise<FinalReport> {
  if (usingMockApi) return { ...MOCK_FINAL_REPORT, runId };
  return request<FinalReport>(`/api/reports/${runId}`);
}
