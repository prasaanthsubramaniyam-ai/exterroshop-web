"use client";

import * as React from "react";
import {
  Trophy, Medal, Star, Loader2, Crown,
  UsersRound, Sparkles, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { recognitionService, type LeaderboardEntry, type Recognition } from "@/services/engagement.service";
import { rewardsService, type DeptLeaderboardEntry } from "@/services/rewards.service";

// ── Avatar ────────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function Avatar({ name, url, size = 10 }: { name: string; url: string | null; size?: number }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name} className={`size-${size} rounded-full object-cover ring-2 ring-white dark:ring-border`} />
  ) : (
    <div className={`flex size-${size} items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary ring-2 ring-white dark:ring-border`}>
      {initials(name)}
    </div>
  );
}

// ── Champions podium ──────────────────────────────────────────────────────────

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const [period, setPeriod] = React.useState<"month" | "all">("month");
  const [rows, setRows]     = React.useState<LeaderboardEntry[]>(entries);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback((p: "month" | "all") => {
    setLoading(true);
    recognitionService.leaderboard(p, 10)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const switchPeriod = (p: "month" | "all") => {
    setPeriod(p);
    load(p);
  };

  const gold   = rows[0];
  const silver = rows[1];
  const bronze = rows[2];
  const rest   = rows.slice(3);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold text-lg">
          <Crown className="size-5 text-amber-500" /> Champions
        </h2>
        <div className="flex gap-1">
          {(["month", "all"] as const).map((p) => (
            <button key={p} onClick={() => switchPeriod(p)}
              className={cn("rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                period === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}>
              {p === "month" ? "This month" : "All time"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No recognition data yet — start sending kudos!</p>
      ) : (
        <>
          {/* Top 3 podium */}
          <div className="flex items-end justify-center gap-4">
            {/* Silver — 2nd */}
            {silver && (
              <div className="flex flex-col items-center gap-2">
                <Avatar name={silver.name} url={silver.avatarUrl} size={12} />
                <div className="text-center">
                  <p className="font-semibold text-sm truncate max-w-[80px]">{silver.name.split(" ")[0]}</p>
                  <p className="text-xs text-muted-foreground">{silver.points.toLocaleString()} pts</p>
                </div>
                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm">
                  <span className="text-2xl">🥈</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">#2</span>
                </div>
              </div>
            )}
            {/* Gold — 1st */}
            {gold && (
              <div className="flex flex-col items-center gap-2 -mb-2">
                <div className="relative">
                  <Avatar name={gold.name} url={gold.avatarUrl} size={16} />
                  <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 size-5 text-amber-400" />
                </div>
                <div className="text-center">
                  <p className="font-bold truncate max-w-[90px]">{gold.name.split(" ")[0]}</p>
                  <p className="text-xs text-primary font-semibold">{gold.points.toLocaleString()} pts</p>
                </div>
                <div className="flex h-28 w-24 flex-col items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950 shadow-md border border-amber-200 dark:border-amber-800">
                  <span className="text-3xl">🥇</span>
                  <span className="text-xs font-bold text-amber-600">#1</span>
                </div>
              </div>
            )}
            {/* Bronze — 3rd */}
            {bronze && (
              <div className="flex flex-col items-center gap-2">
                <Avatar name={bronze.name} url={bronze.avatarUrl} size={12} />
                <div className="text-center">
                  <p className="font-semibold text-sm truncate max-w-[80px]">{bronze.name.split(" ")[0]}</p>
                  <p className="text-xs text-muted-foreground">{bronze.points.toLocaleString()} pts</p>
                </div>
                <div className="flex h-16 w-20 flex-col items-center justify-center rounded-xl bg-amber-50/50 dark:bg-amber-950/40 shadow-sm">
                  <span className="text-2xl">🥉</span>
                  <span className="text-xs font-bold text-amber-700/60">#3</span>
                </div>
              </div>
            )}
          </div>

          {/* 4–10 list */}
          {rest.length > 0 && (
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {rest.map((r) => (
                <div key={r.userId} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-6 text-center text-xs font-bold text-muted-foreground">{r.rank}</span>
                  <Avatar name={r.name} url={r.avatarUrl} size={8} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    {r.department && <p className="text-[11px] text-muted-foreground">{r.department}</p>}
                  </div>
                  <span className="text-sm font-bold tabular-nums text-primary">{r.points.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Badge Wall ────────────────────────────────────────────────────────────────

function BadgeWall({ feed }: { feed: Recognition[] }) {
  const counts = React.useMemo(() => {
    const map: Record<string, { emoji: string; label: string; count: number }> = {};
    for (const r of feed) {
      if (!map[r.badge]) map[r.badge] = { emoji: r.badgeEmoji, label: r.badgeLabel, count: 0 };
      map[r.badge].count++;
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [feed]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <h2 className="flex items-center gap-2 font-bold">
        <Sparkles className="size-4 text-primary" /> Badge Wall
      </h2>
      {counts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No badges awarded yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {counts.map((b) => (
            <div key={b.label} className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
              <span className="text-2xl">{b.emoji}</span>
              <div>
                <p className="text-xs font-semibold leading-none">{b.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{b.count}× awarded</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Department rankings ───────────────────────────────────────────────────────

function DeptRankings() {
  const [period, setPeriod] = React.useState<"month" | "all">("month");
  const [rows, setRows]     = React.useState<DeptLeaderboardEntry[] | null>(null);

  React.useEffect(() => {
    setRows(null);
    rewardsService.deptLeaderboard(period).then(setRows).catch(() => setRows([]));
  }, [period]);

  const podiumColor = (rank: number) =>
    rank === 1 ? "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
    : rank === 2 ? "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700"
    : rank === 3 ? "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800"
    : "bg-background border-border";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold">
          <Building2 className="size-4 text-blue-500" /> Department Rankings
        </h2>
        <div className="flex gap-1">
          {(["month", "all"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                period === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}>
              {p === "month" ? "Month" : "All time"}
            </button>
          ))}
        </div>
      </div>

      {rows === null ? (
        <div className="flex justify-center py-8"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No department data yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.slice(0, 8).map((r) => (
            <div key={r.department}
              className={cn("flex items-center gap-3 rounded-xl border px-4 py-3", podiumColor(r.rank))}>
              <span className="w-6 text-center font-bold text-sm">
                {r.rank === 1 ? "🏆" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : r.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{r.department}</p>
                <p className="text-[11px] text-muted-foreground">{r.memberCount} members · avg {r.avgPoints.toFixed(0)} pts</p>
              </div>
              <span className="text-sm font-bold text-primary tabular-nums">{r.totalPoints.toLocaleString()} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Recent kudos strip ────────────────────────────────────────────────────────

function RecentKudosStrip({ feed }: { feed: Recognition[] }) {
  if (feed.length === 0) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <h2 className="flex items-center gap-2 font-bold">
        <Star className="size-4 text-amber-500" /> Recent recognitions
      </h2>
      <div className="space-y-3">
        {feed.slice(0, 8).map((r) => (
          <div key={r.id} className="flex items-center gap-3">
            <Avatar name={r.senderName} url={r.senderAvatarUrl} size={8} />
            <div className="min-w-0 flex-1 text-sm">
              <span className="font-semibold">{r.senderName}</span>
              <span className="text-muted-foreground"> → </span>
              <span className="font-semibold">{r.recipientName}</span>
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {r.badgeEmoji} {r.badgeLabel}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">+{r.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function HallOfFameView() {
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);
  const [feed,        setFeed]        = React.useState<Recognition[]>([]);

  React.useEffect(() => {
    recognitionService.leaderboard("month", 10).then(setLeaderboard).catch(() => setLeaderboard([]));
    recognitionService.feed(0, 30).then(setFeed).catch(() => setFeed([]));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950">
          <Trophy className="size-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Hall of Fame</h1>
          <p className="text-sm text-muted-foreground">Champions, top badges and department standings</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Medal,      label: "Top scorer",    value: leaderboard[0]?.name.split(" ")[0] ?? "—",            tint: "bg-amber-500"   },
          { icon: Star,       label: "Kudos given",   value: feed.length,                                            tint: "bg-yellow-500"  },
          { icon: UsersRound, label: "Recognised",    value: new Set(feed.map((r) => r.recipientId)).size,          tint: "bg-blue-500"    },
          { icon: Sparkles,   label: "Badge types",   value: new Set(feed.map((r) => r.badge)).size,                tint: "bg-purple-500"  },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
              <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", s.tint)}>
                <Icon className="size-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold truncate">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Podium entries={leaderboard} />
          <BadgeWall feed={feed} />
        </div>
        <div className="space-y-5">
          <DeptRankings />
          <RecentKudosStrip feed={feed} />
        </div>
      </div>
    </div>
  );
}
