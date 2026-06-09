"use client";

import * as React from "react";
import { Scissors, Plus, Pencil, Trash2 } from "lucide-react";
import { wellnessServiceApi } from "@/services/wellness.service";
import type { WellnessService, CreateServicePayload } from "@/types/wellness";

export default function ServicesPage() {
  const [services, setServices] = React.useState<WellnessService[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<WellnessService | null>(null);

  const load = () => {
    setLoading(true);
    wellnessServiceApi.getAll().then(setServices).catch(() => undefined).finally(() => setLoading(false));
  };

  React.useEffect(() => { load(); }, []);

  const handleSave = async (payload: CreateServicePayload) => {
    try {
      if (editing) {
        await wellnessServiceApi.update(editing.id, payload);
      } else {
        await wellnessServiceApi.create(payload);
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Failed to save service");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Beauty Services</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage available beauty services</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" /> Add Service
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Scissors className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.durationMinutes} min + {s.bufferMinutes} min buffer</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setEditing(s); setShowForm(true); }} className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Pencil className="size-3.5" />
                  </button>
                  <button onClick={async () => { if (!confirm("Deactivate?")) return; await wellnessServiceApi.deactivate(s.id); load(); }} className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              {s.description && <p className="mt-3 text-sm text-muted-foreground">{s.description}</p>}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ServiceFormModal
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function ServiceFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial: WellnessService | null;
  onSave: (p: CreateServicePayload) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = React.useState<CreateServicePayload>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    durationMinutes: initial?.durationMinutes ?? 30,
    bufferMinutes: initial?.bufferMinutes ?? 10,
    genderType: initial?.genderType ?? "ALL",
    icon: initial?.icon ?? "",
  });
  const [saving, setSaving] = React.useState(false);

  const set = (k: keyof CreateServicePayload, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold text-lg">{initial ? "Edit Service" : "New Service"}</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input className={INPUT} value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className={INPUT} rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Duration (min) *</label>
            <input type="number" min={5} className={INPUT} value={form.durationMinutes} onChange={(e) => set("durationMinutes", Number(e.target.value))} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Buffer (min)</label>
            <input type="number" min={0} className={INPUT} value={form.bufferMinutes} onChange={(e) => set("bufferMinutes", Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gender Type</label>
          <select className={INPUT} value={form.genderType} onChange={(e) => set("genderType", e.target.value)}>
            <option value="ALL">All</option>
            <option value="MALE_ONLY">Male Only</option>
            <option value="FEMALE_ONLY">Female Only</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-70 hover:bg-primary/90">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

const INPUT = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
