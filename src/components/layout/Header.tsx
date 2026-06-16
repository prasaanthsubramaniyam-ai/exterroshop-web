"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X, ChevronRight, ChevronLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { toggleDrawer } from "@/store/slices/aiSlice";
import { UserDropdown } from "./UserDropdown";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

// ── Route registry ────────────────────────────────────────────────────────────
// Maps every known path → human label.
// Dynamic segments (e.g. /products/[id]) are resolved by longest-prefix match.

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard":                         "Home",
  "/dashboard/my-work":                 "My Work",
  "/dashboard/attendance":              "Attendance",
  "/dashboard/leave":                   "Leave",
  "/dashboard/approvals":               "Approvals",
  "/dashboard/holidays":                "Holidays",
  "/dashboard/payslips":                "Payslips",
  "/dashboard/team":                    "My Team",
  "/dashboard/directory":               "Directory",
  "/dashboard/org-chart":               "Org Chart",
  "/dashboard/engagement":              "Engagement",
  "/dashboard/engagement/recognition":  "Recognition",
  "/dashboard/engagement/rewards":      "Rewards Store",
  "/dashboard/engagement/hall-of-fame": "Hall of Fame",
  "/dashboard/engagement/challenges":   "Challenges",
  "/dashboard/engagement/ideas":        "Ideas",
  "/dashboard/engagement/polls":        "Polls",
  "/dashboard/engagement/surveys":      "Surveys",
  "/dashboard/engagement/celebrations": "Celebrations",
  "/dashboard/engagement/clubs":        "Clubs",
  "/dashboard/engagement/learning":     "Learning",
  "/dashboard/engagement/csr":          "CSR",
  "/dashboard/engagement/wellness":     "Wellness Activities",
  "/dashboard/engagement/feed":         "Community Feed",
  "/dashboard/engagement/achievements": "Achievements",
  "/dashboard/engagement/leaderboard":  "Leaderboard",
  "/dashboard/engagement/analytics":    "Engagement Analytics",
  "/dashboard/sports":                  "Sports & Events",
  "/dashboard/sports/gallery":          "Gallery",
  "/dashboard/sports/results":          "Results",
  "/dashboard/sports/my-registrations": "My Registrations",
  "/dashboard/sports/hr":               "HR Sports Admin",
  "/dashboard/sports/hr/events":        "Events",
  "/dashboard/sports/hr/events/new":    "New Event",
  "/dashboard/sports/hr/gallery":       "Gallery",
  "/dashboard/sports/hr/participants":  "Participants",
  "/dashboard/sports/hr/results":       "Results",
  "/dashboard/sports/hr/teams":         "Teams",
  "/dashboard/sports/hr/volunteers":    "Volunteers",
  "/dashboard/reports":                 "Reports & Insights",
  "/dashboard/products":                "Marketplace",
  "/dashboard/products/new":            "Sell Item",
  "/dashboard/favorites":               "Favorites",
  "/dashboard/my-products":             "My Listings",
  "/dashboard/chat":                    "Chats",
  "/dashboard/call-requests":           "Call Requests",
  "/dashboard/search":                  "Search",
  "/dashboard/notifications":           "Notifications",
  "/dashboard/finance/expenses":        "Expenses",
  "/dashboard/finance/payroll":         "Payroll",
  "/dashboard/it/assets":               "Assets",
  "/dashboard/it/tickets":              "Help Desk",
  "/dashboard/admin":                   "Admin",
  "/dashboard/admin/employees/new":     "Onboard Employee",
  "/dashboard/users":                   "User Management",
  "/dashboard/admin/departments":       "Departments",
  "/dashboard/admin/designations":      "Designations",
  "/dashboard/admin/teams":             "Teams",
  "/dashboard/admin/roles":             "Roles & Permissions",
  "/dashboard/admin/reporting":         "Reporting Structure",
  "/dashboard/admin/cms":               "CMS & Branding",
  "/dashboard/admin/theme":             "Theme Editor",
  "/dashboard/admin/audit-logs":        "Audit Logs",
  "/dashboard/profile":                 "My Profile",
  "/dashboard/settings":                "Settings",
  "/dashboard/settings/security":       "Security",
  "/wellness":                          "Wellness",
  "/wellness/dashboard":                "Wellness",
  "/wellness/book":                     "Book",
  "/wellness/bookings":                 "Bookings",
  "/wellness/appointments":             "Appointments",
  "/wellness/centers":                  "Centres",
  "/wellness/services":                 "Services",
  "/wellness/staff":                    "Staff",
  "/wellness/calendar":                 "Calendar",
  "/wellness/bulk-upload":              "Bulk Upload",
};

// Canonical parent for each path segment prefix.
// Used to build the crumb chain without relying on browser history.
const PARENT_MAP: Record<string, string> = {
  "/dashboard/my-work":                  "/dashboard",
  "/dashboard/attendance":               "/dashboard/my-work",
  "/dashboard/leave":                    "/dashboard/my-work",
  "/dashboard/approvals":                "/dashboard/my-work",
  "/dashboard/holidays":                 "/dashboard/my-work",
  "/dashboard/payslips":                 "/dashboard/my-work",
  "/dashboard/team":                     "/dashboard",
  "/dashboard/directory":                "/dashboard",
  "/dashboard/org-chart":                "/dashboard",
  // Engagement subtree
  "/dashboard/engagement":               "/dashboard",
  "/dashboard/engagement/recognition":   "/dashboard/engagement",
  "/dashboard/engagement/rewards":       "/dashboard/engagement",
  "/dashboard/engagement/hall-of-fame":  "/dashboard/engagement",
  "/dashboard/engagement/challenges":    "/dashboard/engagement",
  "/dashboard/engagement/ideas":         "/dashboard/engagement",
  "/dashboard/engagement/polls":         "/dashboard/engagement",
  "/dashboard/engagement/surveys":       "/dashboard/engagement",
  "/dashboard/engagement/celebrations":  "/dashboard/engagement",
  "/dashboard/engagement/clubs":         "/dashboard/engagement",
  "/dashboard/engagement/learning":      "/dashboard/engagement",
  "/dashboard/engagement/csr":           "/dashboard/engagement",
  "/dashboard/engagement/wellness":      "/dashboard/engagement",
  "/dashboard/engagement/feed":          "/dashboard/engagement",
  "/dashboard/engagement/achievements":  "/dashboard/engagement",
  "/dashboard/engagement/leaderboard":   "/dashboard/engagement",
  "/dashboard/engagement/analytics":    "/dashboard/engagement",
  // Sports subtree
  "/dashboard/sports":                   "/dashboard",
  "/dashboard/sports/gallery":           "/dashboard/sports",
  "/dashboard/sports/results":           "/dashboard/sports",
  "/dashboard/sports/my-registrations":  "/dashboard/sports",
  "/dashboard/sports/hr":                "/dashboard/sports",
  "/dashboard/sports/hr/events":         "/dashboard/sports/hr",
  "/dashboard/sports/hr/events/new":     "/dashboard/sports/hr/events",
  "/dashboard/sports/hr/gallery":        "/dashboard/sports/hr",
  "/dashboard/sports/hr/participants":   "/dashboard/sports/hr",
  "/dashboard/sports/hr/results":        "/dashboard/sports/hr",
  "/dashboard/sports/hr/teams":          "/dashboard/sports/hr",
  "/dashboard/sports/hr/volunteers":     "/dashboard/sports/hr",
  // Admin subtree
  "/dashboard/admin":                    "/dashboard",
  "/dashboard/admin/employees/new":      "/dashboard/admin",
  "/dashboard/users":                    "/dashboard/admin",
  "/dashboard/admin/departments":        "/dashboard/admin",
  "/dashboard/admin/designations":       "/dashboard/admin",
  "/dashboard/admin/teams":              "/dashboard/admin",
  "/dashboard/admin/roles":              "/dashboard/admin",
  "/dashboard/admin/reporting":          "/dashboard/admin",
  "/dashboard/admin/cms":                "/dashboard/admin",
  "/dashboard/admin/theme":              "/dashboard/admin",
  "/dashboard/admin/audit-logs":         "/dashboard/admin",
  // Finance subtree → back to Admin hub
  "/dashboard/finance/expenses":         "/dashboard/admin",
  "/dashboard/finance/payroll":          "/dashboard/admin",
  // IT subtree → back to Admin hub
  "/dashboard/it/assets":                "/dashboard/admin",
  "/dashboard/it/tickets":               "/dashboard/admin",
  // Marketplace
  "/dashboard/products":                 "/dashboard",
  "/dashboard/products/new":             "/dashboard/products",
  "/dashboard/favorites":                "/dashboard/products",
  "/dashboard/my-products":              "/dashboard/products",
  // Other
  "/dashboard/reports":                  "/dashboard",
  "/dashboard/chat":                     "/dashboard",
  "/dashboard/call-requests":            "/dashboard",
  "/dashboard/search":                   "/dashboard",
  "/dashboard/notifications":            "/dashboard",
  "/dashboard/settings":                 "/dashboard",
  "/dashboard/settings/security":        "/dashboard/settings",
  "/dashboard/profile":                  "/dashboard",
  // Wellness subtree
  "/wellness/dashboard":                 "/wellness",
  "/wellness/book":                      "/wellness",
  "/wellness/bookings":                  "/wellness",
  "/wellness/appointments":              "/wellness",
  "/wellness/centers":                   "/wellness",
  "/wellness/services":                  "/wellness",
  "/wellness/staff":                     "/wellness",
  "/wellness/calendar":                  "/wellness",
  "/wellness/bulk-upload":               "/wellness",
};

// Root pages — no breadcrumb strip shown (single-level pages)
const ROOT_PAGES = new Set([
  "/dashboard",
  "/wellness",
  "/wellness/dashboard",
  "/login",
]);

// ── Breadcrumb logic ──────────────────────────────────────────────────────────

interface Crumb { label: string; href: string }

function resolveLabel(path: string): string {
  if (ROUTE_LABELS[path]) return ROUTE_LABELS[path];
  // longest prefix match for dynamic routes
  let best = ""; let bestLen = 0;
  for (const [key, label] of Object.entries(ROUTE_LABELS)) {
    if (path.startsWith(key + "/") && key.length > bestLen) {
      best = label; bestLen = key.length;
    }
  }
  return best || path.split("/").pop() || "…";
}

function resolveParent(path: string): string | null {
  if (PARENT_MAP[path]) return PARENT_MAP[path];
  // dynamic route: strip last segment and try again
  const parent = path.split("/").slice(0, -1).join("/");
  if (!parent || parent === path) return null;
  return parent || null;
}

function buildCrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: resolveLabel(pathname), href: pathname }];
  let current = pathname;
  let safety = 0;
  while (safety++ < 8) {
    const parent = resolveParent(current);
    if (!parent) break;
    crumbs.unshift({ label: resolveLabel(parent), href: parent });
    current = parent;
  }
  return crumbs;
}

// ── Breadcrumb component ──────────────────────────────────────────────────────

function Breadcrumbs({ pathname, searchOpen }: { pathname: string; searchOpen: boolean }) {
  if (ROOT_PAGES.has(pathname)) return null;

  const crumbs = buildCrumbs(pathname);
  if (crumbs.length <= 1) return null;

  const parent = crumbs[crumbs.length - 2];
  const current = crumbs[crumbs.length - 1];

  return (
    <>
      {/* Desktop: full breadcrumb chain */}
      <nav
        aria-label="Breadcrumb"
        className={cn(
          "hidden sm:flex items-center gap-1 min-w-0 flex-1",
          searchOpen && "hidden"
        )}
      >
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <React.Fragment key={crumb.href}>
              {isLast ? (
                <span className="text-sm font-semibold text-foreground truncate max-w-[160px]" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px] shrink-0"
                >
                  {crumb.label}
                </Link>
              )}
              {!isLast && (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Mobile: condensed ← Parent  ·  Current */}
      <div className={cn("flex sm:hidden items-center gap-2 min-w-0 flex-1", searchOpen && "hidden")}>
        <Link
          href={parent.href}
          className="flex items-center gap-0.5 text-sm font-medium text-primary shrink-0"
          aria-label={`Back to ${parent.label}`}
        >
          <ChevronLeft className="size-4" />
          <span className="max-w-[90px] truncate">{parent.label}</span>
        </Link>
        <span className="text-muted-foreground/40 text-xs shrink-0">·</span>
        <span className="text-sm font-semibold truncate text-foreground">{current.label}</span>
      </div>
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Header() {
  const dispatch    = useAppDispatch();
  const router      = useRouter();
  const aiDrawerOpen = useAppSelector((s) => s.ai.isDrawerOpen);
  const pathname  = usePathname();
  const [query, setQuery]         = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);

  const isRoot = ROOT_PAGES.has(pathname);
  const crumbs = buildCrumbs(pathname);
  const hasMultipleCrumbs = crumbs.length > 1;

  // Plain title (used on root pages only)
  const pageTitle = resolveLabel(pathname);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    router.push(`/dashboard/search?q=${encodeURIComponent(term)}`);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">

        {/* Mobile: hamburger on root pages, back-arrow on deep pages */}
        {hasMultipleCrumbs ? (
          <Link
            href={crumbs[crumbs.length - 2].href}
            className="lg:hidden flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="size-5" />
          </Link>
        ) : (
          <button
            className="lg:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle menu"
          >
            <Menu className="size-5" />
          </button>
        )}

        {/* Desktop hamburger always visible */}
        {hasMultipleCrumbs && (
          <button
            className="hidden lg:flex rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle menu"
          >
            <Menu className="size-5" />
          </button>
        )}

        {/* Title area: breadcrumbs for deep pages, plain title for root */}
        {isRoot || !hasMultipleCrumbs ? (
          <div className={cn("flex-1 min-w-0", searchOpen && "hidden sm:block")}>
            <h2 className="text-lg font-semibold leading-none truncate">{pageTitle}</h2>
          </div>
        ) : (
          <Breadcrumbs pathname={pathname} searchOpen={searchOpen} />
        )}

        {/* Desktop search form */}
        <form
          onSubmit={submitSearch}
          className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 w-64 lg:w-80 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/30 transition-all"
        >
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            type="search"
            placeholder="Search people, products…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        {/* Mobile search toggle */}
        <button
          className="sm:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          onClick={() => setSearchOpen((o) => !o)}
          aria-label="Search"
        >
          {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
        </button>

        <NotificationBell />
        <div className="hidden h-6 w-px bg-border sm:block" aria-hidden />
        <UserDropdown />
        <div className="hidden h-6 w-px bg-border sm:block" aria-hidden />

        {/* Exterro AI button */}
        <button
          onClick={() => dispatch(toggleDrawer())}
          aria-label={aiDrawerOpen ? "Close Exterro AI" : "Open Exterro AI"}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all",
            "bg-gradient-to-r from-primary to-orange-500 text-white shadow-sm",
            "hover:opacity-90 hover:shadow-md active:scale-95",
            aiDrawerOpen && "opacity-80 shadow-none",
            // Mobile: icon-only
            "sm:px-3"
          )}
        >
          <span className="text-sm">✦</span>
          <span className="hidden sm:inline tracking-wide">Ask AI</span>
        </button>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <form
          onSubmit={submitSearch}
          className="flex items-center gap-2 border-t border-border px-4 py-3 sm:hidden"
        >
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            type="search"
            placeholder="Search people, products…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      )}
    </header>
  );
}
