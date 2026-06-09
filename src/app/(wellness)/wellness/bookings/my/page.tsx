"use client";

import * as React from "react";
import Link from "next/link";
import { bookingService } from "@/services/wellness.service";
import { StatusBadge } from "@/components/wellness/StatusBadge";
import type { WellnessBooking } from "@/types/wellness";

export default function MyBookingsPage() {
  const [bookings, setBookings] = React.useState<WellnessBooking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cancelling, setCancelling] = React.useState<number | null>(null);

  const load = () => {
    setLoading(true);
    bookingService
      .myBookings()
      .then(setBookings)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  React.useEffect(() => { load(); }, []);

  const cancel = async (id: number) => {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(id);
    try {
      await bookingService.cancel(id);
      load();
    } catch {
      alert("Failed to cancel booking");
    } finally {
      setCancelling(null);
    }
  };

  const upcoming = bookings.filter((b) =>
    b.status === "PENDING" || b.status === "CONFIRMED"
  );
  const past = bookings.filter((b) =>
    b.status === "COMPLETED" || b.status === "CANCELLED" || b.status === "REJECTED" || b.status === "NO_SHOW"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">Your beauty services appointment history</p>
        </div>
        <Link
          href="/wellness/book"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          Book Appointment
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="font-medium text-muted-foreground">No bookings yet</p>
          <Link href="/wellness/book" className="mt-3 text-sm text-primary hover:underline">
            Book your first appointment
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <Section title="Upcoming">
              {upcoming.map((b) => (
                <BookingCard key={b.id} booking={b} onCancel={cancel} cancelling={cancelling} />
              ))}
            </Section>
          )}
          {past.length > 0 && (
            <Section title="Past">
              {past.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function BookingCard({
  booking: b,
  onCancel,
  cancelling,
}: {
  booking: WellnessBooking;
  onCancel?: (id: number) => void;
  cancelling?: number | null;
}) {
  const canCancel = b.status === "PENDING" || b.status === "CONFIRMED";
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{b.serviceName}</p>
            <StatusBadge status={b.status} />
          </div>
          <p className="text-sm text-muted-foreground">{b.centerName} · with {b.staffName}</p>
          <p className="text-sm text-muted-foreground">
            {b.bookingDate} · {b.startTime} – {b.endTime}
          </p>
          {b.rejectionReason && (
            <p className="text-xs text-red-600 mt-1">Reason: {b.rejectionReason}</p>
          )}
          {b.notes && (
            <p className="text-xs text-muted-foreground mt-1">Note: {b.notes}</p>
          )}
        </div>
        {onCancel && canCancel && (
          <button
            onClick={() => onCancel(b.id)}
            disabled={cancelling === b.id}
            className="shrink-0 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
          >
            {cancelling === b.id ? "Cancelling…" : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
}
