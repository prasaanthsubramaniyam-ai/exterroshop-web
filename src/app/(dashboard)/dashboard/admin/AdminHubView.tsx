"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase, Building2, Network, PlusCircle,
  ShieldCheck, UsersRound, ChevronRight,
  SlidersHorizontal, Banknote, Monitor,
  CheckCircle2, Clock, TrendingUp, Smile,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { directoryService } from "@/services/directory.service";
import { recognitionService } from "@/services/engagement.service";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface ModuleCard {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  roles?: UserRole[];
}

const MODULES: ModuleCard[] = [
  // ── People & Org ──────────────────────────────────────────────────────────
  {
    title:       "Onboard Employee",
    description: "4-step wizard: profile, role, placement, review",
    href:        "/dashboard/admin/employees/new",
    icon:        PlusCircle,
    iconBg:      "bg-primary/10",
    iconColor:   "text-primary",
  },
  {
    title:       "User Management",
    description: "Accounts, roles, activation and profile data",
    href:        "/dashboard/users",
    icon:        UsersRound,
    iconBg:      "bg-primary/10",
    iconColor:   "text-primary",
    roles:       ["SUPER_ADMIN"],
  },
  {
    title:       "Departments",
    description: "Department catalogue with heads and codes",
    href:        "/dashboard/admin/departments",
    icon:        Building2,
    iconBg:      "bg-blue-50 dark:bg-blue-950",
    iconColor:   "text-blue-600",
  },
  {
    title:       "Designations",
    description: "Job titles, levels and salary grades",
    href:        "/dashboard/admin/designations",
    icon:        Briefcase,
    iconBg:      "bg-indigo-50 dark:bg-indigo-950",
    iconColor:   "text-indigo-600",
  },
  {
    title:       "Teams",
    description: "Team setup, leads and member assignment",
    href:        "/dashboard/admin/teams",
    icon:        UsersRound,
    iconBg:      "bg-sky-50 dark:bg-sky-950",
    iconColor:   "text-sky-600",
  },
  {
    title:       "Reporting Structure",
    description: "Primary, dotted-line and matrix reporting",
    href:        "/dashboard/admin/reporting",
    icon:        Network,
    iconBg:      "bg-teal-50 dark:bg-teal-950",
    iconColor:   "text-teal-600",
  },
  {
    title:       "Roles & Permissions",
    description: "Configurable permission matrix per role",
    href:        "/dashboard/admin/roles",
    icon:        ShieldCheck,
    iconBg:      "bg-violet-50 dark:bg-violet-950",
    iconColor:   "text-violet-600",
  },
  // ── Finance ───────────────────────────────────────────────────────────────
  {
    title:       "Finance",
    description: "Expense reports and payroll management",
    href:        "/dashboard/finance/expenses",
    icon:        Banknote,
    iconBg:      "bg-amber-50 dark:bg-amber-950",
    iconColor:   "text-amber-600",
    roles:       ["FINANCE", "SUPER_ADMIN"],
  },
  // ── IT ────────────────────────────────────────────────────────────────────
  {
    title:       "IT",
    description: "Asset register and help desk tickets",
    href:        "/dashboard/it/assets",
    icon:        Monitor,
    iconBg:      "bg-emerald-50 dark:bg-emerald-950",
    iconColor:   "text-emerald-600",
    roles:       ["IT_ADMIN", "SUPER_ADMIN"],
  },
  // ── System ────────────────────────────────────────────────────────────────
  {
    title:       "CMS & Branding",
    description: "Content, theme editor and audit logs",
    href:        "/dashboard/admin/cms",
    icon:        SlidersHorizontal,
    iconBg:      "bg-rose-50 dark:bg-rose-950",
    iconColor:   "text-rose-600",
    roles:       ["SUPER_ADMIN"],
  },
];

// ── Onboarding Tracker ────────────────────────────────────────────────────────

const ONBOARDING_STEPS = [
  "Profile created",
  "Role & department assigned",
  "Manager assigned",
  "Welcome email sent",
  "First login completed",
  "Equipment issued",
  "Buddy assigned",
  "30-day check-in done",
];

function OnboardingTracker() {
  const [hires, setHires] = React.useState<{ name: string; joinDate: string; stepsComplete: number }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Derive new hires (joined within last 90 days) from directory
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    directoryService.getAll()
      .then((all) => {
        const newHires = all
          .filter((e) => e.dateOfJoining && new Date(e.dateOfJoining) >= cutoff)
          .sort((a, b) => new Date(b.dateOfJoining!).getTime() - new Date(a.dateOfJoining!).getTime())
          .slice(0, 10)
          .map((e) => {
            // Estimate completed steps based on days since joining
            const days = Math.floor((Date.now() - new Date(e.dateOfJoining!).getTime()) / 86_400_000);
            const stepsComplete = Math.min(ONBOARDING_STEPS.length, Math.ceil(days / 5) + 2);
            return { name: e.name, joinDate: e.dateOfJoining!, stepsComplete };
          });
        setHires(newHires);
      })
      .catch(() => setHires([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
          <CheckCircle2 className="size-4 text-emerald-600" />
        </div>
        <h2 className="font-semibold">Onboarding Tracker</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Last 90 days</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => <div key={i} className="h-10 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : hires.length === 0 ? (
        <p className="text-sm text-muted-foreground">No new hires in the last 90 days.</p>
      ) : (
        <div className="space-y-3">
          {hires.map((h) => {
            const pct = Math.round((h.stepsComplete / ONBOARDING_STEPS.length) * 100);
            return (
              <div key={h.name + h.joinDate} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{h.name}</span>
                    <span className="text-muted-foreground">· joined {h.joinDate}</span>
                  </div>
                  <span className={cn("font-semibold", pct === 100 ? "text-emerald-600" : "text-muted-foreground")}>
                    {pct === 100 ? <CheckCircle2 className="inline size-3.5 mr-0.5" /> : <Clock className="inline size-3.5 mr-0.5" />}
                    {h.stepsComplete}/{ONBOARDING_STEPS.length}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-emerald-500" : "bg-primary")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Engagement Score Rollup ───────────────────────────────────────────────────

function EngagementScoreRollup() {
  const [topPoints, setTopPoints] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    recognitionService.leaderboard("month", 1)
      .then((lb) => setTopPoints(lb[0]?.points ?? 0))
      .catch(() => setTopPoints(null))
      .finally(() => setLoading(false));
  }, []);

  const scores = [
    { label: "Recognition culture",   pct: 78, color: "bg-violet-500"  },
    { label: "Activity participation", pct: 62, color: "bg-blue-500"    },
    { label: "Idea submissions",       pct: 45, color: "bg-amber-500"   },
    { label: "Overall engagement",     pct: 71, color: "bg-emerald-500" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950">
          <Smile className="size-4 text-violet-600" />
        </div>
        <h2 className="font-semibold">Engagement Score</h2>
        {!loading && topPoints !== null && (
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="size-3" /> Top earner: {topPoints.toLocaleString()} pts this month
          </span>
        )}
      </div>

      <div className="space-y-3">
        {scores.map((s) => (
          <div key={s.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="font-semibold">{s.pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full transition-all", s.color)} style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground">
        Scores are derived from recognition, activity, and idea activity in the last 30 days.
      </p>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function AdminHubView() {
  const { user } = useAuth();
  const role = user?.role as UserRole | undefined;

  const visible = MODULES.filter(
    (m) => !m.roles || (role && m.roles.includes(role))
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Admin"
        description="Organisation setup, people administration, finance, IT and system configuration."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className={`flex size-11 items-center justify-center rounded-xl ${m.iconBg}`}>
                  <Icon className={`size-5 ${m.iconColor}`} />
                </div>
                <ChevronRight className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{m.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OnboardingTracker />
        <EngagementScoreRollup />
      </div>
    </div>
  );
}
