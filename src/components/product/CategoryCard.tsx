"use client";

import Image from "next/image";
import Link from "next/link";
import type { CategoryConfig } from "@/constants";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: CategoryConfig;
  variant?: "tile" | "compact";
}

export function CategoryCard({ category, variant = "tile" }: CategoryCardProps) {
  const href = `/dashboard/products?category=${encodeURIComponent(category.value)}`;

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className="group flex flex-col items-center gap-2 rounded-md p-2 transition-all hover:bg-surface"
      >
        <div
          className="flex size-14 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: category.color }}
        >
          <Image src={category.image} alt={category.label} width={32} height={32} />
        </div>
        <span className="text-xs font-medium text-foreground">{category.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-card p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
      )}
    >
      <div
        className="flex size-16 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: category.color }}
      >
        <Image src={category.image} alt={category.label} width={36} height={36} />
      </div>
      <span className="text-sm font-medium text-foreground">{category.label}</span>
    </Link>
  );
}
