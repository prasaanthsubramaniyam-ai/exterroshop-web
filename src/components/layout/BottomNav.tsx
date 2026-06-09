"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_NAV_EMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {BOTTOM_NAV_EMS.map((item) => {
          const Icon   = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");

          if (item.isFab) {
            // Centre FAB — check-in button raised above the nav bar
            return (
              <li key={item.label} className="flex items-end justify-center pb-1">
                <Link
                  href={item.href}
                  className="relative -top-4 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition-transform active:scale-95"
                  aria-label={item.label}
                >
                  {Icon && <Icon className="size-6" />}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "size-5 transition-colors",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                )}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
