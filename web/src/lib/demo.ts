/** Fixed frontend-owned briefing used by the primary demo action. */
export const FRONTEND_DEMO_QUERY =
  "Show me startup opportunities of investment in Barcelona related to AI.";

export const FRONTEND_DEMO_RUN_ID = "run-demo-barcelona-ai";

export function isFrontendDemoQuery(query: string): boolean {
  return query.trim() === FRONTEND_DEMO_QUERY;
}
