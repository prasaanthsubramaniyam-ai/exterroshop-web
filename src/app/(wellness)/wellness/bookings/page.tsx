"use client";

import * as React from "react";
import { bookingService } from "@/services/wellness.service";
import { StatusBadge } from "@/components/wellness/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import type { WellnessBooking, BookingStatus } from "@/types/wellness";

const STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "REJECTED", "CANCELLED", "NO_SHOW"];

export default function AllBookingsPage() {
  const { user } = useAuth();
  const isAdmin = (user as { role?: string } | null)?.role === "SUPER_ADMIN";

  const [bookings, setBookings] = React.useState<WellnessBooking[]>([]);
  const [filter, setFilter] = React.useState<BookingStatus | "ALL">("ALL");
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState<number | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    bookingService
      .all(filter !== "ALL" ? { status: filter } : undefined)
      .then(setBookings)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [filter]);

  React.useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: number, status: BookingStatus, rejectionReason?: string) => {
    setUpdating(id);
    try {
      await bookingService.updateStatus(id, { status, rejectionReason });
      load();
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = bookings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Bookings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage all beauty services appointments</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(["ALL", ...STATUSES] as (BookingStatus | "ALL")[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === s
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No bookings found</p>
          <p className="text-sm">Try a different filter</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Staff</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Service</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date & Time</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Center</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                {isAdmin && <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{b.employeeName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.staffName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.serviceName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{b.bookingDate}</div>
                    <div className="text-xs">{b.startTime} – {b.endTime}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{b.centerName}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      {b.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            disabled={updating === b.id}
                            onClick={() => handleStatusChange(b.id, "CONFIRMED")}
                            className="rounded px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            disabled={updating === b.id}
                            onClick={() => {
                              const reason = prompt("Rejection reason (optional):");
                              handleStatusChange(b.id, "REJECTED", reason ?? undefined);
                            }}
                            className="rounded px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {b.status === "CONFIRMED" && (
                        <div className="flex gap-2">
                          <button
                            disabled={updating === b.id}
                            onClick={() => handleStatusChange(b.id, "COMPLETED")}
                            className="rounded px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
                          >
                            Complete
                          </button>
                          <button
                            disabled={updating === b.id}
                            onClick={() => handleStatusChange(b.id, "NO_SHOW")}
                            className="rounded px-2 py-1 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors disabled:opacity-50"
                          >
                            No Show
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
