"use client";

import * as React from "react";
import Image from "next/image";
import { Trophy, Star, Target, Heart, BookOpen, Users2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  reportsInsightsService,
  type SportEventReport,
  type EngagementStats,
  type ActivityStats,
} from "@/services/reports-insights.service";

// ── Activity stat card ────────────────────────────────────────────────────────

function ActivityCard({
  icon: Icon, label, stats, iconBg,
}: {
  icon: React.ElementType;
  label: string;
  stats: ActivityStats;
  iconBg: string;
}) {
  const completionRate = stats.totalRegistrations > 0
    ? Math.round((stats.completions / stats.totalRegistrations) * 100)
    : 0;

  return (
    <div className="rounded-2xl border border-border bg-background p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className={cn("flex size-8 items-center justify-center rounded-lg", iconBg)}>
          <Icon className="size-4 text-white" />
        </div>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <div className="text-xl font-bold">{stats.totalActivities}</div>
          <div className="text-muted-foreground">Activities</div>
        </div>
        <div>
          <div className="text-xl font-bold">{stats.totalRegistrations}</div>
          <div className="text-muted-foreground">Registrations</div>
        </div>
        <div>
          <div className="text-xl font-bold">{stats.completions}</div>
          <div className="text-muted-foreground">Completed</div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Completion rate</span>
          <span className="font-bold">{completionRate}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${completionRate}%` }} />
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

function RecognitionLeaderboard({ recipients }: { recipients: EngagementStats["topRecipients"] }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h3 className="text-sm font-semibold mb-4">Points Leaderboard</h3>
      {recipients.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No recognition data yet</p>
      ) : (
        <div className="space-y-2">
          {recipients.map((r, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg w-6 text-center">{medals[i] ?? `#${i + 1}`}</span>
              {r.avatarUrl ? (
                <Image src={r.avatarUrl} alt="" width={32} height={32} className="size-8 rounded-full object-cover" />
              ) : (
                <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                  {r.name.charAt(0)}
                </div>
              )}
              <span className="flex-1 text-sm font-medium">{r.name}</span>
              <span className="font-bold tabular-nums text-sm">{r.points} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sports events ─────────────────────────────────────────────────────────────

function SportsEventsTable({ rows }: { rows: SportEventReport[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead className="bg-muted/40">
          <tr>
            {["Event","Date","Status","Registrations","Capacity","Fill Rate"].map(h => (
              <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No events found</td></tr>
          ) : rows.map(r => {
            const fillPct = r.capacity > 0 ? Math.round((r.totalRegistrations / r.capacity) * 100) : 0;
            return (
              <tr key={r.eventId} className="border-t border-border/40 hover:bg-muted/20">
                <td className="px-3 py-2 font-medium">{r.eventName}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.eventDate ?? "—"}</td>
                <td className="px-3 py-2">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    r.status === "OPEN"   && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                    r.status === "CLOSED" && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
                    !["OPEN","CLOSED"].includes(r.status) && "bg-muted text-muted-foreground",
                  )}>
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2 font-bold">{r.totalRegistrations}</td>
                <td className="px-3 py-2">{r.capacity || "Unlimited"}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${fillPct}%` }} />
                    </div>
                    <span className="font-bold">{fillPct}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function EngagementReportsTab() {
  const [stats, setStats]   = React.useState<EngagementStats | null>(null);
  const [sports, setSports] = React.useState<SportEventReport[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.allSettled([
      reportsInsightsService.getEngagementStats(),
      reportsInsightsService.getSportsReport(),
    ]).then(([s, sp]) => {
      if (s.status  === "fulfilled") setStats(s.value);
      if (sp.status === "fulfilled") setSports(sp.value);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Sports & Events */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="size-4 text-amber-500" />
          <h2 className="text-sm font-semibold">Sports & Events</h2>
        </div>
        <SportsEventsTable rows={sports} />
      </div>

      {/* Employee Engagement */}
      {stats && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="size-4 text-violet-500" />
            <h2 className="text-sm font-semibold">Employee Engagement</h2>
          </div>

          {/* Surveys + Recognition stats */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
            {[
              { label: "Total Surveys",      value: stats.totalSurveys },
              { label: "Total Responses",    value: stats.totalSurveyResponses },
              { label: "Survey Participation", value: `${stats.surveyParticipationPct.toFixed(1)}%` },
              { label: "Kudos This Month",   value: stats.kudosGivenThisMonth },
              { label: "Kudos All Time",     value: stats.kudosGivenAllTime },
              { label: "Unique Recognizers", value: stats.uniqueRecognizers },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-background p-3 text-center">
                <p className="text-xl font-bold tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Activity cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
            <ActivityCard icon={Target}  label="Challenges"       stats={stats.challenges} iconBg="bg-red-500"    />
            <ActivityCard icon={Heart}   label="CSR Activities"   stats={stats.csr}        iconBg="bg-emerald-500"/>
            <ActivityCard icon={BookOpen} label="Learning Events" stats={stats.learning}   iconBg="bg-indigo-500" />
            <ActivityCard icon={Users2}  label="Wellness"         stats={stats.wellness}   iconBg="bg-teal-500"   />
          </div>

          {/* Leaderboard */}
          <RecognitionLeaderboard recipients={stats.topRecipients} />
        </div>
      )}
    </div>
  );
}
