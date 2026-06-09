"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Building2,
  Scissors,
  UserCircle2,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  /** Visible only to STAFF (admin uses /wellness/bookings instead) */
  staffOnly?: boolean;
  /** Hide from STAFF (it makes no sense for them) */
  hideFromStaff?: boolean;
}

const NAV: NavItem[] = [
  { label: "Dashboard",        href: "/wellness/dashboard",     icon: LayoutDashboard },
  { label: "My Appointments",  href: "/wellness/appointments",  icon: BookOpen,     staffOnly:  true },
  { label: "My Bookings",      href: "/wellness/bookings/my",   icon: BookOpen,     hideFromStaff: true },
  { label: "Book Appointment", href: "/wellness/book",          icon: CalendarDays, hideFromStaff: true },
  { label: "Calendar",         href: "/wellness/calendar",      icon: CalendarDays, adminOnly: true },
  { label: "All Bookings",     href: "/wellness/bookings",      icon: BookOpen,     adminOnly: true },
  { label: "Centers",          href: "/wellness/centers",       icon: Building2,    adminOnly: true },
  { label: "Services",         href: "/wellness/services",      icon: Scissors,     adminOnly: true },
  { label: "Staff",            href: "/wellness/staff",         icon: UserCircle2,  adminOnly: true },
];

export function WellnessSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = (user as { role?: string } | null)?.role;
  const isAdmin = role === "SUPER_ADMIN";
  const isStaff = role === "STAFF";

  const visible = NAV.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.staffOnly && !isStaff) return false;
    if (item.hideFromStaff && isStaff) return false;
    return true;
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-background lg:sticky lg:top-0 lg:h-screen lg:translate-x-0">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
          <Scissors className="size-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Beauty Services</p>
          <p className="text-xs text-muted-foreground">Employee Grooming</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        <ul className="space-y-0.5">
          {visible.map((item) => {
            // A more-specific nav item (e.g. /wellness/bookings/my) should win over
            // its parent prefix (/wellness/bookings). Only activate via startsWith
            // when no other visible item is a closer match for the current path.
            const active =
              pathname === item.href ||
              (pathname.startsWith(item.href + "/") &&
                !visible.some(
                  (other) =>
                    other.href !== item.href &&
                    (pathname === other.href || pathname.startsWith(other.href + "/"))
                ));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-primary"
                      : "text-foreground hover:bg-surface"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 shrink-0 transition-colors",
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4 space-y-0.5">
        <Link
          href="/dashboard"
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface"
        >
          <ArrowLeft className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span>Back to Marketplace</span>
        </Link>
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-destructive/5 hover:text-destructive"
        >
          <LogOut className="size-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
