"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeletonGrid } from "@/components/product/ProductCardSkeleton";

export function SearchView() {
  const search = useSearchParams();
  const q = search.get("q") ?? "";

  const { list, isLoading, fetchAll, toggleFavorite, isFavorite } = useProducts();

  React.useEffect(() => {
    if (q.trim()) fetchAll({ search: q.trim() }).catch(() => undefined);
  }, [fetchAll, q]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={q ? `Results for “${q}”` : "Search"}
        description={
          q
            ? `${list.length} ${list.length === 1 ? "item" : "items"} found`
            : "Type in the search bar above to find products."
        }
      />

      {!q ? (
        <EmptyState
          title="Start typing to search"
          description="Try a brand, model, category or location."
        />
      ) : isLoading && !list.length ? (
        <ProductCardSkeletonGrid count={8} />
      ) : list.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
          title="No matches"
          description={`We couldn't find anything for "${q}".`}
        />
      )}
    </div>
  );
}
