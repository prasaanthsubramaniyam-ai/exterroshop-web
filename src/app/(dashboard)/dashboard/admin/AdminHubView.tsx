"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase, Building2, Network, PlusCircle,
  ShieldCheck, UsersRound, ChevronRight,
  SlidersHorizontal, Banknote, Monitor,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";

interface ModuleCard {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  roles?: UserRole[];
}

const MODULES: ModuleCard[] = [
  // ── People & Org ──────────────────────────────────────────────────────────
  {
    title:       "Onboard Employee",
    description: "4-step wizard: profile, role, placement, review",
    href:        "/dashboard/admin/employees/new",
    icon:        PlusCircle,
    iconBg:      "bg-primary/10",
    iconColor:   "text-primary",
  },
  {
    title:       "User Management",
    description: "Accounts, roles, activation and profile data",
    href:        "/dashboard/users",
    icon:        UsersRound,
    iconBg:      "bg-primary/10",
    iconColor:   "text-primary",
    roles:       ["SUPER_ADMIN"],
  },
  {
    title:       "Departments",
    description: "Department catalogue with heads and codes",
    href:        "/dashboard/admin/departments",
    icon:        Building2,
    iconBg:      "bg-blue-50 dark:bg-blue-950",
    iconColor:   "text-blue-600",
  },
  {
    title:       "Designations",
    description: "Job titles, levels and salary grades",
    href:        "/dashboard/admin/designations",
    icon:        Briefcase,
    iconBg:      "bg-indigo-50 dark:bg-indigo-950",
    iconColor:   "text-indigo-600",
  },
  {
    title:       "Teams",
    description: "Team setup, leads and member assignment",
    href:        "/dashboard/admin/teams",
    icon:        UsersRound,
    iconBg:      "bg-sky-50 dark:bg-sky-950",
    iconColor:   "text-sky-600",
  },
  {
    title:       "Reporting Structure",
    description: "Primary, dotted-line and matrix reporting",
    href:        "/dashboard/admin/reporting",
    icon:        Network,
    iconBg:      "bg-teal-50 dark:bg-teal-950",
    iconColor:   "text-teal-600",
  },
  {
    title:       "Roles & Permissions",
    description: "Configurable permission matrix per role",
    href:        "/dashboard/admin/roles",
    icon:        ShieldCheck,
    iconBg:      "bg-violet-50 dark:bg-violet-950",
    iconColor:   "text-violet-600",
  },
  // ── Finance ───────────────────────────────────────────────────────────────
  {
    title:       "Finance",
    description: "Expense reports and payroll management",
    href:        "/dashboard/finance/expenses",
    icon:        Banknote,
    iconBg:      "bg-amber-50 dark:bg-amber-950",
    iconColor:   "text-amber-600",
    roles:       ["FINANCE", "SUPER_ADMIN"],
  },
  // ── IT ────────────────────────────────────────────────────────────────────
  {
    title:       "IT",
    description: "Asset register and help desk tickets",
    href:        "/dashboard/it/assets",
    icon:        Monitor,
    iconBg:      "bg-emerald-50 dark:bg-emerald-950",
    iconColor:   "text-emerald-600",
    roles:       ["IT_ADMIN", "SUPER_ADMIN"],
  },
  // ── System ────────────────────────────────────────────────────────────────
  {
    title:       "CMS & Branding",
    description: "Content, theme editor and audit logs",
    href:        "/dashboard/admin/cms",
    icon:        SlidersHorizontal,
    iconBg:      "bg-rose-50 dark:bg-rose-950",
    iconColor:   "text-rose-600",
    roles:       ["SUPER_ADMIN"],
  },
];

export function AdminHubView() {
  const { user } = useAuth();
  const role = user?.role as UserRole | undefined;

  const visible = MODULES.filter(
    (m) => !m.roles || (role && m.roles.includes(role))
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Admin"
        description="Organisation setup, people administration, finance, IT and system configuration."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className={`flex size-11 items-center justify-center rounded-xl ${m.iconBg}`}>
                  <Icon className={`size-5 ${m.iconColor}`} />
                </div>
                <ChevronRight className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{m.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
