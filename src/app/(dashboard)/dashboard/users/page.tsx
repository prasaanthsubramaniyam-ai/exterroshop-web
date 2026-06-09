"use client";

import * as React from "react";
import { Users, Plus, Search, KeyRound, Trash2, Pencil } from "lucide-react";
import { wellnessUserService } from "@/services/wellness.service";
import { departmentService } from "@/services/department.service";
import { designationService } from "@/services/designation.service";
import type { WellnessUser, CreateWellnessUserPayload, UpdateWellnessUserPayload } from "@/types/wellness";
import type { Department, Designation } from "@/types";
import { RoleGuard } from "@/components/auth/RoleGuard";

const ALL_ROLES = [
  "EMPLOYEE_USER",
  "MANAGER",
  "HR",
  "STAFF",
  "FINANCE",
  "IT_ADMIN",
  "SUPER_ADMIN",
] as const;

const CREATE_ROLES = ["EMPLOYEE_USER", "MANAGER", "HR", "STAFF", "FINANCE", "IT_ADMIN", "SUPER_ADMIN"] as const;
const GENDERS = ["MALE", "FEMALE"] as const;

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  MANAGER:     "bg-blue-100 text-blue-700",
  HR:          "bg-teal-100 text-teal-700",
  FINANCE:     "bg-amber-100 text-amber-700",
  IT_ADMIN:    "bg-indigo-100 text-indigo-700",
  STAFF:       "bg-sky-100 text-sky-700",
  EMPLOYEE_USER: "bg-gray-100 text-gray-600",
};

export default function UsersPage() {
  const [users, setUsers] = React.useState<WellnessUser[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [designations, setDesignations] = React.useState<Designation[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [role, setRole] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [showCreate, setShowCreate] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<WellnessUser | null>(null);
  const [resetTarget, setResetTarget] = React.useState<WellnessUser | null>(null);

  // load reference data once
  React.useEffect(() => {
    Promise.all([departmentService.getAll(), designationService.getAll()])
      .then(([depts, desigs]) => { setDepartments(depts); setDesignations(desigs); })
      .catch(() => undefined);
  }, []);

  const load = React.useCallback(() => {
    setLoading(true);
    wellnessUserService
      .getAll({ page, size: 20, role: role || undefined, search: search || undefined })
      .then((r) => { setUsers(r.data ?? []); setTotal(r.total ?? 0); })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [page, search, role]);

  React.useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm("Deactivate this user?")) return;
    try {
      await wellnessUserService.delete(id);
      load();
    } catch {
      alert("Failed to deactivate user");
    }
  };

  const handleResetPassword = async (id: number, newPassword: string) => {
    try {
      await wellnessUserService.resetPassword(id, newPassword);
      setResetTarget(null);
      alert("Password reset successfully");
    } catch {
      alert("Failed to reset password");
    }
  };

  return (
    <RoleGuard roles={["SUPER_ADMIN"]}>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} total users</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(0); }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Roles</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <Users className="size-10 text-muted-foreground mb-3" />
          <p className="font-medium text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Emp ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Department</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">
                    {u.employeeId ? (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
                        {u.employeeId}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {u.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.department ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditTarget(u)}
                        className="rounded border border-border p-1.5 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                        title="Edit user"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setResetTarget(u)}
                        className="rounded border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Reset password"
                      >
                        <KeyRound className="size-3.5" />
                      </button>
                      {u.active && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="rounded border border-border p-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                          title="Deactivate"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {page * 20 + 1}–{Math.min((page + 1) * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 0} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40 hover:bg-muted">Prev</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={(page + 1) * 20 >= total} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40 hover:bg-muted">Next</button>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateUserModal
          departments={departments}
          onSave={async (p) => {
            await wellnessUserService.create(p);
            setShowCreate(false);
            load();
          }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editTarget && (
        <EditUserModal
          user={editTarget}
          departments={departments}
          designations={designations}
          onSave={async (p) => {
            await wellnessUserService.update(editTarget.id, p);
            setEditTarget(null);
            load();
          }}
          onClose={() => setEditTarget(null)}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onSave={(pwd) => handleResetPassword(resetTarget.id, pwd)}
          onClose={() => setResetTarget(null)}
        />
      )}
    </div>
    </RoleGuard>
  );
}

// ── Create modal ──────────────────────────────────────────────────────────────

function CreateUserModal({
  departments,
  onSave,
  onClose,
}: {
  departments: Department[];
  onSave: (p: CreateWellnessUserPayload) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = React.useState<CreateWellnessUserPayload>({
    name: "", gender: "MALE", employeeId: "", email: "", password: "",
    phone: "", department: "", role: "EMPLOYEE_USER",
  });
  const [saving, setSaving] = React.useState(false);

  const set = <K extends keyof CreateWellnessUserPayload>(k: K, v: CreateWellnessUserPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Failed to create user");
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Add User" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Name *">
            <input className={INPUT} value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </ModalField>
          <ModalField label="Gender *">
            <select className={INPUT} value={form.gender} onChange={(e) => set("gender", e.target.value)} required>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </ModalField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Employee ID *">
            <input className={INPUT} value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} required />
          </ModalField>
          <ModalField label="Email ID *">
            <input type="email" className={INPUT} value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </ModalField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Set Password *">
            <input type="password" className={INPUT} value={form.password} onChange={(e) => set("password", e.target.value)} minLength={6} required />
          </ModalField>
          <ModalField label="Mobile Number *">
            <input type="tel" className={INPUT} placeholder="+91 9XXXXXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
          </ModalField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Department">
            <select className={INPUT} value={form.department ?? ""} onChange={(e) => set("department", e.target.value)}>
              <option value="">— Select —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </ModalField>
          <ModalField label="Role *">
            <select className={INPUT} value={form.role} onChange={(e) => set("role", e.target.value)} required>
              {CREATE_ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
            </select>
          </ModalField>
        </div>
        <p className="text-xs text-muted-foreground">
          For bulk user adding, use the{" "}
          <a href="/wellness/bulk-upload" className="text-primary hover:underline">Bulk Upload</a> page.
        </p>
        <ModalActions saving={saving} onClose={onClose} submitLabel="Add User" />
      </form>
    </Modal>
  );
}

// ── Edit modal ────────────────────────────────────────────────────────────────

function EditUserModal({
  user,
  departments,
  designations,
  onSave,
  onClose,
}: {
  user: WellnessUser;
  departments: Department[];
  designations: Designation[];
  onSave: (p: UpdateWellnessUserPayload) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = React.useState<UpdateWellnessUserPayload>({
    name: user.name,
    email: user.email,
    gender: user.gender ?? "MALE",
    employeeId: user.employeeId ?? "",
    phone: user.phone ?? "",
    department: user.department ?? "",
    role: user.role,
    // Pre-fill EMS structured fields from the user's saved values
    departmentId: user.departmentId ?? null,
    designationId: user.designationId ?? null,
    jobTitle: user.jobTitle ?? "",
    workLocation: user.workLocation ?? "",
    employmentType: user.employmentType ?? "FULL_TIME",
    userStatus: user.userStatus ?? "ACTIVE",
  });
  const [saving, setSaving] = React.useState(false);

  const set = <K extends keyof UpdateWellnessUserPayload>(k: K, v: UpdateWellnessUserPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Failed to update user");
    } finally { setSaving(false); }
  };

  return (
    <Modal title={`Edit User — ${user.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Name *">
            <input className={INPUT} value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </ModalField>
          <ModalField label="Gender *">
            <select className={INPUT} value={form.gender} onChange={(e) => set("gender", e.target.value)} required>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </ModalField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Employee ID *">
            <input className={INPUT} value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} required />
          </ModalField>
          <ModalField label="Email ID">
            <input type="email" className={INPUT} value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
          </ModalField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Mobile Number *">
            <input type="tel" className={INPUT} placeholder="+91 9XXXXXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
          </ModalField>
          <ModalField label="Role *">
            <select className={INPUT} value={form.role} onChange={(e) => set("role", e.target.value)} required>
              {ALL_ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
            </select>
          </ModalField>
        </div>

        {/* EMS structured fields */}
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Department">
            <select
              className={INPUT}
              value={form.departmentId?.toString() ?? ""}
              onChange={(e) => set("departmentId", e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">— Keep current —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </ModalField>
          <ModalField label="Designation">
            <select
              className={INPUT}
              value={form.designationId?.toString() ?? ""}
              onChange={(e) => set("designationId", e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">— Keep current —</option>
              {designations.map((d) => (
                <option key={d.id} value={d.id}>{d.title} (L{d.level})</option>
              ))}
            </select>
          </ModalField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Job Title">
            <input className={INPUT} value={form.jobTitle ?? ""} onChange={(e) => set("jobTitle", e.target.value)} placeholder="Auto-set from designation" />
          </ModalField>
          <ModalField label="Work Location">
            <input className={INPUT} value={form.workLocation ?? ""} onChange={(e) => set("workLocation", e.target.value)} placeholder="e.g. Chennai – Floor 3" />
          </ModalField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Employment Type">
            <select className={INPUT} value={form.employmentType ?? "FULL_TIME"} onChange={(e) => set("employmentType", e.target.value)}>
              {["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"].map((t) => (
                <option key={t} value={t}>{t.replace("_", " ")}</option>
              ))}
            </select>
          </ModalField>
          <ModalField label="Status">
            <select className={INPUT} value={form.userStatus ?? "ACTIVE"} onChange={(e) => set("userStatus", e.target.value)}>
              {["ACTIVE", "INACTIVE", "ON_NOTICE", "EXITED"].map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </ModalField>
        </div>

        <p className="text-xs text-muted-foreground">
          To change this user&apos;s password, close this dialog and use the Reset Password button.
        </p>
        <ModalActions saving={saving} onClose={onClose} submitLabel="Save Changes" />
      </form>
    </Modal>
  );
}

// ── Reset password modal ──────────────────────────────────────────────────────

function ResetPasswordModal({
  user,
  onSave,
  onClose,
}: {
  user: WellnessUser;
  onSave: (p: string) => void;
  onClose: () => void;
}) {
  const [pwd, setPwd] = React.useState("");
  return (
    <Modal title={`Reset Password — ${user.name}`} onClose={onClose}>
      <div className="space-y-4">
        <ModalField label="New Password *">
          <input type="password" className={INPUT} value={pwd} onChange={(e) => setPwd(e.target.value)} minLength={8} />
        </ModalField>
        <ModalActions
          saving={false}
          onClose={onClose}
          submitLabel="Reset"
          onSubmit={() => { if (pwd.length < 8) return alert("Min 8 chars"); onSave(pwd); }}
        />
      </div>
    </Modal>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold text-lg mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium mb-1">{label}</label>{children}</div>;
}

function ModalActions({ saving, onClose, submitLabel, onSubmit }: { saving: boolean; onClose: () => void; submitLabel: string; onSubmit?: () => void }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted">Cancel</button>
      <button type={onSubmit ? "button" : "submit"} onClick={onSubmit} disabled={saving} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-70 hover:bg-primary/90">
        {saving ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}

const INPUT = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
