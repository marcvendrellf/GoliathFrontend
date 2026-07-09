"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { cn, Textarea } from "@sim/emcn";
import { ArrowUp, Mic, Paperclip, Plus, Send, Slash, Square } from "@sim/emcn/icons";

export function UserInput({
  defaultValue = "",
  isSending,
  onSubmit,
  onStopGeneration,
  variant = "chat",
}: {
  defaultValue?: string;
  isSending: boolean;
  onSubmit: (text: string) => void;
  onStopGeneration: () => void;
  variant?: "home" | "chat";
}) {
  const [value, setValue] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 168)}px`;
  }, [value]);

  function submit() {
    const text = value.trim();
    if (!text || isSending) return;
    onSubmit(text);
    setValue("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-[20px] border border-[var(--border-1)] bg-[var(--surface-2)] p-2 shadow-card",
        variant === "home" && "rounded-[18px]",
      )}
    >
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Goliath to find and track opportunities..."
        rows={1}
        className={cn(
          "max-h-[168px] resize-none border-0 bg-transparent px-2 py-2 font-[430] text-base shadow-none focus-visible:ring-0",
          variant === "home" ? "min-h-[44px]" : "min-h-[52px]",
        )}
      />
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-1.5 text-[var(--text-icon)]">
          <button type="button" className="flex size-7 items-center justify-center rounded-[6px] hover-hover:bg-[var(--surface-4)]" aria-label="Add">
            <Plus className="size-4" />
          </button>
          <button type="button" className="flex size-7 items-center justify-center rounded-[6px] hover-hover:bg-[var(--surface-4)]" aria-label="Attach">
            <Paperclip className="size-4" />
          </button>
          <button type="button" className="flex size-7 items-center justify-center rounded-[6px] hover-hover:bg-[var(--surface-4)]" aria-label="Command">
            <Slash className="size-4" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" className="flex size-7 items-center justify-center rounded-[6px] text-[var(--text-icon)] hover-hover:bg-[var(--surface-4)]" aria-label="Voice input">
            <Mic className="size-4" />
          </button>
          <button
            type={isSending ? "button" : "submit"}
            onClick={isSending ? onStopGeneration : undefined}
            disabled={!isSending && value.trim().length === 0}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors",
              isSending
                ? "bg-[var(--surface-5)] text-[var(--text-primary)]"
                : "bg-[var(--text-primary)] text-[var(--text-inverse)] hover-hover:bg-[var(--text-body)] disabled:bg-[var(--surface-6)] disabled:text-[var(--text-muted)]",
            )}
            aria-label={isSending ? "Stop generation" : "Send message"}
          >
            {isSending ? (
              <Square className="size-3.5" />
            ) : variant === "home" ? (
              <ArrowUp className="size-4" />
            ) : (
              <Send className="size-3.5" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
