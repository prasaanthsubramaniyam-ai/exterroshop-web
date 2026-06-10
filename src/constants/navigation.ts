/**
 * EMS Navigation Architecture
 * Grouped sidebar sections + EMS-first bottom nav
 */

import {
  LayoutDashboard,
  Clock,
  CalendarOff,
  CheckSquare,
  Users,
  BookUser,
  BarChart3,
  ShoppingBag,
  Heart,
  Package,
  PlusCircle,
  MessageCircle,
  Phone,
  Scissors,
  UsersRound,
  SlidersHorizontal,
  Palette,
  UserCircle,
  Settings,
  Fingerprint,
  MoreHorizontal,
  CalendarDays,
  FileText,
  Building2,
  Briefcase,
  Network,
  Receipt,
  Banknote,
  Monitor,
  LifeBuoy,
  ShieldCheck,
  Trophy,
  Medal,
  ClipboardList,
  ImageIcon,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmsNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  matchPrefix?: string;
  /** Show a live badge: "count" = number pill, "dot" = presence dot */
  badge?: "count" | "dot";
  /** Roles that can see this item. undefined = visible to all authenticated users */
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

// ── Sidebar sections ──────────────────────────────────────────────────────────

export const EMS_NAV_SECTIONS: EmsNavSection[] = [
  {
    id: "workspace",
    label: "Workspace",
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
        matchPrefix: "/dashboard/attendance",
      },
      {
        label: "Leave",
        href: "/dashboard/leave",
        icon: CalendarOff,
        matchPrefix: "/dashboard/leave",
      },
      {
        label: "Approvals",
        href: "/dashboard/approvals",
        icon: CheckSquare,
        matchPrefix: "/dashboard/approvals",
        badge: "count",
        roles: ["MANAGER", "HR", "SUPER_ADMIN"],
      },
      {
        label: "Holidays",
        href: "/dashboard/holidays",
        icon: CalendarDays,
        matchPrefix: "/dashboard/holidays",
      },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      {
        label: "Team",
        href: "/dashboard/team",
        icon: Users,
        matchPrefix: "/dashboard/team",
      },
      {
        label: "Directory",
        href: "/dashboard/directory",
        icon: BookUser,
        matchPrefix: "/dashboard/directory",
      },
      {
        label: "Org Chart",
        href: "/dashboard/org-chart",
        icon: Network,
        matchPrefix: "/dashboard/org-chart",
      },
      {
        label: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
        matchPrefix: "/dashboard/reports",
        roles: ["MANAGER", "HR", "SUPER_ADMIN"],
      },
    ],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    items: [
      {
        label: "Browse",
        href: "/dashboard/products",
        icon: ShoppingBag,
        matchPrefix: "/dashboard/products",
      },
      {
        label: "Favorites",
        href: "/dashboard/favorites",
        icon: Heart,
      },
      {
        label: "My Marketplace",
        href: "/dashboard/my-products",
        icon: Package,
        matchPrefix: "/dashboard/my-products",
      },
      {
        label: "Sell Item",
        href: "/dashboard/products/new",
        icon: PlusCircle,
      },
      {
        label: "Chats",
        href: "/dashboard/chat",
        icon: MessageCircle,
        matchPrefix: "/dashboard/chat",
        badge: "dot",
      },
      {
        label: "Call Requests",
        href: "/dashboard/call-requests",
        icon: Phone,
        matchPrefix: "/dashboard/call-requests",
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      {
        label: "Expenses",
        href: "/dashboard/finance/expenses",
        icon: Receipt,
        matchPrefix: "/dashboard/finance/expenses",
        roles: ["FINANCE", "SUPER_ADMIN", "MANAGER", "HR"],
      },
      {
        label: "Payroll",
        href: "/dashboard/finance/payroll",
        icon: Banknote,
        matchPrefix: "/dashboard/finance/payroll",
        roles: ["FINANCE", "SUPER_ADMIN"],
      },
    ],
  },
  {
    id: "it",
    label: "IT",
    items: [
      {
        label: "Assets",
        href: "/dashboard/it/assets",
        icon: Monitor,
        matchPrefix: "/dashboard/it/assets",
        roles: ["IT_ADMIN", "SUPER_ADMIN"],
      },
      {
        label: "Help Desk",
        href: "/dashboard/it/tickets",
        icon: LifeBuoy,
        matchPrefix: "/dashboard/it/tickets",
        roles: ["IT_ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    id: "sports",
    label: "Sports & Events",
    items: [
      // ── Employee / All ─────────────────────────────────────────────────────
      {
        label: "Upcoming Events",
        href: "/dashboard/sports",
        icon: Trophy,
        matchPrefix: "/dashboard/sports",
        roles: ["EMPLOYEE_USER", "MANAGER", "STAFF"],
      },
      {
        label: "My Registrations",
        href: "/dashboard/sports/my-registrations",
        icon: ClipboardList,
        matchPrefix: "/dashboard/sports/my-registrations",
        roles: ["EMPLOYEE_USER", "MANAGER", "STAFF"],
      },
      {
        label: "Event Results",
        href: "/dashboard/sports/results",
        icon: Medal,
        matchPrefix: "/dashboard/sports/results",
        roles: ["EMPLOYEE_USER", "MANAGER", "STAFF"],
      },
      {
        label: "Gallery",
        href: "/dashboard/sports/gallery",
        icon: ImageIcon,
        matchPrefix: "/dashboard/sports/gallery",
        roles: ["EMPLOYEE_USER", "MANAGER", "STAFF"],
      },
      // ── HR ─────────────────────────────────────────────────────────────────
      {
        label: "Sports Dashboard",
        href: "/dashboard/sports/hr",
        icon: LayoutDashboard,
        matchPrefix: "/dashboard/sports/hr",
        roles: ["HR", "SUPER_ADMIN"],
      },
      {
        label: "Events",
        href: "/dashboard/sports/hr/events",
        icon: Trophy,
        matchPrefix: "/dashboard/sports/hr/events",
        roles: ["HR", "SUPER_ADMIN"],
      },
      {
        label: "Participants",
        href: "/dashboard/sports/hr/participants",
        icon: Users,
        matchPrefix: "/dashboard/sports/hr/participants",
        roles: ["HR", "SUPER_ADMIN"],
      },
      {
        label: "Teams",
        href: "/dashboard/sports/hr/teams",
        icon: Users,
        matchPrefix: "/dashboard/sports/hr/teams",
        roles: ["HR", "SUPER_ADMIN"],
      },
      {
        label: "Results",
        href: "/dashboard/sports/hr/results",
        icon: Medal,
        matchPrefix: "/dashboard/sports/hr/results",
        roles: ["HR", "SUPER_ADMIN"],
      },
      {
        label: "Gallery Mgmt",
        href: "/dashboard/sports/hr/gallery",
        icon: ImageIcon,
        matchPrefix: "/dashboard/sports/hr/gallery",
        roles: ["HR", "SUPER_ADMIN"],
      },
    ],
  },
  {
    id: "services",
    label: "Services",
    items: [
      {
        label: "Beauty Services",
        href: "/wellness/dashboard",
        icon: Scissors,
      },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    items: [
      {
        label: "User Management",
        href: "/dashboard/users",
        icon: UsersRound,
        matchPrefix: "/dashboard/users",
        roles: ["SUPER_ADMIN"],
      },
      {
        label: "Departments",
        href: "/dashboard/admin/departments",
        icon: Building2,
        matchPrefix: "/dashboard/admin/departments",
        roles: ["HR", "SUPER_ADMIN"],
      },
      {
        label: "Designations",
        href: "/dashboard/admin/designations",
        icon: Briefcase,
        matchPrefix: "/dashboard/admin/designations",
        roles: ["HR", "SUPER_ADMIN"],
      },
      {
        label: "Teams",
        href: "/dashboard/admin/teams",
        icon: UsersRound,
        matchPrefix: "/dashboard/admin/teams",
        roles: ["HR", "SUPER_ADMIN"],
      },
      {
        label: "Roles & Permissions",
        href: "/dashboard/admin/roles",
        icon: ShieldCheck,
        matchPrefix: "/dashboard/admin/roles",
        roles: ["HR", "SUPER_ADMIN"],
      },
      {
        label: "Onboard Employee",
        href: "/dashboard/admin/employees/new",
        icon: PlusCircle,
        matchPrefix: "/dashboard/admin/employees",
        roles: ["HR", "SUPER_ADMIN"],
      },
      {
        label: "Reporting Structure",
        href: "/dashboard/admin/reporting",
        icon: Network,
        matchPrefix: "/dashboard/admin/reporting",
        roles: ["HR", "SUPER_ADMIN"],
      },
      {
        label: "CMS",
        href: "/dashboard/admin/cms",
        icon: SlidersHorizontal,
        matchPrefix: "/dashboard/admin/cms",
        roles: ["SUPER_ADMIN"],
      },
      {
        label: "Theme Editor",
        href: "/dashboard/admin/theme",
        icon: Palette,
        matchPrefix: "/dashboard/admin/theme",
        roles: ["SUPER_ADMIN"],
      },
      {
        label: "Audit Logs",
        href: "/dashboard/admin/audit-logs",
        icon: ShieldCheck,
        matchPrefix: "/dashboard/admin/audit-logs",
        roles: ["SUPER_ADMIN"],
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      {
        label: "Payslips",
        href: "/dashboard/payslips",
        icon: FileText,
        matchPrefix: "/dashboard/payslips",
      },
      {
        label: "Profile",
        href: "/dashboard/profile",
        icon: UserCircle,
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

// ── Bottom nav (mobile) ───────────────────────────────────────────────────────

export const BOTTOM_NAV_EMS: BottomNavItem[] = [
  { label: "Home",       href: "/dashboard",            icon: LayoutDashboard },
  { label: "Attendance", href: "/dashboard/attendance", icon: Clock },
  { label: "Check In",   href: "/dashboard/attendance", icon: Fingerprint, isFab: true },
  { label: "Leave",      href: "/dashboard/leave",      icon: CalendarOff },
  { label: "More",       href: "/dashboard/profile",    icon: MoreHorizontal },
];
