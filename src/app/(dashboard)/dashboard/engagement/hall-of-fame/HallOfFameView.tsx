"use client";

import * as React from "react";
import {
  Trophy, Medal, Star, Loader2, Crown,
  UsersRound, Sparkles, Building2, Plus, X, CheckCircle2, XCircle, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { recognitionService, type LeaderboardEntry, type Recognition, hofService, type HofEntry } from "@/services/engagement.service";
import { rewardsService, type DeptLeaderboardEntry } from "@/services/rewards.service";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import type { UserRole } from "@/types";

const HR_ROLES: UserRole[] = ["HR", "SUPER_ADMIN", "CEO"];

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

// ── HoF Inductees grid ────────────────────────────────────────────────────────

const CATEGORY_TINT: Record<string, string> = {
  "Employee of the Month":  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Innovation Champion":    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "Culture Champion":       "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "CSR Hero":               "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "Learning Leader":        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Sports Star":            "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

function InducteesGrid({ entries }: { entries: HofEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <h2 className="flex items-center gap-2 font-bold">
        <Flame className="size-4 text-amber-500" /> Hall of Fame Inductees
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {entries.map((e) => (
          <div key={e.id} className="rounded-xl border border-border bg-background p-4 flex flex-col items-center text-center gap-2">
            {e.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.avatarUrl} alt={e.userName} className="size-14 rounded-full object-cover ring-2 ring-amber-400" />
            ) : (
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary ring-2 ring-amber-400">
                {e.userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-sm">{e.userName}</p>
              {e.department && <p className="text-[10px] text-muted-foreground">{e.department}</p>}
            </div>
            <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
              CATEGORY_TINT[e.category] ?? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400")}>
              {e.category}
            </span>
            <p className="text-[10px] text-muted-foreground">{e.periodLabel}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Nominate modal ────────────────────────────────────────────────────────────

const HOF_CATEGORIES = [
  "Employee of the Month", "Innovation Champion", "Culture Champion",
  "CSR Hero", "Learning Leader", "Sports Star",
];

function NominateModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const dispatch = useAppDispatch();
  const [userId,   setUserId]   = React.useState("");
  const [category, setCategory] = React.useState(HOF_CATEGORIES[0]);
  const [period,   setPeriod]   = React.useState("");
  const [reason,   setReason]   = React.useState("");
  const [saving,   setSaving]   = React.useState(false);

  const submit = async () => {
    if (!userId.trim() || !period.trim() || !reason.trim()) return;
    setSaving(true);
    try {
      await hofService.nominate({
        userId: Number(userId),
        category,
        periodLabel: period.trim(),
        reason: reason.trim(),
      });
      dispatch(pushToast({ title: "Nomination submitted!", description: "HR will review and approve shortly." }));
      onDone();
      onClose();
    } catch (err) {
      dispatch(pushToast({ title: "Nomination failed", description: (err as Error).message, variant: "destructive" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2"><Trophy className="size-4 text-amber-500" /> Nominate for Hall of Fame</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Employee ID *</label>
            <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. 42"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30">
              {HOF_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Period *</label>
            <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="e.g. June 2026"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Reason *</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              placeholder="Why does this person deserve to be inducted?"
              className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
          <button onClick={submit} disabled={saving || !userId || !period || !reason}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pending nominations panel (HR) ────────────────────────────────────────────

function PendingNominations({ onApproval }: { onApproval: () => void }) {
  const dispatch = useAppDispatch();
  const [pending, setPending]   = React.useState<HofEntry[] | null>(null);
  const [working, setWorking]   = React.useState<number | null>(null);

  React.useEffect(() => {
    hofService.getPending().then(setPending).catch(() => setPending([]));
  }, []);

  const process = async (id: number, status: "APPROVED" | "REJECTED", featured: boolean) => {
    setWorking(id);
    try {
      await hofService.process(id, status, featured);
      setPending((prev) => prev?.filter((e) => e.id !== id) ?? null);
      dispatch(pushToast({ title: status === "APPROVED" ? "Inductee approved 🏆" : "Nomination rejected" }));
      if (status === "APPROVED") onApproval();
    } catch (err) {
      dispatch(pushToast({ title: "Action failed", description: (err as Error).message, variant: "destructive" }));
    } finally {
      setWorking(null);
    }
  };

  if (pending === null) return <div className="flex justify-center py-6"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>;
  if (pending.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20 p-5 space-y-4">
      <h2 className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
        <Trophy className="size-4" /> Pending Nominations ({pending.length})
      </h2>
      <div className="space-y-3">
        {pending.map((e) => (
          <div key={e.id} className="rounded-xl border border-border bg-background p-4 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {e.userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{e.userName}</p>
              <p className="text-xs text-muted-foreground">{e.category} · {e.periodLabel}</p>
              {e.reason && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{e.reason}</p>}
              {e.nominatorName && <p className="text-[10px] text-muted-foreground mt-0.5">Nominated by {e.nominatorName}</p>}
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => process(e.id, "APPROVED", true)} disabled={working === e.id}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 transition-colors disabled:opacity-50">
                {working === e.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />} Approve
              </button>
              <button onClick={() => process(e.id, "REJECTED", false)} disabled={working === e.id}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 transition-colors disabled:opacity-50">
                <XCircle className="size-3" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function HallOfFameView() {
  const { user }   = useAuth();
  const isHR       = HR_ROLES.includes(user?.role as UserRole);

  const [leaderboard,  setLeaderboard]  = React.useState<LeaderboardEntry[]>([]);
  const [feed,         setFeed]         = React.useState<Recognition[]>([]);
  const [inductees,    setInductees]    = React.useState<HofEntry[]>([]);
  const [nomOpen,      setNomOpen]      = React.useState(false);
  const [reloadTick,   setReloadTick]   = React.useState(0);

  React.useEffect(() => {
    recognitionService.leaderboard("month", 10).then(setLeaderboard).catch(() => setLeaderboard([]));
    recognitionService.feed(0, 30).then(setFeed).catch(() => setFeed([]));
    hofService.getFeatured().then(setInductees).catch(() => setInductees([]));
  }, [reloadTick]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950">
            <Trophy className="size-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Hall of Fame</h1>
            <p className="text-sm text-muted-foreground">Champions, inductees and department standings</p>
          </div>
        </div>
        <button onClick={() => setNomOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="size-4" /> Nominate
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Medal,      label: "Top scorer",    value: leaderboard[0]?.name.split(" ")[0] ?? "—",            tint: "bg-amber-500"   },
          { icon: Star,       label: "Kudos given",   value: feed.length,                                            tint: "bg-yellow-500"  },
          { icon: UsersRound, label: "Recognised",    value: new Set(feed.map((r) => r.recipientId)).size,          tint: "bg-blue-500"    },
          { icon: Sparkles,   label: "Inductees",     value: inductees.length,                                       tint: "bg-purple-500"  },
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

      {/* HR pending nominations */}
      {isHR && <PendingNominations onApproval={() => setReloadTick((t) => t + 1)} />}

      {/* Featured inductees grid */}
      <InducteesGrid entries={inductees} />

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

      {nomOpen && <NominateModal onClose={() => setNomOpen(false)} onDone={() => setReloadTick((t) => t + 1)} />}
    </div>
  );
}
