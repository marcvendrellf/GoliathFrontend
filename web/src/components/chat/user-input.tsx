"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { cn, Textarea } from "@sim/emcn";
import { Send, Square } from "@sim/emcn/icons";

export function UserInput({
  defaultValue = "",
  isSending,
  onSubmit,
  onStopGeneration,
}: {
  defaultValue?: string;
  isSending: boolean;
  onSubmit: (text: string) => void;
  onStopGeneration: () => void;
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
      className="rounded-[20px] border border-[var(--border-1)] bg-[var(--surface-2)] p-2 shadow-card"
    >
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Goliath to find VC opportunities..."
        rows={1}
        className="max-h-[168px] min-h-[52px] resize-none border-0 bg-transparent px-2 py-2 font-[430] text-base shadow-none focus-visible:ring-0"
      />
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-1 text-[var(--text-subtle)] text-xs">
          <span>Cala AI</span>
          <span>·</span>
          <span>News</span>
          <span>·</span>
          <span>PitchBook</span>
        </div>
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
          {isSending ? <Square className="size-3.5" /> : <Send className="size-3.5" />}
        </button>
      </div>
    </form>
  );
}

