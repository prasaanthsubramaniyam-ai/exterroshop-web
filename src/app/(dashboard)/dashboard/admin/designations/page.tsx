"use client";

import * as React from "react";
import { Briefcase, Plus, Pencil, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { designationService } from "@/services/designation.service";
import { departmentService } from "@/services/department.service";
import { RoleGuard } from "@/components/auth/RoleGuard";
import type { Designation, Department } from "@/types";
import { usePermissions } from "@/hooks/usePermissions";

const INPUT = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

const LEVEL_LABELS: Record<number, string> = {
  1: "Intern",
  2: "Junior",
  3: "Mid",
  4: "Senior",
  5: "Lead",
  6: "Manager",
  7: "Sr Manager",
  8: "Director",
  9: "VP",
  10: "CXO",
};

export default function DesignationsPage() {
  const [designations, setDesignations] = React.useState<Designation[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterDept, setFilterDept] = React.useState<string>("");
  const [showCreate, setShowCreate] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Designation | null>(null);
  const { can } = usePermissions();
  const canManage = can("DESIGNATION_MANAGE");

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([designationService.getAll(), departmentService.getAll()])
      .then(([desigs, depts]) => {
        setDesignations(desigs);
        setDepartments(depts);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleToggle = async (d: Designation) => {
    try {
      await designationService.update(d.id, {
        title: d.title,
        level: d.level,
        departmentId: d.departmentId ?? null,
        active: !d.active,
      });
      load();
    } catch {
      alert("Failed to update designation");
    }
  };

  const filtered = designations.filter((d) => {
    const matchSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.departmentName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || String(d.departmentId) === filterDept;
    return matchSearch && matchDept;
  });

  return (
    <RoleGuard roles={["HR", "SUPER_ADMIN"]}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Designations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {designations.length} designation{designations.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" /> Add Designation
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search title or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <Briefcase className="size-10 text-muted-foreground mb-3" />
          <p className="font-medium text-muted-foreground">No designations found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Level</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Department</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <Briefcase className="size-4 text-muted-foreground shrink-0" />
                      {d.title}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                      L{d.level} — {LEVEL_LABELS[d.level] ?? "Custom"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {d.departmentName ? (
                      <span>
                        {d.departmentName}
                        {d.departmentCode && (
                          <span className="ml-1 text-xs text-muted-foreground/60">
                            ({d.departmentCode})
                          </span>
                        )}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        d.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {d.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditTarget(d)}
                        className="rounded border border-border p-1.5 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggle(d)}
                        className="rounded border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title={d.active ? "Deactivate" : "Activate"}
                      >
                        {d.active ? (
                          <ToggleRight className="size-3.5 text-green-600" />
                        ) : (
                          <ToggleLeft className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <DesignationModal
          departments={departments}
          onSave={async (p) => {
            await designationService.create(p);
            setShowCreate(false);
            load();
          }}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editTarget && (
        <DesignationModal
          designation={editTarget}
          departments={departments}
          onSave={async (p) => {
            await designationService.update(editTarget.id, p);
            setEditTarget(null);
            load();
          }}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
    </RoleGuard>
  );
}

// ── Create / Edit modal ───────────────────────────────────────────────────────

function DesignationModal({
  designation,
  departments,
  onSave,
  onClose,
}: {
  designation?: Designation;
  departments: Department[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (p: any) => Promise<void>;
  onClose: () => void;
}) {
  const isEdit = !!designation;
  const [form, setForm] = React.useState({
    title: designation?.title ?? "",
    level: String(designation?.level ?? 3),
    departmentId: designation?.departmentId?.toString() ?? "",
  });
  const [saving, setSaving] = React.useState(false);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        title: form.title,
        level: Number(form.level),
        departmentId: form.departmentId ? Number(form.departmentId) : null,
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      alert(msg ?? "Failed to save designation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-semibold text-lg mb-4">
          {isEdit ? `Edit Designation — ${designation.title}` : "Add Designation"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              className={INPUT}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Senior Engineer"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Level (1–10) *</label>
              <select
                className={INPUT}
                value={form.level}
                onChange={(e) => set("level", e.target.value)}
                required
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((l) => (
                  <option key={l} value={l}>
                    L{l} — {LEVEL_LABELS[l] ?? "Custom"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <select
                className={INPUT}
                value={form.departmentId}
                onChange={(e) => set("departmentId", e.target.value)}
              >
                <option value="">— Cross-dept —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-70 hover:bg-primary/90"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Designation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
