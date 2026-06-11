"use client";

import * as React from "react";
import {
  Star,
  Plus,
  Loader2,
  X,
  Trophy,
  Medal,
  Search,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/utils/format";
import {
  recognitionService,
  type Recognition,
  type LeaderboardEntry,
} from "@/services/engagement.service";
import { directoryService, type Employee } from "@/services/directory.service";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function Avatar({ name, url, size = 9 }: { name: string; url: string | null; size?: number }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name} className={`size-${size} rounded-full object-cover`} />
  ) : (
    <div className={`flex size-${size} items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary`}>
      {initials(name)}
    </div>
  );
}

// ── Give kudos modal ──────────────────────────────────────────────────────────

function GiveKudosModal({
  onClose,
  onSent,
}: {
  onClose: () => void;
  onSent: (r: Recognition) => void;
}) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [colleagues, setColleagues] = React.useState<Employee[]>([]);
  const [badges, setBadges] = React.useState<Record<string, [string, string]>>({});
  const [query, setQuery] = React.useState("");
  const [recipient, setRecipient] = React.useState<Employee | null>(null);
  const [badge, setBadge] = React.useState<string>("");
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    directoryService.getAll().then(setColleagues).catch(() => setColleagues([]));
    recognitionService.badges().then(setBadges).catch(() => setBadges({}));
  }, []);

  const filtered = colleagues
    .filter((c) => c.id !== user?.id)
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);

  const submit = async () => {
    if (!recipient || !badge || !message.trim()) return;
    setSending(true);
    try {
      const r = await recognitionService.give(recipient.id, badge, message.trim());
      onSent(r);
      dispatch(pushToast({ title: `Kudos sent to ${recipient.name} 🎉` }));
      onClose();
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't send kudos",
        description: (err as Error).message,
        variant: "destructive",
      }));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Sparkles className="size-4 text-primary" /> Give kudos
          </h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {/* 1. Pick colleague */}
        <div className="space-y-2">
          <Label>Who deserves it?</Label>
          {recipient ? (
            <div className="flex items-center justify-between rounded-xl border border-primary/40 bg-primary/5 px-3 py-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Avatar name={recipient.name} url={recipient.avatarUrl ?? null} size={7} />
                {recipient.name}
              </span>
              <button type="button" onClick={() => setRecipient(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search colleagues…"
                leftIcon={<Search />}
                autoFocus
              />
              {query && (
                <div className="divide-y divide-border rounded-xl border border-border">
                  {filtered.length === 0 && (
                    <p className="px-3 py-2.5 text-sm text-muted-foreground">No matches</p>
                  )}
                  {filtered.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setRecipient(c); setQuery(""); }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <Avatar name={c.name} url={c.avatarUrl ?? null} size={7} />
                      <span className="font-medium">{c.name}</span>
                      {c.departmentName && (
                        <span className="text-xs text-muted-foreground">· {c.departmentName}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* 2. Pick badge */}
        <div className="space-y-2">
          <Label>Badge</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(badges).map(([code, [label, emoji]]) => (
              <button
                key={code}
                type="button"
                onClick={() => setBadge(code)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                  badge === code
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <span className="text-lg">{emoji}</span> {label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Message */}
        <div className="space-y-2">
          <Label htmlFor="msg">Why?</Label>
          <textarea
            id="msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="They stayed late to help me ship the release…"
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={submit}
            loading={sending}
            disabled={!recipient || !badge || !message.trim()}
          >
            Send kudos (+10 pts)
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

function Leaderboard() {
  const [period, setPeriod] = React.useState<"month" | "all">("month");
  const [rows, setRows] = React.useState<LeaderboardEntry[] | null>(null);

  React.useEffect(() => {
    setRows(null);
    recognitionService.leaderboard(period).then(setRows).catch(() => setRows([]));
  }, [period]);

  const medal = (rank: number) =>
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}`;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <Trophy className="size-4 text-amber-500" /> Leaderboard
        </h2>
        <div className="flex gap-1">
          {(["month", "all"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {p === "month" ? "This month" : "All time"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {rows === null && (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {rows?.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No points yet — send the first kudos!
          </p>
        )}
        {rows?.map((r) => (
          <div key={r.userId} className="flex items-center gap-3">
            <span className="w-7 text-center text-sm font-semibold">{medal(r.rank)}</span>
            <Avatar name={r.name} url={r.avatarUrl} size={8} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{r.name}</p>
              {r.department && (
                <p className="truncate text-[11px] text-muted-foreground">{r.department}</p>
              )}
            </div>
            <span className="text-sm font-bold tabular-nums text-primary">{r.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function RecognitionView() {
  const [feed, setFeed] = React.useState<Recognition[] | null>(null);
  const [myPoints, setMyPoints] = React.useState<number | null>(null);
  const [showGive, setShowGive] = React.useState(false);
  const [lbKey, setLbKey] = React.useState(0);

  const load = React.useCallback(() => {
    recognitionService.feed().then(setFeed).catch(() => setFeed([]));
    recognitionService.myPoints().then(setMyPoints).catch(() => setMyPoints(null));
  }, []);
  React.useEffect(load, [load]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        title="Rewards & Recognition"
        description="Celebrate great work — send kudos, earn points, climb the board."
        actions={
          <div className="flex items-center gap-3">
            {myPoints !== null && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                <Medal className="size-4" /> {myPoints} pts
              </span>
            )}
            <Button onClick={() => setShowGive(true)}>
              <Plus className="size-4" /> Give kudos
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Feed */}
        <div className="space-y-4">
          {feed === null && (
            <div className="flex justify-center py-16">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {feed?.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <Star className="mx-auto size-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium">No kudos yet</p>
              <Button className="mt-4" size="sm" onClick={() => setShowGive(true)}>
                <Plus className="size-4" /> Send the first one
              </Button>
            </div>
          )}
          {feed?.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <Avatar name={r.senderName} url={r.senderAvatarUrl} />
                <div className="min-w-0 flex-1 text-sm">
                  <span className="font-semibold">{r.senderName}</span>
                  <span className="text-muted-foreground"> recognised </span>
                  <span className="font-semibold">{r.recipientName}</span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatTimeAgo(r.createdAt)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  {r.badgeEmoji} {r.badgeLabel}
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                  +{r.points} pts
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">{r.message}</p>
            </div>
          ))}
        </div>

        {/* Sidebar: leaderboard */}
        <div className="space-y-5">
          <Leaderboard key={lbKey} />
        </div>
      </div>

      {showGive && (
        <GiveKudosModal
          onClose={() => setShowGive(false)}
          onSent={(r) => {
            setFeed((prev) => [r, ...(prev ?? [])]);
            setLbKey((k) => k + 1); // refresh leaderboard
          }}
        />
      )}
    </div>
  );
}
