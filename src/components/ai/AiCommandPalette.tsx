"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { closeCommand, openDrawer, pushMessage, setLoading,
         setActiveConversation, updateLastAssistantMessage } from "@/store/slices/aiSlice";
import { aiService } from "@/services/ai.service";
import { cn } from "@/lib/utils";

interface CommandResult {
  id: string;
  icon: string;
  label: string;
  sublabel?: string;
  badge?: string;
  action: () => void;
}

const NAV_COMMANDS = [
  { icon: "🏠", label: "Home",              sublabel: "Dashboard",            url: "/dashboard" },
  { icon: "💼", label: "My Work",           sublabel: "Attendance & Leave",   url: "/dashboard/my-work" },
  { icon: "✅", label: "Approvals",         sublabel: "Pending approvals",    url: "/dashboard/approvals" },
  { icon: "🗓", label: "Leave",             sublabel: "Apply & view leave",   url: "/dashboard/leave" },
  { icon: "📍", label: "Attendance",        sublabel: "Check in / out",       url: "/dashboard/attendance" },
  { icon: "✨", label: "Engagement",        sublabel: "Points & activities",  url: "/dashboard/engagement" },
  { icon: "📊", label: "Reports",           sublabel: "Analytics & exports",  url: "/dashboard/reports" },
  { icon: "👥", label: "Directory",         sublabel: "Find employees",       url: "/dashboard/directory" },
  { icon: "🏆", label: "Sports & Events",   sublabel: "Join events",          url: "/dashboard/sports" },
  { icon: "💅", label: "Wellness",          sublabel: "Book appointments",    url: "/wellness/dashboard" },
  { icon: "🛍", label: "Marketplace",       sublabel: "Buy & sell",           url: "/dashboard/products" },
  { icon: "⚙️", label: "Settings",          sublabel: "Account settings",     url: "/dashboard/settings" },
];

export function AiCommandPalette() {
  const dispatch    = useAppDispatch();
  const router      = useRouter();
  const isOpen      = useAppSelector((s) => s.ai.isCommandOpen);
  const isLoading   = useAppSelector((s) => s.ai.isLoading);

  const [query,     setQuery]     = React.useState("");
  const [focused,   setFocused]   = React.useState(0);
  const inputRef                  = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setQuery("");
      setFocused(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const close = () => dispatch(closeCommand());

  const navResults: CommandResult[] = NAV_COMMANDS
    .filter((c) =>
      !query || c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.sublabel?.toLowerCase().includes(query.toLowerCase())
    )
    .map((c) => ({
      id: c.url,
      icon: c.icon,
      label: c.label,
      sublabel: c.sublabel,
      badge: "Page",
      action: () => { router.push(c.url); close(); },
    }));

  // AI command result when query looks like a natural language request
  const isAiQuery = query.length > 3 && !NAV_COMMANDS.some(
    (c) => c.label.toLowerCase() === query.toLowerCase()
  );

  const allResults: CommandResult[] = [
    ...(isAiQuery
      ? [{
          id: "ai-action",
          icon: "✦",
          label: query,
          sublabel: "Ask Exterro AI",
          badge: "AI",
          action: async () => {
            close();
            dispatch(openDrawer());
            const userMsg = { role: "user" as const, content: query };
            dispatch(pushMessage(userMsg));
            dispatch(pushMessage({ role: "assistant", content: "", isStreaming: true }));
            dispatch(setLoading(true));
            try {
              const res = await aiService.chat({ message: query, eventType: "COMMAND" });
              dispatch(setActiveConversation(res.conversationId));
              dispatch(updateLastAssistantMessage({
                id: res.messageId,
                content: res.reply,
                intent: res.intent,
                agentUsed: res.agentUsed,
                action: res.action,
                isStreaming: false,
              }));
            } catch {
              dispatch(updateLastAssistantMessage({ content: "Something went wrong.", isStreaming: false }));
            } finally {
              dispatch(setLoading(false));
            }
          },
        }]
      : []),
    ...navResults,
  ];

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown")  { e.preventDefault(); setFocused((f) => Math.min(f + 1, allResults.length - 1)); }
    if (e.key === "ArrowUp")    { e.preventDefault(); setFocused((f) => Math.max(f - 1, 0)); }
    if (e.key === "Enter")      { allResults[focused]?.action(); }
    if (e.key === "Escape")     { close(); }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden
      />

      {/* Palette */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="fixed left-1/2 top-[15vh] z-50 w-full max-w-lg -translate-x-1/2 rounded-2xl border border-border bg-background shadow-2xl"
      >
        {/* Input row */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          <span className="text-base text-primary">✦</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setFocused(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search or ask Exterro AI…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <Search className="size-4 shrink-0 text-muted-foreground" />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {allResults.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No results found</p>
          ) : (
            <div className="py-1">
              {isAiQuery && (
                <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  AI Action
                </p>
              )}
              {allResults.map((r, i) => {
                if (i === (isAiQuery ? 1 : 0) && !isAiQuery) return (
                  <React.Fragment key={r.id}>
                    <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Navigate
                    </p>
                    <CommandItem result={r} focused={focused === i} onSelect={r.action} onHover={() => setFocused(i)} />
                  </React.Fragment>
                );
                if (i === 1 && isAiQuery) return (
                  <React.Fragment key={r.id}>
                    <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Navigate
                    </p>
                    <CommandItem result={r} focused={focused === i} onSelect={r.action} onHover={() => setFocused(i)} />
                  </React.Fragment>
                );
                return (
                  <CommandItem key={r.id} result={r} focused={focused === i} onSelect={r.action} onHover={() => setFocused(i)} />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[9px]">↑</kbd>
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[9px]">↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[9px]">↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[9px]">ESC</kbd>
            close
          </span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[9px]">⌘</kbd>
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[9px]">K</kbd>
          </span>
        </div>
      </div>
    </>
  );
}

function CommandItem({
  result, focused, onSelect, onHover,
}: {
  result: CommandResult;
  focused: boolean;
  onSelect: () => void;
  onHover: () => void;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
        focused ? "bg-primary/8 text-foreground" : "hover:bg-muted/50"
      )}
      onClick={onSelect}
      onMouseEnter={onHover}
    >
      <div className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm",
        result.badge === "AI" ? "bg-primary/10 text-primary" : "bg-muted"
      )}>
        {result.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{result.label}</p>
        {result.sublabel && (
          <p className="truncate text-xs text-muted-foreground">{result.sublabel}</p>
        )}
      </div>
      {result.badge && (
        <span className={cn(
          "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold",
          result.badge === "AI" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {result.badge}
        </span>
      )}
      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
    </button>
  );
}
