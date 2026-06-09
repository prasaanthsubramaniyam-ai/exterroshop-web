"use client";

import * as React from "react";
import { Building2, Plus, Pencil, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { departmentService } from "@/services/department.service";
import type { Department } from "@/types";
import { RoleGuard } from "@/components/auth/RoleGuard";

const INPUT = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

export default function DepartmentsPage() {
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [showCreate, setShowCreate] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Department | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    departmentService
      .getAll()
      .then(setDepartments)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleToggle = async (dept: Department) => {
    try {
      await departmentService.update(dept.id, { active: !dept.active });
      load();
    } catch {
      alert("Failed to update department");
    }
  };

  const filtered = departments.filter((d) =>
    !search ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleGuard roles={["HR", "SUPER_ADMIN"]}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {departments.length} department{departments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" /> Add Department
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <Building2 className="size-10 text-muted-foreground mb-3" />
          <p className="font-medium text-muted-foreground">No departments found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Head</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Parent</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-muted-foreground shrink-0" />
                      {d.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-medium">
                      {d.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.headName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.parentName ?? "—"}</td>
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
        <DepartmentModal
          departments={departments}
          onSave={async (p) => {
            await departmentService.create(p);
            setShowCreate(false);
            load();
          }}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editTarget && (
        <DepartmentModal
          department={editTarget}
          departments={departments.filter((d) => d.id !== editTarget.id)}
          onSave={async (p) => {
            await departmentService.update(editTarget.id, p);
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

function DepartmentModal({
  department,
  departments,
  onSave,
  onClose,
}: {
  department?: Department;
  departments: Department[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (p: any) => Promise<void>;
  onClose: () => void;
}) {
  const isEdit = !!department;
  const [form, setForm] = React.useState({
    name: department?.name ?? "",
    code: department?.code ?? "",
    headId: department?.headId?.toString() ?? "",
    parentId: department?.parentId?.toString() ?? "",
  });
  const [saving, setSaving] = React.useState(false);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        name: form.name,
        code: form.code.toUpperCase(),
        headId: form.headId ? Number(form.headId) : null,
        parentId: form.parentId ? Number(form.parentId) : null,
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      alert(msg ?? "Failed to save department");
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
          {isEdit ? `Edit Department — ${department.name}` : "Add Department"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                className={INPUT}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input
                className={INPUT}
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                maxLength={10}
                placeholder="ENG"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Parent Department</label>
            <select
              className={INPUT}
              value={form.parentId}
              onChange={(e) => set("parentId", e.target.value)}
            >
              <option value="">— None (root) —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
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
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
