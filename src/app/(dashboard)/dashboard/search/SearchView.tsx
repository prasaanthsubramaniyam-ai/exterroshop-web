"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeletonGrid } from "@/components/product/ProductCardSkeleton";
import { directoryService, type Employee } from "@/services/directory.service";
import { announcementService } from "@/services/announcement.service";
import type { Announcement } from "@/types";
import { cn } from "@/lib/utils";
import { Users, ShoppingBag, Megaphone } from "lucide-react";

type Tab = "products" | "people" | "announcements";

function EmployeeChip({ emp }: { emp: Employee }) {
  return (
    <Link href="/dashboard/directory"
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:border-primary/40 hover:bg-muted/30 transition-colors">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold uppercase">
        {emp.name.slice(0, 2)}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{emp.name}</p>
        <p className="text-xs text-muted-foreground truncate">{emp.jobTitle ?? emp.role} &middot; {emp.departmentName ?? emp.department}</p>
      </div>
    </Link>
  );
}

function AnnouncementChip({ ann }: { ann: Announcement }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">{ann.title}</p>
      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{ann.body}</p>
    </div>
  );
}

export function SearchView() {
  const search = useSearchParams();
  const q = search.get("q") ?? "";

  const [tab, setTab] = React.useState<Tab>("products");
  const [people, setPeople] = React.useState<Employee[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [peopleLoading, setPeopleLoading] = React.useState(false);
  const [annLoading, setAnnLoading] = React.useState(false);

  const { list: products, isLoading: prodLoading, fetchAll, toggleFavorite, isFavorite } = useProducts();

  React.useEffect(() => {
    if (!q.trim()) return;
    fetchAll({ search: q.trim() }).catch(() => undefined);
    setPeopleLoading(true);
    directoryService.getAll({ search: q.trim() })
      .then(setPeople)
      .catch(() => setPeople([]))
      .finally(() => setPeopleLoading(false));
    setAnnLoading(true);
    announcementService.getAll()
      .then((all) => setAnnouncements(all.filter((a) =>
        a.title.toLowerCase().includes(q.toLowerCase()) ||
        a.body.toLowerCase().includes(q.toLowerCase())
      )))
      .catch(() => setAnnouncements([]))
      .finally(() => setAnnLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const totalCount = products.length + people.length + announcements.length;

  const TABS: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: "products",      label: "Products",     icon: ShoppingBag, count: products.length      },
    { id: "people",        label: "People",        icon: Users,       count: people.length        },
    { id: "announcements", label: "Announcements", icon: Megaphone,   count: announcements.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={q ? `Results for "${q}"` : "Search"}
        description={
          q
            ? `${totalCount} ${totalCount === 1 ? "result" : "results"} across products, people and announcements`
            : "Type in the search bar above to search across the platform."
        }
      />

      {!q ? (
        <EmptyState title="Start typing to search" description="Find products, people, or announcements." />
      ) : (
        <>
          <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    tab === t.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}>
                  <Icon className="size-3.5" />
                  {t.label}
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {tab === "products" && (
            prodLoading && !products.length ? (
              <ProductCardSkeletonGrid count={8} />
            ) : products.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p}
                    isFavorite={isFavorite(p.id)}
                    onFavoriteToggle={() => toggleFavorite(p.id).catch(() => undefined)} />
                ))}
              </div>
            ) : (
              <EmptyState title="No products" description={`No listings match "${q}".`} />
            )
          )}

          {tab === "people" && (
            peopleLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : people.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {people.map((e) => <EmployeeChip key={e.id} emp={e} />)}
              </div>
            ) : (
              <EmptyState title="No people found" description={`No employees match "${q}".`} />
            )
          )}

          {tab === "announcements" && (
            annLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : announcements.length ? (
              <div className="space-y-3">
                {announcements.map((a) => <AnnouncementChip key={a.id} ann={a} />)}
              </div>
            ) : (
              <EmptyState title="No announcements" description={`No announcements match "${q}".`} />
            )
          )}
        </>
      )}
    </div>
  );
}