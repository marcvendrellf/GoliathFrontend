/**
 * Static, decorative sidebar data for the Goliath workspace. No persistence.
 * these drive the ported Sim sidebar's nav rows as pure decoration, except
 * "New chat" which resets the conversation.
 */
import {
  HelpCircle,
  Home,
  Integration,
  Search,
  Settings,
} from "@sim/emcn/icons";

export type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type ThreadItem = {
  id: string;
  title: string;
};

export const PRIMARY_NAV: NavItem[] = [
  { id: "new-chat", label: "New chat", icon: Home },
  { id: "search", label: "Search", icon: Search },
  { id: "integrations", label: "Integrations", icon: Integration },
];

export const FOOTER_NAV: NavItem[] = [
  { id: "help", label: "Help", icon: HelpCircle },
  { id: "settings", label: "Settings", icon: Settings },
];

export const WORKFLOWS: ThreadItem[] = [
  { id: "barcelona-ai", title: "Barcelona AI opportunities" },
  { id: "fintech-berlin", title: "Fintech seed rounds Berlin" },
  { id: "climate-series-a", title: "Climate tech Series A" },
  { id: "llm-infra", title: "LLM infra startups" },
  { id: "healthtech-q3", title: "Healthtech Q3 scan" },
];
