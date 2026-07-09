const AGENT_ROLE_LABELS: Record<string, string> = {
  market_mapper: "Market analysis",
  company_scout: "Startup discovery",
  current_opportunities: "Opportunity heat",
  funding_analyst: "Funding analysis",
  risk_analyst: "Risk assessment",
};

export function agentRoleLabel(role: string): string {
  return (
    AGENT_ROLE_LABELS[role] ??
    role
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}
