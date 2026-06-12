"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Plus, UsersRound, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clubsService, type Club } from "@/services/engagement.service";
import { clubTint } from "./clubColors";
import { ClubCreateModal } from "./ClubCreateModal";

export function ClubsView() {
  const [scope, setScope] = React.useState<"all" | "mine">("all");
  const [clubs, setClubs] = React.useState<Club[] | null>(null);
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(() => {
    clubsService.list(scope).then(setClubs).catch(() => setClubs([]));
  }, [scope]);
  React.useEffect(load, [load]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Clubs & Communities"
        description="Find your people — or start a club of your own."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Start a club
          </Button>
        }
      />

      {/* Scope tabs */}
      <div className="flex gap-2">
        {([
          { value: "all", label: "Browse all" },
          { value: "mine", label: "My clubs" },
        ] as const).map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setScope(t.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              scope === t.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {clubs === null && (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {clubs?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <UsersRound className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">
            {scope === "mine" ? "You haven't joined any clubs yet" : "No clubs yet"}
          </p>
          {scope === "all" && (
            <Button className="mt-4" size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Start the first one
            </Button>
          )}
        </div>
      )}

      {clubs && clubs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/engagement/clubs/${c.id}`}
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className={cn("flex size-12 items-center justify-center rounded-xl text-2xl",
                  clubTint(c.color))}>
                  {c.icon}
                </div>
                <ChevronRight className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <h3 className="mt-4 line-clamp-1 font-semibold">{c.name}</h3>
              {c.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <UsersRound className="size-3.5" /> {c.memberCount}
                </span>
                {c.joinedByMe && (
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    c.myRole === "ADMIN"
                      ? "bg-primary/10 text-primary"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  )}>
                    {c.myRole === "ADMIN" ? "Admin" : "Joined"}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {creating && (
        <ClubCreateModal
          onClose={() => setCreating(false)}
          onCreated={(c) => setClubs((prev) => [c, ...(prev ?? [])])}
        />
      )}
    </div>
  );
}
