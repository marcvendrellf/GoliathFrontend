"use client";

/**
 * Goliath workspace sidebar — reproduces Sim's sidebar structure using its real
 * emcn primitives (Chip / ChipLink), driven by static Goliath data. Decorative:
 * only "New chat" is wired (resets the conversation).
 */
import { Chip } from "@sim/emcn";
import { PanelLeft } from "@sim/emcn/icons";
import {
  PRIMARY_NAV,
  THREADS,
  type NavItem,
} from "@/lib/goliath/nav-data";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pt-4 pb-1 font-medium text-[var(--text-subtle)] text-xs">
      {children}
    </div>
  );
}

function NavRow({
  item,
  active,
  onClick,
  trailing,
}: {
  item: Pick<NavItem, "label" | "icon">;
  active?: boolean;
  onClick?: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <Chip leftIcon={item.icon} active={active} fullWidth onClick={onClick}>
      <span className="flex-1 truncate text-left">{item.label}</span>
      {trailing}
    </Chip>
  );
}

export function Sidebar({
  onNewChat,
  activeThreadId = "barcelona-ai",
}: {
  onNewChat?: () => void;
  activeThreadId?: string;
}) {
  return (
    <div className="sidebar-container flex h-full flex-col bg-[var(--surface-1)]">
      {/* Header */}
      <div className="flex items-center justify-between px-2 pt-3 pb-1">
        <div className="flex items-center gap-2 px-1">
          <span
            aria-hidden
            className="size-4 rounded-[5px] bg-[var(--brand-agent)]"
          />
          <span className="font-semibold text-[var(--text-primary)] text-small">
            Goliath
          </span>
        </div>
        <button
          type="button"
          aria-label="Toggle sidebar"
          className="flex size-6 items-center justify-center rounded-[5px] text-[var(--text-icon)] hover-hover:bg-[var(--surface-active)]"
        >
          <PanelLeft className="size-4" />
        </button>
      </div>

      {/* Primary actions */}
      <div className="mt-2 flex flex-col gap-0.5 px-2">
        {PRIMARY_NAV.map((item) => (
          <NavRow
            key={item.id}
            item={item}
            onClick={item.id === "new-chat" ? onNewChat : undefined}
          />
        ))}
      </div>

      {/* Scrollable middle */}
      <div className="mt-1 min-h-0 flex-1 overflow-y-auto px-2">
        <SectionLabel>Chats</SectionLabel>
        <div className="flex flex-col gap-0.5 pb-2">
          {THREADS.map((thread) => (
            <Chip key={thread.id} active={thread.id === activeThreadId} fullWidth>
              <span className="flex-1 truncate text-left">{thread.title}</span>
            </Chip>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-0.5 border-[var(--border)] border-t px-2 py-2">
        <Chip fullWidth>
          <span className="flex-1 truncate text-left">Settings</span>
        </Chip>
        <Chip fullWidth>
          <span className="flex-1 truncate text-left">Help</span>
        </Chip>
      </div>
    </div>
  );
}
