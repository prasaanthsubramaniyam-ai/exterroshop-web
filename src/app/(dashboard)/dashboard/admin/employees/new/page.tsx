"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus, ArrowLeft, ArrowRight, Loader2, Check, Copy,
  User as UserIcon, Building2, Shield, ClipboardCheck,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { cn } from "@/lib/utils";
import { employeeService, type OnboardResult } from "@/services/employee.service";
import { departmentService, type Department } from "@/services/department.service";
import { designationService, type Designation } from "@/services/designation.service";
import { teamService, type Team } from "@/services/team.service";
import { directoryService, type Employee } from "@/services/directory.service";

const INPUT = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const LABEL = "block text-sm font-medium mb-1";

const ROLES = [
  { value: "EMPLOYEE_USER", label: "Employee" },
  { value: "MANAGER",       label: "Manager" },
  { value: "HR",            label: "HR" },
  { value: "FINANCE",       label: "Finance" },
  { value: "IT_ADMIN",      label: "IT Admin" },
  { value: "SUPER_ADMIN",   label: "Super Admin" },
];
const EMPLOYMENT = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"];
const LOCATIONS = ["Chennai", "Coimbatore", "Bangalore"];

const STEPS = [
  { key: "basic", label: "Basic Info",   icon: UserIcon },
  { key: "org",   label: "Organization", icon: Building2 },
  { key: "role",  label: "Role & Job",   icon: Shield },
  { key: "review",label: "Review",       icon: ClipboardCheck },
];

export default function OnboardEmployeePage() {
  const router = useRouter();

  const [step, setStep] = React.useState(0);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [designations, setDesignations] = React.useState<Designation[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [managers, setManagers] = React.useState<Employee[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<OnboardResult | null>(null);
  const [copied, setCopied] = React.useState(false);

  const [form, setForm] = React.useState({
    name: "", email: "", phone: "", gender: "", password: "",
    departmentId: "", teamId: "", designationId: "", managerId: "",
    role: "EMPLOYEE_USER", employmentType: "FULL_TIME", jobTitle: "",
    dateOfJoining: new Date().toISOString().slice(0, 10), location: "Chennai",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  React.useEffect(() => {
    Promise.all([
      departmentService.getAll(),
      designationService.getAll(),
      teamService.getAllTeams(),
      directoryService.getAll(),
    ]).then(([d, des, t, m]) => {
      setDepartments(d); setDesignations(des); setTeams(t); setManagers(m);
    }).catch(() => {});
  }, []);

  // department-scoped sub-lists
  const deptId = form.departmentId ? Number(form.departmentId) : null;
  const scopedDesignations = deptId
    ? designations.filter((x) => !x.departmentId || x.departmentId === deptId)
    : designations;
  const scopedTeams = deptId ? teams.filter((x) => x.departmentId === deptId) : teams;

  const canNext = () => {
    if (step === 0) return form.name && form.email && form.phone;
    if (step === 2) return !!form.role;
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await employeeService.onboard({
        name: form.name,
        email: form.email,
        phone: form.phone,
        gender: form.gender || undefined,
        role: form.role,
        departmentId: form.departmentId ? Number(form.departmentId) : undefined,
        teamId: form.teamId ? Number(form.teamId) : undefined,
        designationId: form.designationId ? Number(form.designationId) : undefined,
        managerId: form.managerId ? Number(form.managerId) : undefined,
        employmentType: form.employmentType,
        jobTitle: form.jobTitle || undefined,
        dateOfJoining: form.dateOfJoining || undefined,
        location: form.location,
        password: form.password || undefined,
      });
      setResult(res);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Onboarding failed");
    } finally {
      setSubmitting(false);
    }
  };

  const deptName = departments.find((d) => String(d.id) === form.departmentId)?.name;
  const desigName = designations.find((d) => String(d.id) === form.designationId)?.title;
  const teamName = teams.find((t) => String(t.id) === form.teamId)?.teamName;
  const mgrName = managers.find((m) => String(m.id) === form.managerId)?.name;

  // ── Success screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <RoleGuard roles={["HR", "SUPER_ADMIN"]}>
        <div className="max-w-lg mx-auto py-8">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900 mb-3">
              <Check className="size-7 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold">{result.employee.name} onboarded!</h1>
            <p className="text-sm text-muted-foreground mt-1">A welcome notification has been sent.</p>

            <div className="mt-5 space-y-2 text-left">
              <div className="flex justify-between rounded-lg border border-border bg-background px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Employee ID</span>
                <span className="text-sm font-mono font-semibold">{result.employeeCode}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg border border-border bg-background px-4 py-2.5">
                <span className="text-sm text-muted-foreground">
                  {result.passwordGenerated ? "Temp password" : "Password"}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold">{result.tempPassword}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(result.tempPassword); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="rounded p-1 text-muted-foreground hover:text-foreground"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  </button>
                </span>
              </div>
            </div>
            {result.passwordGenerated && (
              <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                Share this temporary password securely. Ask the employee to change it on first login.
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setResult(null); setStep(0); setForm({ ...form, name: "", email: "", phone: "", password: "", jobTitle: "" }); }}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted"
              >
                Onboard Another
              </button>
              <button
                onClick={() => router.push("/dashboard/users")}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90"
              >
                Go to Users
              </button>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  // ── Wizard ──────────────────────────────────────────────────────────────────
  return (
    <RoleGuard roles={["HR", "SUPER_ADMIN"]}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-xl border border-border p-2 hover:bg-muted">
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
              <UserPlus className="size-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Onboard Employee</h1>
              <p className="text-sm text-muted-foreground">Create and activate a new employee account</p>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step, done = i < step;
            return (
              <React.Fragment key={s.key}>
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "flex size-9 items-center justify-center rounded-full border-2 transition-colors",
                    done ? "bg-primary border-primary text-white"
                      : active ? "border-primary text-primary"
                      : "border-border text-muted-foreground"
                  )}>
                    {done ? <Check className="size-4" /> : <Icon className="size-4" />}
                  </div>
                  <span className={cn("text-[11px]", active ? "font-semibold text-foreground" : "text-muted-foreground")}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={cn("flex-1 h-0.5 mx-2", done ? "bg-primary" : "bg-border")} />}
              </React.Fragment>
            );
          })}
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        {/* Step content */}
        <div className="rounded-2xl border border-border bg-background p-6 space-y-4">
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={LABEL}>Full Name *</label><input className={INPUT} value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
                <div><label className={LABEL}>Email *</label><input type="email" className={INPUT} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
                <div><label className={LABEL}>Phone *</label><input className={INPUT} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
                <div>
                  <label className={LABEL}>Gender</label>
                  <select className={INPUT} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                    <option value="">—</option><option value="MALE">Male</option><option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={LABEL}>Password</label>
                <input className={INPUT} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Leave blank to auto-generate a temp password" />
              </div>
            </>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Department</label>
                <select className={INPUT} value={form.departmentId} onChange={(e) => { set("departmentId", e.target.value); set("teamId", ""); set("designationId", ""); }}>
                  <option value="">— Select —</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Team</label>
                <select className={INPUT} value={form.teamId} onChange={(e) => set("teamId", e.target.value)}>
                  <option value="">— None —</option>
                  {scopedTeams.map((t) => <option key={t.id} value={t.id}>{t.teamName}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Designation</label>
                <select className={INPUT} value={form.designationId} onChange={(e) => set("designationId", e.target.value)}>
                  <option value="">— None —</option>
                  {scopedDesignations.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Reporting Manager</label>
                <select className={INPUT} value={form.managerId} onChange={(e) => set("managerId", e.target.value)}>
                  <option value="">— None —</option>
                  {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Role *</label>
                <select className={INPUT} value={form.role} onChange={(e) => set("role", e.target.value)}>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Employment Type</label>
                <select className={INPUT} value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)}>
                  {EMPLOYMENT.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div><label className={LABEL}>Job Title</label><input className={INPUT} value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} placeholder="Defaults to designation" /></div>
              <div><label className={LABEL}>Date of Joining</label><input type="date" className={INPUT} value={form.dateOfJoining} onChange={(e) => set("dateOfJoining", e.target.value)} /></div>
              <div>
                <label className={LABEL}>Location</label>
                <select className={INPUT} value={form.location} onChange={(e) => set("location", e.target.value)}>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2 text-sm">
              <Row label="Name" value={form.name} />
              <Row label="Email" value={form.email} />
              <Row label="Phone" value={form.phone} />
              <Row label="Role" value={ROLES.find((r) => r.value === form.role)?.label ?? form.role} />
              <Row label="Department" value={deptName ?? "—"} />
              <Row label="Team" value={teamName ?? "—"} />
              <Row label="Designation" value={desigName ?? "—"} />
              <Row label="Reporting Manager" value={mgrName ?? "—"} />
              <Row label="Employment" value={form.employmentType.replace(/_/g, " ")} />
              <Row label="Date of Joining" value={form.dateOfJoining} />
              <Row label="Location" value={form.location} />
              <Row label="Password" value={form.password ? "Custom" : "Auto-generated temp password"} />
              <p className="pt-2 text-xs text-muted-foreground">
                On submit: the account is created &amp; activated, an Employee ID is generated, and a welcome notification is sent.
              </p>
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-40"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => canNext() && setStep((s) => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              Next <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {submitting ? "Onboarding…" : "Onboard Employee"}
            </button>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
