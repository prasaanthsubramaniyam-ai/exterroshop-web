"use client";

import * as React from "react";
import { UserCircle2, Plus, Clock } from "lucide-react";
import { staffService, centerService, wellnessUserService } from "@/services/wellness.service";
import type { StaffProfile, WellnessCenter, WellnessUser, AssignStaffPayload } from "@/types/wellness";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function StaffPage() {
  const [staff, setStaff] = React.useState<StaffProfile[]>([]);
  const [centers, setCenters] = React.useState<WellnessCenter[]>([]);
  const [users, setUsers] = React.useState<WellnessUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [filterCenter, setFilterCenter] = React.useState<number | "">("");

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      filterCenter ? staffService.getByCenter(Number(filterCenter)) : staffService.getAll(),
      centerService.getAll(),
      wellnessUserService.getAll({ size: 100 }).then((r) => r.data ?? []),
    ])
      .then(([s, c, u]) => { setStaff(s); setCenters(c); setUsers(u); })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [filterCenter]);

  React.useEffect(() => { load(); }, [load]);

  const handleAssign = async (payload: AssignStaffPayload) => {
    try {
      await staffService.assign(payload);
      setShowForm(false);
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Failed to assign staff");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Assign and manage beauty services staff</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" /> Assign Staff
        </button>
      </div>

      {/* Filter */}
      <select
        value={filterCenter}
        onChange={(e) => setFilterCenter(e.target.value ? Number(e.target.value) : "")}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Centers</option>
        {centers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      ) : staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <UserCircle2 className="size-10 text-muted-foreground mb-3" />
          <p className="font-medium text-muted-foreground">No staff assigned yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                  {s.userName[0]}
                </div>
                <div>
                  <p className="font-semibold">{s.userName}</p>
                  <p className="text-xs text-muted-foreground">{s.userEmail}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">Center:</span> {s.centerName}</p>
                {s.specialization && <p><span className="font-medium text-foreground">Specialization:</span> {s.specialization}</p>}
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  <span>{s.workingStart} – {s.workingEnd}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {DAYS.map((d) => (
                  <span
                    key={d}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      s.workingDays.includes(d)
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AssignStaffModal
          centers={centers}
          users={users}
          onSave={handleAssign}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function AssignStaffModal({
  centers,
  users,
  onSave,
  onClose,
}: {
  centers: WellnessCenter[];
  users: WellnessUser[];
  onSave: (p: AssignStaffPayload) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = React.useState<AssignStaffPayload>({
    userId: 0,
    centerId: 0,
    specialization: "",
    workingStart: "09:00",
    workingEnd: "18:00",
    workingDays: "MON,TUE,WED,THU,FRI",
  });
  const [saving, setSaving] = React.useState(false);

  const set = <K extends keyof AssignStaffPayload>(k: K, v: AssignStaffPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleDay = (day: string) => {
    const days = form.workingDays ? form.workingDays.split(",").filter(Boolean) : [];
    const updated = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    set("workingDays", updated.join(","));
  };

  const activeDays = form.workingDays ? form.workingDays.split(",") : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.centerId) return alert("Select user and center");
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold text-lg">Assign Staff to Center</h2>

        <div>
          <label className="block text-sm font-medium mb-1">User *</label>
          <select className={INPUT} value={form.userId || ""} onChange={(e) => set("userId", Number(e.target.value))} required>
            <option value="">Select user…</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Center *</label>
          <select className={INPUT} value={form.centerId || ""} onChange={(e) => set("centerId", Number(e.target.value))} required>
            <option value="">Select center…</option>
            {centers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Specialization</label>
          <input className={INPUT} value={form.specialization ?? ""} onChange={(e) => set("specialization", e.target.value)} placeholder="e.g. Haircut & Styling" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Working Start</label>
            <input type="time" className={INPUT} value={form.workingStart ?? "09:00"} onChange={(e) => set("workingStart", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Working End</label>
            <input type="time" className={INPUT} value={form.workingEnd ?? "18:00"} onChange={(e) => set("workingEnd", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Working Days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeDays.includes(d) ? "bg-primary text-white" : "border border-border hover:bg-muted"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-70 hover:bg-primary/90">
            {saving ? "Assigning…" : "Assign Staff"}
          </button>
        </div>
      </form>
    </div>
  );
}

const INPUT = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
