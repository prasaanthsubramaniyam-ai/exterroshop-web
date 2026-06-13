"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_NAV_EMS } from "@/constants/navigation";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <ul className="grid grid-cols-5">
          {BOTTOM_NAV_EMS.map((item) => {
            const Icon = item.icon;

            // Centre FAB — raised check-in button
            if (item.isFab) {
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

            // Menu button — opens slide-up drawer
            if (item.isMenu) {
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    aria-label="Open navigation menu"
                    className={cn(
                      "flex w-full flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                      drawerOpen ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {Icon && (
                      <Icon className={cn("size-5", drawerOpen ? "text-primary" : "text-muted-foreground")} />
                    )}
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            }

            // Standard nav link
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");

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
                    <Icon className={cn("size-5", active ? "text-primary" : "text-muted-foreground")} />
                  )}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <MobileNavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
