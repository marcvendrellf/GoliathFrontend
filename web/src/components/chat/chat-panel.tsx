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
  const { isSending, messages, stop, submit } = useMockChat({
    run,
    onSubmitQuery,
  });
  const hasMessages = messages.length > 0;

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!hasMessages) {
    return (
      <div className="relative h-full overflow-y-auto bg-[var(--bg)] [scrollbar-gutter:stable_both-edges]">
        <div className="flex min-h-full flex-col items-center justify-center px-6 pt-[2vh] pb-[22vh]">
          <h1 className="mb-7 max-w-[48rem] text-balance font-season text-[30px] text-[var(--text-primary)]">
            What should we find, Felipe?
          </h1>
          <div className="relative w-full max-w-[48rem]">
            <UserInput
              variant="home"
              isSending={isSending}
              onSubmit={submit}
              onStopGeneration={stop}
            />
            <SuggestedActions onSelectPrompt={submit} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--bg)]">
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
          <UserInput isSending={isSending} onSubmit={submit} onStopGeneration={stop} />
        </div>
      </div>
    </div>
  );
}
