"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, ChevronLeft, ChevronDown, ChevronRight } from "lucide-react";
import {
  EMS_NAV_SECTIONS,
  ROLE_LABELS,
  ROLE_RING,
  type EmsNavItem,
} from "@/constants/navigation";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSidebarOpen, toggleSidebarCollapsed } from "@/store/slices/uiSlice";
import { useAuth } from "@/hooks/useAuth";
import { useCms } from "@/context/CmsContext";
import { leaveService } from "@/services/leave.service";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

// ── Constants ─────────────────────────────────────────────────────────────────

const APPROVALS_ROLES: UserRole[] = ["MANAGER", "HR", "SUPER_ADMIN"];
const SECTION_STORAGE_KEY = "ems_collapsed_sections";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getAllItems(role: UserRole | undefined): EmsNavItem[] {
  return EMS_NAV_SECTIONS.flatMap((s) =>
    s.items.filter((item) => !item.roles || (role && item.roles.includes(role)))
  );
}

function matchesPrefixes(current: string, item: EmsNavItem): boolean {
  return (item.matchPrefixes ?? []).some(
    (p) => current === p || current.startsWith(p + "/")
  );
}

function isActive(
  current: string,
  item: EmsNavItem,
  allItems: EmsNavItem[]
): boolean {
  if (current === item.href) return true;
  if (matchesPrefixes(current, item)) {
    // If another item matches more specifically (longer prefix or exact href),
    // it wins — e.g. CMS (/dashboard/admin/cms) beats Employee Management
    // (/dashboard/admin) when viewing a CMS page.
    const myLongest = Math.max(
      ...(item.matchPrefixes ?? []).filter(
        (p) => current === p || current.startsWith(p + "/")
      ).map((p) => p.length)
    );
    const beaten = allItems.some((other) => {
      if (other.href === item.href) return false;
      if (current === other.href) return true;
      const otherLongest = Math.max(
        0,
        ...(other.matchPrefixes ?? []).filter(
          (p) => current === p || current.startsWith(p + "/")
        ).map((p) => p.length)
      );
      return otherLongest > myLongest;
    });
    return !beaten;
  }
  return false;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function loadCollapsedSections(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SECTION_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveCollapsedSections(set: Set<string>) {
  try {
    localStorage.setItem(SECTION_STORAGE_KEY, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname  = usePathname();
  const open      = useAppSelector((s) => s.ui.sidebarOpen);
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const dispatch  = useAppDispatch();
  const { logout, user } = useAuth();
  const { cms } = useCms();

  const logoUrl     = cms("app.logo.url",  "");
  const wordmarkUrl = cms("app.logo.name", "");

  const onClose = () => dispatch(setSidebarOpen(false));
  const onToggleCollapse = () => dispatch(toggleSidebarCollapsed());

  const userRole = user?.role as UserRole | undefined;
  const allItems = getAllItems(userRole);

  // ── Section collapse (persisted in localStorage) ─────────────────────────

  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(
    () => loadCollapsedSections()
  );

  const toggleSection = React.useCallback((id: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveCollapsedSections(next);
      return next;
    });
  }, []);

  // ── Live approvals count ──────────────────────────────────────────────────

  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    if (!userRole || !APPROVALS_ROLES.includes(userRole)) return;

    let mounted = true;
    const fetch = () =>
      leaveService
        .getPendingApprovals()
        .then((r) => { if (mounted) setPendingCount(r.length); })
        .catch(() => {});

    fetch();
    const interval = setInterval(fetch, 60_000);
    return () => { mounted = false; clearInterval(interval); };
  }, [userRole]);

  // ── Visible sections ──────────────────────────────────────────────────────

  const visibleSections = EMS_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !item.roles || (userRole && item.roles.includes(userRole))
    ),
  })).filter((section) => section.items.length > 0);

  // ── Logo renderers ────────────────────────────────────────────────────────

  const LogoIcon = logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoUrl} width={32} height={32} alt="Logo" className="size-8 shrink-0 object-contain" />
  ) : (
    <Image src="/logo.svg" width={32} height={32} alt="Logo" priority className="size-8 shrink-0" />
  );

  const LogoWordmark = wordmarkUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={wordmarkUrl} height={32} alt="ExterroShop" className="h-7 w-auto object-contain" />
  ) : (
    <Image src="/logo-name.svg" width={140} height={28} alt="ExterroShop" priority className="h-7 w-auto" />
  );

  // ── Avatar ring class ─────────────────────────────────────────────────────

  const avatarRing = userRole ? ROLE_RING[userRole] : "ring-gray-300";

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-background",
          "transition-[width,transform] duration-300 ease-in-out overflow-hidden",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* ── Logo area ───────────────────────────────────────────────────── */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border",
            collapsed ? "justify-center px-0" : "px-4"
          )}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "hidden lg:flex items-center gap-2.5 min-w-0 group relative",
              collapsed ? "justify-center" : "w-full"
            )}
          >
            {LogoIcon}
            <span
              className={cn(
                "min-w-0 overflow-hidden transition-all duration-300",
                collapsed ? "w-0 opacity-0" : "opacity-100"
              )}
            >
              {LogoWordmark}
            </span>
            {!collapsed && (
              <ChevronLeft
                className={cn(
                  "ml-auto size-4 shrink-0 text-muted-foreground/50",
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                )}
              />
            )}
          </button>

          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex lg:hidden items-center gap-2.5 min-w-0"
          >
            {LogoIcon}
            {LogoWordmark}
          </Link>
        </div>

        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden py-3 no-scrollbar"
        >
          <div className={cn(collapsed ? "px-2" : "px-3")}>
            {visibleSections.map((section, sectionIdx) => {
              const isSectionCollapsed = !collapsed && collapsedSections.has(section.id);

              return (
                <div key={section.id} className={cn(sectionIdx > 0 && "mt-4")}>

                  {/* Section label + collapse toggle (skipped for unlabeled sections) */}
                  {!collapsed && section.label && (
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="group mb-1 flex w-full items-center justify-between px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      <span>{section.label}</span>
                      {isSectionCollapsed ? (
                        <ChevronRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <ChevronDown className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  )}

                  {/* Items — hidden when section is collapsed (but always visible in icon mode) */}
                  {!isSectionCollapsed && (
                    <ul className={cn("space-y-0.5", collapsed && sectionIdx > 0 && "mt-1")}>
                      {section.items.map((item) => {
                        const active = isActive(pathname, item, allItems);
                        const Icon   = item.icon;
                        const showCount =
                          item.badge === "count" &&
                          item.href === "/dashboard/approvals" &&
                          pendingCount > 0;

                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={onClose}
                              title={collapsed ? item.label : undefined}
                              className={cn(
                                "group relative flex items-center rounded-xl text-sm font-medium transition-all",
                                collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2",
                                active
                                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
                              )}
                            >
                              <Icon
                                className={cn(
                                  "size-[18px] shrink-0 transition-colors",
                                  active
                                    ? "text-primary-foreground"
                                    : "text-muted-foreground group-hover:text-foreground"
                                )}
                              />

                              {!collapsed && (
                                <>
                                  <span className="flex-1 leading-none">{item.label}</span>

                                  {/* Count badge */}
                                  {showCount && (
                                    <span className={cn(
                                      "inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                                      active
                                        ? "bg-primary-foreground/20 text-primary-foreground"
                                        : "bg-primary text-primary-foreground"
                                    )}>
                                      {pendingCount > 99 ? "99+" : pendingCount}
                                    </span>
                                  )}

                                  {/* Dot badge */}
                                  {item.badge === "dot" && !active && (
                                    <span className="size-1.5 rounded-full bg-primary" />
                                  )}
                                </>
                              )}

                              {/* Collapsed count badge — shown as a dot indicator on the icon */}
                              {collapsed && showCount && (
                                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                                  {pendingCount > 9 ? "9+" : pendingCount}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* ── User footer ─────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-border p-2">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
              {/* Avatar with role ring */}
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className={cn("size-9 shrink-0 rounded-full object-cover ring-2", avatarRing)}
                />
              ) : (
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    "bg-primary/10 text-xs font-bold text-primary ring-2",
                    avatarRing
                  )}
                >
                  {user ? getInitials(user.name) : "?"}
                </div>
              )}

              {/* Name + subtitle */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-none">
                  {user?.name ?? "—"}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground leading-tight">
                  {/* Show designation+dept if available, fallback to role+location */}
                  {(user as { designationTitle?: string })?.designationTitle
                    ? `${(user as { designationTitle?: string }).designationTitle} · ${(user as { departmentName?: string }).departmentName ?? (user as { department?: string }).department ?? ""}`
                    : `${userRole ? ROLE_LABELS[userRole] : "Employee"}${user?.location ? ` · ${user.location}` : ""}`
                  }
                </p>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={() => logout()}
                title="Log out"
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            /* Collapsed footer: avatar + logout stacked */
            <div className="flex flex-col items-center gap-1">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  title={`${user.name} · ${userRole ? ROLE_LABELS[userRole] : "Employee"}`}
                  className={cn("size-9 rounded-full object-cover ring-2", avatarRing)}
                />
              ) : (
                <div
                  title={`${user?.name ?? ""} · ${userRole ? ROLE_LABELS[userRole] : "Employee"}`}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full",
                    "bg-primary/10 text-xs font-bold text-primary ring-2",
                    avatarRing
                  )}
                >
                  {user ? getInitials(user.name) : "?"}
                </div>
              )}
              <button
                type="button"
                onClick={() => logout()}
                title="Log out"
                className="flex w-full items-center justify-center rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
