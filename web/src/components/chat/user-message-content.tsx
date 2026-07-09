"use client";

import { cn } from "@sim/emcn";

const USER_MESSAGE_CLASSES =
  "whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-[430] font-[family-name:var(--font-inter)] text-base text-[var(--text-primary)] leading-[23px] tracking-[0] antialiased";

export function UserMessageContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return <p className={cn(USER_MESSAGE_CLASSES, className)}>{content.trim()}</p>;
}

