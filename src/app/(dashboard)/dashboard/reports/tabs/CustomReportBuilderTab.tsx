"use client";

import * as React from "react";
import { Plus, X, GripVertical, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { reportsInsightsService } from "@/services/reports-insights.service";

// Available fields per report source
const REPORT_SOURCES: Record<string, string[]> = {
  "employees/master":    ["Name","Email","Role","Department","Designation","Location","Employee Code","Joining Date","Active","Gender"],
  "attendance/daily":    ["Employee","Department","Date","Check In","Check Out","Status","Work Mode","Duration","Late","Early Logout"],
  "leave/balance":       ["Employee","Department","Leave Type","Total Days","Used Days","Remaining Days"],
  "engagement/sports":   ["Event Name","Date","Status","Registrations","Capacity","Fill Rate"],
  "business/marketplace":["Category","Total Listings","Active","Sold","Listed Value","Sold Value"],
};

const SORT_DIRECTIONS = ["ASC","DESC"];

interface Filter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface SortRule {
  id: string;
  field: string;
  dir: "ASC" | "DESC";
}

export function CustomReportBuilderTab() {
  const [source, setSource]       = React.useState<string>("employees/master");
  const [selectedFields, setSelectedFields] = React.useState<string[]>([]);
  const [filters, setFilters]     = React.useState<Filter[]>([]);
  const [sorts, setSorts]         = React.useState<SortRule[]>([]);
  const [format, setFormat]       = React.useState<"XLSX"|"CSV"|"PDF">("XLSX");
  const [exporting, setExporting] = React.useState(false);
  const [done, setDone]           = React.useState(false);

  const allFields = REPORT_SOURCES[source] ?? [];

  function toggleField(f: string) {
    setSelectedFields(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  }

  function addFilter() {
    setFilters(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      field: allFields[0] ?? "",
      operator: "equals",
      value: "",
    }]);
  }

  function removeFilter(id: string) {
    setFilters(prev => prev.filter(f => f.id !== id));
  }

  function updateFilter(id: string, key: keyof Omit<Filter,"id">, val: string) {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f));
  }

  function addSort() {
    setSorts(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      field: allFields[0] ?? "",
      dir: "ASC",
    }]);
  }

  async function handleExport() {
    setExporting(true);
    setDone(false);
    try {
      const filterMap: Record<string, unknown> = {};
      filters.forEach(f => { filterMap[f.field] = f.value; });
      if (selectedFields.length > 0) filterMap["fields"] = selectedFields;

      await reportsInsightsService.createExport({
        reportType: source,
        exportFormat: format,
        filters: filterMap,
      });
      setDone(true);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left panel — builder */}
      <div className="lg:col-span-2 space-y-5">

        {/* Report source */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <h3 className="text-sm font-semibold mb-3">Report Source</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(REPORT_SOURCES).map(s => (
              <button
                key={s}
                onClick={() => { setSource(s); setSelectedFields([]); setFilters([]); setSorts([]); }}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
                  source === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted"
                )}
              >
                {s.split("/").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" — ")}
              </button>
            ))}
          </div>
        </div>

        {/* Field selector */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Select Fields</h3>
            <button
              onClick={() => setSelectedFields(selectedFields.length === allFields.length ? [] : [...allFields])}
              className="text-xs text-primary font-medium hover:underline"
            >
              {selectedFields.length === allFields.length ? "Deselect all" : "Select all"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {allFields.map(f => (
              <button
                key={f}
                onClick={() => toggleField(f)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  selectedFields.includes(f)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          {selectedFields.length > 0 && (
            <p className="mt-2 text-[11px] text-muted-foreground">{selectedFields.length} of {allFields.length} fields selected</p>
          )}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Filters</h3>
            <button onClick={addFilter} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
              <Plus className="size-3" /> Add filter
            </button>
          </div>
          {filters.length === 0 ? (
            <p className="text-xs text-muted-foreground">No filters applied — report will include all data.</p>
          ) : (
            <div className="space-y-2">
              {filters.map(f => (
                <div key={f.id} className="flex items-center gap-2">
                  <select
                    value={f.field}
                    onChange={e => updateFilter(f.id, "field", e.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 ring-primary/30"
                  >
                    {allFields.map(field => <option key={field} value={field}>{field}</option>)}
                  </select>
                  <select
                    value={f.operator}
                    onChange={e => updateFilter(f.id, "operator", e.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 ring-primary/30"
                  >
                    {["equals","contains","starts with","greater than","less than"].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <input
                    value={f.value}
                    onChange={e => updateFilter(f.id, "value", e.target.value)}
                    placeholder="Value"
                    className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:ring-2 ring-primary/30"
                  />
                  <button onClick={() => removeFilter(f.id)} className="text-muted-foreground hover:text-destructive">
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Sort By</h3>
            <button onClick={addSort} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
              <Plus className="size-3" /> Add sort
            </button>
          </div>
          {sorts.length === 0 ? (
            <p className="text-xs text-muted-foreground">No sort rules — default order will apply.</p>
          ) : (
            <div className="space-y-2">
              {sorts.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <GripVertical className="size-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                  <select
                    value={s.field}
                    onChange={e => setSorts(prev => prev.map(r => r.id === s.id ? { ...r, field: e.target.value } : r))}
                    className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none"
                  >
                    {allFields.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select
                    value={s.dir}
                    onChange={e => setSorts(prev => prev.map(r => r.id === s.id ? { ...r, dir: e.target.value as "ASC"|"DESC" } : r))}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none"
                  >
                    {SORT_DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <button
                    onClick={() => setSorts(prev => prev.filter(r => r.id !== s.id))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel — export */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-background p-5 space-y-4 sticky top-4">
          <h3 className="text-sm font-semibold">Export Options</h3>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Format</label>
            <div className="flex gap-2">
              {(["XLSX","CSV","PDF"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    "flex-1 rounded-xl border py-2 text-xs font-bold transition-colors",
                    format === f
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Source</span>
              <span className="font-medium text-foreground">{source}</span>
            </div>
            <div className="flex justify-between">
              <span>Fields</span>
              <span className="font-medium text-foreground">
                {selectedFields.length > 0 ? `${selectedFields.length} selected` : "All fields"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Filters</span>
              <span className="font-medium text-foreground">{filters.length} active</span>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Download className={cn("size-4", exporting && "animate-bounce")} />
            {exporting ? "Generating…" : `Export as ${format}`}
          </button>

          {done && (
            <p className="text-xs text-emerald-600 text-center font-medium">
              ✓ Export queued — check Export Center tab
            </p>
          )}

          <p className="text-[11px] text-muted-foreground text-center">
            Exports are processed in the background.<br />
            Download from the Export Center tab.
          </p>
        </div>
      </div>
    </div>
  );
}
