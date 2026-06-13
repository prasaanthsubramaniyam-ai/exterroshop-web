"use client";

import * as React from "react";
import { Trophy, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/utils/format";
import {
  achievementService,
  type EarnedAchievement,
  type AchievementCatalog,
} from "@/services/engagement.service";

const RARITY_META: Record<string, { label: string; ring: string; badge: string }> = {
  COMMON:   { label: "Common",    ring: "ring-1 ring-gray-200 dark:ring-gray-700",   badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  UNCOMMON: { label: "Uncommon",  ring: "ring-1 ring-blue-200 dark:ring-blue-700",   badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  RARE:     { label: "Rare",      ring: "ring-2 ring-violet-300 dark:ring-violet-600",badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
  EPIC:     { label: "Epic",      ring: "ring-2 ring-amber-300 dark:ring-amber-600", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  LEGENDARY:{ label: "Legendary", ring: "ring-2 ring-rose-400 dark:ring-rose-500",   badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
};

function AchievementBadge({ achievement, earned }: {
  achievement: AchievementCatalog;
  earned?: EarnedAchievement;
}) {
  const meta = RARITY_META[achievement.rarity] ?? RARITY_META.COMMON;

  return (
    <div className={cn(
      "rounded-2xl border border-border bg-card p-4 flex flex-col items-center text-center gap-2 transition-all",
      earned ? "opacity-100" : "opacity-50 grayscale"
    )}>
      <div className={cn(
        "flex size-14 items-center justify-center rounded-2xl text-3xl",
        earned ? "bg-gradient-to-br from-primary/10 to-primary/20" : "bg-muted",
        meta.ring
      )}>
        {earned ? achievement.icon : <Lock className="size-5 text-muted-foreground" />}
      </div>
      <div>
        <p className="text-sm font-semibold leading-tight">{achievement.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{achievement.description}</p>
      </div>
      <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide", meta.badge)}>
        {meta.label}
      </span>
      {earned && (
        <p className="text-[10px] text-muted-foreground">Earned {formatTimeAgo(earned.earnedAt)}</p>
      )}
      {!earned && achievement.pointsReward > 0 && (
        <p className="text-[10px] text-primary font-semibold">+{achievement.pointsReward} pts on earn</p>
      )}
    </div>
  );
}

type Tab = "earned" | "all";

export function AchievementsView() {
  const [tab, setTab] = React.useState<Tab>("earned");
  const [earned, setEarned] = React.useState<EarnedAchievement[]>([]);
  const [catalog, setCatalog] = React.useState<AchievementCatalog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([achievementService.getMy(), achievementService.getAll()])
      .then(([e, a]) => { setEarned(e); setCatalog(a); })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const earnedIds = new Set(earned.map((e) => e.id));
  const earnedMap = new Map(earned.map((e) => [e.id, e]));

  const displayed = tab === "earned"
    ? catalog.filter((a) => earnedIds.has(a.id))
    : catalog;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950">
            <Trophy className="size-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Achievements</h1>
            <p className="text-sm text-muted-foreground">
              {earned.length} of {catalog.length} unlocked
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: catalog.length > 0 ? `${Math.round((earned.length / catalog.length) * 100)}%` : "0%" }}
            />
          </div>
          <span className="text-sm font-semibold">
            {catalog.length > 0 ? Math.round((earned.length / catalog.length) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Rarity breakdown */}
      <div className="grid grid-cols-5 gap-2">
        {["LEGENDARY", "EPIC", "RARE", "UNCOMMON", "COMMON"].map((r) => {
          const count = earned.filter((e) => {
            const a = catalog.find((c) => c.id === e.id);
            return a?.rarity === r;
          }).length;
          const total = catalog.filter((a) => a.rarity === r).length;
          const meta = RARITY_META[r];
          return (
            <div key={r} className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-lg font-bold">{count}<span className="text-xs text-muted-foreground font-normal">/{total}</span></p>
              <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide", meta.badge)}>
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
        {(["earned", "all"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}>
            {t === "earned" ? `Earned (${earned.length})` : `All (${catalog.length})`}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center">
          <Trophy className="mx-auto mb-3 size-10 text-muted-foreground/30" />
          <p className="font-semibold">No achievements yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start engaging — give kudos, post updates, join activities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {displayed.map((a) => (
            <AchievementBadge key={a.id} achievement={a} earned={earnedMap.get(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
