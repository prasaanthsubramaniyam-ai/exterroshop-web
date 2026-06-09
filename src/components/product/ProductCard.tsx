"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { formatPrice, formatTimeAgo } from "@/utils/format";
import { useCms } from "@/context/CmsContext";

interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: number) => void;
  layout?: "vertical" | "horizontal";
  className?: string;
}

const PLACEHOLDER = "/placeholder.svg";

export function ProductCard({
  product,
  isFavorite,
  onFavoriteToggle,
  layout = "vertical",
  className,
}: ProductCardProps) {
  const { cms } = useCms();
  const cardShadow     = cms("theme.card-shadow", "");
  const btnEnabled     = cms("product.card.button.enabled", "false") === "true";
  const btnLabel       = cms("product.card.button.label", "View Details");

  const primary = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
  const src = primary?.thumbnailUrl || primary?.url || PLACEHOLDER;

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(product.id);
  };

  if (layout === "horizontal") {
    return (
      <Link
        href={`/dashboard/products/${product.id}`}
        className={cn(
          "group flex items-center gap-4 rounded-lg border border-border/60 bg-card p-3 transition-all hover:shadow-card-hover",
          className
        )}
      >
        <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-surface">
          <Image
            src={src}
            alt={product.title}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground">
            {product.title}
          </h3>
          <p className="mt-1 text-base font-semibold text-foreground">
            {formatPrice(product.price)}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            <span>{product.location}</span>
            <span>·</span>
            <span>{formatTimeAgo(product.createdAt)}</span>
          </div>
        </div>
        {onFavoriteToggle ? (
          <button
            type="button"
            onClick={handleFav}
            className="rounded-full p-2 transition-colors hover:bg-surface"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn(
                "size-5 transition-colors",
                isFavorite ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </button>
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      href={`/dashboard/products/${product.id}`}
      className={cn(
        "group block overflow-hidden rounded-lg border border-border/60 bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover",
        className
      )}
      style={cardShadow ? { boxShadow: cardShadow } : undefined}
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        <Image
          src={src}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {onFavoriteToggle ? (
          <button
            type="button"
            onClick={handleFav}
            className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-background/90 shadow-card backdrop-blur transition-colors hover:bg-background"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                isFavorite ? "fill-primary text-primary" : "text-foreground"
              )}
            />
          </button>
        ) : null}
        {product.condition === "New" ? (
          <span className="absolute left-3 top-3 rounded-full bg-foreground/85 px-2.5 py-1 text-xs font-medium text-background backdrop-blur">
            New
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">
          {product.title}
        </h3>
        <p className="mt-1.5 text-lg font-semibold text-foreground">
          {formatPrice(product.price)}
        </p>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          <span>{product.location}</span>
          <span>·</span>
          <span>{formatTimeAgo(product.createdAt)}</span>
        </div>
        {btnEnabled && (
          <div className="mt-3 border-t border-border/60 pt-3">
            <span className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity group-hover:opacity-90">
              {btnLabel}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
