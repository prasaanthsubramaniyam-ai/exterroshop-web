"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { closeDrawer } from "@/store/slices/aiSlice";
import { useAuth } from "@/hooks/useAuth";

export function AiDrawerHeader() {
  const dispatch = useAppDispatch();
  const summary  = useAppSelector((s) => s.ai.summary);
  const { user } = useAuth();

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const hasSummaryItem =
    summary && (summary.pendingApprovals > 0 || !summary.checkedInToday);

  return (
    <div className="bg-gradient-to-r from-primary to-orange-500 px-4 pb-4 pt-4 text-white">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">✦</span>
            <span className="text-sm font-bold tracking-wide">Exterro AI</span>
          </div>
          <p className="mt-0.5 text-base font-semibold">
            {greeting}, {firstName} 👋
          </p>
        </div>
        <button
          onClick={() => dispatch(closeDrawer())}
          aria-label="Close AI drawer"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 transition-colors hover:bg-white/30"
        >
          <X className="size-4" />
        </button>
      </div>

      {hasSummaryItem && (
        <div className="mt-3 rounded-lg bg-white/15 px-3 py-2 text-xs leading-relaxed">
          {!summary?.checkedInToday && (
            <span>📍 You haven&apos;t checked in yet today. </span>
          )}
          {summary && summary.pendingApprovals > 0 && (
            <span>
              📋 {summary.pendingApprovals} pending approval
              {summary.pendingApprovals !== 1 ? "s" : ""} waiting for you.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
