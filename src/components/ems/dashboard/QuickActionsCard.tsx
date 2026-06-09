"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarOff,
  Users,
  ShoppingBag,
  Scissors,
  CalendarDays,
  FileText,
  type LucideIcon,
} from "lucide-react";

interface Action {
  label: string;
  href:  string;
  icon:  LucideIcon;
  color: string;
  bg:    string;
}

const ACTIONS: Action[] = [
  { label: "Apply Leave",       href: "/dashboard/leave",         icon: CalendarOff,  color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950"  },
  { label: "My Team",           href: "/dashboard/team",          icon: Users,        color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950"      },
  { label: "Marketplace",       href: "/dashboard/products",      icon: ShoppingBag,  color: "text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-950" },
  { label: "Beauty Services",   href: "/wellness/dashboard",      icon: Scissors,     color: "text-pink-600",   bg: "bg-pink-50 dark:bg-pink-950"      },
  { label: "Holidays",          href: "/dashboard/holidays",      icon: CalendarDays, color: "text-red-600",    bg: "bg-red-50 dark:bg-red-950"        },
  { label: "Payslips",          href: "/dashboard/payslips",      icon: FileText,     color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-950"    },
];

export function QuickActionsCard() {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className="mb-4 text-sm font-semibold">Quick Actions</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
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
