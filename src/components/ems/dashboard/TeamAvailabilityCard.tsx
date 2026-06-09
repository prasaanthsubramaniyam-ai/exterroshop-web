"use client";

import * as React from "react";
import Link from "next/link";
import { Users, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { attendanceService, type TeamAttendanceMember } from "@/services/attendance.service";

function formatTime(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

type PresenceStatus = "in" | "out" | "unknown";

function getPresence(m: TeamAttendanceMember): PresenceStatus {
  if (m.checkedIn) return "in";
  return "unknown";
}

const PRESENCE_DOT: Record<PresenceStatus, string> = {
  in:      "bg-emerald-500",
  out:     "bg-amber-400",
  unknown: "bg-gray-300 dark:bg-gray-600",
};

export function TeamAvailabilityCard() {
  const [members,  setMembers]  = React.useState<TeamAttendanceMember[]>([]);
  const [loading,  setLoading]  = React.useState(true);
  const [error,    setError]    = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const load = () => {
      attendanceService
        .getTeamToday()
        .then((data) => { if (!cancelled) { setMembers(data); setLoading(false); } })
        .catch((e: unknown) => {
          if (!cancelled) {
            setError(e instanceof Error ? e.message : "Failed to load");
            setLoading(false);
          }
        });
    };

    load();
    // Refresh every 5 minutes
    const tid = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(tid); };
  }, []);

  const checkedInCount = members.filter((m) => m.checkedIn).length;
  const visible        = members.slice(0, 9);
  const overflow       = members.length - 9;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-background p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950">
            <Users className="size-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Team Today</p>
            <p className="text-xs text-muted-foreground">
              {loading
                ? "Loading…"
                : error
                ? "Could not load"
                : members.length === 0
                ? "No colleagues"
                : `${checkedInCount} / ${members.length} in office`}
            </p>
          </div>
        </div>
        <Link href="/dashboard/team" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Presence legend */}
      {!loading && !error && members.length > 0 && (
        <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-emerald-500" /> In office
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-gray-300 dark:bg-gray-600" /> Not yet
          </span>
        </div>
      )}

      {/* Avatar grid */}
      <div className="mt-4 flex-1">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-1.5 py-5 text-center">
            <AlertCircle className="size-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        ) : visible.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">No colleagues found</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {visible.map((m) => {
              const initials  = m.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
              const presence  = getPresence(m);
              const checkTime = m.checkedIn ? formatTime(m.checkInTime) : null;
              const tooltip   = [
                m.name,
                m.designationTitle,
                m.checkedIn
                  ? `Checked in${checkTime ? " at " + checkTime : ""}`
                  : "Not checked in",
              ].filter(Boolean).join(" · ");

              return (
                <div key={m.userId} className="group relative" title={tooltip}>
                  {m.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.avatarUrl}
                      alt={m.name}
                      className={cn(
                        "size-10 rounded-full object-cover ring-2",
                        presence === "in" ? "ring-emerald-400" : "ring-border",
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full bg-muted text-[11px] font-bold ring-2",
                        presence === "in" ? "ring-emerald-400" : "ring-border",
                      )}
                    >
                      {initials}
                    </div>
                  )}

                  {/* Presence dot */}
                  <span
                    className={cn(
                      "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background",
                      PRESENCE_DOT[presence],
                    )}
                  />
                </div>
              );
            })}

            {overflow > 0 && (
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground ring-2 ring-border">
                +{overflow}
              </div>
            )}
          </div>
        )}
      </div>

      <Link
        href="/dashboard/team"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        Full team view <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
