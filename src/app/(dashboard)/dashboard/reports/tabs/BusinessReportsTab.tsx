"use client";

import * as React from "react";
import { ShoppingBag, Scissors, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { reportsInsightsService, type MarketplaceReport } from "@/services/reports-insights.service";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 text-center">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs font-medium mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function HBar({ label, value, max, colorClass }: { label: string; value: number; max: number; colorClass: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 truncate text-xs font-medium text-right">{label}</span>
      <div className="flex-1 h-3.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all duration-500", colorClass)}
          style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <span className="w-8 shrink-0 text-xs font-bold tabular-nums text-right">{value}</span>
    </div>
  );
}

function MarketplaceSection() {
  const [data, setData]     = React.useState<MarketplaceReport | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    reportsInsightsService.getMarketplaceReport()
      .then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  if (!data) return <p className="text-sm text-muted-foreground py-4 text-center">No marketplace data available</p>;

  const maxCat = Math.max(...Object.values(data.byCategory), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Listings"   value={data.totalListings}     />
        <StatCard label="Active Listings"  value={data.activeListings}    sub={`₹${Number(data.totalListedValue).toLocaleString()} listed`} />
        <StatCard label="Sold"             value={data.soldListings}      sub={`₹${Number(data.totalSoldValue).toLocaleString()} sold`} />
        <StatCard label="Call Requests"    value={data.totalCallRequests} />
      </div>

      <div className="rounded-2xl border border-border bg-background p-5">
        <h3 className="text-sm font-semibold mb-4">By Category</h3>
        <div className="space-y-2.5">
          {Object.entries(data.byCategory).sort(([,a],[,b]) => b - a).map(([cat, count]) => (
            <HBar key={cat} label={cat} value={count} max={maxCat} colorClass="bg-blue-500" />
          ))}
        </div>
      </div>
    </div>
  );
}

function BeautyServicesSection() {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center">
      <Scissors className="size-8 text-muted-foreground/40 mx-auto mb-3" />
      <p className="text-sm font-semibold">Beauty Services Analytics</p>
      <p className="text-xs text-muted-foreground mt-1">
        Connect a wellness booking data source to see booking analytics,<br />
        revenue by service, and staff utilisation here.
      </p>
    </div>
  );
}

export function BusinessReportsTab() {
  const [section, setSection] = React.useState<"marketplace" | "beauty">("marketplace");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {([["marketplace","Marketplace",ShoppingBag],["beauty","Beauty Services",Scissors]] as const).map(([k,l,Icon]) => (
          <button
            key={k}
            onClick={() => setSection(k as typeof section)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
              section === k
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-muted",
            )}
          >
            <Icon className="size-4" />
            {l}
          </button>
        ))}
      </div>

      {section === "marketplace" ? <MarketplaceSection /> : <BeautyServicesSection />}
    </div>
  );
}
