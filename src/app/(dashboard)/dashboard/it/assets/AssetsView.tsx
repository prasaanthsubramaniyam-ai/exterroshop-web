"use client";

import * as React from "react";
import {
  Monitor, Plus, Loader2, X, Laptop, Smartphone,
  Keyboard, Mouse, Package, CheckCircle2, Wrench, Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import {
  itService,
  type Asset,
  type AssetStatus,
  type AssetType,
  type RegisterAssetPayload,
} from "@/services/it.service";
import type { UserRole } from "@/types";

const ADMIN_ROLES: UserRole[] = ["IT_ADMIN", "SUPER_ADMIN"];

const TYPE_ICON: Record<AssetType, React.ElementType> = {
  LAPTOP: Laptop, PHONE: Smartphone, MONITOR: Monitor,
  KEYBOARD: Keyboard, MOUSE: Mouse, OTHER: Package,
};
const TYPE_LABEL: Record<AssetType, string> = {
  LAPTOP: "Laptop", PHONE: "Phone", MONITOR: "Monitor",
  KEYBOARD: "Keyboard", MOUSE: "Mouse", OTHER: "Other",
};
const ASSET_TYPES: AssetType[] = ["LAPTOP","PHONE","MONITOR","KEYBOARD","MOUSE","OTHER"];

const STATUS_META: Record<AssetStatus, { label: string; icon: React.ElementType; cls: string }> = {
  AVAILABLE:  { label: "Available",  icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  ASSIGNED:   { label: "Assigned",   icon: CheckCircle2, cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"             },
  IN_REPAIR:  { label: "In repair",  icon: Wrench,       cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"         },
  RETIRED:    { label: "Retired",    icon: Archive,      cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"                 },
};

const ALL_STATUSES: (AssetStatus | "ALL")[] = ["ALL","AVAILABLE","ASSIGNED","IN_REPAIR","RETIRED"];

// ── Register modal ─────────────────────────────────────────────────────────────

function RegisterModal({ onClose, onRegistered }: { onClose: () => void; onRegistered: (a: Asset) => void }) {
  const dispatch = useAppDispatch();
  const [form, setForm] = React.useState<RegisterAssetPayload>({ assetTag: "", name: "", type: "LAPTOP" });
  const [saving, setSaving] = React.useState(false);

  const set = <K extends keyof RegisterAssetPayload>(k: K, v: RegisterAssetPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.assetTag.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      const asset = await itService.registerAsset(form);
      onRegistered(asset);
      dispatch(pushToast({ title: "Asset registered" }));
      onClose();
    } catch (err) {
      dispatch(pushToast({ title: "Failed", description: (err as Error).message, variant: "destructive" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Register asset</h2>
          <button onClick={onClose}><X className="size-5 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Asset tag *</label>
              <input value={form.assetTag} onChange={(e) => set("assetTag", e.target.value)} placeholder="EXT-001"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value as AssetType)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30">
                {ASSET_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
              </select>
            </div>
          </div>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Asset name *"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.brand ?? ""} onChange={(e) => set("brand", e.target.value)} placeholder="Brand"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
            <input value={form.model ?? ""} onChange={(e) => set("model", e.target.value)} placeholder="Model"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
          </div>
          <input value={form.serialNumber ?? ""} onChange={(e) => set("serialNumber", e.target.value)} placeholder="Serial number"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
          <button onClick={submit} disabled={saving || !form.assetTag.trim() || !form.name.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Asset card ─────────────────────────────────────────────────────────────────

function AssetCard({ asset, isAdmin, onUnassign, onStatusChange }: {
  asset: Asset;
  isAdmin: boolean;
  onUnassign: (id: number) => void;
  onStatusChange: (id: number, s: AssetStatus) => void;
}) {
  const TypeIcon = TYPE_ICON[asset.type];
  const meta = STATUS_META[asset.status];
  const StatusIcon = meta.icon;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-muted shrink-0">
          <TypeIcon className="size-4 text-muted-foreground" />
        </div>
        <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold shrink-0", meta.cls)}>
          <StatusIcon className="size-3" />{meta.label}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold leading-tight">{asset.name}</p>
        <p className="text-xs text-muted-foreground">{asset.assetTag} · {TYPE_LABEL[asset.type]}</p>
        {asset.brand && <p className="text-xs text-muted-foreground">{asset.brand} {asset.model}</p>}
        {asset.assignedToName && (
          <p className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">→ {asset.assignedToName}</p>
        )}
      </div>
      {isAdmin && (
        <div className="flex flex-wrap gap-1.5 border-t border-border/60 pt-2">
          {asset.status === "ASSIGNED" && (
            <button onClick={() => onUnassign(asset.id)}
              className="rounded-lg px-2 py-1 text-[11px] font-medium bg-muted hover:bg-muted/70">
              Unassign
            </button>
          )}
          {asset.status !== "IN_REPAIR" && asset.status !== "RETIRED" && (
            <button onClick={() => onStatusChange(asset.id, "IN_REPAIR")}
              className="rounded-lg px-2 py-1 text-[11px] font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300">
              Mark In Repair
            </button>
          )}
          {asset.status !== "RETIRED" && (
            <button onClick={() => onStatusChange(asset.id, "RETIRED")}
              className="rounded-lg px-2 py-1 text-[11px] font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400">
              Retire
            </button>
          )}
          {asset.status === "IN_REPAIR" && (
            <button onClick={() => onStatusChange(asset.id, "AVAILABLE")}
              className="rounded-lg px-2 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
              Mark Available
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function AssetsView() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const isAdmin = ADMIN_ROLES.includes(user?.role as UserRole);

  const [assets,    setAssets]    = React.useState<Asset[] | null>(null);
  const [filter,    setFilter]    = React.useState<AssetStatus | "ALL">("ALL");
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    itService.listAssets().then(setAssets).catch(() => setAssets([]));
  }, []);

  const handleUnassign = async (id: number) => {
    try {
      const updated = await itService.unassignAsset(id);
      setAssets((prev) => prev?.map((a) => a.id === id ? updated : a) ?? null);
      dispatch(pushToast({ title: "Asset unassigned" }));
    } catch (err) {
      dispatch(pushToast({ title: "Failed", description: (err as Error).message, variant: "destructive" }));
    }
  };

  const handleStatusChange = async (id: number, status: AssetStatus) => {
    try {
      const updated = await itService.updateAssetStatus(id, status);
      setAssets((prev) => prev?.map((a) => a.id === id ? updated : a) ?? null);
      dispatch(pushToast({ title: `Asset marked ${STATUS_META[status].label}` }));
    } catch (err) {
      dispatch(pushToast({ title: "Failed", description: (err as Error).message, variant: "destructive" }));
    }
  };

  const all = assets ?? [];
  const visible = filter === "ALL" ? all : all.filter((a) => a.status === filter);
  const available = all.filter((a) => a.status === "AVAILABLE").length;
  const assigned  = all.filter((a) => a.status === "ASSIGNED").length;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
            <Monitor className="size-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">IT Assets</h1>
            <p className="text-sm text-muted-foreground">Hardware inventory and assignments</p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" /> Register asset
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total assets",  value: all.length,   tint: "bg-blue-500"    },
          { label: "Available",     value: available,     tint: "bg-emerald-500" },
          { label: "Assigned",      value: assigned,      tint: "bg-purple-500"  },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <div className={cn("mb-2 h-1.5 w-8 rounded-full", s.tint)} />
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
            )}>
            {f === "ALL" ? "All" : STATUS_META[f].label}
          </button>
        ))}
      </div>

      {assets === null ? (
        <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
          <Monitor className="mx-auto mb-2 size-8 text-muted-foreground/30" />
          {filter === "ALL" ? "No assets registered." : `No ${STATUS_META[filter as AssetStatus].label.toLowerCase()} assets.`}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((a) => (
            <AssetCard key={a.id} asset={a} isAdmin={isAdmin}
              onUnassign={handleUnassign} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {showModal && (
        <RegisterModal
          onClose={() => setShowModal(false)}
          onRegistered={(a) => setAssets((prev) => [a, ...(prev ?? [])])}
        />
      )}
    </div>
  );
}
