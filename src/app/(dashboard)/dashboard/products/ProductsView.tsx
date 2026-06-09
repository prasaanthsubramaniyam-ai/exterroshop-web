"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  OFFICE_LOCATIONS,
} from "@/constants";
import type { ProductFilters } from "@/types";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeletonGrid } from "@/components/product/ProductCardSkeleton";

const SORT_OPTIONS = [
  { label: "Newest first", value: "createdAt:desc" },
  { label: "Oldest first", value: "createdAt:asc" },
  { label: "Price: low → high", value: "price:asc" },
  { label: "Price: high → low", value: "price:desc" },
  { label: "Most viewed", value: "views:desc" },
];

const filtersFromSearch = (search: URLSearchParams): ProductFilters => ({
  category: (search.get("category") as ProductFilters["category"]) ?? undefined,
  location: (search.get("location") as ProductFilters["location"]) ?? undefined,
  condition:
    (search.get("condition") as ProductFilters["condition"]) ?? undefined,
  minPrice: search.get("minPrice") ? Number(search.get("minPrice")) : undefined,
  maxPrice: search.get("maxPrice") ? Number(search.get("maxPrice")) : undefined,
  search: search.get("q") ?? undefined,
  sortBy:
    (search.get("sortBy") as ProductFilters["sortBy"]) ?? "createdAt",
  sortOrder:
    (search.get("sortOrder") as ProductFilters["sortOrder"]) ?? "desc",
});

export function ProductsView() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = React.useMemo(() => filtersFromSearch(search), [search]);

  const { list, isLoading, fetchAll, toggleFavorite, isFavorite, pagination } =
    useProducts();

  React.useEffect(() => {
    fetchAll(filters).catch(() => undefined);
  }, [fetchAll, filters]);

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(search.toString());
    if (value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const sortValue = `${filters.sortBy ?? "createdAt"}:${filters.sortOrder ?? "desc"}`;

  const onSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split(":");
    const params = new URLSearchParams(search.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => router.replace(pathname, { scroll: false });

  const activeChips = [
    filters.category && { label: filters.category, key: "category" },
    filters.location && { label: filters.location, key: "location" },
    filters.condition && { label: filters.condition, key: "condition" },
    filters.search && { label: `"${filters.search}"`, key: "q" },
  ].filter(Boolean) as { label: string; key: string }[];

  return (
    <div className="space-y-6">
      <PageHeader
        title={filters.category ? filters.category : "All products"}
        description={`${pagination.total || list.length} items available`}
        actions={
          <Select
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-56"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <FiltersPanel filters={filters} onChange={updateFilter} onClear={clearAll} />

        <div className="space-y-4">
          {activeChips.length ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Filters:
              </span>
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => updateFilter(chip.key, undefined)}
                  className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-border"
                >
                  {chip.label}
                  <X className="size-3" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-medium text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          ) : null}

          {isLoading && !list.length ? (
            <ProductCardSkeletonGrid count={12} />
          ) : list.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavorite={isFavorite(p.id)}
                  onFavoriteToggle={() => toggleFavorite(p.id).catch(() => undefined)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No products match your filters"
              description="Try removing a filter or broadening your search."
              action={
                <Button variant="outline" onClick={clearAll}>
                  Clear all filters
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface FiltersPanelProps {
  filters: ProductFilters;
  onChange: (key: string, value: string | undefined) => void;
  onClear: () => void;
}

function FiltersPanel({ filters, onChange, onClear }: FiltersPanelProps) {
  return (
    <aside className="space-y-5 rounded-lg border border-border/60 bg-card p-5 shadow-card lg:sticky lg:top-20 lg:self-start">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="size-4" />
          Filters
        </p>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-primary hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Category</p>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_CATEGORIES.map((c) => {
            const active = filters.category === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() =>
                  onChange("category", active ? undefined : c.value)
                }
              >
                <Badge variant={active ? "default" : "secondary"}>
                  {c.label}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Location</p>
        <Select
          value={filters.location ?? ""}
          onChange={(e) => onChange("location", e.target.value || undefined)}
        >
          <option value="">All offices</option>
          {OFFICE_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Condition</p>
        <Select
          value={filters.condition ?? ""}
          onChange={(e) => onChange("condition", e.target.value || undefined)}
        >
          <option value="">Any condition</option>
          {PRODUCT_CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Price</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) => onChange("minPrice", e.target.value || undefined)}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) => onChange("maxPrice", e.target.value || undefined)}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </aside>
  );
}
