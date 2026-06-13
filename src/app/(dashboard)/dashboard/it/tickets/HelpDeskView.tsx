"use client";

import * as React from "react";
import {
  Headphones, Plus, Loader2, X, CheckCircle2,
  Clock, XCircle, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { formatTimeAgo } from "@/utils/format";
import {
  itService,
  type Ticket,
  type TicketStatus,
  type TicketPriority,
  type TicketCategory,
  type RaiseTicketPayload,
} from "@/services/it.service";
import type { UserRole } from "@/types";

const AGENT_ROLES: UserRole[] = ["IT_ADMIN", "SUPER_ADMIN"];

const PRIORITY_META: Record<TicketPriority, { label: string; cls: string }> = {
  LOW:      { label: "Low",      cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"         },
  MEDIUM:   { label: "Medium",   cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"      },
  HIGH:     { label: "High",     cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"  },
  CRITICAL: { label: "Critical", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"      },
};

const STATUS_META: Record<TicketStatus, { label: string; icon: React.ElementType; cls: string }> = {
  OPEN:        { label: "Open",        icon: Clock,         cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"   },
  IN_PROGRESS: { label: "In Progress", icon: AlertTriangle, cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"       },
  RESOLVED:    { label: "Resolved",    icon: CheckCircle2,  cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  CLOSED:      { label: "Closed",      icon: XCircle,       cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"         },
};

const CATEGORIES: TicketCategory[] = ["HARDWARE","SOFTWARE","NETWORK","ACCESS","OTHER"];
const CAT_LABEL: Record<TicketCategory, string> = {
  HARDWARE: "Hardware", SOFTWARE: "Software", NETWORK: "Network", ACCESS: "Access", OTHER: "Other",
};
const PRIORITIES: TicketPriority[] = ["LOW","MEDIUM","HIGH","CRITICAL"];

const ALL_STATUSES: (TicketStatus | "ALL")[] = ["ALL","OPEN","IN_PROGRESS","RESOLVED","CLOSED"];

// ── Raise ticket modal ────────────────────────────────────────────────────────

function RaiseTicketModal({ onClose, onRaised }: { onClose: () => void; onRaised: (t: Ticket) => void }) {
  const dispatch = useAppDispatch();
  const [form, setForm] = React.useState<RaiseTicketPayload>({ title: "", category: "SOFTWARE", priority: "MEDIUM" });
  const [saving, setSaving] = React.useState(false);

  const set = <K extends keyof RaiseTicketPayload>(k: K, v: RaiseTicketPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const ticket = await itService.raiseTicket(form);
      onRaised(ticket);
      dispatch(pushToast({ title: "Ticket raised", description: `#${ticket.id} — ${ticket.title}` }));
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
          <h2 className="font-semibold">Raise IT ticket</h2>
          <button onClick={onClose}><X className="size-5 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Title *"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value as TicketCategory)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30">
                {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value as TicketPriority)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30">
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}
              </select>
            </div>
          </div>
          <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the issue" rows={3}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/30" />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
          <button onClick={submit} disabled={saving || !form.title.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Ticket row ────────────────────────────────────────────────────────────────

function TicketRow({ ticket, isAgent, onResolve, onClose: onCloseTicket }: {
  ticket: Ticket;
  isAgent: boolean;
  onResolve: (id: number) => void;
  onClose: (id: number) => void;
}) {
  const pMeta = PRIORITY_META[ticket.priority];
  const sMeta = STATUS_META[ticket.status];
  const SIcon = sMeta.icon;

  return (
    <div className="border-t border-border/60 px-5 py-4 first:border-0">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">#{ticket.id} {ticket.title}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", pMeta.cls)}>
              {pMeta.label}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {CAT_LABEL[ticket.category]}
            </span>
          </div>
          {ticket.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{ticket.description}</p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">
            {ticket.raisedByName} · {formatTimeAgo(ticket.createdAt)}
            {ticket.assignedToName && <> · Assigned to <span className="font-medium">{ticket.assignedToName}</span></>}
          </p>
          {ticket.resolution && (
            <p className="mt-1 text-xs italic text-muted-foreground">Resolution: {ticket.resolution}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold", sMeta.cls)}>
            <SIcon className="size-3" />{sMeta.label}
          </span>
          {isAgent && ticket.status === "OPEN" && (
            <button onClick={() => onResolve(ticket.id)}
              className="rounded-lg px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
              Resolve
            </button>
          )}
          {isAgent && ticket.status === "RESOLVED" && (
            <button onClick={() => onCloseTicket(ticket.id)}
              className="rounded-lg px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function HelpDeskView() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const isAgent = AGENT_ROLES.includes(user?.role as UserRole);

  const [tickets,   setTickets]   = React.useState<Ticket[] | null>(null);
  const [filter,    setFilter]    = React.useState<TicketStatus | "ALL">("ALL");
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    itService.listTickets().then(setTickets).catch(() => setTickets([]));
  }, []);

  const handleResolve = async (id: number) => {
    const resolution = prompt("Resolution notes:");
    if (resolution === null) return;
    try {
      const updated = await itService.resolveTicket(id, resolution || "Resolved by IT");
      setTickets((prev) => prev?.map((t) => t.id === id ? updated : t) ?? null);
      dispatch(pushToast({ title: "Ticket resolved" }));
    } catch (err) {
      dispatch(pushToast({ title: "Failed", description: (err as Error).message, variant: "destructive" }));
    }
  };

  const handleClose = async (id: number) => {
    try {
      const updated = await itService.closeTicket(id);
      setTickets((prev) => prev?.map((t) => t.id === id ? updated : t) ?? null);
      dispatch(pushToast({ title: "Ticket closed" }));
    } catch (err) {
      dispatch(pushToast({ title: "Failed", description: (err as Error).message, variant: "destructive" }));
    }
  };

  const all = tickets ?? [];
  const visible = filter === "ALL" ? all : all.filter((t) => t.status === filter);
  const open = all.filter((t) => t.status === "OPEN").length;
  const inProgress = all.filter((t) => t.status === "IN_PROGRESS").length;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950">
            <Headphones className="size-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">IT Help Desk</h1>
            <p className="text-sm text-muted-foreground">Raise and track IT support tickets</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="size-4" /> New ticket
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Open",        value: open,          tint: "bg-amber-500"   },
          { label: "In Progress", value: inProgress,    tint: "bg-blue-500"    },
          { label: "Total",       value: all.length,    tint: "bg-purple-500"  },
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

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {tickets === null ? (
          <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : visible.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            <Headphones className="mx-auto mb-2 size-8 text-muted-foreground/30" />
            {filter === "ALL" ? "No tickets yet." : `No ${STATUS_META[filter as TicketStatus]?.label.toLowerCase()} tickets.`}
          </div>
        ) : (
          visible.map((t) => (
            <TicketRow key={t.id} ticket={t} isAgent={isAgent}
              onResolve={handleResolve} onClose={handleClose} />
          ))
        )}
      </div>

      {showModal && (
        <RaiseTicketModal
          onClose={() => setShowModal(false)}
          onRaised={(t) => setTickets((prev) => [t, ...(prev ?? [])])}
        />
      )}
    </div>
  );
}
