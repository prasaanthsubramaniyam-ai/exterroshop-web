"use client";

import * as React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchFavoritesThunk, toggleFavoriteThunk } from "@/store/slices/favoritesSlice";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeletonGrid } from "@/components/product/ProductCardSkeleton";

export function FavoritesView() {
  const dispatch = useAppDispatch();
  const { list, isLoading } = useAppSelector((s) => s.favorites);

  React.useEffect(() => {
    dispatch(fetchFavoritesThunk());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Favorites"
        description={`${list.length} ${list.length === 1 ? "item" : "items"} saved for later`}
      />

      {isLoading && !list.length ? (
        <ProductCardSkeletonGrid count={8} />
      ) : list.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {list.map((product: Product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite
              onFavoriteToggle={() =>
                dispatch(
                  toggleFavoriteThunk({ productId: product.id, isFavorite: true })
                )
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart className="size-6" />}
          title="No favorites yet"
          description="Tap the heart icon on any product to save it here."
          action={
            <Button asChild>
              <Link href="/dashboard/products">Discover products</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
