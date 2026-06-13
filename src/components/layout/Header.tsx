"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useAppDispatch } from "@/store";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { UserDropdown } from "./UserDropdown";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

// ── Page title map ────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":                          "Home",
  "/dashboard/my-work":                  "My Work",
  "/dashboard/attendance":               "Attendance",
  "/dashboard/leave":                    "Leave",
  "/dashboard/approvals":                "Approvals",
  "/dashboard/holidays":                 "Holidays",
  "/dashboard/payslips":                 "Payslips",
  "/dashboard/team":                     "My Team",
  "/dashboard/directory":                "Directory",
  "/dashboard/org-chart":                "Org Chart",
  "/dashboard/engagement":               "Engagement",
  "/dashboard/sports":                   "Sports & Events",
  "/dashboard/reports":                  "Reports & Insights",
  "/dashboard/products":                 "Marketplace",
  "/dashboard/products/new":             "Sell Item",
  "/dashboard/favorites":                "Favorites",
  "/dashboard/my-products":              "My Listings",
  "/dashboard/chat":                     "Chats",
  "/dashboard/call-requests":            "Call Requests",
  "/wellness/dashboard":                 "Wellness",
  "/wellness":                           "Wellness",
  "/dashboard/finance/expenses":         "Finance — Expenses",
  "/dashboard/finance/payroll":          "Finance — Payroll",
  "/dashboard/it/assets":                "IT — Assets",
  "/dashboard/it/tickets":               "IT — Help Desk",
  "/dashboard/admin":                    "Admin",
  "/dashboard/admin/employees/new":      "Onboard Employee",
  "/dashboard/users":                    "User Management",
  "/dashboard/admin/departments":        "Departments",
  "/dashboard/admin/designations":       "Designations",
  "/dashboard/admin/teams":              "Teams",
  "/dashboard/admin/roles":              "Roles & Permissions",
  "/dashboard/admin/reporting":          "Reporting Structure",
  "/dashboard/admin/cms":                "CMS & Branding",
  "/dashboard/admin/theme":              "Theme Editor",
  "/dashboard/admin/audit-logs":         "Audit Logs",
  "/dashboard/profile":                  "My Profile",
  "/dashboard/settings":                 "Settings",
  "/dashboard/settings/security":        "Security",
};

function getPageTitle(pathname: string): string {
  // exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // prefix match (longest wins)
  let best = "";
  let bestLen = 0;
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(prefix + "/") && prefix.length > bestLen) {
      best = title;
      bestLen = prefix.length;
    }
  }
  return best || "ExterroShop";
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Header() {
  const dispatch  = useAppDispatch();
  const router    = useRouter();
  const pathname  = usePathname();
  const [query, setQuery]   = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);

  const pageTitle = getPageTitle(pathname);

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

        {/* Mobile hamburger */}
        <button
          className="lg:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle menu"
        >
          <Menu className="size-5" />
        </button>

        {/* Page title — always visible on desktop, hidden when search is open on mobile */}
        <div className={cn("flex-1 min-w-0", searchOpen && "hidden sm:block")}>
          <h2 className="text-lg font-semibold leading-none truncate">{pageTitle}</h2>
        </div>

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
        <UserDropdown />
      </div>

      {/* Mobile search bar — slides down when open */}
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
