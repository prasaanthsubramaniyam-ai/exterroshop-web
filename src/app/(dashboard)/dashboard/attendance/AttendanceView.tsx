"use client";

import * as React from "react";
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  Briefcase,
  Home,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  Navigation,
  NavigationOff,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAttendance } from "@/hooks/useAttendance";
import { AttendanceCorrections } from "./AttendanceCorrections";
import type {
  AttendanceRecord,
  WorkMode,
  LocationHistory,
  DeviceHistory,
} from "@/services/attendance.service";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toUTC(iso: string): string {
  return iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
}

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(toUTC(iso)).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function fmtDateTime(iso: string): string {
  return new Date(toUTC(iso)).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function fmtDuration(minutes: number | null): string {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const STATUS_STYLE: Record<string, string> = {
  PRESENT:  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  ABSENT:   "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  HALF_DAY: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  ON_LEAVE: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  HOLIDAY:  "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  WEEKEND:  "bg-muted text-muted-foreground",
};

const STATUS_LABEL: Record<string, string> = {
  PRESENT:  "Present",
  ABSENT:   "Absent",
  HALF_DAY: "Half Day",
  ON_LEAVE: "On Leave",
  HOLIDAY:  "Holiday",
  WEEKEND:  "Weekend",
};

const MODE_ICON: Record<WorkMode, React.ElementType> = {
  OFFICE: Briefcase,
  WFH:    Home,
  FIELD:  MapPin,
};

// ── Location card ─────────────────────────────────────────────────────────────

function LocationCard({ loc }: { loc: LocationHistory }) {
  const label = loc.eventType === "CHECK_IN" ? "Check-in" : "Check-out";
  const isCaptured = loc.locationStatus === "CAPTURED";

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label} Location</span>
        <span className={cn(
          "text-[10px] font-semibold rounded-full px-2 py-0.5",
          isCaptured
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
            : "bg-muted text-muted-foreground"
        )}>
          {loc.locationStatus}
        </span>
      </div>

      {isCaptured ? (
        <div className="space-y-0.5">
          {(loc.city || loc.state || loc.country) && (
            <p className="flex items-center gap-1.5 text-foreground font-medium">
              <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
              {[loc.city, loc.state, loc.country].filter(Boolean).join(", ")}
            </p>
          )}
          {loc.latitude != null && loc.longitude != null && (
            <p className="text-xs text-muted-foreground pl-5">
              {Number(loc.latitude).toFixed(5)}, {Number(loc.longitude).toFixed(5)}
              {loc.accuracyMeters != null && ` ± ${Math.round(Number(loc.accuracyMeters))}m`}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {loc.locationStatus === "DENIED"
            ? "Location permission was denied"
            : loc.locationStatus === "TIMEOUT"
            ? "Location capture timed out"
            : "Location unavailable on this device"}
        </p>
      )}

      <p className="mt-1.5 text-[11px] text-muted-foreground">{fmtDateTime(loc.capturedAt)}</p>
    </div>
  );
}

// ── Device card ───────────────────────────────────────────────────────────────

function DeviceCard({ dev }: { dev: DeviceHistory }) {
  const label = dev.eventType === "CHECK_IN" ? "Check-in" : "Check-out";
  const isDesktop = !/(Android|iPhone|iPad)/.test(dev.platform ?? "");

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label} Device</span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          {isDesktop
            ? <Monitor className="size-3" />
            : <Smartphone className="size-3" />}
          {isDesktop ? "Desktop" : "Mobile"}
        </span>
      </div>

      <div className="space-y-0.5">
        {dev.browser && (
          <p className="flex items-center gap-1.5 font-medium">
            <Globe className="size-3.5 shrink-0 text-muted-foreground" />
            {dev.browser}{dev.os ? ` · ${dev.os}` : ""}
          </p>
        )}
        {dev.timezone && (
          <p className="text-xs text-muted-foreground pl-5">
            <Clock className="size-3 inline mr-1" />
            {dev.timezone}
          </p>
        )}
        {dev.screenResolution && (
          <p className="text-xs text-muted-foreground pl-5">
            {dev.screenResolution}
          </p>
        )}
      </div>

      <p className="mt-1.5 text-[11px] text-muted-foreground">{fmtDateTime(dev.capturedAt)}</p>
    </div>
  );
}

// ── Today panel ───────────────────────────────────────────────────────────────

function TodayPanel() {
  const { today, loading, checkIn, checkOut, locationStatus } = useAttendance();
  const [now, setNow]       = React.useState(new Date());
  const [doing, setDoing]   = React.useState(false);
  const [workMode, setWorkMode] = React.useState<WorkMode>("OFFICE");
  const [gpsCapturing, setGpsCapturing] = React.useState(false);

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const timeStr    = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr    = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const checkedIn  = Boolean(today?.checkInTime);
  const checkedOut = Boolean(today?.checkOutTime);

  const handleCheckIn = async () => {
    setDoing(true);
    setGpsCapturing(true);
    try { await checkIn(workMode); }
    catch { /* handled by hook */ }
    finally { setDoing(false); setGpsCapturing(false); }
  };

  const handleCheckOut = async () => {
    setDoing(true);
    setGpsCapturing(true);
    try { await checkOut(); }
    catch { /* handled by hook */ }
    finally { setDoing(false); setGpsCapturing(false); }
  };

  // Derive last location from today's record
  const lastLocation = today?.locationHistory?.slice(-1)[0];
  const lastDevice   = today?.deviceHistory?.slice(-1)[0];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#8B1700] via-primary to-[#FF5020] p-6 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='white'/%3E%3C/svg%3E\")" }}
        aria-hidden />
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-3xl" aria-hidden />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left */}
        <div>
          <p className="text-sm font-medium text-white/70">{dateStr}</p>
          <p className="mt-1 text-5xl font-bold tabular-nums tracking-tight">{timeStr}</p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
            <div>
              <span className="text-white/60 text-xs uppercase tracking-wide">Check-in</span>
              <p className="font-semibold">{fmt(today?.checkInTime ?? null)}</p>
            </div>
            <div>
              <span className="text-white/60 text-xs uppercase tracking-wide">Check-out</span>
              <p className="font-semibold">{fmt(today?.checkOutTime ?? null)}</p>
            </div>
            {today?.durationMinutes != null && (
              <div>
                <span className="text-white/60 text-xs uppercase tracking-wide">Duration</span>
                <p className="font-semibold">{fmtDuration(today.durationMinutes)}</p>
              </div>
            )}
          </div>

          {/* Location + device indicators */}
          {checkedIn && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
              {lastLocation && (
                <span className="flex items-center gap-1 text-xs text-white/80">
                  {lastLocation.locationStatus === "CAPTURED"
                    ? <><Navigation className="size-3" />
                        {lastLocation.city
                          ? lastLocation.city
                          : `${Number(lastLocation.latitude).toFixed(3)}, ${Number(lastLocation.longitude).toFixed(3)}`}
                      </>
                    : <><NavigationOff className="size-3" /> Location {lastLocation.locationStatus.toLowerCase()}</>
                  }
                </span>
              )}
              {lastDevice && (
                <span className="flex items-center gap-1 text-xs text-white/80">
                  <ShieldCheck className="size-3" />
                  {lastDevice.browser} · {lastDevice.os}
                </span>
              )}
            </div>
          )}

          {/* GPS capturing indicator */}
          {gpsCapturing && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-white/70">
              <Loader2 className="size-3 animate-spin" />
              Capturing location…
            </p>
          )}

          {/* Location denied hint */}
          {locationStatus === "DENIED" && !gpsCapturing && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-white/60">
              <NavigationOff className="size-3" />
              Location permission denied. Attendance recorded without GPS.
            </p>
          )}
        </div>

        {/* Right — action */}
        <div className="flex flex-col gap-3">
          {!checkedIn && (
            <div className="flex gap-2">
              {(["OFFICE", "WFH", "FIELD"] as WorkMode[]).map((m) => {
                const Icon = MODE_ICON[m];
                return (
                  <button
                    key={m}
                    onClick={() => setWorkMode(m)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                      workMode === m
                        ? "bg-white text-primary"
                        : "bg-white/15 text-white/80 hover:bg-white/25"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {m === "OFFICE" ? "Office" : m === "WFH" ? "WFH" : "Field"}
                  </button>
                );
              })}
            </div>
          )}

          {checkedOut ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-white/20 px-6 py-3 text-sm font-bold backdrop-blur-sm">
              <CheckCircle2 className="size-4" />
              Day Complete
            </div>
          ) : checkedIn ? (
            <button
              onClick={handleCheckOut}
              disabled={doing}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-lg transition-all hover:bg-white/90 active:scale-[0.97] disabled:opacity-60"
            >
              {doing ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
              {doing ? (gpsCapturing ? "Getting location…" : "Checking out…") : "Check Out"}
            </button>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={doing || loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary shadow-lg transition-all hover:bg-white/90 active:scale-[0.97] disabled:opacity-60"
            >
              {doing ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
              {doing ? (gpsCapturing ? "Getting location…" : "Checking in…") : "Check In"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Summary bar ───────────────────────────────────────────────────────────────

function SummaryBar({ summary }: { summary: NonNullable<ReturnType<typeof useAttendance>["summary"]> }) {
  const stats = [
    { label: "Present",      value: summary.present,          color: "text-emerald-600" },
    { label: "Absent",       value: summary.absent,           color: "text-red-600"     },
    { label: "Half Day",     value: summary.halfDay,          color: "text-amber-600"   },
    { label: "On Leave",     value: summary.onLeave,          color: "text-violet-600"  },
    { label: "Working days", value: summary.totalWorkingDays, color: "text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-border bg-background px-4 py-3 text-center">
          <p className={cn("text-2xl font-bold tabular-nums", s.color)}>{s.value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── History row (expandable) ──────────────────────────────────────────────────

function HistoryRow({ record }: { record: AttendanceRecord }) {
  const [expanded, setExpanded] = React.useState(false);
  const ModeIcon = MODE_ICON[record.workMode] ?? Briefcase;

  const hasLocation = record.locationHistory?.length > 0;
  const hasDevice   = record.deviceHistory?.length > 0;

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 overflow-hidden">
      {/* Main row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        {/* Date */}
        <div className="w-24 shrink-0">
          <p className="text-sm font-semibold">{fmtDate(record.workDate)}</p>
        </div>

        {/* Status badge */}
        <span className={cn(
          "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
          STATUS_STYLE[record.status] ?? STATUS_STYLE.ABSENT
        )}>
          {STATUS_LABEL[record.status] ?? record.status}
        </span>

        {/* Times */}
        <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
          <span>In: <span className="font-medium text-foreground">{fmt(record.checkInTime)}</span></span>
          <span>Out: <span className="font-medium text-foreground">{fmt(record.checkOutTime)}</span></span>
          {record.durationMinutes != null && (
            <span className="text-xs">{fmtDuration(record.durationMinutes)}</span>
          )}
        </div>

        {/* Icons row */}
        <div className="flex items-center gap-2 shrink-0">
          {hasLocation && (
            <Navigation className={cn(
              "size-3.5",
              record.locationHistory[0]?.locationStatus === "CAPTURED"
                ? "text-emerald-500"
                : "text-muted-foreground/40"
            )} />
          )}
          {hasDevice && <Monitor className="size-3.5 text-blue-500" />}
          <ModeIcon className="size-4 text-muted-foreground" title={record.workMode} />
          <ChevronDown className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )} />
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border/60 px-4 py-3 space-y-3">
          {/* Location history */}
          {hasLocation && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <Navigation className="size-3" />
                Location History
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {record.locationHistory.map((loc) => (
                  <LocationCard key={loc.id} loc={loc} />
                ))}
              </div>
            </div>
          )}

          {/* Device history */}
          {hasDevice && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <Monitor className="size-3" />
                Device History
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {record.deviceHistory.map((dev) => (
                  <DeviceCard key={dev.id} dev={dev} />
                ))}
              </div>
            </div>
          )}

          {!hasLocation && !hasDevice && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No location or device data recorded for this entry.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function AttendanceView() {
  const now = new Date();
  const [selYear,  setSelYear]  = React.useState(now.getFullYear());
  const [selMonth, setSelMonth] = React.useState(now.getMonth() + 1);

  const { history, summary, loading, fetchHistory } = useAttendance();

  React.useEffect(() => {
    fetchHistory(selYear, selMonth);
  }, [fetchHistory, selYear, selMonth]);

  const prevMonth = () => {
    if (selMonth === 1) { setSelYear((y) => y - 1); setSelMonth(12); }
    else setSelMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (selMonth === 12) { setSelYear((y) => y + 1); setSelMonth(1); }
    else setSelMonth((m) => m + 1);
  };
  const isCurrentMonth = selYear === now.getFullYear() && selMonth === now.getMonth() + 1;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
          <Clock className="size-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Attendance</h1>
          <p className="text-sm text-muted-foreground">Track your daily check-in, location, and device verification</p>
        </div>
      </div>

      {/* Today panel */}
      <TodayPanel />

      {/* History section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Monthly History</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-[100px] text-center text-sm font-medium">
              {MONTH_NAMES[selMonth - 1]} {selYear}
            </span>
            <button
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {summary && <div className="mb-4"><SummaryBar summary={summary} /></div>}

        {/* Legend */}
        <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Navigation className="size-3 text-emerald-500" /> GPS saved
          </span>
          <span className="flex items-center gap-1">
            <NavigationOff className="size-3 text-muted-foreground/40" /> No location
          </span>
          <span className="flex items-center gap-1">
            <Monitor className="size-3 text-blue-500" /> Device verified
          </span>
          <span className="flex items-center gap-1">
            <ChevronDown className="size-3" /> Click row to expand
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin mr-2" />
            Loading…
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
            <CalendarDays className="size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No records for {MONTH_NAMES[selMonth - 1]} {selYear}</p>
            <p className="text-xs text-muted-foreground">Start checking in to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((rec) => (
              <HistoryRow key={rec.id} record={rec} />
            ))}
          </div>
        )}
      </div>

      {/* Corrections */}
      <AttendanceCorrections records={history} />
    </div>
  );
}
