"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { chatService } from "@/services/chat.service";
import type { Conversation } from "@/types";
import { formatTimeAgo } from "@/utils/format";
import { cn } from "@/lib/utils";

export function ChatListView() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    chatService.getConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-display-sm font-semibold tracking-tight">Chats</h1>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-4 rounded-xl border border-border p-4">
              <div className="size-12 rounded-full bg-surface" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-surface" />
                <div className="h-3 w-2/3 rounded bg-surface" />
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <MessageCircle className="size-12 opacity-40" />
          <p className="text-sm">No chats yet. Start a conversation from a product page.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/dashboard/chat/${conv.id}`}
              className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-card-hover"
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-surface">
                {conv.otherUserAvatar ? (
                  <Image src={conv.otherUserAvatar} alt={conv.otherUserName} fill className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
                    {conv.otherUserName[0]}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("text-sm font-semibold truncate", conv.unreadCount > 0 && "text-foreground")}>
                    {conv.otherUserName}
                  </p>
                  {conv.lastMessageTime && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatTimeAgo(conv.lastMessageTime)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{conv.productTitle}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className={cn("truncate text-sm text-muted-foreground", conv.unreadCount > 0 && "font-medium text-foreground")}>
                    {conv.lastMessage || "No messages yet"}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
