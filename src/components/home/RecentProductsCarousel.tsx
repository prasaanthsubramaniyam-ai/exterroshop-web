"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, formatTimeAgo } from "@/utils/format";
import { cn } from "@/lib/utils";

interface Props {
  products: Product[];
  interval?: number;
}

const PLACEHOLDER = "/placeholder.svg";
const AUTO_INTERVAL = 3500;

export function RecentProductsCarousel({ products, interval = AUTO_INTERVAL }: Props) {
  const [current, setCurrent] = React.useState(0);
  const [paused,  setPaused]  = React.useState(false);
  const [animDir, setAnimDir] = React.useState<"left" | "right">("left");
  const [visible, setVisible] = React.useState(true);
  const total = products.length;

  const goTo = React.useCallback(
    (index: number, direction: "left" | "right") => {
      setAnimDir(direction);
      setVisible(false);
      setTimeout(() => {
        setCurrent((index + total) % total);
        setVisible(true);
      }, 160);
    },
    [total]
  );

  const prev = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); goTo(current - 1, "right"); };
  const next = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); goTo(current + 1, "left"); };

  const currentRef = React.useRef(current);
  React.useEffect(() => { currentRef.current = current; }, [current]);

  React.useEffect(() => {
    if (paused || total <= 1) return;
    const id = setInterval(() => { goTo(currentRef.current + 1, "left"); }, interval);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, total, interval]);

  if (!total) return null;

  const product = products[current];
  const primary = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
  const src     = primary?.thumbnailUrl || primary?.url || PLACEHOLDER;

  return (
    <div
      data-testid="recent-carousel"
      className="w-full select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Header: label · dots · counter ── */}
      <div className="mb-2.5 flex items-center justify-between px-0.5">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">
          <span className="size-1.5 rounded-full bg-white/55 inline-block" />
          Just Added
        </span>

        <div className="flex items-center gap-2">
          {/* Pill dots */}
          <div className="flex items-center gap-[3px]">
            {products.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i, i > current ? "left" : "right")}
                aria-label={`Go to product ${i + 1}`}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === current
                    ? "w-4 h-[5px] bg-white"
                    : "w-[5px] h-[5px] bg-white/25 hover:bg-white/50"
                )}
              />
            ))}
          </div>
          <span className="tabular-nums text-[10px] text-white/40">
            {current + 1}<span className="mx-0.5 text-white/25">/</span>{total}
          </span>
        </div>
      </div>

      {/* ── Card row: [←] [card] [→] ── */}
      <div className="flex items-center gap-2">

        {/* Prev arrow */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous product"
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/10 transition-all hover:bg-white/20 hover:ring-white/20 active:scale-95"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        {/* Product card */}
        <Link href={`/dashboard/products/${product.id}`} className="min-w-0 flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-xl shadow-black/20",
              visible
                ? "opacity-100 translate-x-0"
                : animDir === "left"
                ? "opacity-0 -translate-x-3"
                : "opacity-0 translate-x-3"
            )}
            style={{ transition: "opacity 160ms ease, transform 160ms ease" }}
          >
            {/* Thumbnail */}
            <div className="relative size-[72px] shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={src}
                alt={product.title}
                fill
                sizes="72px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              {product.condition === "New" && (
                <span className="absolute left-1 top-1 rounded bg-gray-900/80 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white leading-none">
                  New
                </span>
              )}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-[13px] font-semibold leading-snug text-gray-900">
                {product.title}
              </p>
              <p className="mt-0.5 text-sm font-bold text-primary leading-none">
                {formatPrice(product.price)}
              </p>
              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
                <MapPin className="size-2.5 shrink-0" />
                <span className="truncate">{product.location}</span>
                <span className="shrink-0 text-gray-300">·</span>
                <Clock className="size-2.5 shrink-0" />
                <span className="shrink-0">{formatTimeAgo(product.createdAt)}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Next arrow */}
        <button
          type="button"
          onClick={next}
          aria-label="Next product"
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/10 transition-all hover:bg-white/20 hover:ring-white/20 active:scale-95"
        >
          <ChevronRight className="size-3.5" />
        </button>

      </div>
    </div>
  );
}

/* ── Skeleton ── */
export function RecentProductsCarouselSkeleton() {
  return (
    <div className="w-full">
      <div className="mb-2.5 h-3 w-20 rounded-full bg-white/10" />
      <div className="flex items-center gap-2">
        <div className="size-7 shrink-0 rounded-full bg-white/10" />
        <div className="flex flex-1 items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5">
          <div className="size-[72px] shrink-0 rounded-lg bg-white/10 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-4/5 rounded bg-white/10 animate-pulse" />
            <div className="h-4 w-2/5 rounded bg-white/15 animate-pulse" />
            <div className="h-2.5 w-3/5 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
        <div className="size-7 shrink-0 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
