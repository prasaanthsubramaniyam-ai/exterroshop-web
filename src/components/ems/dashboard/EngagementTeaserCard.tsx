"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Star, ArrowRight, Loader2 } from "lucide-react";
import { recognitionService } from "@/services/engagement.service";

export function EngagementTeaserCard() {
  const [points, setPoints] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    recognitionService
      .myPoints()
      .then(setPoints)
      .catch(() => setPoints(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950">
            <Sparkles className="size-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Engagement</p>
            <p className="text-xs text-muted-foreground">Your points this month</p>
          </div>
        </div>
        <Link
          href="/dashboard/engagement"
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
        >
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-4 flex items-end gap-3">
        {loading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <Star className="mb-0.5 size-5 text-amber-500" />
              <span className="text-3xl font-bold tabular-nums">
                {points ?? 0}
              </span>
              <span className="text-sm text-muted-foreground">pts</span>
            </div>
          </>
        )}
      </div>

      <Link
        href="/dashboard/engagement/recognition"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        <Sparkles className="size-4" />
        View Engagement Hub
      </Link>
    </div>
  );
}
