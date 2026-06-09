"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, BookOpen, Building2, Users, ArrowRight, Clock } from "lucide-react";
import { bookingService } from "@/services/wellness.service";
import { StatusBadge } from "@/components/wellness/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import type { WellnessBooking } from "@/types/wellness";
import { format } from "date-fns";

export default function WellnessDashboard() {
  const { user } = useAuth();
  const role = (user as { role?: string } | null)?.role;
  const isAdmin = role === "SUPER_ADMIN";
  const isStaff = role === "STAFF";

  const [bookings, setBookings] = React.useState<WellnessBooking[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetch = isAdmin
      ? bookingService.all()
      : isStaff
      ? bookingService.staffBookings()
      : bookingService.myBookings();

    fetch
      .then(setBookings)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [isAdmin, isStaff]);

  const pending = bookings.filter((b) => b.status === "PENDING").length;
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
  const today = format(new Date(), "yyyy-MM-dd");
  const todayBookings = bookings.filter((b) => b.bookingDate === today);
  const recent = bookings.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isAdmin ? "Beauty Services Admin Dashboard" : isStaff ? "Staff Dashboard" : "Your beauty services overview"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Bookings" value={bookings.length} color="bg-blue-50 text-blue-600" />
        <StatCard icon={Clock} label="Pending" value={pending} color="bg-yellow-50 text-yellow-600" />
        <StatCard icon={CalendarDays} label="Confirmed" value={confirmed} color="bg-green-50 text-green-600" />
        <StatCard icon={CalendarDays} label="Today" value={todayBookings.length} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!isAdmin && !isStaff && (
          <QuickLink href="/wellness/book" icon={CalendarDays} label="Book Appointment" desc="Schedule your beauty service session" />
        )}
        {isStaff ? (
          <QuickLink href="/wellness/appointments" icon={BookOpen} label="My Appointments" desc="Accept, complete or reject your bookings" />
        ) : (
          <QuickLink href="/wellness/bookings/my" icon={BookOpen} label="My Bookings" desc="View your appointment history" />
        )}
        {(isAdmin || isStaff) && (
          <QuickLink href="/wellness/calendar" icon={CalendarDays} label="Calendar View" desc="See the full schedule" />
        )}
        {isAdmin && (
          <>
            <QuickLink href="/wellness/centers" icon={Building2} label="Manage Centers" desc="Men's & Women's beauty service centers" />
            <QuickLink href="/dashboard/users" icon={Users} label="Manage Users" desc="Add and manage employees" />
          </>
        )}
      </div>

      {/* Recent bookings */}
      {!loading && recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">
              {isStaff ? "Recent Appointments" : isAdmin ? "Recent Bookings" : "Recent Bookings"}
            </h2>
            <Link
              href={isStaff ? "/wellness/appointments" : isAdmin ? "/wellness/bookings" : "/wellness/bookings/my"}
              className="text-sm text-primary flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    {isStaff || isAdmin ? "Customer" : "Staff"}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Service</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {isStaff || isAdmin ? b.employeeName : b.staffName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{b.serviceName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.bookingDate}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.startTime}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className={`inline-flex size-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="size-5" />
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label, desc }: {
  href: string; icon: React.ElementType; label: string; desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-primary/5 transition-colors"
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </Link>
  );
}
