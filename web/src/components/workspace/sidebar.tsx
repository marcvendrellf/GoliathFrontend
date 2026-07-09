"use client";

/**
 * Goliath workspace sidebar, reproducing Sim's sidebar structure using its real
 * emcn primitives (Chip / ChipLink), driven by static Goliath data. Decorative:
 * only "New chat" is wired (resets the conversation).
 */
import { Chip } from "@sim/emcn";
import { ChevronDown, MoreHorizontal, PanelLeft, Plus } from "@sim/emcn/icons";
import {
  FOOTER_NAV,
  PRIMARY_NAV,
  WORKFLOWS,
  type NavItem,
} from "@/lib/goliath/nav-data";

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
            className="flex size-5 items-center justify-center rounded-[6px] bg-[#ff5b66] font-medium text-[11px] text-white"
          >
            F
          </span>
          <span className="font-semibold text-[var(--text-primary)] text-small">
            Felipe&apos;s Workspace
          </span>
          <ChevronDown className="size-3.5 text-[var(--text-icon)]" />
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
        <div className="flex items-center justify-between px-2 pt-4 pb-1">
          <span className="font-medium text-[var(--text-subtle)] text-xs">
            Workflows
          </span>
          <div className="flex items-center gap-1 text-[var(--text-icon)]">
            <MoreHorizontal className="size-3.5" />
            <Plus className="size-3.5" />
          </div>
        </div>
        <div className="flex flex-col gap-0.5 pb-2">
          {WORKFLOWS.map((thread) => (
            <Chip key={thread.id} active={thread.id === activeThreadId} fullWidth>
              <span className="flex-1 truncate text-left">{thread.title}</span>
            </Chip>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-0.5 px-2 py-2">
        {FOOTER_NAV.map((item) => (
          <NavRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
