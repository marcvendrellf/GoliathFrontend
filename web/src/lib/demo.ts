/** Fixed frontend-owned briefing used by the primary demo action. */
export const FRONTEND_DEMO_QUERY =
  "AI and deep-tech startup investment opportunities in Barcelona with strong traction";

export const FRONTEND_DEMO_RUN_ID = "run-demo-barcelona-ai";

export function isFrontendDemoQuery(query: string): boolean {
  return query.trim() === FRONTEND_DEMO_QUERY;
}
