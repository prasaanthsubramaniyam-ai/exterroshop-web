"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Trash2,
  Edit3,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductCard } from "@/components/product/ProductCard";
import { Section } from "@/components/common/Section";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { CallRequestButton } from "@/components/callRequest/CallRequestButton";
import { chatService } from "@/services/chat.service";
import {
  formatPrice,
  formatDate,
  formatTimeAgo,
  formatKm,
  initials,
} from "@/utils/format";

interface Props {
  productId: number;
}

export function ProductDetailsView({ productId }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const {
    selected,
    list,
    fetchById,
    toggleFavorite,
    isFavorite,
    remove,
  } = useProducts();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetchById(productId)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [fetchById, productId]);

  if (loading) return <DetailsSkeleton />;
  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <h2 className="text-lg font-semibold">Product not found</h2>
        <Button asChild variant="outline">
          <Link href="/dashboard/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  const product = selected;
  const fav = isFavorite(product.id);
  const isOwner = user?.id === product.seller.id;

  const related = list
    .filter(
      (p) => p.category === product.category && p.id !== product.id
    )
    .slice(0, 4);

  const onShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `${product.title} — ${formatPrice(product.price)} on ExterroShop`,
          url: typeof window !== "undefined" ? window.location.href : "",
        });
        return;
      } catch {
        /* user cancelled */
      }
    }
    if (typeof window !== "undefined") {
      await navigator.clipboard?.writeText(window.location.href);
      dispatch(pushToast({ title: "Link copied", variant: "success" }));
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await remove(product.id);
      dispatch(pushToast({ title: "Product deleted", variant: "success" }));
      router.replace("/dashboard/my-products");
    } catch (err) {
      dispatch(
        pushToast({
          title: "Delete failed",
          description: (err as Error).message,
          variant: "destructive",
        })
      );
    }
  };

  return (
    <div className="space-y-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <ProductGallery images={product.images} title={product.title} />

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{product.category}</Badge>
              <Badge variant="secondary">{product.condition}</Badge>
              {product.status !== "active" ? (
                <Badge variant="warning">{product.status}</Badge>
              ) : null}
            </div>
            <h1 className="text-display-sm font-semibold leading-tight tracking-tight">
              {product.title}
            </h1>
            <div className="flex items-baseline gap-3">
              <p className="text-display-xs font-semibold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-lg border border-border/60 bg-surface/50 p-4">
            <Stat icon={<Heart className="size-4" />} label="Saved" value={product.favoriteCount} />
            <Stat icon={<Eye className="size-4" />} label="Views" value={product.viewCount} />
            <Stat icon={<MapPin className="size-4" />} label="Office" value={product.location} />
          </div>

          {/* Seller */}
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4">
            <Avatar className="size-12">
              {product.seller.avatarUrl ? (
                <AvatarImage src={product.seller.avatarUrl} alt={product.seller.name} />
              ) : null}
              <AvatarFallback>{initials(product.seller.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {product.seller.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {product.seller.department ?? "Employee"} · {product.seller.location}
              </p>
            </div>
            <Badge variant="success" className="hidden sm:inline-flex">
              <ShieldCheck className="mr-1 size-3" />
              Verified
            </Badge>
          </div>

          {/* Specs */}
          {(product.brand || product.model || product.year || product.kmDriven || product.fuelType) ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {product.brand ? <Spec label="Brand" value={product.brand} /> : null}
              {product.model ? <Spec label="Model" value={product.model} /> : null}
              {product.year ? <Spec label="Year" value={String(product.year)} /> : null}
              {product.fuelType ? <Spec label="Fuel" value={product.fuelType} /> : null}
              {product.kmDriven != null ? (
                <Spec label="Driven" value={formatKm(product.kmDriven)} />
              ) : null}
              <Spec label="Listed" value={formatDate(product.createdAt)} />
            </div>
          ) : null}

          {/* Actions */}
          {isOwner ? (
            <div className="flex flex-wrap gap-2">
              <Button asChild className="flex-1 sm:flex-none">
                <Link href={`/dashboard/products/${product.id}/edit`}>
                  <Edit3 />
                  Edit listing
                </Link>
              </Button>
              <Button variant="outline" onClick={onShare}>
                <Share2 />
                Share
              </Button>
              <Button variant="outline" onClick={onDelete} className="text-destructive hover:bg-destructive/5">
                <Trash2 />
                Delete
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <CallRequestButton
                    productId={product.id}
                    sellerId={product.seller.id}
                    currentUserId={user?.id}
                  />
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={async () => {
                    try {
                      const conv = await chatService.getOrCreateConversation(product.id);
                      router.push(`/dashboard/chat/${conv.id}`);
                    } catch { dispatch(pushToast({ title: "Could not open chat", variant: "destructive" })); }
                  }}
                >
                  <MessageCircle className="size-4" />
                  Message
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => toggleFavorite(product.id).catch(() => undefined)}
                  aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={fav ? "fill-primary text-primary" : ""} />
                </Button>
                <Button size="lg" variant="outline" className="flex-1" onClick={onShare} aria-label="Share">
                  <Share2 />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <section className="rounded-lg border border-border/60 bg-card p-6 shadow-card">
        <h2 className="text-base font-semibold">Description</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Posted {formatTimeAgo(product.createdAt)} · Last updated {formatTimeAgo(product.updatedAt)}
        </p>
      </section>

      {related.length ? (
        <Section title="Related products" href={`/dashboard/products?category=${product.category}`}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isFavorite={isFavorite(p.id)}
                onFavoriteToggle={() => toggleFavorite(p.id).catch(() => undefined)}
              />
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="text-center">
      <span className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
        {icon}
        {label}
      </span>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
