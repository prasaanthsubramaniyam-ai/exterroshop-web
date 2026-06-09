"use client";

import * as React from "react";
import { Megaphone, Pin, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { formatTimeAgo } from "@/utils/format";
import { cn } from "@/lib/utils";

const AUDIENCE_COLORS: Record<string, string> = {
  ALL:          "bg-muted text-muted-foreground",
  MANAGER_ONLY: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  HR_ONLY:      "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};
const AUDIENCE_LABELS: Record<string, string> = {
  ALL:          "All",
  MANAGER_ONLY: "Managers",
  HR_ONLY:      "HR",
};

export function AnnouncementsCard() {
  const { announcements, loading } = useAnnouncements();

  // Show latest 4 (pinned first, then newest)
  const visible = announcements.slice(0, 4);

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950">
            <Megaphone className="size-4 text-amber-600" />
          </div>
          <p className="text-sm font-semibold">Announcements</p>
        </div>
        {loading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <span className="text-xs text-muted-foreground">
            {announcements.length} active
          </span>
        )}
      </div>

      {/* List */}
      {!loading && visible.length === 0 ? (
        <p className="mt-4 text-center text-sm text-muted-foreground py-4">
          No announcements yet
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {visible.map((ann) => (
            <li
              key={ann.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border border-border/60 px-4 py-3",
                ann.pinned ? "bg-amber-50/60 dark:bg-amber-950/30" : "bg-muted/30"
              )}
            >
              {ann.pinned && (
                <Pin className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
              )}
              {!ann.pinned && (
                <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-400" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{ann.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {ann.body}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      AUDIENCE_COLORS[ann.audience] ?? AUDIENCE_COLORS.ALL
                    )}
                  >
                    {AUDIENCE_LABELS[ann.audience] ?? ann.audience}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatTimeAgo(ann.createdAt)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/dashboard/announcements"
        className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
      >
        View all announcements <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}
