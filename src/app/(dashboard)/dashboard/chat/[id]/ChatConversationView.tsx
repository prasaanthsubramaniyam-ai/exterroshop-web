"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Circle } from "lucide-react";
import { chatService } from "@/services/chat.service";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import type { Message, Conversation } from "@/types";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/utils/format";

interface Props { conversationId: number; }

export function ChatConversationView({ conversationId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [conversation, setConversation] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [otherTyping, setOtherTyping] = React.useState(false);
  const [otherOnline] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const typingTimer = React.useRef<ReturnType<typeof setTimeout>>();

  const { connected, sendTyping, sendRead } = useWebSocket({
    conversationId,
    onMessage: (msg) => {
      const m = msg as Message;
      setMessages((prev) => {
        if (prev.some((x) => x.id === m.id)) return prev;
        return [...prev, m];
      });
      sendRead(conversationId);
    },
    onTyping: (data) => {
      const d = data as { typing: boolean; senderId: number };
      if (d.senderId !== user?.id) {
        setOtherTyping(d.typing);
        if (d.typing) {
          clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setOtherTyping(false), 3000);
        }
      }
    },
    onRead: (data) => {
      const d = data as { senderId: number };
      // The OTHER user opened the chat — flip the "read" indicator on messages I sent.
      if (d.senderId !== user?.id) {
        setMessages((prev) => prev.map((m) => (m.senderId === user?.id ? { ...m, isRead: true } : m)));
      }
    },
  });

  React.useEffect(() => {
    Promise.all([
      chatService.getConversations().then((convs) => convs.find((c) => c.id === conversationId)),
      chatService.getMessages(conversationId),
    ]).then(([conv, msgs]) => {
      if (conv) setConversation(conv);
      setMessages(msgs);
      chatService.markRead(conversationId).catch(() => {});
    }).catch(() => {});
  }, [conversationId]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    try {
      const msg = await chatService.sendMessage(conversationId, text);
      setMessages((prev) => {
        if (prev.some((x) => x.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } catch {} finally {
      setSending(false);
    }
  };

  const handleTyping = (val: string) => {
    setInput(val);
    if (connected) {
      sendTyping(conversationId, val.length > 0);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => sendTyping(conversationId, false), 2000);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button type="button" onClick={() => router.back()} className="rounded-full p-1.5 hover:bg-surface">
          <ArrowLeft className="size-5" />
        </button>
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-surface">
          {conversation?.otherUserAvatar ? (
            <Image src={conversation.otherUserAvatar} alt={conversation?.otherUserName ?? ""} fill className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center font-semibold text-muted-foreground">
              {conversation?.otherUserName?.[0] ?? "?"}
            </div>
          )}
          {otherOnline && (
            <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-green-500" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{conversation?.otherUserName}</p>
          <p className="text-xs text-muted-foreground">
            {otherTyping ? (
              <span className="text-primary">typing…</span>
            ) : otherOnline ? "online" : conversation?.productTitle}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-2">
          {messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                    isMine
                      ? "rounded-br-sm bg-primary text-white"
                      : "rounded-bl-sm bg-surface text-foreground"
                  )}
                >
                  <p>{msg.content}</p>
                  <div className={cn("mt-1 flex items-center gap-1 text-[10px]", isMine ? "justify-end text-white/70" : "text-muted-foreground")}>
                    <span>{formatTimeAgo(msg.createdAt)}</span>
                    {isMine && (
                      <Circle className={cn("size-2 fill-current", msg.isRead ? "text-white" : "text-white/50")} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {otherTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-surface px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
