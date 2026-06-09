"use client";

import * as React from "react";
import Link from "next/link";
import {
  Trophy, Users, ClipboardList, Medal, ImageIcon,
  Loader2, TrendingUp, Clock, CheckCircle2,
} from "lucide-react";
import { sportsService, type HRDashboard } from "@/services/sports.service";
import { cn } from "@/lib/utils";

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className={cn("flex size-10 items-center justify-center rounded-xl mb-3", color)}>
        <Icon className="size-5" />
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

const QUICK_LINKS = [
  { label: "Manage Events",    href: "/dashboard/sports/hr/events",       icon: Trophy,       color: "bg-orange-50 dark:bg-orange-950 text-orange-500" },
  { label: "Participants",     href: "/dashboard/sports/hr/participants",  icon: Users,        color: "bg-blue-50 dark:bg-blue-950 text-blue-500" },
  { label: "Volunteers",       href: "/dashboard/sports/hr/volunteers",    icon: ClipboardList, color: "bg-teal-50 dark:bg-teal-950 text-teal-500" },
  { label: "Teams",            href: "/dashboard/sports/hr/teams",         icon: Users,        color: "bg-violet-50 dark:bg-violet-950 text-violet-500" },
  { label: "Publish Results",  href: "/dashboard/sports/hr/results",       icon: Medal,        color: "bg-amber-50 dark:bg-amber-950 text-amber-500" },
  { label: "Gallery",          href: "/dashboard/sports/hr/gallery",       icon: ImageIcon,    color: "bg-pink-50 dark:bg-pink-950 text-pink-500" },
];

export default function HRSportsDashboard() {
  const [dash, setDash] = React.useState<HRDashboard | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    sportsService.getHRDashboard()
      .then(setDash)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950">
            <Trophy className="size-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Sports & Events Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage all sports events and registrations</p>
          </div>
        </div>
        <Link
          href="/dashboard/sports/hr/events/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Trophy className="size-4" />
          Create Event
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2" /> Loading…
        </div>
      ) : dash ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Active Events"          value={dash.activeEvents}          icon={TrendingUp}   color="bg-emerald-50 dark:bg-emerald-950 text-emerald-600" />
          <StatCard label="Draft Events"           value={dash.draftEvents}           icon={Clock}        color="bg-gray-100 dark:bg-gray-800 text-gray-500" />
          <StatCard label="Completed"              value={dash.completedEvents}       icon={CheckCircle2} color="bg-violet-50 dark:bg-violet-950 text-violet-600" />
          <StatCard label="Pending Approvals"      value={dash.pendingRegistrations}  icon={ClipboardList} color="bg-amber-50 dark:bg-amber-950 text-amber-500" />
          <StatCard label="Approved Participants"  value={dash.approvedParticipants}  icon={Users}        color="bg-blue-50 dark:bg-blue-950 text-blue-600" />
          <StatCard label="Approved Volunteers"    value={dash.approvedVolunteers}    icon={Users}        color="bg-teal-50 dark:bg-teal-950 text-teal-600" />
        </div>
      ) : null}

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_LINKS.map(({ label, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-background p-4 hover:shadow-md hover:border-primary/30 transition-all text-center"
            >
              <div className={cn("flex size-10 items-center justify-center rounded-xl", color.split(" ").slice(0, 2).join(" "))}>
                <Icon className={cn("size-5", color.split(" ").slice(2).join(" "))} />
              </div>
              <span className="text-xs font-medium leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
