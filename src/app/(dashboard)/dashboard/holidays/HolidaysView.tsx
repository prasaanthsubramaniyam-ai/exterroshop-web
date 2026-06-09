"use client";

import * as React from "react";
import {
  CalendarDays, Plus, Trash2, X, Loader2, AlertCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useHolidays } from "@/hooks/useHolidays";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const CAN_MANAGE = new Set(["HR", "SUPER_ADMIN"]);

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Create modal ──────────────────────────────────────────────────────────────

interface CreateProps {
  onClose: () => void;
  onCreate: (p: { name: string; date: string; optional: boolean }) => Promise<unknown>;
}

function CreateModal({ onClose, onCreate }: CreateProps) {
  const [name,     setName]     = React.useState("");
  const [date,     setDate]     = React.useState("");
  const [optional, setOptional] = React.useState(false);
  const [saving,   setSaving]   = React.useState(false);
  const [error,    setError]    = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) { setError("Name and date are required"); return; }
    setSaving(true);
    try {
      await onCreate({ name: name.trim(), date, optional });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">Add Holiday</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" /> {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Holiday name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              placeholder="e.g. Pongal"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={optional}
              onChange={(e) => setOptional(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm">Optional / restricted holiday</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving && <Loader2 className="size-4 animate-spin" />} Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Day-of-week header ─────────────────────────────────────────────────────────

const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function MiniCalendar({ year, month, holidayDates }: {
  year: number; month: number; holidayDates: Set<string>;
}) {
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  // Shift so Monday = 0
  const offset = (firstDay + 6) % 7;
  const cells: (number | null)[] = [...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="mt-3 grid grid-cols-7 gap-0.5 text-center text-[10px]">
      {DOW.map((d) => (
        <div key={d} className="py-0.5 font-semibold text-muted-foreground">{d}</div>
      ))}
      {cells.map((day, idx) => {
        if (!day) return <div key={idx} />;
        const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const isHoliday = holidayDates.has(iso);
        const isWeekend = ((idx % 7) === 5) || ((idx % 7) === 6);
        return (
          <div key={idx} className={cn(
            "rounded py-0.5 font-medium",
            isHoliday  && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
            !isHoliday && isWeekend && "text-muted-foreground/50",
            !isHoliday && !isWeekend && "text-foreground"
          )}>
            {day}
          </div>
        );
      })}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function HolidaysView() {
  const { user }                        = useAuth();
  const [year, setYear]                 = React.useState(new Date().getFullYear());
  const { holidays, loading, error, create, remove } = useHolidays(year);
  const [showModal, setShowModal]       = React.useState(false);
  const [deleting,  setDeleting]        = React.useState<number | null>(null);

  const canManage = CAN_MANAGE.has(user?.role ?? "");

  const holidayDates = React.useMemo(
    () => new Set(holidays.map((h) => h.date.slice(0, 10))),
    [holidays]
  );

  // Group by month
  const byMonth = React.useMemo(() => {
    const map = new Map<number, typeof holidays>();
    holidays.forEach((h) => {
      const m = parseInt(h.date.slice(5, 7));
      if (!map.has(m)) map.set(m, []);
      map.get(m)!.push(h);
    });
    return map;
  }, [holidays]);

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this holiday?")) return;
    setDeleting(id);
    try { await remove(id); } finally { setDeleting(null); }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950">
            <CalendarDays className="size-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Holiday Calendar</h1>
            <p className="text-xs text-muted-foreground">
              {holidays.length} holidays in {year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Year navigator */}
          <div className="flex items-center gap-1 rounded-xl border border-border px-2 py-1">
            <button type="button" onClick={() => setYear((y) => y - 1)}
              className="rounded p-1 hover:bg-muted"><ChevronLeft className="size-4" /></button>
            <span className="w-12 text-center text-sm font-semibold tabular-nums">{year}</span>
            <button type="button" onClick={() => setYear((y) => y + 1)}
              className="rounded p-1 hover:bg-muted"><ChevronRight className="size-4" /></button>
          </div>

          {canManage && (
            <button type="button" onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Plus className="size-4" /> Add
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && holidays.length === 0 && (
        <div className="rounded-2xl border border-border bg-background py-14 text-center">
          <CalendarDays className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">No holidays added for {year}</p>
          {canManage && <p className="mt-1 text-xs text-muted-foreground">Add company and public holidays for the year</p>}
        </div>
      )}

      {/* Month grid */}
      {!loading && holidays.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
            const monthHolidays = byMonth.get(month);
            if (!monthHolidays?.length) return null;
            return (
              <div key={month} className="rounded-2xl border border-border bg-background p-4">
                <p className="text-sm font-semibold">{MONTH_NAMES[month - 1]}</p>
                <MiniCalendar year={year} month={month} holidayDates={holidayDates} />
                <ul className="mt-3 space-y-1.5">
                  {monthHolidays.map((h) => (
                    <li key={h.id} className="flex items-center gap-2">
                      <span className={cn(
                        "size-2 shrink-0 rounded-full",
                        h.optional ? "bg-amber-400" : "bg-red-500"
                      )} />
                      <span className="min-w-0 flex-1 text-xs">
                        <span className="font-medium">{h.date.slice(8, 10)} {MONTH_NAMES[month - 1].slice(0, 3)}</span>
                        {" — "}{h.name}
                        {h.optional && (
                          <span className="ml-1 rounded-full bg-amber-100 px-1.5 text-[9px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            OPT
                          </span>
                        )}
                      </span>
                      {canManage && (
                        <button type="button" onClick={() => handleDelete(h.id)}
                          disabled={deleting === h.id}
                          className="shrink-0 text-muted-foreground hover:text-destructive">
                          {deleting === h.id
                            ? <Loader2 className="size-3 animate-spin" />
                            : <Trash2 className="size-3" />}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CreateModal onClose={() => setShowModal(false)} onCreate={create} />
      )}
    </div>
  );
}
