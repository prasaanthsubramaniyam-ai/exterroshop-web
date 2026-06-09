"use client";

import * as React from "react";
import { calendarService, centerService, staffService } from "@/services/wellness.service";
import { StatusBadge } from "@/components/wellness/StatusBadge";
import type { WellnessCenter, StaffProfile, CalendarDay } from "@/types/wellness";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday } from "date-fns";

type ViewMode = "month" | "week" | "day";

export default function CalendarPage() {
  const [view, setView] = React.useState<ViewMode>("month");
  const [current, setCurrent] = React.useState(new Date());
  const [centerId, setCenterId] = React.useState<number | undefined>();
  const [staffId, setStaffId] = React.useState<number | undefined>();
  const [centers, setCenters] = React.useState<WellnessCenter[]>([]);
  const [staffList, setStaffList] = React.useState<StaffProfile[]>([]);
  const [monthData, setMonthData] = React.useState<CalendarDay[]>([]);
  const [dayData, setDayData] = React.useState<CalendarDay | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState<CalendarDay | null>(null);

  React.useEffect(() => {
    centerService.getAll().then(setCenters).catch(() => undefined);
    staffService.getAll().then(setStaffList).catch(() => undefined);
  }, []);

  const load = React.useCallback(() => {
    setLoading(true);
    const params = { centerId, staffId };
    if (view === "month") {
      calendarService
        .month(current.getFullYear(), current.getMonth() + 1, params)
        .then(setMonthData)
        .catch(() => undefined)
        .finally(() => setLoading(false));
    } else if (view === "day") {
      calendarService
        .day(format(current, "yyyy-MM-dd"), params)
        .then((d) => { setDayData(d); setSelectedDay(d); })
        .catch(() => undefined)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [view, current, centerId, staffId]);

  React.useEffect(() => { load(); }, [load]);

  const nav = (dir: number) => {
    setCurrent((d) => {
      const next = new Date(d);
      if (view === "month") next.setMonth(next.getMonth() + dir);
      else if (view === "week") next.setDate(next.getDate() + dir * 7);
      else next.setDate(next.getDate() + dir);
      return next;
    });
  };

  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(current), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(current), { weekStartsOn: 1 }),
  });

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return monthData.find((d) => d.date === dateStr)?.bookings ?? [];
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground text-sm mt-1">View and manage the beauty services schedule</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-border overflow-hidden text-sm">
          {(["month", "week", "day"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 font-medium transition-colors capitalize ${view === v ? "bg-primary text-white" : "hover:bg-muted"}`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => nav(-1)} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">←</button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {view === "month" ? format(current, "MMMM yyyy") : view === "week" ? `Week of ${format(current, "MMM d")}` : format(current, "EEEE, MMM d")}
          </span>
          <button onClick={() => nav(1)} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">→</button>
        </div>

        <select
          value={centerId ?? ""}
          onChange={(e) => setCenterId(e.target.value ? Number(e.target.value) : undefined)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Centers</option>
          {centers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          value={staffId ?? ""}
          onChange={(e) => setStaffId(e.target.value ? Number(e.target.value) : undefined)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Staff</option>
          {staffList.map((s) => <option key={s.id} value={s.id}>{s.userName}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : view === "month" ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-7 bg-muted/50 text-xs font-medium text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="px-3 py-2 text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-border">
            {monthDays.map((day) => {
              const bookings = getBookingsForDate(day);
              const inMonth = isSameMonth(day, current);
              const today = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => {
                    const found = monthData.find((d) => d.date === format(day, "yyyy-MM-dd"));
                    if (found) setSelectedDay(found);
                  }}
                  className={`min-h-[80px] p-2 cursor-pointer hover:bg-primary/5 transition-colors ${!inMonth ? "bg-muted/20" : ""}`}
                >
                  <span className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-medium ${today ? "bg-primary text-white" : !inMonth ? "text-muted-foreground" : ""}`}>
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {bookings.slice(0, 2).map((b) => (
                      <div key={b.id} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary truncate">
                        {b.startTime} {b.serviceName}
                      </div>
                    ))}
                    {bookings.length > 2 && (
                      <div className="text-[10px] text-muted-foreground">+{bookings.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : view === "day" && dayData ? (
        <DayView day={dayData} />
      ) : null}

      {/* Day detail modal */}
      {selectedDay && view === "month" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedDay(null)}>
          <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{selectedDay.date}</h3>
              <button onClick={() => setSelectedDay(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            {selectedDay.bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings on this day.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {selectedDay.bookings.map((b) => (
                  <div key={b.id} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{b.startTime} – {b.endTime}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-muted-foreground">{b.serviceName} · {b.employeeName}</p>
                    <p className="text-xs text-muted-foreground">Staff: {b.staffName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DayView({ day }: { day: CalendarDay }) {
  return (
    <div className="space-y-3">
      {day.bookings.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">No bookings today</div>
      ) : (
        day.bookings.map((b) => (
          <div key={b.id} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
            <div className="text-sm font-medium text-muted-foreground w-24 shrink-0">{b.startTime}–{b.endTime}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{b.serviceName}</span>
                <StatusBadge status={b.status} />
              </div>
              <p className="text-sm text-muted-foreground">{b.employeeName} · Staff: {b.staffName}</p>
              {b.notes && <p className="text-xs text-muted-foreground mt-1">{b.notes}</p>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
