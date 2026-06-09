"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, LogIn, LogOut, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAttendance } from "@/hooks/useAttendance";

/**
 * Backend serialises LocalDateTime (UTC) without a timezone suffix.
 * Appending "Z" forces UTC interpretation so the browser converts to IST.
 */
function toUTC(iso: string): string {
  return iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
}

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(toUTC(iso)).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function fmtDuration(minutes: number | null): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function AttendanceTodayCard() {
  const { today, loading, checkIn, checkOut } = useAttendance();

  const [now, setNow]   = React.useState(new Date());
  const [doing, setDoing] = React.useState(false);

  // Tick every minute for live clock
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const timeStr    = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const isWorkHours = now.getHours() >= 8 && now.getHours() < 20;
  const checkedIn   = Boolean(today?.checkInTime);
  const checkedOut  = Boolean(today?.checkOutTime);

  const handleCheckIn = async () => {
    setDoing(true);
    try { await checkIn("OFFICE"); } catch { /* error shown elsewhere */ }
    finally { setDoing(false); }
  };

  const handleCheckOut = async () => {
    setDoing(true);
    try { await checkOut(); } catch { /* error shown elsewhere */ }
    finally { setDoing(false); }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-background p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
            <Clock className="size-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Attendance</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
        </div>

        {/* Status chip */}
        <span className={cn(
          "rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
          checkedOut
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-800"
            : checkedIn
              ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:ring-blue-800"
              : "bg-amber-50 text-amber-600 ring-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-800"
        )}>
          {loading && !today ? "Loading…"
            : checkedOut  ? "Completed"
            : checkedIn   ? "Checked in"
            : "Not checked in"}
        </span>
      </div>

      {/* Time + check-in/out info */}
      <div className="mt-5 flex-1">
        <p className="text-3xl font-bold tabular-nums tracking-tight">{timeStr}</p>

        {checkedIn ? (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">In:</span> {fmt(today!.checkInTime)}
            </span>
            {checkedOut && (
              <span>
                <span className="font-medium text-foreground">Out:</span> {fmt(today!.checkOutTime)}
              </span>
            )}
            {checkedOut && today!.durationMinutes != null && (
              <span>
                <span className="font-medium text-foreground">Duration:</span>{" "}
                {fmtDuration(today!.durationMinutes)}
              </span>
            )}
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            {isWorkHours ? "Office hours — mark your attendance" : "Outside office hours"}
          </p>
        )}
      </div>

      {/* Action button */}
      <div className="mt-5 space-y-2">
        {checkedOut ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="size-4" />
            Day complete
          </div>
        ) : checkedIn ? (
          <button
            onClick={handleCheckOut}
            disabled={doing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
          >
            {doing ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
            {doing ? "Checking out…" : "Check Out"}
          </button>
        ) : (
          <button
            onClick={handleCheckIn}
            disabled={doing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
          >
            {doing ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
            {doing ? "Checking in…" : "Check In"}
          </button>
        )}
        <Link
          href="/dashboard/attendance"
          className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          View full history →
        </Link>
      </div>
    </div>
  );
}
