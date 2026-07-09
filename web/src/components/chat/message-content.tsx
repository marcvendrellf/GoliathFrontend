"use client";

import { useMemo } from "react";
import { Streamdown } from "streamdown";
import "streamdown/styles.css";
import { ChevronDown, cn, Expandable, ExpandableContent, PillsRing } from "@sim/emcn";
import {
  Check,
  CircleInfo,
  Database,
  Search,
  ShieldCheck,
  Square,
} from "@sim/emcn/icons";
import type { ContentBlock, OptionItem, ToolCallInfo } from "./types";

type AgentGroupSegment = {
  type: "agent_group";
  id: string;
  agentName: string;
  agentLabel: string;
  items: Array<{ type: "text"; content: string } | { type: "tool"; data: ToolCallInfo }>;
  isDelegating: boolean;
  isOpen: boolean;
};

type TextSegment = {
  type: "text";
  id: string;
  content: string;
};

type OptionsSegment = {
  type: "options";
  items: OptionItem[];
};

type ThinkingSegment = {
  type: "thinking";
  id: string;
  content: string;
};

type MessageSegment = AgentGroupSegment | TextSegment | OptionsSegment | ThinkingSegment;

const THINKING_BLOCKS = [
  { color: "#2ABBF8", delay: "0s" },
  { color: "#00F701", delay: "0.2s" },
  { color: "#FA4EDF", delay: "0.6s" },
  { color: "#FFCC02", delay: "0.4s" },
] as const;

const AGENT_LABELS: Record<string, string> = {
  orchestrator: "Goliath Partner",
  "agent-market": "Market Mapper",
  "agent-scout": "Company Scout",
  "agent-funding": "Funding Analyst",
  "agent-risk": "Risk Analyst",
};

function agentLabel(agentId: string): string {
  return AGENT_LABELS[agentId] ?? agentId;
}

function parseBlocks(blocks: ContentBlock[]): MessageSegment[] {
  const segments: MessageSegment[] = [];
  const groups = new Map<string, AgentGroupSegment>();

  const ensureGroup = (agentName: string, spanId: string): AgentGroupSegment => {
    const existing = groups.get(spanId);
    if (existing) return existing;
    const group: AgentGroupSegment = {
      type: "agent_group",
      id: `agent-${spanId}`,
      agentName,
      agentLabel: agentLabel(agentName),
      items: [],
      isDelegating: true,
      isOpen: true,
    };
    groups.set(spanId, group);
    segments.push(group);
    return group;
  };

  blocks.forEach((block, index) => {
    if (block.type === "thinking") {
      segments.push({ type: "thinking", id: `thinking-${index}`, content: block.content });
      return;
    }

    if (block.type === "text" && block.content) {
      const last = segments[segments.length - 1];
      if (last?.type === "text") {
        last.content += block.content;
      } else {
        segments.push({ type: "text", id: `text-${index}`, content: block.content });
      }
      return;
    }

    if (block.type === "tool_call") {
      const group = ensureGroup("orchestrator", "orchestrator");
      group.isDelegating = block.toolCall.status === "executing";
      group.items.push({ type: "tool", data: block.toolCall });
      return;
    }

    if (block.type === "subagent") {
      const group = ensureGroup(block.content, block.spanId);
      group.isOpen = block.endedAt === undefined;
      group.isDelegating = block.endedAt === undefined;
      return;
    }

    if (block.type === "subagent_text") {
      const group = ensureGroup(block.subagent, block.spanId);
      group.isDelegating = false;
      group.items.push({ type: "text", content: block.content });
      return;
    }

    if (block.type === "subagent_end") {
      const group = groups.get(block.spanId);
      if (group) {
        group.isOpen = false;
        group.isDelegating = false;
      }
      return;
    }

    if (block.type === "options" && block.options.length > 0) {
      segments.push({ type: "options", items: block.options });
    }
  });

  return segments.filter(
    (segment) =>
      segment.type !== "agent_group" ||
      segment.items.length > 0 ||
      segment.isDelegating ||
      segment.isOpen,
  );
}

function AgentIcon({ agentName, className }: { agentName: string; className?: string }) {
  const Icon =
    agentName === "agent-market"
      ? Database
      : agentName === "agent-scout"
        ? Search
        : agentName === "agent-risk"
          ? ShieldCheck
          : CircleInfo;
  return <Icon className={className} />;
}

function ToolStatus({ toolCall }: { toolCall: ToolCallInfo }) {
  if (toolCall.status === "executing") {
    return <PillsRing className="size-[15px] text-[var(--text-tertiary)]" animate />;
  }
  if (toolCall.status === "error") {
    return <Square className="size-[15px] text-[var(--text-tertiary)]" />;
  }
  return <Check className="size-[15px] text-[var(--text-tertiary)]" />;
}

function AgentGroup({ segment, isStreaming }: { segment: AgentGroupSegment; isStreaming: boolean }) {
  const expanded = isStreaming || segment.isOpen || segment.isDelegating;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className="flex size-[16px] flex-shrink-0 items-center justify-center">
          {segment.isDelegating ? (
            <PillsRing className="size-[15px] text-[var(--text-icon)]" animate />
          ) : (
            <AgentIcon agentName={segment.agentName} className="size-[16px] text-[var(--text-icon)]" />
          )}
        </div>
        <span className="text-[var(--text-body)] text-sm">{segment.agentLabel}</span>
        {segment.items.length > 0 && (
          <ChevronDown
            className={cn(
              "h-[7px] w-[9px] text-[var(--text-icon)] transition-transform duration-150",
              !expanded && "-rotate-90",
            )}
          />
        )}
      </div>

      {segment.items.length > 0 && (
        <Expandable expanded={expanded}>
          <ExpandableContent>
            <div className="flex max-h-[140px] flex-col gap-1.5 overflow-y-auto py-0.5 pr-2">
              {segment.items.map((item, index) => {
                if (item.type === "tool") {
                  return (
                    <div key={item.data.id} className="flex items-center gap-[8px] pl-[24px]">
                      <div className="flex size-[16px] flex-shrink-0 items-center justify-center">
                        <ToolStatus toolCall={item.data} />
                      </div>
                      <span className="text-[13px] text-[var(--text-secondary)]">
                        {item.data.displayTitle}
                      </span>
                    </div>
                  );
                }
                return (
                  <span
                    key={`${segment.id}-${index}`}
                    className="pl-6 text-[13px] text-[var(--text-secondary)] leading-[18px] opacity-70"
                  >
                    {item.content.trim()}
                  </span>
                );
              })}
            </div>
          </ExpandableContent>
        </Expandable>
      )}
    </div>
  );
}

function Options({
  items,
  onSelect,
}: {
  items: OptionItem[];
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect?.(item.id)}
          className="rounded-full border border-[var(--divider)] bg-[var(--bg)] px-3.5 py-1.5 font-[430] font-[family-name:var(--font-inter)] text-[var(--text-primary)] text-sm leading-5 transition-colors hover-hover:bg-[var(--surface-5)]"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function PendingTagIndicator() {
  return (
    <div className="flex animate-stream-fade-in items-center gap-2 py-2">
      <div className="grid size-[16px] grid-cols-2 gap-[1.5px]">
        {THINKING_BLOCKS.map((block, index) => (
          <div
            key={index}
            className="animate-thinking-block rounded-xs"
            style={{ backgroundColor: block.color, animationDelay: block.delay }}
          />
        ))}
      </div>
      <span className="text-[var(--text-body)] text-sm">Thinking...</span>
    </div>
  );
}

export function MessageContent({
  blocks,
  fallbackContent,
  isStreaming,
  onOptionSelect,
}: {
  blocks?: ContentBlock[];
  fallbackContent?: string;
  isStreaming: boolean;
  onOptionSelect?: (id: string) => void;
}) {
  const segments = useMemo(() => parseBlocks(blocks ?? []), [blocks]);

  if (segments.length === 0 && !fallbackContent) {
    return isStreaming ? <PendingTagIndicator /> : null;
  }

  return (
    <div className="flex flex-col gap-4">
      {segments.map((segment) => {
        if (segment.type === "agent_group") {
          return <AgentGroup key={segment.id} segment={segment} isStreaming={isStreaming} />;
        }
        if (segment.type === "options") {
          return <Options key={segment.items.map((item) => item.id).join("-")} items={segment.items} onSelect={onOptionSelect} />;
        }
        if (segment.type === "thinking") {
          return <PendingTagIndicator key={segment.id} />;
        }
        return (
          <div
            key={segment.id}
            className="prose prose-base max-w-none break-words font-[430] font-[family-name:var(--font-inter)] tracking-[0] prose-p:my-0 prose-p:text-[var(--text-primary)] prose-p:text-base prose-p:leading-[25px] prose-strong:text-[var(--text-primary)]"
          >
            <Streamdown>{segment.content}</Streamdown>
          </div>
        );
      })}
      {segments.length === 0 && fallbackContent && (
        <div className="prose prose-base max-w-none break-words font-[430] font-[family-name:var(--font-inter)] tracking-[0] prose-p:my-0 prose-p:text-[var(--text-primary)] prose-p:text-base prose-p:leading-[25px]">
          <Streamdown>{fallbackContent}</Streamdown>
        </div>
      )}
    </div>
  );
}

export function assistantMessageHasRenderableContent(
  blocks?: ContentBlock[],
  fallbackContent?: string,
) {
  return Boolean((blocks?.length ?? 0) > 0 || fallbackContent?.trim());
}
