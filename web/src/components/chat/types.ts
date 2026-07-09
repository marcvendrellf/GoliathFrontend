export const ToolCallStatus = {
  executing: "executing",
  success: "success",
  error: "error",
} as const;

export type ToolCallStatus =
  (typeof ToolCallStatus)[keyof typeof ToolCallStatus];

export type ToolCallInfo = {
  id: string;
  name: string;
  displayTitle: string;
  status: ToolCallStatus;
};

export type OptionItem = {
  id: string;
  label: string;
};

export type ContentBlock =
  | { type: "text"; content: string }
  | { type: "thinking"; content: string }
  | { type: "tool_call"; toolCall: ToolCallInfo }
  | {
      type: "subagent";
      content: string;
      spanId: string;
      parentSpanId?: string;
      endedAt?: number;
    }
  | {
      type: "subagent_text";
      content: string;
      subagent: string;
      spanId: string;
      parentSpanId?: string;
    }
  | { type: "subagent_end"; spanId: string }
  | { type: "options"; options: OptionItem[] };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  contentBlocks?: ContentBlock[];
};

