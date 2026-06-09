"use client";

import * as React from "react";
import { Calendar, Check, X, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { bookingService } from "@/services/wellness.service";
import { StatusBadge } from "@/components/wellness/StatusBadge";
import type { WellnessBooking, BookingStatus } from "@/types/wellness";

const TABS = [
  { key: "UPCOMING", label: "Upcoming" },
  { key: "PENDING",  label: "Pending"  },
  { key: "PAST",     label: "Past"     },
  { key: "ALL",      label: "All"      },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default function StaffAppointmentsPage() {
  const [bookings, setBookings] = React.useState<WellnessBooking[]>([]);
  const [loading, setLoading]   = React.useState(true);
  const [tab, setTab]           = React.useState<Tab>("UPCOMING");
  const [updating, setUpdating] = React.useState<number | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    bookingService.staffBookings()
      .then((rows) => setBookings(rows ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const onChange = async (id: number, status: BookingStatus, rejectionReason?: string) => {
    setUpdating(id);
    try {
      await bookingService.updateStatus(id, { status, rejectionReason });
      load();
    } catch {
      alert("Could not update appointment");
    } finally {
      setUpdating(null);
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const filtered = bookings.filter((b) => {
    if (tab === "PENDING")  return b.status === "PENDING";
    if (tab === "UPCOMING") return (b.status === "PENDING" || b.status === "CONFIRMED") && b.bookingDate >= today;
    if (tab === "PAST")     return ["COMPLETED", "CANCELLED", "REJECTED", "NO_SHOW"].includes(b.status) || b.bookingDate < today;
    return true;
  });

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedToday = bookings.filter((b) => b.status === "CONFIRMED" && b.bookingDate === today).length;
  const completed = bookings.filter((b) => b.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground text-sm mt-1">Bookings assigned to you — accept, complete, or reject</p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatPill icon={AlertCircle} label="Pending"        value={pendingCount}    color="bg-yellow-50 text-yellow-700" />
        <StatPill icon={Clock}       label="Today (confirmed)" value={confirmedToday} color="bg-blue-50 text-blue-700"   />
        <StatPill icon={CheckCircle2} label="Completed"     value={completed}       color="bg-green-50 text-green-700" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Calendar className="size-10 text-muted-foreground mb-3" />
          <p className="font-medium text-muted-foreground">No appointments here</p>
          <p className="text-xs text-muted-foreground mt-1">
            {tab === "PENDING" ? "You have no new requests waiting." : "Nothing in this list yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <AppointmentCard key={b.id} booking={b} updating={updating === b.id} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className={`inline-flex size-9 items-center justify-center rounded-lg ${color}`}>
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({
  booking: b, updating, onChange,
}: {
  booking: WellnessBooking;
  updating: boolean;
  onChange: (id: number, status: BookingStatus, reason?: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">{b.employeeName}</p>
            <StatusBadge status={b.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {b.serviceName} · {b.centerName}
          </p>
          <p className="text-sm text-muted-foreground">
            {b.bookingDate} · {b.startTime} – {b.endTime}
          </p>
          {b.notes && (
            <p className="text-xs text-muted-foreground mt-2 italic">Note from customer: {b.notes}</p>
          )}
          {b.rejectionReason && (
            <p className="text-xs text-red-600 mt-1">Rejected: {b.rejectionReason}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0">
          {b.status === "PENDING" && (
            <>
              <button
                disabled={updating}
                onClick={() => onChange(b.id, "CONFIRMED")}
                className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Check className="size-3.5" /> Accept
              </button>
              <button
                disabled={updating}
                onClick={() => {
                  const reason = prompt("Why are you rejecting this? (optional)") ?? undefined;
                  onChange(b.id, "REJECTED", reason);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
              >
                <X className="size-3.5" /> Reject
              </button>
            </>
          )}
          {b.status === "CONFIRMED" && (
            <>
              <button
                disabled={updating}
                onClick={() => onChange(b.id, "COMPLETED")}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="size-3.5" /> Mark Completed
              </button>
              <button
                disabled={updating}
                onClick={() => onChange(b.id, "NO_SHOW")}
                className="inline-flex items-center gap-1 rounded-lg border border-orange-400 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                No Show
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
