/**
 * EMS Navigation Architecture — flat primary nav, max 9 items.
 *
 * Design principles (from architecture review, June 2026):
 *  - ≤9 sidebar items per role — research shows >10 causes discovery abandonment
 *  - "My Work" consolidates Attendance + Leave + Approvals + Payslips + Corrections
 *  - "Wellness" consolidates Beauty Services booking + Wellness programs
 *  - Finance, IT, CMS are inside Admin hub — not primary nav items
 *  - Approvals badge surfaces on My Work icon, not a separate nav entry
 *  - Bottom mobile nav: Home | My Work | [FAB] | Engagement | ≡ Menu (drawer)
 */

import {
  LayoutDashboard,
  Briefcase,
  Users,
  Sparkles,
  ShoppingBag,
  Heart,
  BarChart3,
  ShieldCheck,
  Settings,
  Fingerprint,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmsNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  matchPrefixes?: string[];
  badge?: "count" | "dot";
  roles?: UserRole[];
}

export interface EmsNavSection {
  id: string;
  label: string;
  items: EmsNavItem[];
}

export interface BottomNavItem {
  label: string;
  href: string;
  icon: LucideIcon | null;
  isFab?: boolean;
  isMenu?: boolean;
}

// ── Role metadata ─────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN:   "Super Admin",
  IT_ADMIN:      "IT Admin",
  FINANCE:       "Finance",
  HR:            "HR",
  MANAGER:       "Manager",
  STAFF:         "Staff",
  EMPLOYEE_USER: "Employee",
};

export const ROLE_RING: Record<UserRole, string> = {
  SUPER_ADMIN:   "ring-purple-500",
  IT_ADMIN:      "ring-indigo-500",
  FINANCE:       "ring-amber-500",
  HR:            "ring-teal-500",
  MANAGER:       "ring-blue-500",
  STAFF:         "ring-sky-500",
  EMPLOYEE_USER: "ring-gray-300 dark:ring-gray-600",
};

export const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  SUPER_ADMIN:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  IT_ADMIN:      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  FINANCE:       "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  HR:            "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  MANAGER:       "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  STAFF:         "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  EMPLOYEE_USER: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

// ── Primary sidebar nav — 9 items max ────────────────────────────────────────

export const EMS_NAV_SECTIONS: EmsNavSection[] = [
  {
    id: "main",
    label: "",
    items: [
      {
        label: "Home",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        // Consolidates: Attendance · Leave · Approvals · Corrections · Payslips · Holidays
        label: "My Work",
        href: "/dashboard/my-work",
        icon: Briefcase,
        matchPrefixes: [
          "/dashboard/my-work",
          "/dashboard/attendance",
          "/dashboard/leave",
          "/dashboard/approvals",
          "/dashboard/holidays",
          "/dashboard/payslips",
        ],
        badge: "count",
      },
      {
        // In-page tabs: Team · Directory · Org Chart
        label: "People",
        href: "/dashboard/team",
        icon: Users,
        matchPrefixes: [
          "/dashboard/team",
          "/dashboard/directory",
          "/dashboard/org-chart",
        ],
      },
      {
        // Hub: Sports, Recognition, Polls, Celebrations, Surveys,
        // Challenges, CSR, Learning, Wellness Programs, Ideas, Clubs
        label: "Engagement",
        href: "/dashboard/engagement",
        icon: Sparkles,
        matchPrefixes: ["/dashboard/engagement", "/dashboard/sports"],
      },
      {
        // In-page tabs: Browse · Favorites · My Items · Sell · Chats · Calls
        label: "Marketplace",
        href: "/dashboard/products",
        icon: ShoppingBag,
        matchPrefixes: [
          "/dashboard/products",
          "/dashboard/favorites",
          "/dashboard/my-products",
          "/dashboard/chat",
          "/dashboard/call-requests",
        ],
        badge: "dot",
      },
      {
        // Covers Beauty Services booking (/wellness/*) + Wellness programs
        label: "Wellness",
        href: "/wellness/dashboard",
        icon: Heart,
        matchPrefixes: ["/wellness"],
      },
      {
        // Employee: own data only. Manager+: team/org data.
        label: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
        matchPrefixes: ["/dashboard/reports"],
        roles: ["MANAGER", "HR", "FINANCE", "SUPER_ADMIN"],
      },
      {
        // Hub: User Mgmt, Onboard, Departments, Designations, Teams,
        //      Roles & Permissions, Reporting Structure, CMS, Finance, IT
        label: "Admin",
        href: "/dashboard/admin",
        icon: ShieldCheck,
        matchPrefixes: [
          "/dashboard/admin",
          "/dashboard/users",
          "/dashboard/finance",
          "/dashboard/it",
        ],
        roles: ["HR", "FINANCE", "IT_ADMIN", "SUPER_ADMIN"],
      },
      {
        // In-page tabs: Profile · Security · Notifications · Preferences
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        matchPrefixes: [
          "/dashboard/settings",
          "/dashboard/profile",
        ],
      },
    ],
  },
];

// ── In-page tab definitions (single source of truth for SectionTabs) ──────────

export interface SectionTabDef {
  label: string;
  href: string;
  roles?: UserRole[];
}

export const PEOPLE_TABS: SectionTabDef[] = [
  { label: "Team",      href: "/dashboard/team" },
  { label: "Directory", href: "/dashboard/directory" },
  { label: "Org Chart", href: "/dashboard/org-chart" },
];

export const MY_WORK_TABS: SectionTabDef[] = [
  { label: "Attendance", href: "/dashboard/attendance" },
  { label: "Leave",      href: "/dashboard/leave" },
  { label: "Holidays",   href: "/dashboard/holidays" },
  { label: "Payslips",   href: "/dashboard/payslips" },
  { label: "Approvals",  href: "/dashboard/approvals", roles: ["MANAGER", "HR", "SUPER_ADMIN"] },
];

export const LEAVE_TABS: SectionTabDef[] = [
  { label: "My Leave", href: "/dashboard/leave" },
  { label: "Holidays", href: "/dashboard/holidays" },
];

export const MARKETPLACE_TABS: SectionTabDef[] = [
  { label: "Browse",        href: "/dashboard/products" },
  { label: "Favorites",     href: "/dashboard/favorites" },
  { label: "My Items",      href: "/dashboard/my-products" },
  { label: "Sell Item",     href: "/dashboard/products/new" },
  { label: "Chats",         href: "/dashboard/chat" },
  { label: "Call Requests", href: "/dashboard/call-requests" },
];

export const FINANCE_TABS: SectionTabDef[] = [
  { label: "Expenses", href: "/dashboard/finance/expenses" },
  { label: "Payroll",  href: "/dashboard/finance/payroll", roles: ["FINANCE", "SUPER_ADMIN"] },
];

export const IT_TABS: SectionTabDef[] = [
  { label: "Assets",    href: "/dashboard/it/assets" },
  { label: "Help Desk", href: "/dashboard/it/tickets" },
];

export const CMS_TABS: SectionTabDef[] = [
  { label: "Content",      href: "/dashboard/admin/cms" },
  { label: "Theme Editor", href: "/dashboard/admin/theme" },
  { label: "Audit Logs",   href: "/dashboard/admin/audit-logs" },
];

export const SPORTS_EMPLOYEE_TABS: SectionTabDef[] = [
  { label: "Upcoming Events",  href: "/dashboard/sports" },
  { label: "My Registrations", href: "/dashboard/sports/my-registrations" },
  { label: "Results",          href: "/dashboard/sports/results" },
  { label: "Gallery",          href: "/dashboard/sports/gallery" },
];

export const SPORTS_HR_TABS: SectionTabDef[] = [
  { label: "Dashboard",    href: "/dashboard/sports/hr" },
  { label: "Events",       href: "/dashboard/sports/hr/events" },
  { label: "Participants", href: "/dashboard/sports/hr/participants" },
  { label: "Teams",        href: "/dashboard/sports/hr/teams" },
  { label: "Results",      href: "/dashboard/sports/hr/results" },
  { label: "Gallery",      href: "/dashboard/sports/hr/gallery" },
];

// ── Bottom nav (mobile) — 5 slots ─────────────────────────────────────────────
// Slot 5 is "Menu" — opens MobileNavDrawer, not a page link

export const BOTTOM_NAV_EMS: BottomNavItem[] = [
  { label: "Home",       href: "/dashboard",           icon: LayoutDashboard },
  { label: "My Work",    href: "/dashboard/my-work",   icon: Briefcase },
  { label: "Check In",   href: "/dashboard/attendance", icon: Fingerprint,   isFab: true },
  { label: "Engage",     href: "/dashboard/engagement", icon: Sparkles },
  { label: "Menu",       href: "",                      icon: MoreHorizontal, isMenu: true },
];
