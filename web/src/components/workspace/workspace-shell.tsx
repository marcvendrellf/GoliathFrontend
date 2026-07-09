"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Workspace shell — adapted from Sim's workspace-chrome. Sidebar rail on the
 * left; the routed content sits in Sim's signature rounded, bordered frame.
 * Fixed sidebar width (no collapse for the hackathon).
 */
export function WorkspaceShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="flex h-screen min-h-0"
      style={{ "--sidebar-width": "244px" } as CSSProperties}
    >
      <div className="sidebar-shell-outer w-[var(--sidebar-width)] shrink-0 overflow-hidden">
        <div className="sidebar-shell-inner h-full w-[var(--sidebar-width)] shrink-0">
          {sidebar}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-[8px] pl-0">
        <div className="flex-1 overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--bg)]">
          {children}
        </div>
      </div>
    </div>
  );
}
