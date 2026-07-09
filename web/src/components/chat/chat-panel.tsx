"use client";

import { useEffect, useRef } from "react";
import { cn } from "@sim/emcn";
import type { Run } from "@/lib/contract";
import { MessageContent, PendingTagIndicator, assistantMessageHasRenderableContent } from "./message-content";
import { SuggestedActions } from "./suggested-actions";
import { useMockChat } from "./use-mock-chat";
import { UserInput } from "./user-input";
import { UserMessageContent } from "./user-message-content";

export function ChatPanel({
  run,
  onSubmitQuery,
}: {
  run?: Run;
  onSubmitQuery: (query: string) => Promise<Run>;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { isSending, messages, reset, stop, submit } = useMockChat({
    run,
    onSubmitQuery,
  });

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--bg)]">
      <div className="flex shrink-0 items-center justify-between border-[var(--border)] border-b px-6 py-3">
        <div>
          <h1 className="font-medium text-[var(--text-primary)] text-base">Goliath Copilot</h1>
          <p className="text-[var(--text-muted)] text-small">
            VC research team, assembled on demand
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-[6px] px-2 py-1 text-[var(--text-secondary)] text-small transition-colors hover-hover:bg-[var(--surface-4)]"
        >
          New chat
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pt-4 pb-8 [scrollbar-gutter:stable_both-edges]"
      >
        <div className="mx-auto flex w-full max-w-[48rem] flex-col gap-6">
          {messages.map((message, index) => {
            const isLast = index === messages.length - 1;
            if (message.role === "user") {
              return (
                <div key={message.id} className="flex flex-col items-end gap-[6px] pt-3">
                  <div className="max-w-[70%] overflow-hidden rounded-[16px] bg-[var(--surface-5)] px-3.5 py-2">
                    <UserMessageContent content={message.content} />
                  </div>
                </div>
              );
            }

            const hasContent = assistantMessageHasRenderableContent(
              message.contentBlocks,
              message.content,
            );

            return (
              <div key={message.id} className={cn("group/msg", !hasContent && "min-h-6")}>
                {hasContent ? (
                  <MessageContent
                    blocks={message.contentBlocks}
                    fallbackContent={message.content}
                    isStreaming={isSending && isLast}
                    onOptionSelect={submit}
                  />
                ) : (
                  <PendingTagIndicator />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-shrink-0 px-[24px] pb-[16px]">
        <div className="mx-auto flex max-w-[48rem] flex-col gap-3">
          {!run && <SuggestedActions onSelectPrompt={submit} />}
          <UserInput isSending={isSending} onSubmit={submit} onStopGeneration={stop} />
        </div>
      </div>
    </div>
  );
}

