"use client";

import * as React from "react";
import { Medal, Trophy, Loader2, Calendar } from "lucide-react";
import { sportsService, type SportsResult, EVENT_TYPE_LABELS } from "@/services/sports.service";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function ResultsPage() {
  const [results, setResults] = React.useState<SportsResult[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    sportsService.getAllResults()
      .then(setResults)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
          <Medal className="size-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Event Results</h1>
          <p className="text-sm text-muted-foreground">Published results from completed events</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2" /> Loading…
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Medal className="size-10 text-muted-foreground/40" />
          <p className="font-medium">No results published yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((r) => (
            <div key={r.id}
              className="rounded-2xl border border-border bg-background overflow-hidden">
              {/* Banner */}
              <div className="relative h-28 bg-gradient-to-br from-violet-500/20 to-orange-500/10">
                {r.bannerUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.bannerUrl} alt={r.eventTitle}
                    className="absolute inset-0 w-full h-full object-cover opacity-60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white font-bold text-lg leading-tight line-clamp-1">{r.eventTitle}</p>
                  <p className="text-white/70 text-xs">{EVENT_TYPE_LABELS[r.eventType] ?? r.eventType}</p>
                </div>
              </div>

              {/* Podium */}
              <div className="p-4 grid gap-3 sm:grid-cols-2">
                {r.winnerTeamName && (
                  <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                    <Trophy className="size-6 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">Winner 🥇</p>
                      <p className="font-bold text-sm">{r.winnerTeamName}</p>
                    </div>
                  </div>
                )}
                {r.runnerUpTeamName && (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 px-4 py-3">
                    <Medal className="size-6 text-gray-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Runner-up 🥈</p>
                      <p className="font-bold text-sm">{r.runnerUpTeamName}</p>
                    </div>
                  </div>
                )}
              </div>

              {r.remarks && (
                <div className="px-4 pb-4">
                  <p className="rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{r.remarks}</p>
                </div>
              )}

              <div className="px-4 pb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                Published {fmtDate(r.publishedAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
