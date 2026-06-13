"use client";

import * as React from "react";
import {
  Loader2, Gift, ShoppingBag, Clock, CheckCircle2,
  XCircle, Plus, Award, Star, ToggleLeft, ToggleRight, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { formatTimeAgo } from "@/utils/format";
import {
  rewardsService,
  type RewardItem,
  type Redemption,
  type RedemptionStatus,
  type RewardCategory,
} from "@/services/rewards.service";
import { recognitionService } from "@/services/engagement.service";
import type { UserRole } from "@/types";

const HR_ROLES: UserRole[] = ["HR", "SUPER_ADMIN"];

const CATEGORY_LABELS: Record<RewardCategory, string> = {
  VOUCHER:      "Voucher",
  MERCHANDISE:  "Merchandise",
  EXPERIENCE:   "Experience",
  DONATION:     "Donation",
  OTHER:        "Other",
};

const CATEGORY_TINT: Record<RewardCategory, string> = {
  VOUCHER:     "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  MERCHANDISE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  EXPERIENCE:  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  DONATION:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  OTHER:       "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const STATUS_META: Record<RedemptionStatus, { label: string; icon: React.ElementType; cls: string }> = {
  PENDING:   { label: "Pending",   icon: Clock,         cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  FULFILLED: { label: "Fulfilled", icon: CheckCircle2,  cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  REJECTED:  { label: "Rejected",  icon: XCircle,       cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
};

// ── Reward catalog card ───────────────────────────────────────────────────────

function RewardCard({
  item,
  myPoints,
  onRedeem,
  redeeming,
}: {
  item: RewardItem;
  myPoints: number;
  onRedeem: (item: RewardItem) => void;
  redeeming: number | null;
}) {
  const canAfford  = myPoints >= item.pointsCost;
  const outOfStock = item.stock !== null && item.stock === 0;

  return (
    <div className={cn(
      "group rounded-2xl border border-border bg-card flex flex-col transition-all",
      item.active && !outOfStock ? "hover:border-primary/40 hover:shadow-md" : "opacity-60"
    )}>
      {/* Image / placeholder */}
      <div className="relative h-36 w-full overflow-hidden rounded-t-2xl bg-muted flex items-center justify-center">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <Gift className="size-10 text-muted-foreground/30" />
        )}
        <span className={cn("absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold", CATEGORY_TINT[item.category])}>
          {CATEGORY_LABELS[item.category]}
        </span>
      </div>

      <div className="flex flex-col flex-1 gap-3 p-4">
        <div className="flex-1">
          <h3 className="font-semibold leading-snug">{item.name}</h3>
          {item.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
            <Star className="size-3" /> {item.pointsCost.toLocaleString()} pts
          </span>
          {item.stock !== null && (
            <span className="text-[10px] text-muted-foreground">{item.stock} left</span>
          )}
        </div>

        <button
          onClick={() => onRedeem(item)}
          disabled={!item.active || outOfStock || !canAfford || redeeming === item.id}
          className={cn(
            "w-full rounded-xl py-2 text-sm font-semibold transition-colors",
            canAfford && item.active && !outOfStock
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {redeeming === item.id ? (
            <span className="flex items-center justify-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin" /> Redeeming…
            </span>
          ) : outOfStock ? "Out of stock"
            : !item.active ? "Unavailable"
            : !canAfford ? `Need ${(item.pointsCost - myPoints).toLocaleString()} more pts`
            : "Redeem"}
        </button>
      </div>
    </div>
  );
}

// ── Add reward modal (HR only) ────────────────────────────────────────────────

function AddRewardModal({ onClose, onCreated }: { onClose: () => void; onCreated: (item: RewardItem) => void }) {
  const dispatch = useAppDispatch();
  const [name, setName]         = React.useState("");
  const [desc, setDesc]         = React.useState("");
  const [cost, setCost]         = React.useState(100);
  const [cat, setCat]           = React.useState<RewardCategory>("VOUCHER");
  const [stock, setStock]       = React.useState<string>("");
  const [saving, setSaving]     = React.useState(false);

  const submit = async () => {
    if (!name.trim() || cost < 1) return;
    setSaving(true);
    try {
      const item = await rewardsService.createItem({
        name: name.trim(),
        description: desc.trim() || undefined,
        pointsCost: cost,
        category: cat,
        stock: stock === "" ? null : Number(stock),
      });
      onCreated(item);
      dispatch(pushToast({ title: `"${item.name}" added to the store` }));
      onClose();
    } catch (err) {
      dispatch(pushToast({ title: "Couldn't add reward", description: (err as Error).message, variant: "destructive" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Add reward item</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
        </div>

        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name *"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" rows={2}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Points cost *</label>
              <input type="number" min={1} value={cost} onChange={(e) => setCost(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Stock (blank = ∞)</label>
              <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Unlimited"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <select value={cat} onChange={(e) => setCat(e.target.value as RewardCategory)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
          <button onClick={submit} disabled={saving || !name.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Add item
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Redemption row ────────────────────────────────────────────────────────────

function RedemptionRow({
  r,
  showUser,
  onProcess,
}: {
  r: Redemption;
  showUser?: boolean;
  onProcess?: (id: number, status: "FULFILLED" | "REJECTED") => void;
}) {
  const meta = STATUS_META[r.status];
  const MetaIcon = meta.icon;

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-t border-border/60 first:border-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
        <Gift className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{r.itemName}</p>
        <p className="text-xs text-muted-foreground">
          {showUser && <>{r.userName} · </>}
          <span className="font-medium text-primary">{r.pointsCost.toLocaleString()} pts</span>
          {" · "}{formatTimeAgo(r.requestedAt)}
        </p>
        {r.adminNote && <p className="text-xs text-muted-foreground mt-0.5 italic">{r.adminNote}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold", meta.cls)}>
          <MetaIcon className="size-3" />{meta.label}
        </span>
        {r.status === "PENDING" && onProcess && (
          <>
            <button onClick={() => onProcess(r.id, "FULFILLED")}
              className="rounded-lg px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 transition-colors">
              Fulfil
            </button>
            <button onClick={() => onProcess(r.id, "REJECTED")}
              className="rounded-lg px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 transition-colors">
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

type Tab = "store" | "mine" | "manage";

function TabBar({ tabs, active, onChange }: { tabs: { id: Tab; label: string }[]; active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={cn(
            "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors",
            active === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function RewardsStoreView() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const isHR = HR_ROLES.includes(user?.role as UserRole);

  const tabs: { id: Tab; label: string }[] = [
    { id: "store", label: "Rewards Store" },
    { id: "mine",  label: "My Redemptions" },
    ...(isHR ? [{ id: "manage" as Tab, label: "Manage Requests" }] : []),
  ];

  const [activeTab, setActiveTab] = React.useState<Tab>("store");
  const [myPoints,  setMyPoints]  = React.useState<number>(0);
  const [catalog,   setCatalog]   = React.useState<RewardItem[] | null>(null);
  const [mine,      setMine]      = React.useState<Redemption[] | null>(null);
  const [allReqs,   setAllReqs]   = React.useState<Redemption[] | null>(null);
  const [redeeming, setRedeeming] = React.useState<number | null>(null);
  const [addOpen,   setAddOpen]   = React.useState(false);
  const [catFilter, setCatFilter] = React.useState<RewardCategory | "ALL">("ALL");

  React.useEffect(() => {
    recognitionService.myPoints().then(setMyPoints).catch(() => setMyPoints(0));
    rewardsService.listItems().then(setCatalog).catch(() => setCatalog([]));
    rewardsService.myRedemptions().then(setMine).catch(() => setMine([]));
    if (isHR) {
      rewardsService.allRedemptions().then(setAllReqs).catch(() => setAllReqs([]));
    }
  }, [isHR]);

  const handleRedeem = async (item: RewardItem) => {
    if (!confirm(`Redeem "${item.name}" for ${item.pointsCost} points?`)) return;
    setRedeeming(item.id);
    try {
      const r = await rewardsService.redeem(item.id);
      setMine((prev) => [r, ...(prev ?? [])]);
      setMyPoints((p) => p - item.pointsCost);
      dispatch(pushToast({
        title: "Redemption requested!",
        description: `"${item.name}" — HR will fulfil it shortly.`,
      }));
    } catch (err) {
      dispatch(pushToast({ title: "Redemption failed", description: (err as Error).message, variant: "destructive" }));
    } finally {
      setRedeeming(null);
    }
  };

  const handleProcess = async (id: number, status: "FULFILLED" | "REJECTED") => {
    try {
      const updated = await rewardsService.processRedemption(id, status);
      setAllReqs((prev) => prev?.map((r) => r.id === id ? updated : r) ?? null);
      dispatch(pushToast({
        title: status === "FULFILLED" ? "Redemption fulfilled" : "Redemption rejected",
      }));
    } catch (err) {
      dispatch(pushToast({ title: "Action failed", description: (err as Error).message, variant: "destructive" }));
    }
  };

  const visibleItems = (catalog ?? []).filter(
    (i) => i.active && (catFilter === "ALL" || i.category === catFilter)
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950">
            <Gift className="size-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Rewards Store</h1>
            <p className="text-sm text-muted-foreground">Spend your points on great rewards</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
            <Star className="size-4" /> {myPoints.toLocaleString()} pts available
          </span>
          {isHR && (
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Plus className="size-4" /> Add item
            </button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Store tab */}
      {activeTab === "store" && (
        <div className="space-y-4">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {(["ALL", ...Object.keys(CATEGORY_LABELS)] as (RewardCategory | "ALL")[]).map((c) => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  catFilter === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                )}>
                {c === "ALL" ? "All" : CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>

          {catalog === null ? (
            <div className="flex justify-center py-16"><Loader2 className="size-7 animate-spin text-muted-foreground" /></div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <ShoppingBag className="mx-auto size-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm font-medium">No rewards available</p>
              {isHR && <button onClick={() => setAddOpen(true)} className="mt-3 text-sm text-primary hover:underline">Add the first one →</button>}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((item) => (
                <RewardCard key={item.id} item={item} myPoints={myPoints} onRedeem={handleRedeem} redeeming={redeeming} />
              ))}
            </div>
          )}

          {/* HR: toggle inactive items */}
          {isHR && catalog !== null && catalog.some((i) => !i.active) && (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Inactive items (HR only)</p>
              <div className="space-y-2">
                {catalog.filter((i) => !i.active).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.name} — {item.pointsCost} pts</span>
                    <button onClick={() => rewardsService.toggleItem(item.id, true).then((u) =>
                      setCatalog((prev) => prev?.map((x) => x.id === u.id ? u : x) ?? null)
                    )} className="flex items-center gap-1 text-primary hover:underline text-xs">
                      <ToggleRight className="size-4" /> Enable
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* My redemptions tab */}
      {activeTab === "mine" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {mine === null ? (
            <div className="flex justify-center py-10"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
          ) : mine.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <ShoppingBag className="mx-auto mb-2 size-8 text-muted-foreground/30" />
              No redemptions yet. Spend your points in the store!
            </div>
          ) : (
            mine.map((r) => <RedemptionRow key={r.id} r={r} />)
          )}
        </div>
      )}

      {/* Manage tab (HR) */}
      {activeTab === "manage" && isHR && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {allReqs === null ? (
            <div className="flex justify-center py-10"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
          ) : allReqs.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No redemption requests yet.</p>
          ) : (
            allReqs.map((r) => <RedemptionRow key={r.id} r={r} showUser onProcess={handleProcess} />)
          )}
        </div>
      )}

      {addOpen && <AddRewardModal onClose={() => setAddOpen(false)} onCreated={(item) => setCatalog((prev) => [item, ...(prev ?? [])])} />}
    </div>
  );
}
