"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { openDrawer, setSummary } from "@/store/slices/aiSlice";
import { aiService } from "@/services/ai.service";
import { useAiChat } from "@/hooks/useAiChat";

const QUICK_ACTIONS = [
  { label: "Check In",    prompt: "Check me in for today",         icon: "✓",  url: "/dashboard/attendance" },
  { label: "Apply Leave", prompt: "I want to apply for leave",     icon: "🗓", url: "/dashboard/leave" },
  { label: "My Team",     prompt: "Show my team",                  icon: "👥", url: "/dashboard/team" },
  { label: "Reports",     prompt: "Show me the workforce reports", icon: "📊", url: "/dashboard/reports" },
];

export function AiDashboardCard() {
  const dispatch = useAppDispatch();
  const summary  = useAppSelector((s) => s.ai.summary);
  const { send } = useAiChat();

  React.useEffect(() => {
    aiService.getSummary()
      .then((s) => dispatch(setSummary(s)))
      .catch(() => {});
  }, [dispatch]);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/90 to-orange-500/90 px-4 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Exterro AI</span>
          </div>
          <button
            onClick={() => dispatch(openDrawer())}
            className="text-[11px] font-medium text-white/80 underline-offset-2 hover:underline"
          >
            Open chat →
          </button>
        </div>
        <p className="mt-2 text-base font-semibold">
          {summary?.greeting ?? `${greeting}! 👋`}
        </p>
        {summary && !summary.checkedInToday && (
          <p className="mt-1 text-xs text-white/80">
            📍 You haven&apos;t checked in yet today.
          </p>
        )}
        {summary && summary.pendingApprovals > 0 && (
          <p className="text-xs text-white/80">
            📋 {summary.pendingApprovals} pending approval{summary.pendingApprovals !== 1 ? "s" : ""} need your attention.
          </p>
        )}
      </div>

      {/* Quick actions */}
      <div className="p-4">
        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => { dispatch(openDrawer()); send(a.prompt, "SUGGESTION"); }}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-left text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
              <span className="text-base">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI suggestions */}
      {summary && summary.suggestedActions.length > 0 && (
        <div className="border-t border-border px-4 pb-4">
          <p className="mb-2 mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            AI Suggests
          </p>
          <div className="flex flex-col gap-1.5">
            {summary.suggestedActions.slice(0, 3).map((action, i) => (
              <button
                key={i}
                onClick={() => { dispatch(openDrawer()); send(action, "SUGGESTION"); }}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-muted"
              >
                <ArrowRight className="size-3 shrink-0 text-primary" />
                {action}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
