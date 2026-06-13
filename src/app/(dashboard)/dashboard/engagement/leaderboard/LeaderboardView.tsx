"use client";

import * as React from "react";
import { Trophy, Flame, Crown, Medal, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  leaderboardService,
  type LeaderboardUser,
  type LeaderboardPeriod,
  type LeaderboardResult,
} from "@/services/engagement.service";

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "WEEKLY",    label: "This Week"  },
  { value: "MONTHLY",   label: "This Month" },
  { value: "QUARTERLY", label: "Quarter"    },
  { value: "YEARLY",    label: "Year"       },
  { value: "ALL_TIME",  label: "All Time"   },
];

function Avatar({ name, url, size = 40 }: { name: string; url?: string | null; size?: number }) {
  const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-primary"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

function PodiumCard({ user, position }: { user: LeaderboardUser; position: 1 | 2 | 3 }) {
  const heights = { 1: "h-24", 2: "h-16", 3: "h-12" };
  const medals  = { 1: <Crown className="size-5 text-amber-500" />, 2: <Medal className="size-4 text-slate-400" />, 3: <Medal className="size-4 text-amber-700" /> };
  const rings   = { 1: "ring-2 ring-amber-400", 2: "ring-2 ring-slate-300", 3: "ring-2 ring-amber-600" };

  return (
    <div className={cn("flex flex-col items-center gap-2", position === 1 && "-mt-4")}>
      <div className="relative">
        <Avatar name={user.name} url={user.avatarUrl} size={position === 1 ? 64 : 52} />
        <div className={cn("absolute inset-0 rounded-full", rings[position])} />
        <div className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-background shadow">
          {medals[position]}
        </div>
      </div>
      <div className="text-center max-w-[80px]">
        <p className="text-xs font-semibold leading-tight truncate">{user.name.split(" ")[0]}</p>
        <p className="text-xs text-primary font-bold">{user.totalPoints.toLocaleString()} pts</p>
      </div>
      <div className={cn(
        "w-16 rounded-t-lg bg-gradient-to-t",
        heights[position],
        position === 1 ? "from-amber-400 to-amber-300" :
        position === 2 ? "from-slate-300 to-slate-200" :
                         "from-amber-700 to-amber-600"
      )} />
    </div>
  );
}

function RankRow({ user, isSelf }: { user: LeaderboardUser; isSelf: boolean }) {
  const rankIcon = user.rank === 1
    ? <Crown className="size-4 text-amber-500" />
    : user.rank === 2
    ? <Medal className="size-4 text-slate-400" />
    : user.rank === 3
    ? <Medal className="size-4 text-amber-700" />
    : <span className="text-sm font-bold text-muted-foreground w-4 text-center">{user.rank}</span>;

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
      isSelf
        ? "border-primary/30 bg-primary/5"
        : "border-border bg-card hover:bg-muted/30"
    )}>
      <div className="flex size-7 items-center justify-center shrink-0">
        {rankIcon}
      </div>
      <Avatar name={user.name} url={user.avatarUrl} size={36} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{user.name} {isSelf && <span className="text-xs text-primary">(you)</span>}</p>
        {user.department && <p className="text-xs text-muted-foreground truncate">{user.department}</p>}
      </div>
      {user.currentStreak > 0 && (
        <div className="flex items-center gap-1 text-orange-500">
          <Flame className="size-3.5" />
          <span className="text-xs font-semibold">{user.currentStreak}d</span>
        </div>
      )}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-primary">{user.totalPoints.toLocaleString()}</p>
        <p className="text-[10px] text-muted-foreground">pts</p>
      </div>
    </div>
  );
}

export function LeaderboardView() {
  const [period, setPeriod] = React.useState<LeaderboardPeriod>("MONTHLY");
  const [data, setData] = React.useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    leaderboardService.get(period)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [period]);

  const top3    = data?.entries.slice(0, 3) ?? [];
  const rest    = data?.entries.slice(3) ?? [];
  const myId    = data?.me?.userId;

  const podiumOrder: (1 | 2 | 3)[] = [2, 1, 3];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950">
            <Trophy className="size-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Leaderboard</h1>
            {data && (
              <p className="text-sm text-muted-foreground">{data.periodLabel}</p>
            )}
          </div>
        </div>

        {/* Period tabs */}
        <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1 overflow-x-auto">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                period === p.value
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || data.entries.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center">
          <Star className="mx-auto mb-3 size-10 text-muted-foreground/30" />
          <p className="font-semibold">No data yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Participate in activities to earn points.</p>
        </div>
      ) : (
        <>
          {/* Podium (top 3) */}
          {top3.length >= 3 && (
            <div className="rounded-2xl border border-border bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/20 p-6">
              <div className="flex items-end justify-center gap-4">
                {podiumOrder.map((pos) => {
                  const user = top3[pos - 1];
                  return user ? <PodiumCard key={user.userId} user={user} position={pos} /> : null;
                })}
              </div>
            </div>
          )}

          {/* Rank list (4+) */}
          {rest.length > 0 && (
            <div className="space-y-2">
              {rest.map((user) => (
                <RankRow key={user.userId} user={user} isSelf={user.userId === myId} />
              ))}
            </div>
          )}

          {/* My rank sticky card (if not in visible list) */}
          {data.me && !data.entries.find((e) => e.userId === data.me!.userId) && (
            <div className="sticky bottom-4">
              <div className="rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur p-3 shadow-lg">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Your position</p>
                <RankRow user={data.me} isSelf />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
