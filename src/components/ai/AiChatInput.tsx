"use client";

import * as React from "react";
import { Send, Mic } from "lucide-react";
import { useAiChat } from "@/hooks/useAiChat";
import { cn } from "@/lib/utils";

export function AiChatInput({ eventType = "CHAT" }: { eventType?: string }) {
  const { send, isLoading } = useAiChat();
  const [value, setValue]   = React.useState("");
  const inputRef            = React.useRef<HTMLTextAreaElement>(null);

  const submit = async () => {
    const text = value.trim();
    if (!text || isLoading) return;
    setValue("");
    await send(text, eventType);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  // Auto-resize textarea
  React.useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [value]);

  return (
    <div className="border-t border-border bg-background px-4 py-3">
      <div className="flex items-end gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 focus-within:border-primary/40 focus-within:bg-background focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask Exterro AI anything…"
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground leading-relaxed"
          disabled={isLoading}
        />
        <div className="flex shrink-0 items-center gap-1 pb-0.5">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Voice input"
          >
            <Mic className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim() || isLoading}
            aria-label="Send message"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
              value.trim() && !isLoading
                ? "bg-primary text-white hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60">
        Exterro AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
