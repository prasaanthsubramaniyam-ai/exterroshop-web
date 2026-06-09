"use client";

import * as React from "react";
import {
  BookUser, Search, SlidersHorizontal,
  Loader2, X, LayoutGrid, List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDirectory } from "@/hooks/useDirectory";
import { EmployeeCard }   from "@/components/ems/directory/EmployeeCard";
import { EmployeeDrawer } from "@/components/ems/directory/EmployeeDrawer";
import type { Employee }  from "@/services/directory.service";

// ── Constants ──────────────────────────────────────────────────────────────

const LOCATIONS = ["Chennai", "Coimbatore", "Bangalore"] as const;

const ALL_ROLES: { value: string; label: string }[] = [
  { value: "EMPLOYEE_USER", label: "Employee"    },
  { value: "MANAGER",       label: "Manager"     },
  { value: "HR",            label: "HR"          },
  { value: "FINANCE",       label: "Finance"     },
  { value: "IT_ADMIN",      label: "IT Admin"    },
  { value: "STAFF",         label: "Beauty Staff"},
  { value: "SUPER_ADMIN",   label: "Super Admin" },
];

// ── Component ──────────────────────────────────────────────────────────────

export function DirectoryView() {
  const { employees, departments, loading, fetch } = useDirectory();

  const [query,       setQuery]       = React.useState("");
  const [location,    setLocation]    = React.useState("");
  const [department,  setDepartment]  = React.useState("");
  const [role,        setRole]        = React.useState("");
  const [viewMode,    setViewMode]    = React.useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = React.useState(false);
  const [selected,    setSelected]    = React.useState<Employee | null>(null);

  // Debounce fetch
  React.useEffect(() => {
    const id = setTimeout(() => {
      fetch({
        search:     query      || undefined,
        location:   location   || undefined,
        department: department || undefined,
        role:       role       || undefined,
      });
    }, 300);
    return () => clearTimeout(id);
  }, [query, location, department, role, fetch]);

  const clearFilters = () => { setQuery(""); setLocation(""); setDepartment(""); setRole(""); };
  const hasFilters   = !!(query || location || department || role);
  const activeCount  = (location ? 1 : 0) + (department ? 1 : 0) + (role ? 1 : 0);

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-950">
              <BookUser className="size-5 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Employee Directory</h1>
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Loading…"
                  : hasFilters
                  ? `${employees.length} result${employees.length !== 1 ? "s" : ""} found`
                  : `${employees.length} employee${employees.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, role, department…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-muted">
                <X className="size-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-sm font-medium transition-colors",
              showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted",
            )}
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeCount > 0 && (
              <span className={cn(
                "absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full text-[10px] font-bold",
                showFilters ? "bg-white text-primary" : "bg-primary text-primary-foreground",
              )}>
                {activeCount}
              </span>
            )}
          </button>

          {/* View mode */}
          <div className="flex overflow-hidden rounded-xl border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("px-3 py-2.5 transition-colors", viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}
              title="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("border-l border-border px-3 py-2.5 transition-colors", viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}
              title="List view"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
            {/* Role */}
            <div>
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Role</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_ROLES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setRole(role === value ? "" : value)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      role === value
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background hover:bg-muted",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Location</p>
              <div className="flex flex-wrap gap-1.5">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocation(location === loc ? "" : loc)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      location === loc
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background hover:bg-muted",
                    )}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Department */}
            {departments.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Department</p>
                <div className="flex flex-wrap gap-1.5">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setDepartment(department === dept ? "" : dept)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        department === dept
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-background hover:bg-muted",
                      )}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasFilters && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3" /> Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active filter chips (when panel is collapsed) */}
        {hasFilters && !showFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {query && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                &ldquo;{query}&rdquo;
                <button onClick={() => setQuery("")}><X className="size-3" /></button>
              </span>
            )}
            {role && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {ALL_ROLES.find((r) => r.value === role)?.label ?? role}
                <button onClick={() => setRole("")}><X className="size-3" /></button>
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {location}
                <button onClick={() => setLocation("")}><X className="size-3" /></button>
              </span>
            )}
            {department && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {department}
                <button onClick={() => setDepartment("")}><X className="size-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
            <BookUser className="size-10 text-muted-foreground/40" />
            <p className="text-base font-semibold">No employees found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {employees.map((emp) => (
              <EmployeeCard key={emp.id} emp={emp} layout="card" onClick={setSelected} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {employees.map((emp) => (
              <EmployeeCard key={emp.id} emp={emp} layout="row" onClick={setSelected} />
            ))}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <EmployeeDrawer emp={selected} onClose={() => setSelected(null)} />
    </>
  );
}
