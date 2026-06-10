"use client";

import * as React from "react";
import {
  Users, UsersRound, Plus, Pencil, Trash2, Search, Loader2,
  Crown, X, UserPlus,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { teamService, type Team, type TeamMember } from "@/services/team.service";
import { departmentService, type Department } from "@/services/department.service";
import { directoryService, type Employee } from "@/services/directory.service";
import { usePermissions } from "@/hooks/usePermissions";

const INPUT = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

const TEAM_TYPES = ["FUNCTIONAL", "PROJECT", "CROSS_FUNCTIONAL", "TEMPORARY"] as const;

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:   "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  INACTIVE: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
  ARCHIVED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function TeamsAdminPage() {
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterDept, setFilterDept] = React.useState("");
  const [showCreate, setShowCreate] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Team | null>(null);
  const [membersTarget, setMembersTarget] = React.useState<Team | null>(null);
  const { can } = usePermissions();
  const canManage = can("TEAM_MANAGE");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [t, d, e] = await Promise.all([
        teamService.getAllTeams(),
        departmentService.getAll(),
        directoryService.getAll(),
      ]);
      setTeams(t);
      setDepartments(d);
      setEmployees(e);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleDelete = async (team: Team) => {
    if (!confirm(`Delete team "${team.teamName}"? This cannot be undone.`)) return;
    try {
      await teamService.deleteTeam(team.id);
      load();
    } catch {
      alert("Failed to delete team");
    }
  };

  const filtered = teams.filter((t) => {
    const matchSearch =
      !search ||
      t.teamName.toLowerCase().includes(search.toLowerCase()) ||
      t.teamCode.toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || String(t.departmentId) === filterDept;
    return matchSearch && matchDept;
  });

  return (
    <RoleGuard roles={["HR", "SUPER_ADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {teams.length} team{teams.length !== 1 ? "s" : ""}
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-4" /> Add Team
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search by name or code…"
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
            <UsersRound className="size-10 text-muted-foreground mb-3" />
            <p className="font-medium text-muted-foreground">No teams found</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Team</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Department</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Lead</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Members</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <UsersRound className="size-4 text-muted-foreground shrink-0" />
                        <div>
                          <p>{t.teamName}</p>
                          <p className="text-xs text-muted-foreground">{t.teamType?.replace(/_/g, " ")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-medium">{t.teamCode}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.departmentName ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.teamLead ? (
                        <span className="flex items-center gap-1.5">
                          <Crown className="size-3.5 text-amber-500" /> {t.teamLead.name}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setMembersTarget(t)}
                        className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium hover:bg-muted/70 transition-colors"
                      >
                        <Users className="size-3.5" /> {t.memberCount} member{t.memberCount !== 1 ? "s" : ""}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[t.status] ?? STATUS_STYLE.ACTIVE}`}>
                        {t.status.charAt(0) + t.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setMembersTarget(t)}
                          className="rounded border border-border p-1.5 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                          title="Manage members"
                        >
                          <UserPlus className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setEditTarget(t)}
                          className="rounded border border-border p-1.5 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          className="rounded border border-border p-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create / Edit modal */}
        {(showCreate || editTarget) && (
          <TeamModal
            team={editTarget ?? undefined}
            departments={departments}
            employees={employees}
            onSave={async (payload) => {
              if (editTarget) await teamService.updateTeam(editTarget.id, payload);
              else await teamService.createTeam(payload);
              setShowCreate(false);
              setEditTarget(null);
              load();
            }}
            onClose={() => { setShowCreate(false); setEditTarget(null); }}
          />
        )}

        {/* Members modal */}
        {membersTarget && (
          <MembersModal
            team={membersTarget}
            employees={employees}
            onClose={() => setMembersTarget(null)}
            onChanged={load}
          />
        )}
      </div>
    </RoleGuard>
  );
}

// ── Create / Edit modal ─────────────────────────────────────────────────────────

function TeamModal({
  team, departments, employees, onSave, onClose,
}: {
  team?: Team;
  departments: Department[];
  employees: Employee[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (p: any) => Promise<void>;
  onClose: () => void;
}) {
  const isEdit = !!team;
  const [form, setForm] = React.useState({
    teamName: team?.teamName ?? "",
    teamCode: team?.teamCode ?? "",
    departmentId: team?.departmentId?.toString() ?? "",
    teamLeadId: team?.teamLead?.id?.toString() ?? "",
    teamType: team?.teamType ?? "FUNCTIONAL",
    description: team?.description ?? "",
    status: team?.status ?? "ACTIVE",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departmentId) { setError("Department is required"); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        teamName: form.teamName,
        teamCode: form.teamCode.toUpperCase(),
        departmentId: Number(form.departmentId),
        teamLeadId: form.teamLeadId ? Number(form.teamLeadId) : undefined,
        teamType: form.teamType,
        description: form.description || undefined,
        status: form.status,
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Failed to save team");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold text-lg mb-4">
          {isEdit ? `Edit Team — ${team.teamName}` : "Add Team"}
        </h2>
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Team Name *</label>
              <input className={INPUT} value={form.teamName} onChange={(e) => set("teamName", e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input className={INPUT} value={form.teamCode} onChange={(e) => set("teamCode", e.target.value.toUpperCase())} maxLength={20} placeholder="BACKEND" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Department *</label>
              <select className={INPUT} value={form.departmentId} onChange={(e) => set("departmentId", e.target.value)} required>
                <option value="">— Select —</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Team Lead</label>
              <select className={INPUT} value={form.teamLeadId} onChange={(e) => set("teamLeadId", e.target.value)}>
                <option value="">— None —</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Team Type</label>
              <select className={INPUT} value={form.teamType} onChange={(e) => set("teamType", e.target.value)}>
                {TEAM_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className={INPUT} value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className={INPUT} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-70 hover:bg-primary/90 flex items-center justify-center gap-2">
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Members management modal ────────────────────────────────────────────────────

function MembersModal({
  team, employees, onClose, onChanged,
}: {
  team: Team;
  employees: Employee[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [members, setMembers] = React.useState<TeamMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addId, setAddId] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const loadMembers = React.useCallback(async () => {
    setLoading(true);
    try {
      setMembers(await teamService.getTeamMembers(team.id));
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [team.id]);

  React.useEffect(() => { loadMembers(); }, [loadMembers]);

  const memberIds = new Set(members.map((m) => m.employee.id));
  const available = employees.filter((e) => !memberIds.has(e.id));

  const handleAdd = async () => {
    if (!addId) return;
    setBusy(true);
    try {
      await teamService.addTeamMember(team.id, Number(addId));
      setAddId("");
      await loadMembers();
      onChanged();
    } catch {
      alert("Failed to add member");
    } finally { setBusy(false); }
  };

  const handleRemove = async (employeeId: number) => {
    setBusy(true);
    try {
      await teamService.removeTeamMember(team.id, employeeId);
      await loadMembers();
      onChanged();
    } catch {
      alert("Failed to remove member");
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Members — {team.teamName}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted"><X className="size-4" /></button>
        </div>

        {/* Add member */}
        <div className="flex gap-2 mb-4">
          <select className={INPUT} value={addId} onChange={(e) => setAddId(e.target.value)}>
            <option value="">— Add employee —</option>
            {available.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <button
            onClick={handleAdd}
            disabled={!addId || busy}
            className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-primary/90 flex items-center gap-1.5"
          >
            <UserPlus className="size-4" /> Add
          </button>
        </div>

        {/* Member list */}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="size-5 animate-spin mr-2" /> Loading…
          </div>
        ) : members.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No members yet</p>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                {m.employee.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.employee.avatarUrl} alt={m.employee.name} className="size-8 rounded-full object-cover" />
                ) : (
                  <div className="size-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {initials(m.employee.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.employee.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.employee.designation ?? m.employee.email}</p>
                </div>
                <button
                  onClick={() => handleRemove(m.employee.id)}
                  disabled={busy}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-60"
                  title="Remove"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
