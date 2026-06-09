"use client";

import * as React from "react";
import Link from "next/link";
import {
  ClipboardList, Loader2, Calendar, MapPin, Trophy,
  CheckCircle2, XCircle, Clock, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sportsService,
  type SportsRegistration,
} from "@/services/sports.service";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; class: string }> = {
  PENDING:    { label: "Pending",    icon: Clock,         class: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  APPROVED:   { label: "Approved",   icon: CheckCircle2,  class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  REJECTED:   { label: "Rejected",   icon: XCircle,       class: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
  WAITLISTED: { label: "Waitlisted", icon: AlertCircle,   class: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function MyRegistrationsPage() {
  const [regs, setRegs] = React.useState<SportsRegistration[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<string>("ALL");

  React.useEffect(() => {
    sportsService.getMyRegistrations()
      .then(setRegs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabs = ["ALL", "PARTICIPANT", "VOLUNTEER"];
  const filtered = tab === "ALL" ? regs : regs.filter((r) => r.registrationType === tab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
          <ClipboardList className="size-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">My Registrations</h1>
          <p className="text-sm text-muted-foreground">Track your event registrations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
              {t === "ALL" ? regs.length : regs.filter((r) => r.registrationType === t).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Trophy className="size-10 text-muted-foreground/40" />
          <p className="font-medium">No registrations yet</p>
          <Link href="/dashboard/sports" className="text-sm text-primary hover:underline">
            Browse upcoming events
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((reg) => {
            const sc = STATUS_CONFIG[reg.status] ?? STATUS_CONFIG.PENDING;
            const StatusIcon = sc.icon;
            return (
              <div key={reg.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center">
                {/* Banner thumb */}
                <div className="size-16 shrink-0 rounded-xl overflow-hidden bg-muted">
                  {reg.bannerUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={reg.bannerUrl} alt={reg.eventTitle}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Trophy className="size-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-1">{reg.eventTitle}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {reg.eventDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {fmtDate(reg.eventDate)}
                      </span>
                    )}
                    {reg.eventLocation && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {reg.eventLocation}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium capitalize">
                    {reg.registrationType.charAt(0) + reg.registrationType.slice(1).toLowerCase()}
                  </span>
                  <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", sc.class)}>
                    <StatusIcon className="size-3" />
                    {sc.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
