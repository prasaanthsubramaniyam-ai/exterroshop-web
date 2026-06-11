"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  Network,
  PlusCircle,
  ShieldCheck,
  UsersRound,
  ChevronRight,
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
  roles?: UserRole[];
}

const MODULES: ModuleCard[] = [
  {
    title: "User Management",
    description: "Accounts, roles, activation and profile data",
    href: "/dashboard/users",
    icon: UsersRound,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Onboard Employee",
    description: "4-step wizard: profile, role, placement, review",
    href: "/dashboard/admin/employees/new",
    icon: PlusCircle,
  },
  {
    title: "Departments",
    description: "Department catalogue with heads and codes",
    href: "/dashboard/admin/departments",
    icon: Building2,
  },
  {
    title: "Designations",
    description: "Job titles, levels and salary grades",
    href: "/dashboard/admin/designations",
    icon: Briefcase,
  },
  {
    title: "Teams",
    description: "Team setup, leads and member assignment",
    href: "/dashboard/admin/teams",
    icon: UsersRound,
  },
  {
    title: "Roles & Permissions",
    description: "Configurable permission matrix per role",
    href: "/dashboard/admin/roles",
    icon: ShieldCheck,
  },
  {
    title: "Reporting Structure",
    description: "Primary, dotted-line and matrix reporting",
    href: "/dashboard/admin/reporting",
    icon: Network,
  },
];

/**
 * Employee Management hub — single sidebar entry; the admin modules
 * live here as cards instead of seven separate nav rows.
 */
export function AdminHubView() {
  const { user } = useAuth();
  const role = user?.role as UserRole | undefined;

  const visible = MODULES.filter(
    (m) => !m.roles || (role && m.roles.includes(role))
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Employee Management"
        description="Organisation setup, people administration and access control."
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
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
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
