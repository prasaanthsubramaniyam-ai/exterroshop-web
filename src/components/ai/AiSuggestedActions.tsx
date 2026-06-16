"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAiChat } from "@/hooks/useAiChat";
import type { AiSuggestion } from "@/types/ai.types";

const PAGE_SUGGESTIONS: Record<string, AiSuggestion[]> = {
  "/dashboard/attendance": [
    { label: "Check Out",         prompt: "Check me out",                icon: "🏃", url: "/dashboard/attendance" },
    { label: "My History",        prompt: "Show my attendance history",   icon: "📅" },
    { label: "Request Correction",prompt: "Request attendance correction", icon: "✏️" },
  ],
  "/dashboard/leave": [
    { label: "Apply Leave",       prompt: "I want to apply for leave",    icon: "🗓" },
    { label: "Leave Balance",     prompt: "What is my leave balance?",    icon: "📊" },
    { label: "Leave Policy",      prompt: "Explain the leave policy",     icon: "📋" },
  ],
  "/dashboard/engagement": [
    { label: "My Points",         prompt: "What are my engagement points?",icon: "⭐" },
    { label: "Leaderboard Rank",  prompt: "What is my leaderboard rank?", icon: "🏆" },
    { label: "Earn More Points",  prompt: "How can I earn more points?",  icon: "✨" },
  ],
  "/dashboard/reports": [
    { label: "Generate Report",   prompt: "Help me generate a report",    icon: "📊" },
    { label: "Export Data",       prompt: "How do I export report data?", icon: "⬇️" },
    { label: "Schedule Report",   prompt: "Set up a scheduled report",    icon: "🗓" },
  ],
  "/dashboard/approvals": [
    { label: "Pending Items",     prompt: "What approvals are pending?",  icon: "⏳" },
    { label: "Approve All Leave", prompt: "Help me review leave requests",icon: "✅" },
  ],
};

const DEFAULT_SUGGESTIONS: AiSuggestion[] = [
  { label: "Check In",        prompt: "Check me in for today",           icon: "✓" },
  { label: "Apply Leave",     prompt: "I want to apply for leave",       icon: "🗓" },
  { label: "My Engagement",   prompt: "Show my engagement score",        icon: "✨" },
  { label: "View Reports",    prompt: "Show me the reports",             icon: "📊" },
];

export function AiSuggestedActions() {
  const pathname    = usePathname();
  const { send }    = useAiChat();
  const suggestions = PAGE_SUGGESTIONS[pathname] ?? DEFAULT_SUGGESTIONS;

  return (
    <div className="px-4 py-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Suggested
      </p>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => send(s.prompt, "SUGGESTION")}
            className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
