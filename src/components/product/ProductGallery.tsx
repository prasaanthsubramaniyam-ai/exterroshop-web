"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/types";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
}

const PLACEHOLDER =
  "https://placehold.co/800x800/EAEAEA/7A7A7A?text=No+Image";

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const safeImages =
    images && images.length > 0
      ? images
      : ([
          {
            id: 0,
            url: PLACEHOLDER,
            thumbnailUrl: PLACEHOLDER,
            isPrimary: true,
            sortOrder: 0,
          },
        ] as ProductImage[]);

  const [active, setActive] = React.useState(0);

  const prev = () =>
    setActive((i) => (i - 1 + safeImages.length) % safeImages.length);
  const next = () => setActive((i) => (i + 1) % safeImages.length);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-surface">
        <Image
          src={safeImages[active].url || safeImages[active].thumbnailUrl}
          alt={`${title} — image ${active + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 600px"
          priority
          className="object-cover"
        />
        {safeImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-card backdrop-blur transition-colors hover:bg-background"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-card backdrop-blur transition-colors hover:bg-background"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}
      </div>

      {safeImages.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {safeImages.map((img, i) => (
            <button
              key={img.id ?? i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-md border-2 bg-surface transition-all",
                i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              )}
              aria-label={`Show image ${i + 1}`}
            >
              <Image
                src={img.thumbnailUrl || img.url}
                alt={`Thumbnail ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
