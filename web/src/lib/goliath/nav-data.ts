/**
 * Static, decorative sidebar data for the Goliath workspace. No persistence —
 * these drive the ported Sim sidebar's nav rows as pure decoration, except
 * "New chat" which resets the conversation.
 */
import {
  Files,
  Home,
  Integration,
  Search,
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

/** Top primary actions. */
export const PRIMARY_NAV: NavItem[] = [
  { id: "new-chat", label: "New chat", icon: Home },
  { id: "search", label: "Search", icon: Search },
  { id: "new-project", label: "New project", icon: Files },
  { id: "integrations", label: "Integrations", icon: Integration },
];

/** Fake prior conversation threads (decorative). */
export const THREADS: ThreadItem[] = [
  { id: "barcelona-ai", title: "Barcelona AI opportunities" },
  { id: "fintech-berlin", title: "Fintech seed rounds — Berlin" },
  { id: "climate-series-a", title: "Climate tech Series A" },
  { id: "llm-infra", title: "LLM infra startups" },
  { id: "healthtech-q3", title: "Healthtech Q3 scan" },
];
