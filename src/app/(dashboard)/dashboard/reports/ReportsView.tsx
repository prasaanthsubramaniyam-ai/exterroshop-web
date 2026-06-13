"use client";

import * as React from "react";
import {
  LayoutDashboard, Users, Sparkles, Briefcase,
  Sliders, Calendar, Download, BarChart2, User,
  CalendarRange,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { MyReportsTab }          from "./tabs/MyReportsTab";
import { ExecutiveDashboardTab } from "./tabs/ExecutiveDashboardTab";
import { WorkforceReportsTab }   from "./tabs/WorkforceReportsTab";
import { EngagementReportsTab }  from "./tabs/EngagementReportsTab";
import { BusinessReportsTab }    from "./tabs/BusinessReportsTab";
import { CustomReportBuilderTab } from "./tabs/CustomReportBuilderTab";
import { ScheduledReportsTab }   from "./tabs/ScheduledReportsTab";
import { ExportCenterTab }       from "./tabs/ExportCenterTab";

// ── Role sets ─────────────────────────────────────────────────────────────────

const EXEC_ROLES:      UserRole[] = ["HR", "CEO", "SUPER_ADMIN"];
const MANAGER_ROLES:   UserRole[] = ["MANAGER", "HR", "FINANCE", "CEO", "SUPER_ADMIN"];
const BUSINESS_ROLES:  UserRole[] = ["HR", "FINANCE", "CEO", "SUPER_ADMIN"];
const EMPLOYEE_ROLES:  UserRole[] = ["EMPLOYEE_USER", "STAFF"];

// ── Tab definitions ───────────────────────────────────────────────────────────

const ALL_TABS = [
  { id: "my",          label: "My Reports",          icon: User,            roles: EMPLOYEE_ROLES },
  { id: "executive",   label: "Executive Dashboard", icon: LayoutDashboard, roles: EXEC_ROLES     },
  { id: "workforce",   label: "Workforce Reports",   icon: Users,           roles: MANAGER_ROLES  },
  { id: "engagement",  label: "Engagement Reports",  icon: Sparkles,        roles: MANAGER_ROLES  },
  { id: "business",    label: "Business Reports",    icon: Briefcase,       roles: BUSINESS_ROLES },
  { id: "custom",      label: "Custom Reports",      icon: Sliders,         roles: MANAGER_ROLES  },
  { id: "scheduled",   label: "Scheduled Reports",   icon: Calendar,        roles: MANAGER_ROLES  },
  { id: "exports",     label: "Export Center",       icon: Download,        roles: MANAGER_ROLES  },
] as const;

type TabId = (typeof ALL_TABS)[number]["id"];

// ── Global filter context ─────────────────────────────────────────────────────

export interface GlobalFilters {
  from: string;
  to:   string;
  dept: string;
}

export const GlobalFiltersCtx = React.createContext<GlobalFilters>({
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
  to:   new Date().toISOString().slice(0, 10),
  dept: "",
});

// ── Global filter bar ─────────────────────────────────────────────────────────

function GlobalFilterBar({
  filters, onChange,
}: {
  filters: GlobalFilters;
  onChange: (f: GlobalFilters) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <CalendarRange className="size-4 shrink-0 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground">Period:</span>

      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        From
        <input
          type="date"
          value={filters.from}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
          className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-2 ring-primary/30"
        />
      </label>

      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        To
        <input
          type="date"
          value={filters.to}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
          className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-2 ring-primary/30"
        />
      </label>

      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        Dept
        <input
          type="text"
          value={filters.dept}
          onChange={(e) => onChange({ ...filters, dept: e.target.value })}
          placeholder="All departments"
          className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-2 ring-primary/30 w-36"
        />
      </label>
    </div>
  );
}

// ── Mobile tab dropdown ───────────────────────────────────────────────────────

function MobileTabSelect({
  tabs, active, onChange,
}: {
  tabs: typeof ALL_TABS[number][];
  active: TabId;
  onChange: (t: TabId) => void;
}) {
  return (
    <div className="lg:hidden">
      <select
        value={active}
        onChange={(e) => onChange(e.target.value as TabId)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:ring-2 ring-primary/30"
      >
        {tabs.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
    </div>
  );
}

// ── Sidebar tab nav ───────────────────────────────────────────────────────────

function SidebarNav({
  tabs, active, onChange,
}: {
  tabs: typeof ALL_TABS[number][];
  active: TabId;
  onChange: (t: TabId) => void;
}) {
  return (
    <nav className="hidden lg:flex flex-col gap-1 w-52 shrink-0">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-left transition-colors w-full",
            active === id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </button>
      ))}
    </nav>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function ReportsView() {
  const { user } = useAuth();
  const role = user?.role as UserRole | undefined;

  // Filter tabs by role
  const visibleTabs = React.useMemo(() =>
    ALL_TABS.filter((t) => !role || t.roles.includes(role)),
    [role]
  );

  const defaultTab = visibleTabs[0]?.id ?? "workforce";
  const [activeTab, setActiveTab] = React.useState<TabId>(defaultTab as TabId);

  // Global filters — passed via context to all tab panels
  const [filters, setFilters] = React.useState<GlobalFilters>(() => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
      to:   now.toISOString().slice(0, 10),
      dept: "",
    };
  });

  // If role changes and current tab is no longer visible, reset
  React.useEffect(() => {
    if (!visibleTabs.find((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id as TabId ?? "my");
    }
  }, [visibleTabs, activeTab]);

  const isEmployee = role ? EMPLOYEE_ROLES.includes(role) : false;

  return (
    <GlobalFiltersCtx.Provider value={filters}>
      <div className="space-y-5">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950">
            <BarChart2 className="size-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Reports &amp; Insights</h1>
            <p className="text-sm text-muted-foreground">
              {isEmployee ? "Your personal data at a glance" : "Enterprise-grade analytics and reporting center"}
            </p>
          </div>
        </div>

        {/* Global filter bar — hidden for employee self-service view */}
        {!isEmployee && (
          <GlobalFilterBar filters={filters} onChange={setFilters} />
        )}

        {/* Mobile tab select */}
        <MobileTabSelect tabs={visibleTabs as typeof ALL_TABS[number][]} active={activeTab} onChange={setActiveTab} />

        {/* Main layout: sidebar + content */}
        <div className="flex gap-6">
          <SidebarNav tabs={visibleTabs as typeof ALL_TABS[number][]} active={activeTab} onChange={setActiveTab} />

          <div className="flex-1 min-w-0">
            {activeTab === "my"         && <MyReportsTab          />}
            {activeTab === "executive"  && <ExecutiveDashboardTab />}
            {activeTab === "workforce"  && <WorkforceReportsTab   />}
            {activeTab === "engagement" && <EngagementReportsTab  />}
            {activeTab === "business"   && <BusinessReportsTab    />}
            {activeTab === "custom"     && <CustomReportBuilderTab />}
            {activeTab === "scheduled"  && <ScheduledReportsTab   />}
            {activeTab === "exports"    && <ExportCenterTab       />}
          </div>
        </div>
      </div>
    </GlobalFiltersCtx.Provider>
  );
}
