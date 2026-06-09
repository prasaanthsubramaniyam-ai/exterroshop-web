"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeletonGrid } from "@/components/product/ProductCardSkeleton";
import type { PurchasedProduct } from "@/types";
import { cn } from "@/lib/utils";

// ── Call-request status UI ────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: CheckCircle2,
    className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400",
  },
} as const;

function PurchaseStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        cfg.className
      )}
    >
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}

// ── Purchases tab ─────────────────────────────────────────────────────────────

function PurchasesTab({ items }: { items: PurchasedProduct[] }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-6" />}
        title="No purchases yet"
        description="When you send a call request on a product, it appears here with its status."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/products">Browse marketplace</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map(({ product, callRequestStatus }) => (
        <Link
          key={product.id}
          href={`/dashboard/products/${product.id}`}
          className="group flex items-center gap-4 rounded-lg border border-border/60 bg-card p-4 shadow-card transition-all hover:shadow-card-hover"
        >
          {/* Thumbnail */}
          <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-surface">
            {product.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images.find((i) => i.isPrimary)?.thumbnailUrl ?? product.images[0].thumbnailUrl}
                alt={product.title}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-surface">
                <Package className="size-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-semibold text-foreground">
              {product.title}
            </p>
            <p className="mt-0.5 text-base font-semibold text-primary">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Seller: {product.seller?.name ?? "—"} · {product.location}
            </p>
          </div>

          {/* Status */}
          <PurchaseStatusBadge status={callRequestStatus} />
        </Link>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Tab = "listings" | "purchases";

export function MyProductsView() {
  const { mine, purchased, isMyLoading, fetchMine, fetchPurchased } = useProducts();
  const [activeTab, setActiveTab] = React.useState<Tab>("listings");

  React.useEffect(() => {
    fetchMine().catch(() => undefined);
    fetchPurchased().catch(() => undefined);
  }, [fetchMine, fetchPurchased]);

  const grouped = React.useMemo(
    () => ({
      active:   mine.filter((p) => p.status === "active"),
      sold:     mine.filter((p) => p.status === "sold"),
      inactive: mine.filter((p) => p.status === "inactive"),
    }),
    [mine]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Marketplace"
        description="Your listings and purchases in one place"
        actions={
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus />
              New listing
            </Link>
          </Button>
        }
      />

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border border-border/60 bg-surface p-1 sm:max-w-xs">
        <TabButton
          active={activeTab === "listings"}
          count={mine.length}
          icon={<Package className="size-4" />}
          label="My Listings"
          onClick={() => setActiveTab("listings")}
        />
        <TabButton
          active={activeTab === "purchases"}
          count={purchased.length}
          icon={<ShoppingBag className="size-4" />}
          label="Purchases"
          onClick={() => setActiveTab("purchases")}
        />
      </div>

      {/* ── Listings tab ── */}
      {activeTab === "listings" && (
        <>
          <div className="grid grid-cols-3 gap-3 sm:max-w-md">
            <StatCard label="Active"   value={grouped.active.length} />
            <StatCard label="Sold"     value={grouped.sold.length} />
            <StatCard label="Inactive" value={grouped.inactive.length} />
          </div>

          {isMyLoading && !mine.length ? (
            <ProductCardSkeletonGrid count={6} />
          ) : mine.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {mine.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Package className="size-6" />}
              title="You haven't listed anything yet"
              description="List your first item and reach Exterro employees."
              action={
                <Button asChild>
                  <Link href="/dashboard/products/new">List an item</Link>
                </Button>
              }
            />
          )}
        </>
      )}

      {/* ── Purchases tab ── */}
      {activeTab === "purchases" && (
        isMyLoading && !purchased.length ? (
          <ProductCardSkeletonGrid count={4} />
        ) : (
          <PurchasesTab items={purchased} />
        )
      )}
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function TabButton({
  active,
  count,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
      {count > 0 && (
        <Badge
          variant={active ? "default" : "secondary"}
          className="ml-0.5 h-5 min-w-5 rounded-full px-1.5 text-[10px]"
        >
          {count}
        </Badge>
      )}
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border/60 bg-card p-4 shadow-card">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
