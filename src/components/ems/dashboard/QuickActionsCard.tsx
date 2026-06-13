"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarOff, Users, ShoppingBag, Heart,
  BarChart3, CheckSquare, UsersRound, Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";

interface Action {
  label: string;
  href:  string;
  icon:  LucideIcon;
  color: string;
  bg:    string;
}

const EMPLOYEE_ACTIONS: Action[] = [
  { label: "Apply Leave",   href: "/dashboard/leave",            icon: CalendarOff, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950"  },
  { label: "My Team",       href: "/dashboard/team",             icon: Users,       color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950"      },
  { label: "Marketplace",   href: "/dashboard/products",         icon: ShoppingBag, color: "text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-950" },
  { label: "Wellness",      href: "/wellness/dashboard",         icon: Heart,       color: "text-pink-600",   bg: "bg-pink-50 dark:bg-pink-950"      },
  { label: "Engagement",    href: "/dashboard/engagement",       icon: Sparkles,    color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-950"    },
  { label: "People",        href: "/dashboard/directory",        icon: Users,       color: "text-sky-600",    bg: "bg-sky-50 dark:bg-sky-950"        },
];

const MANAGER_ACTIONS: Action[] = [
  { label: "Approve",       href: "/dashboard/approvals",        icon: CheckSquare, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950"  },
  { label: "My Team",       href: "/dashboard/team",             icon: Users,       color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950"      },
  { label: "Apply Leave",   href: "/dashboard/leave",            icon: CalendarOff, color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-950"      },
  { label: "Reports",       href: "/dashboard/reports",          icon: BarChart3,   color: "text-teal-600",   bg: "bg-teal-50 dark:bg-teal-950"      },
  { label: "Marketplace",   href: "/dashboard/products",         icon: ShoppingBag, color: "text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-950" },
  { label: "Engagement",    href: "/dashboard/engagement",       icon: Sparkles,    color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-950"    },
];

const HR_ACTIONS: Action[] = [
  { label: "Onboard",       href: "/dashboard/admin/employees/new", icon: UsersRound,  color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950" },
  { label: "Reports",       href: "/dashboard/reports",             icon: BarChart3,   color: "text-teal-600",   bg: "bg-teal-50 dark:bg-teal-950"     },
  { label: "Approve",       href: "/dashboard/approvals",           icon: CheckSquare, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
  { label: "Team",          href: "/dashboard/team",                icon: Users,       color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950"     },
  { label: "Marketplace",   href: "/dashboard/products",            icon: ShoppingBag, color: "text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-950"},
  { label: "Wellness",      href: "/wellness/dashboard",            icon: Heart,       color: "text-pink-600",   bg: "bg-pink-50 dark:bg-pink-950"     },
];

function getActions(role: UserRole | undefined): Action[] {
  if (role === "HR" || role === "SUPER_ADMIN") return HR_ACTIONS;
  if (role === "MANAGER") return MANAGER_ACTIONS;
  return EMPLOYEE_ACTIONS;
}

export function QuickActionsCard() {
  const { user } = useAuth();
  const actions = getActions(user?.role as UserRole | undefined);

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className="mb-4 text-sm font-semibold">Quick Actions</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-all hover:bg-muted active:scale-95"
            >
              <div className={`flex size-10 items-center justify-center rounded-xl ${action.bg} transition-transform group-hover:scale-110`}>
                <Icon className={`size-5 ${action.color}`} />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight text-muted-foreground group-hover:text-foreground">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
