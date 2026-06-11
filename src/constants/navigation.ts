/**
 * EMS Navigation Architecture — flat primary nav.
 *
 * The sidebar shows ONLY top-level modules; secondary navigation lives
 * inside each page (SectionTabs / hub cards). Every legacy route keeps
 * working — it is simply reached via in-page tabs instead of the sidebar.
 */

import {
  LayoutDashboard,
  Clock,
  CalendarOff,
  CheckSquare,
  Users,
  BarChart3,
  ShoppingBag,
  Scissors,
  UsersRound,
  SlidersHorizontal,
  UserCircle,
  Settings,
  Fingerprint,
  MoreHorizontal,
  Banknote,
  Monitor,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmsNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Additional path prefixes that should highlight this item. */
  matchPrefixes?: string[];
  /** Show a live badge: "count" = number pill, "dot" = presence dot */
  badge?: "count" | "dot";
  /** Roles that can see this item. undefined = visible to all authenticated users */
  roles?: UserRole[];
}

export interface EmsNavSection {
  id: string;
  /** Empty label = render items without a section header. */
  label: string;
  items: EmsNavItem[];
}

export interface BottomNavItem {
  label: string;
  href: string;
  icon: LucideIcon | null;
  /** Renders as a raised circular FAB in the center */
  isFab?: boolean;
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

/** Tailwind ring colour for each role — used on avatar in sidebar footer */
export const ROLE_RING: Record<UserRole, string> = {
  SUPER_ADMIN:   "ring-purple-500",
  IT_ADMIN:      "ring-indigo-500",
  FINANCE:       "ring-amber-500",
  HR:            "ring-teal-500",
  MANAGER:       "ring-blue-500",
  STAFF:         "ring-sky-500",
  EMPLOYEE_USER: "ring-gray-300 dark:ring-gray-600",
};

/** Subtle badge background for role chips */
export const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  SUPER_ADMIN:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  IT_ADMIN:      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  FINANCE:       "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  HR:            "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  MANAGER:       "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  STAFF:         "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  EMPLOYEE_USER: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

// ── Sidebar — single flat section ─────────────────────────────────────────────

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
        label: "Attendance",
        href: "/dashboard/attendance",
        icon: Clock,
        matchPrefixes: ["/dashboard/attendance"],
      },
      {
        // In-page tabs: My Leave · Holidays
        label: "Leave",
        href: "/dashboard/leave",
        icon: CalendarOff,
        matchPrefixes: ["/dashboard/leave", "/dashboard/holidays"],
      },
      {
        label: "Approvals",
        href: "/dashboard/approvals",
        icon: CheckSquare,
        matchPrefixes: ["/dashboard/approvals"],
        badge: "count",
        roles: ["MANAGER", "HR", "SUPER_ADMIN"],
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
        // Hub page with module cards (Users, Departments, Designations, Teams,
        // Roles & Permissions, Onboarding, Reporting Structure)
        label: "Employee Management",
        href: "/dashboard/admin",
        icon: UsersRound,
        matchPrefixes: ["/dashboard/admin", "/dashboard/users"],
        roles: ["HR", "SUPER_ADMIN"],
      },
      {
        // Hub page with module cards (Sports, Recognition, Polls,
        // Celebrations, Surveys, Challenges, CSR, Learning, Wellness,
        // Ideas, Clubs). Sports keeps its own /dashboard/sports route.
        label: "Engagement",
        href: "/dashboard/engagement",
        icon: Sparkles,
        matchPrefixes: ["/dashboard/engagement", "/dashboard/sports"],
      },
      {
        label: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
        matchPrefixes: ["/dashboard/reports"],
        roles: ["MANAGER", "HR", "SUPER_ADMIN"],
      },
      {
        // In-page tabs: Expenses · Payroll (payroll tab gated to FINANCE/SA)
        label: "Finance",
        href: "/dashboard/finance/expenses",
        icon: Banknote,
        matchPrefixes: ["/dashboard/finance"],
        roles: ["FINANCE", "SUPER_ADMIN", "MANAGER", "HR"],
      },
      {
        // In-page tabs: Assets · Help Desk
        label: "IT",
        href: "/dashboard/it/assets",
        icon: Monitor,
        matchPrefixes: ["/dashboard/it"],
        roles: ["IT_ADMIN", "SUPER_ADMIN"],
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
        label: "Beauty Services",
        href: "/wellness/dashboard",
        icon: Scissors,
        matchPrefixes: ["/wellness"],
      },
      {
        // In-page tabs: Content · Theme Editor · Audit Logs
        label: "CMS",
        href: "/dashboard/admin/cms",
        icon: SlidersHorizontal,
        matchPrefixes: [
          "/dashboard/admin/cms",
          "/dashboard/admin/theme",
          "/dashboard/admin/audit-logs",
        ],
        roles: ["SUPER_ADMIN"],
      },
      {
        // Settings page links to: Preferences · Security · Payslips · Profile
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        matchPrefixes: [
          "/dashboard/settings",
          "/dashboard/profile",
          "/dashboard/payslips",
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

// ── Bottom nav (mobile) ───────────────────────────────────────────────────────

export const BOTTOM_NAV_EMS: BottomNavItem[] = [
  { label: "Home",       href: "/dashboard",            icon: LayoutDashboard },
  { label: "Attendance", href: "/dashboard/attendance", icon: Clock },
  { label: "Check In",   href: "/dashboard/attendance", icon: Fingerprint, isFab: true },
  { label: "Leave",      href: "/dashboard/leave",      icon: CalendarOff },
  { label: "More",       href: "/dashboard/profile",    icon: MoreHorizontal },
];
