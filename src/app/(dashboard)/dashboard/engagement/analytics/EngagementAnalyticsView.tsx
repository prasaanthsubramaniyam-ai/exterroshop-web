"use client";

import * as React from "react";
import {
  BarChart2, Users, TrendingUp, Zap, Trophy, Star,
  Flame, Loader2, Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  leaderboardService,
  achievementService,
  hofService,
  type LeaderboardUser,
  type EarnedAchievement,
  type HofEntry,
} from "@/services/engagement.service";
import { rewardsService, type DeptLeaderboardEntry } from "@/services/rewards.service";

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tint,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tint)}>
        <Icon className="size-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Points bar ────────────────────────────────────────────────────────────────

function PointsBar({ user, max }: { user: LeaderboardUser; max: number }) {
  const pct = max > 0 ? Math.round((user.totalPoints / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-4 text-center text-xs font-bold text-muted-foreground shrink-0">{user.rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold truncate">{user.name}</p>
          <span className="text-xs text-primary font-bold ml-2 shrink-0">{user.totalPoints.toLocaleString()}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

// ── Dept bar ──────────────────────────────────────────────────────────────────

function DeptBar({ entry, max }: { entry: DeptLeaderboardEntry; max: number }) {
  const pct = max > 0 ? Math.round((entry.totalPoints / max) * 100) : 0;
  const medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank;
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-center text-sm shrink-0">{medal}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold truncate">{entry.department}</p>
          <span className="text-xs text-blue-600 font-bold ml-2 shrink-0">{entry.totalPoints.toLocaleString()}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{entry.memberCount} members · avg {entry.avgPoints.toFixed(0)} pts</p>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

type Period = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ALL_TIME";
const PERIODS: { value: Period; label: string }[] = [
  { value: "WEEKLY",    label: "Week"    },
  { value: "MONTHLY",   label: "Month"   },
  { value: "QUARTERLY", label: "Quarter" },
  { value: "YEARLY",    label: "Year"    },
  { value: "ALL_TIME",  label: "All Time"},
];

export function EngagementAnalyticsView() {
  const [period, setPeriod] = React.useState<Period>("MONTHLY");
  const [loading, setLoading] = React.useState(true);

  const [leaderboard,  setLeaderboard]  = React.useState<LeaderboardUser[]>([]);
  const [deptRows,     setDeptRows]     = React.useState<DeptLeaderboardEntry[]>([]);
  const [achievements, setAchievements] = React.useState<EarnedAchievement[]>([]);
  const [inductees,    setInductees]    = React.useState<HofEntry[]>([]);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      leaderboardService.get(period).then((r) => setLeaderboard(r.entries)),
      rewardsService.deptLeaderboard("month").then(setDeptRows),
      achievementService.getMy().then(setAchievements),
      hofService.getApproved().then(setInductees),
    ])
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [period]);

  const topUser     = leaderboard[0];
  const totalPoints = leaderboard.reduce((s, u) => s + u.totalPoints, 0);
  const maxPts      = topUser?.totalPoints ?? 1;
  const maxDeptPts  = deptRows[0]?.totalPoints ?? 1;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
            <BarChart2 className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Engagement Analytics</h1>
            <p className="text-sm text-muted-foreground">Platform-wide participation & points insights</p>
          </div>
        </div>

        {/* Period tabs */}
        <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                period === p.value ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard icon={Zap}         label="Total Points"       value={totalPoints.toLocaleString()}   tint="bg-primary"       />
            <StatCard icon={Users}       label="Active Users"       value={leaderboard.length}             tint="bg-blue-500"      />
            <StatCard icon={Trophy}      label="Top Earner"         value={topUser?.name.split(" ")[0] ?? "—"} tint="bg-amber-500" />
            <StatCard icon={TrendingUp}  label="Departments"        value={deptRows.length}                tint="bg-green-500"     />
            <StatCard icon={Award}       label="Achievements"       value={achievements.length}            tint="bg-violet-500"    />
            <StatCard icon={Star}        label="Hall of Fame"       value={inductees.length}               tint="bg-rose-500"      />
          </div>

          {/* Two-column grid */}
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Top 10 earners */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <h2 className="flex items-center gap-2 font-bold">
                <Flame className="size-4 text-primary" /> Top Earners
              </h2>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No points data for this period.</p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((u) => (
                    <PointsBar key={u.userId} user={u} max={maxPts} />
                  ))}
                </div>
              )}
            </div>

            {/* Department rankings */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <h2 className="flex items-center gap-2 font-bold">
                <BarChart2 className="size-4 text-blue-500" /> Department Rankings
              </h2>
              {deptRows.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No department data yet.</p>
              ) : (
                <div className="space-y-4">
                  {deptRows.slice(0, 8).map((d) => (
                    <DeptBar key={d.department} entry={d} max={maxDeptPts} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent achievements */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <h2 className="flex items-center gap-2 font-bold">
                <Award className="size-4 text-violet-500" /> Your Recent Achievements
              </h2>
              {achievements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No achievements yet — keep participating!</p>
              ) : (
                <div className="space-y-2">
                  {achievements.slice(0, 8).map((a) => (
                    <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
                      <span className="text-xl shrink-0">{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{a.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                      </div>
                      <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold uppercase shrink-0", {
                        LEGENDARY: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
                        EPIC:      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                        RARE:      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
                        UNCOMMON:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                        COMMON:    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                      }[a.rarity])}>
                        {a.rarity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hall of Fame spotlight */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <h2 className="flex items-center gap-2 font-bold">
                <Trophy className="size-4 text-amber-500" /> Hall of Fame Spotlight
              </h2>
              {inductees.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No inductees yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {inductees.slice(0, 6).map((e) => (
                    <div key={e.id} className="rounded-xl border border-border bg-background p-3 text-center">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary mx-auto mb-2">
                        {e.userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <p className="text-xs font-semibold truncate">{e.userName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{e.category}</p>
                      <p className="text-[10px] text-muted-foreground">{e.periodLabel}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
