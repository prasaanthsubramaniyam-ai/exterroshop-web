"use client";

import * as React from "react";
import { Cake, PartyPopper, Loader2, Send, X, Gift } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import {
  engagementService,
  type Celebration,
  type CelebrationWish,
  type Occasion,
} from "@/services/engagement.service";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function whenLabel(c: Celebration) {
  if (c.today) return "Today 🎉";
  if (c.daysUntil === 1) return "Tomorrow";
  return `In ${c.daysUntil} days`;
}

function occasionLabel(c: Celebration) {
  if (c.occasion === "BIRTHDAY") return "Birthday";
  return c.years ? `${c.years} yr${c.years > 1 ? "s" : ""} at Exterro` : "Work Anniversary";
}

// ── Wishes drawer ───────────────────────────────────────────────────────────

function WishesDrawer({
  celebration,
  onClose,
  onPosted,
}: {
  celebration: Celebration;
  onClose: () => void;
  onPosted: () => void;
}) {
  const dispatch = useAppDispatch();
  const [wishes, setWishes] = React.useState<CelebrationWish[] | null>(null);
  const [message, setMessage] = React.useState("");
  const [posting, setPosting] = React.useState(false);

  React.useEffect(() => {
    engagementService
      .getWishes(celebration.employeeId, celebration.occasion)
      .then(setWishes)
      .catch(() => setWishes([]));
  }, [celebration]);

  const submit = async () => {
    if (!message.trim()) return;
    setPosting(true);
    try {
      const w = await engagementService.postWish(
        celebration.employeeId,
        celebration.occasion,
        message.trim()
      );
      setWishes((prev) => [w, ...(prev ?? [])]);
      setMessage("");
      onPosted();
      dispatch(pushToast({ title: "Wish posted 🎉" }));
    } catch (e) {
      dispatch(pushToast({
        title: "Couldn't post wish",
        description: (e as Error).message,
        variant: "destructive",
      }));
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {initials(celebration.name)}
            </div>
            <div>
              <p className="font-semibold leading-tight">{celebration.name}</p>
              <p className="text-xs text-muted-foreground">{occasionLabel(celebration)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {/* Compose */}
        <div className="border-b border-border p-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder={`Write a ${celebration.occasion === "BIRTHDAY" ? "birthday" : "congratulations"} message…`}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="mt-2 flex justify-end">
            <Button size="sm" onClick={submit} loading={posting} disabled={!message.trim()}>
              <Send className="size-4" /> Post wish
            </Button>
          </div>
        </div>

        {/* Wishes list */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {wishes === null && (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {wishes?.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Be the first to send a wish 🎈
            </p>
          )}
          {wishes?.map((w) => (
            <div key={w.id} className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {initials(w.authorName)}
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2">
                <p className="text-xs font-semibold">{w.authorName}</p>
                <p className="text-sm">{w.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────

function CelebrationCard({ c, onOpen }: { c: Celebration; onOpen: () => void }) {
  const isBday = c.occasion === "BIRTHDAY";
  return (
    <button
      onClick={onOpen}
      className={cn(
        "flex items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-all hover:shadow-md",
        c.today ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
      )}
    >
      <div className="relative">
        {c.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.avatarUrl} alt={c.name} className="size-12 rounded-full object-cover" />
        ) : (
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {initials(c.name)}
          </div>
        )}
        <span className={cn(
          "absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full text-white",
          isBday ? "bg-pink-500" : "bg-indigo-500"
        )}>
          {isBday ? <Cake className="size-3.5" /> : <Gift className="size-3.5" />}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{c.name}</p>
        <p className="text-sm text-muted-foreground">
          {occasionLabel(c)}{c.department ? ` · ${c.department}` : ""}
        </p>
      </div>
      <div className="text-right">
        <span className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold",
          c.today ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {whenLabel(c)}
        </span>
        {c.wishCount > 0 && (
          <p className="mt-1 text-[11px] text-muted-foreground">{c.wishCount} wishes</p>
        )}
      </div>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function CelebrationsView() {
  const [items, setItems] = React.useState<Celebration[] | null>(null);
  const [active, setActive] = React.useState<Celebration | null>(null);

  const load = React.useCallback(() => {
    engagementService.getCelebrations(30).then(setItems).catch(() => setItems([]));
  }, []);
  React.useEffect(load, [load]);

  const today = items?.filter((c) => c.today) ?? [];
  const upcoming = items?.filter((c) => !c.today) ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Celebrations"
        description="Birthdays and work anniversaries across the team."
      />

      {items === null && (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {items?.length === 0 && (
        <div className="rounded-2xl border border-border py-16 text-center">
          <PartyPopper className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">No celebrations in the next 30 days</p>
        </div>
      )}

      {today.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <PartyPopper className="size-4 text-primary" /> Today
          </h2>
          {today.map((c) => (
            <CelebrationCard key={`${c.employeeId}-${c.occasion}`} c={c} onOpen={() => setActive(c)} />
          ))}
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Upcoming</h2>
          {upcoming.map((c) => (
            <CelebrationCard key={`${c.employeeId}-${c.occasion}`} c={c} onOpen={() => setActive(c)} />
          ))}
        </section>
      )}

      {active && (
        <WishesDrawer
          celebration={active}
          onClose={() => setActive(null)}
          onPosted={load}
        />
      )}
    </div>
  );
}
