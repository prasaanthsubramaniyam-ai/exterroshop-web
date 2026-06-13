"use client";

import * as React from "react";
import Link from "next/link";
import {
  Trophy,
  Star,
  ClipboardList,
  BarChart3,
  Target,
  HeartHandshake,
  GraduationCap,
  Dumbbell,
  Cake,
  Lightbulb,
  UsersRound,
  ChevronRight,
  Medal,
  Zap,
  Plus,
  Sparkles,
  Loader2,
  Calendar,
  MapPin,
  Users,
  Award,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/utils/format";
import {
  recognitionService,
  activitiesService,
  type Recognition,
  type LeaderboardEntry,
  type Activity,
} from "@/services/engagement.service";

// ── Module grid data ──────────────────────────────────────────────────────────

interface EngagementModule {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tint: string;
}

const MODULES: EngagementModule[] = [
  { title: "Sports & Events",    description: "Tournaments, registrations and gallery",   href: "/dashboard/sports",                     icon: Trophy,        tint: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  { title: "Celebrations",       description: "Birthdays, anniversaries and wishes",      href: "/dashboard/engagement/celebrations",    icon: Cake,          tint: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" },
  { title: "Rewards & Recognition", description: "Kudos, badges and leaderboards",        href: "/dashboard/engagement/recognition",     icon: Star,          tint: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { title: "Polls",              description: "Quick one-question pulse checks",          href: "/dashboard/engagement/polls",           icon: BarChart3,     tint: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { title: "Surveys",            description: "Multi-question feedback and results",      href: "/dashboard/engagement/surveys",         icon: ClipboardList, tint: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" },
  { title: "Challenges",         description: "Time-boxed goals with leaderboards",      href: "/dashboard/engagement/challenges",      icon: Target,        tint: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  { title: "CSR Activities",     description: "Volunteer drives and impact tracking",    href: "/dashboard/engagement/csr",             icon: HeartHandshake,tint: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  { title: "Learning Events",    description: "Workshops, webinars and materials",       href: "/dashboard/engagement/learning",        icon: GraduationCap, tint: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
  { title: "Wellness Programs",  description: "Fitness and mental-health programs",      href: "/dashboard/engagement/wellness",        icon: Dumbbell,      tint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { title: "Suggestions & Ideas",description: "Idea box with upvotes and status",        href: "/dashboard/engagement/ideas",           icon: Lightbulb,     tint: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  { title: "Clubs & Communities",description: "Interest groups and club feeds",          href: "/dashboard/engagement/clubs",           icon: UsersRound,    tint: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
];

// ── Avatar helper ─────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function Avatar({ name, url, size = 8 }: { name: string; url: string | null; size?: number }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name} className={`size-${size} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`flex size-${size} shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary`}>
      {initials(name)}
    </div>
  );
}

// ── Points hero ───────────────────────────────────────────────────────────────

function PointsHero({
  points,
  rank,
  onGiveKudos,
}: {
  points: number | null;
  rank: number | null;
  onGiveKudos: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-orange-600 p-6 text-primary-foreground shadow-lg shadow-primary/20">
      {/* decorative circles */}
      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-12 -right-4 size-52 rounded-full bg-white/5" />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          {/* Points */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">My points</p>
            <p className="mt-0.5 text-4xl font-bold tabular-nums">
              {points === null ? <span className="inline-block h-10 w-20 animate-pulse rounded-xl bg-white/20" /> : points.toLocaleString()}
            </p>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-white/20" />

          {/* Streak placeholder — will connect to V39 engagement_streaks */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">Streak</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xl font-bold">
              <Zap className="size-5 text-yellow-300" /> 0 days
            </p>
          </div>

          {/* Rank */}
          {rank !== null && rank <= 10 && (
            <>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">Rank</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xl font-bold">
                  <Medal className="size-5 text-yellow-300" /> #{rank}
                </p>
              </div>
            </>
          )}
        </div>

        <Button
          variant="secondary"
          className="shrink-0 bg-white/20 text-primary-foreground hover:bg-white/30 border-0"
          onClick={onGiveKudos}
        >
          <Sparkles className="size-4" /> Give kudos
        </Button>
      </div>
    </div>
  );
}

// ── Recognition feed ──────────────────────────────────────────────────────────

function RecognitionFeed({ feed }: { feed: Recognition[] | null }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="flex items-center gap-2 font-semibold">
          <Star className="size-4 text-amber-500" /> Recent kudos
        </h2>
        <Link href="/dashboard/engagement/recognition" className="text-xs font-medium text-primary hover:underline">
          View all →
        </Link>
      </div>

      <div className="divide-y divide-border">
        {feed === null && (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {feed?.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            <Star className="mx-auto mb-2 size-8 text-muted-foreground/30" />
            No kudos yet — be the first!
          </div>
        )}
        {feed?.slice(0, 5).map((r) => (
          <div key={r.id} className="flex items-start gap-3 px-5 py-4">
            <Avatar name={r.senderName} url={r.senderAvatarUrl} size={8} />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">
                <span className="font-semibold">{r.senderName}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="font-semibold">{r.recipientName}</span>
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  {r.badgeEmoji} {r.badgeLabel}
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                  +{r.points} pts
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.message}</p>
            </div>
            <span className="shrink-0 text-[10px] text-muted-foreground">{formatTimeAgo(r.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Leaderboard snapshot ──────────────────────────────────────────────────────

function LeaderboardSnapshot({ rows }: { rows: LeaderboardEntry[] | null }) {
  const medal = (rank: number) =>
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="flex items-center gap-2 font-semibold">
          <Trophy className="size-4 text-amber-500" /> Top performers
        </h2>
        <Link href="/dashboard/engagement/recognition" className="text-xs font-medium text-primary hover:underline">
          Full board →
        </Link>
      </div>

      <div className="divide-y divide-border">
        {rows === null && (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {rows?.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No points yet this month</p>
        )}
        {rows?.slice(0, 5).map((r) => (
          <div key={r.userId} className="flex items-center gap-3 px-5 py-3">
            <span className="w-6 text-center text-base">
              {medal(r.rank) ?? <span className="text-xs font-bold text-muted-foreground">{r.rank}</span>}
            </span>
            <Avatar name={r.name} url={r.avatarUrl} size={8} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{r.name}</p>
              {r.department && (
                <p className="truncate text-[11px] text-muted-foreground">{r.department}</p>
              )}
            </div>
            <span className="text-sm font-bold tabular-nums text-primary">{r.points.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Open activities strip ─────────────────────────────────────────────────────

const KIND_TINT: Record<string, string> = {
  CHALLENGE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  CSR:       "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  LEARNING:  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  WELLNESS:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};
const KIND_ICON: Record<string, LucideIcon> = {
  CHALLENGE: Target,
  CSR:       HeartHandshake,
  LEARNING:  GraduationCap,
  WELLNESS:  Dumbbell,
};
const KIND_HREF: Record<string, string> = {
  CHALLENGE: "/dashboard/engagement/challenges",
  CSR:       "/dashboard/engagement/csr",
  LEARNING:  "/dashboard/engagement/learning",
  WELLNESS:  "/dashboard/engagement/wellness",
};

function ActivityStrip({ items }: { items: Activity[] | null }) {
  if (items !== null && items.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <Award className="size-4 text-primary" /> Open for you to join
        </h2>
      </div>

      {items === null ? (
        <div className="flex justify-center py-6">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((a) => {
            const Icon = KIND_ICON[a.kind] ?? Target;
            const tint = KIND_TINT[a.kind] ?? "";
            const href = KIND_HREF[a.kind] ?? "/dashboard/engagement";

            return (
              <Link
                key={a.id}
                href={href}
                className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", tint)}>
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{a.title}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                      {a.startsAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(a.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                      {a.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" /> {a.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="size-3" /> {a.registrationCount} joined
                      </span>
                    </div>
                  </div>
                </div>
                {a.pointsReward > 0 && (
                  <div className="mt-2.5 flex items-center gap-1 rounded-lg bg-primary/5 px-2.5 py-1.5 text-[11px] font-bold text-primary">
                    <Award className="size-3" /> +{a.pointsReward} pts on completion
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Give kudos modal import ──────────────────────────────────────────────────
// We re-use the modal from RecognitionView by lazy import to keep bundle lean

import dynamic from "next/dynamic";

const GiveKudosModal = dynamic(
  () =>
    import("./recognition/RecognitionView").then((m) => ({
      default: m.GiveKudosModalExport,
    })),
  { ssr: false }
);

// ── Hub page ──────────────────────────────────────────────────────────────────

export function EngagementHubView() {
  const { user } = useAuth();
  const userId = user?.id;

  const [points, setPoints] = React.useState<number | null>(null);
  const [feed, setFeed] = React.useState<Recognition[] | null>(null);
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[] | null>(null);
  const [openActivities, setOpenActivities] = React.useState<Activity[] | null>(null);
  const [showGive, setShowGive] = React.useState(false);

  // Derive my rank from leaderboard data
  const myRank = React.useMemo(() => {
    if (!leaderboard || userId == null) return null;
    return leaderboard.find((r) => r.userId === userId)?.rank ?? null;
  }, [leaderboard, userId]);

  React.useEffect(() => {
    recognitionService.myPoints().then(setPoints).catch(() => setPoints(0));
    recognitionService.feed(0, 10).then(setFeed).catch(() => setFeed([]));
    recognitionService.leaderboard("month", 20).then(setLeaderboard).catch(() => setLeaderboard([]));
    // load all open activities to show the best 3
    activitiesService.list().then((all) =>
      setOpenActivities(all.filter((a) => a.status === "OPEN" && !a.myStatus))
    ).catch(() => setOpenActivities([]));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Points hero */}
      <PointsHero points={points} rank={myRank} onGiveKudos={() => setShowGive(true)} />

      {/* Main two-column */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <RecognitionFeed feed={feed} />
        <LeaderboardSnapshot rows={leaderboard} />
      </div>

      {/* Open activities you can join */}
      <ActivityStrip items={openActivities} />

      {/* Module grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground/80">All modules</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowGive(true)}>
            <Plus className="size-4" /> Give kudos
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", m.tint)}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{m.description}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </div>

      {showGive && (
        <GiveKudosModal
          onClose={() => setShowGive(false)}
          onSent={(r: Recognition) => {
            setFeed((prev) => [r, ...(prev ?? [])]);
            setShowGive(false);
          }}
        />
      )}
    </div>
  );
}
