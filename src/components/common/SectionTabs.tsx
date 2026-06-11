"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { SectionTabDef } from "@/constants/navigation";
import type { UserRole } from "@/types";

interface SectionTabsProps {
  tabs: SectionTabDef[];
  className?: string;
}

/**
 * In-page secondary navigation — replaces the old deep sidebar.
 * Role-aware: tabs with `roles` are hidden from other users.
 * The active tab is the one whose href most specifically matches the path.
 */
export function SectionTabs({ tabs, className }: SectionTabsProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role as UserRole | undefined;

  const visible = tabs.filter(
    (t) => !t.roles || (role && t.roles.includes(role))
  );
  if (visible.length < 2) return null;

  // Longest-prefix wins so "/dashboard/sports" doesn't trump
  // "/dashboard/sports/results" when both match.
  const activeHref = visible
    .filter((t) => pathname === t.href || pathname.startsWith(t.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div
      className={cn(
        "mb-5 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1 no-scrollbar w-fit max-w-full",
        className
      )}
    >
      {visible.map((tab) => {
        const active = tab.href === activeHref;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
