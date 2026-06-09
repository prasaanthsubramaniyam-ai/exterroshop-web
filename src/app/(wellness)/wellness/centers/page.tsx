"use client";

import * as React from "react";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { centerService } from "@/services/wellness.service";
import type { WellnessCenter, CreateCenterPayload } from "@/types/wellness";

export default function CentersPage() {
  const [centers, setCenters] = React.useState<WellnessCenter[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<WellnessCenter | null>(null);

  const load = () => {
    setLoading(true);
    centerService.getAll().then(setCenters).catch(() => undefined).finally(() => setLoading(false));
  };

  React.useEffect(() => { load(); }, []);

  const handleSave = async (payload: CreateCenterPayload) => {
    try {
      if (editing) {
        await centerService.update(editing.id, payload);
      } else {
        await centerService.create(payload);
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Failed to save center");
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("Deactivate this center?")) return;
    try {
      await centerService.deactivate(id);
      load();
    } catch {
      alert("Failed to deactivate center");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Beauty Service Centers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage Men's and Women's beauty service centers</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" /> Add Center
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : centers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <Building2 className="size-10 text-muted-foreground mb-3" />
          <p className="font-medium text-muted-foreground">No centers yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {centers.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{c.location}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  c.genderType === "MALE_ONLY" ? "bg-blue-100 text-blue-700" :
                  c.genderType === "FEMALE_ONLY" ? "bg-pink-100 text-pink-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {c.genderType.replace("_", " ")}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{c.serviceCount} services</span>
                  <span>{c.staffCount} staff</span>
                  <span className={c.active ? "text-green-600" : "text-red-500"}>{c.active ? "Active" : "Inactive"}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditing(c); setShowForm(true); }}
                    className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  {c.active && (
                    <button
                      onClick={() => handleDeactivate(c.id)}
                      className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CenterFormModal
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function CenterFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial: WellnessCenter | null;
  onSave: (p: CreateCenterPayload) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = React.useState<CreateCenterPayload>({
    name: initial?.name ?? "",
    genderType: initial?.genderType ?? "ALL",
    location: initial?.location ?? "",
    description: initial?.description ?? "",
  });
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold text-lg">{initial ? "Edit Center" : "New Center"}</h2>
        <Field label="Name" required>
          <input className={INPUT} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="Location">
          <input className={INPUT} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </Field>
        <Field label="Gender Type">
          <select className={INPUT} value={form.genderType} onChange={(e) => setForm({ ...form, genderType: e.target.value })}>
            <option value="ALL">All</option>
            <option value="MALE_ONLY">Male Only</option>
            <option value="FEMALE_ONLY">Female Only</option>
          </select>
        </Field>
        <Field label="Description">
          <textarea className={INPUT} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}{required && " *"}</label>
      {children}
    </div>
  );
}
