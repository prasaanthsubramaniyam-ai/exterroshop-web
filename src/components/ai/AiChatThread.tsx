"use client";

import * as React from "react";
import Link from "next/link";
import { useAppSelector } from "@/store";
import { cn } from "@/lib/utils";

export function AiChatThread() {
  const messages  = useAppSelector((s) => s.ai.messages);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
        <span className="text-3xl">✦</span>
        <p className="text-sm font-medium text-foreground">How can I help you today?</p>
        <p className="text-xs text-muted-foreground">
          Ask me anything about attendance, leave, engagement, reports, or your team.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col gap-1",
            msg.role === "user" ? "items-end" : "items-start"
          )}
        >
          <div
            className={cn(
              "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-primary text-white rounded-tr-sm"
                : "bg-muted text-foreground rounded-tl-sm"
            )}
          >
            {msg.isStreaming ? (
              <span className="inline-flex gap-1">
                <span className="animate-bounce">·</span>
                <span className="animate-bounce [animation-delay:0.15s]">·</span>
                <span className="animate-bounce [animation-delay:0.3s]">·</span>
              </span>
            ) : (
              msg.content
            )}
          </div>

          {/* Action button */}
          {msg.action && msg.action.type === "NAVIGATE" && msg.action.url && (
            <Link
              href={msg.action.url}
              className="mt-0.5 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              {msg.action.label ?? "Go"} →
            </Link>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
