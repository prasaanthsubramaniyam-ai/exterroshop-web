"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LogOut } from "lucide-react";
import { EMS_NAV_SECTIONS, ROLE_LABELS, ROLE_RING, type EmsNavItem } from "@/constants/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function MobileNavDrawer({ open, onClose }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role as UserRole | undefined;
  const avatarRing = role ? ROLE_RING[role] : "ring-gray-300";

  const visibleItems: EmsNavItem[] = EMS_NAV_SECTIONS.flatMap((s) =>
    s.items.filter((item) => !item.roles || (role && item.roles.includes(role)))
  );

  function isActive(item: EmsNavItem): boolean {
    if (pathname === item.href) return true;
    return (item.matchPrefixes ?? []).some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
  }

  // Trap focus and close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer — slides up from bottom */}
      <div
        role="dialog"
        aria-modal
        aria-label="Navigation menu"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-background border-t border-border shadow-2xl md:hidden",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
        style={{ maxHeight: "85vh" }}
      >
        {/* Handle + header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="mx-auto w-10 h-1 rounded-full bg-border absolute top-3 left-1/2 -translate-x-1/2" />
          <p className="text-sm font-semibold">Menu</p>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 no-scrollbar">
          <ul className="space-y-0.5">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("size-5 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground")} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-border p-4 pb-safe">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className={cn("size-10 rounded-full object-cover ring-2", avatarRing)}
              />
            ) : (
              <div className={cn(
                "flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary ring-2",
                avatarRing
              )}>
                {user ? getInitials(user.name) : "?"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.name ?? "—"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {role ? ROLE_LABELS[role] : "Employee"}{user?.location ? ` · ${user.location}` : ""}
              </p>
            </div>
            <button
              onClick={() => { logout(); onClose(); }}
              className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="size-3.5" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
