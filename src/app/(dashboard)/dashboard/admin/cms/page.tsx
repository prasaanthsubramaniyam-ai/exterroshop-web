"use client";

import * as React from "react";
import {
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Globe,
  Lock,
} from "lucide-react";
import { cmsService, type CmsSetting, type CmsSettingPayload } from "@/services/cms.service";
import { useCms } from "@/context/CmsContext";
import { cn } from "@/lib/utils";
import { RoleGuard } from "@/components/auth/RoleGuard";

const VALUE_TYPES = ["string", "boolean", "number", "json", "color", "image_url"] as const;

// ── Empty form state ────────────────────────────────────────────────────────

const EMPTY: CmsSettingPayload = {
  settingKey: "",
  settingValue: "",
  category: "general",
  label: "",
  description: "",
  valueType: "string",
  isPublic: false,
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function badge(valueType: string) {
  const map: Record<string, string> = {
    string: "bg-blue-50 text-blue-700",
    boolean: "bg-purple-50 text-purple-700",
    number: "bg-green-50 text-green-700",
    json: "bg-yellow-50 text-yellow-700",
    color: "bg-pink-50 text-pink-700",
    image_url: "bg-orange-50 text-orange-700",
  };
  return map[valueType] ?? "bg-gray-50 text-gray-700";
}

function ColorSwatch({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-4 w-4 rounded border border-border"
        style={{ backgroundColor: value }}
      />
      <code className="text-xs">{value}</code>
    </span>
  );
}

function ValuePreview({ setting }: { setting: CmsSetting }) {
  if (setting.valueType === "color") return <ColorSwatch value={setting.settingValue} />;

  if (setting.valueType === "boolean")
    return (
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium",
          setting.settingValue === "true"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        )}
      >
        {setting.settingValue ?? "—"}
      </span>
    );

  if (setting.valueType === "image_url") {
    if (!setting.settingValue) return <span className="text-muted-foreground italic">empty</span>;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={setting.settingValue}
        alt="preview"
        className="h-8 w-8 rounded object-contain border border-border bg-muted"
      />
    );
  }

  if (!setting.settingValue) return <span className="text-muted-foreground italic">empty</span>;
  return (
    <span className="block max-w-[200px] truncate text-sm" title={setting.settingValue}>
      {setting.settingValue}
    </span>
  );
}

// ── Form modal ───────────────────────────────────────────────────────────────

interface FormProps {
  initial?: CmsSetting | null;
  onSave: (payload: CmsSettingPayload, id?: number) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function SettingForm({ initial, onSave, onCancel, saving }: FormProps) {
  const [form, setForm] = React.useState<CmsSettingPayload>(
    initial
      ? {
          settingKey: initial.settingKey,
          settingValue: initial.settingValue ?? "",
          category: initial.category,
          label: initial.label ?? "",
          description: initial.description ?? "",
          valueType: initial.valueType,
          isPublic: initial.isPublic,
        }
      : EMPTY
  );

  const set = <K extends keyof CmsSettingPayload>(k: K, v: CmsSettingPayload[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form, initial?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">
            {initial ? "Edit Setting" : "New Setting"}
          </h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Key *</label>
              <input
                required
                value={form.settingKey}
                onChange={(e) => set("settingKey", e.target.value)}
                placeholder="theme.color.primary"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={!!initial} // key is immutable after creation
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Category *</label>
              <input
                required
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="theme"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Value Type *</label>
              <select
                value={form.valueType}
                onChange={(e) => set("valueType", e.target.value as CmsSettingPayload["valueType"])}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {VALUE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Label</label>
              <input
                value={form.label ?? ""}
                onChange={(e) => set("label", e.target.value)}
                placeholder="Primary Color"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Value</label>
              {form.valueType === "json" ? (
                <textarea
                  rows={4}
                  value={form.settingValue ?? ""}
                  onChange={(e) => set("settingValue", e.target.value)}
                  placeholder='["Chennai","Coimbatore"]'
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              ) : form.valueType === "color" ? (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.settingValue ?? "#000000"}
                    onChange={(e) => set("settingValue", e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-border p-0.5"
                  />
                  <input
                    value={form.settingValue ?? ""}
                    onChange={(e) => set("settingValue", e.target.value)}
                    placeholder="#FF2F01"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ) : form.valueType === "boolean" ? (
                <select
                  value={form.settingValue ?? "false"}
                  onChange={(e) => set("settingValue", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : (
                <input
                  value={form.settingValue ?? ""}
                  onChange={(e) => set("settingValue", e.target.value)}
                  placeholder="Enter value…"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              )}
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <input
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Short description for admins"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => set("isPublic", e.target.checked)}
                  className="h-4 w-4 rounded accent-primary"
                />
                <span className="text-sm">
                  <span className="font-medium">Public</span>
                  <span className="ml-1 text-muted-foreground">
                    — served to unauthenticated clients
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function CmsSettingsPage() {
  const { reload: reloadCms } = useCms();
  const [settings, setSettings] = React.useState<CmsSetting[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<CmsSetting | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<CmsSetting | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const [all, cats] = await Promise.all([
        cmsService.getAll(),
        cmsService.getCategories(),
      ]);
      setSettings(all);
      setCategories(cats);
    } catch {
      setError("Failed to load CMS settings");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const visible = React.useMemo(
    () => (activeCategory === "all" ? settings : settings.filter((s) => s.category === activeCategory)),
    [settings, activeCategory]
  );

  const handleSave = async (payload: CmsSettingPayload, id?: number) => {
    setSaving(true);
    try {
      if (id) {
        await cmsService.update(id, payload);
      } else {
        await cmsService.create(payload);
      }
      setShowForm(false);
      setEditTarget(null);
      await Promise.all([load(), reloadCms()]);
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (setting: CmsSetting) => {
    try {
      await cmsService.delete(setting.id);
      setDeleteTarget(null);
      await load();
    } catch {
      setError("Delete failed");
    }
  };

  return (
    <RoleGuard roles={["SUPER_ADMIN"]}>
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">CMS Settings</h1>
            <p className="text-sm text-muted-foreground">
              {settings.length} settings across {categories.length} categories
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Setting
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-6">
        {/* Category sidebar */}
        <aside className="w-48 shrink-0">
          <div className="rounded-2xl border border-border bg-background p-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                activeCategory === "all"
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              )}
            >
              All ({settings.length})
            </button>
            {categories.map((cat) => {
              const count = settings.filter((s) => s.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "w-full rounded-xl px-3 py-2 text-left text-sm transition-colors",
                    activeCategory === cat
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </aside>

        {/* Settings table */}
        <div className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-border bg-background">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Loading…
            </div>
          ) : visible.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              No settings in this category.
            </div>
          ) : (
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[35%]" />
                <col className="w-[25%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Key</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Value</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Visibility</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((s) => (
                  <tr key={s.id} className="group hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="truncate font-mono text-xs font-medium">{s.settingKey}</p>
                      {s.label && (
                        <p className="truncate text-xs text-muted-foreground">{s.label}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ValuePreview setting={s} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          badge(s.valueType)
                        )}
                      >
                        {s.valueType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.isPublic ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <Globe className="h-3 w-3" /> Public
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Lock className="h-3 w-3" /> Private
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => { setEditTarget(s); setShowForm(true); }}
                          className="rounded-lg p-1.5 hover:bg-muted"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="rounded-lg p-1.5 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit modal */}
      {showForm && (
        <SettingForm
          initial={editTarget}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
          saving={saving}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">Delete Setting</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <code className="font-mono text-foreground">{deleteTarget.settingKey}</code>?
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-border py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </RoleGuard>
  );
}
