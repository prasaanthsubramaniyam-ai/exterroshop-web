"use client";

import * as React from "react";
import {
  X, Mail, Phone, MapPin, Calendar,
  Building2, Award, Network, User2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Employee } from "@/services/directory.service";
import { Avatar } from "./EmployeeCard";

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN:   "Super Admin",
  IT_ADMIN:      "IT Admin",
  FINANCE:       "Finance",
  MANAGER:       "Manager",
  HR:            "HR",
  STAFF:         "Beauty Staff",
  EMPLOYEE_USER: "Employee",
};

const STATUS_CONFIG: Record<string, { dot: string; label: string; pill: string }> = {
  ACTIVE:    { dot: "bg-emerald-500", label: "Active",      pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  ON_NOTICE: { dot: "bg-amber-400",   label: "On Notice",   pill: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  INACTIVE:  { dot: "bg-gray-400",    label: "Inactive",    pill: "bg-muted text-muted-foreground" },
  SUSPENDED: { dot: "bg-red-500",     label: "Suspended",   pill: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
};

const EMP_TYPE_LABEL: Record<string, string> = {
  FULL_TIME:   "Full Time",
  PART_TIME:   "Part Time",
  CONTRACT:    "Contract",
  INTERN:      "Intern",
  CONSULTANT:  "Consultant",
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-all">{value}</p>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function calcTenure(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  if (ms < 0) return "";
  const days   = Math.floor(ms / 86400000);
  const months = Math.floor(days / 30.44);
  const years  = Math.floor(months / 12);
  const remMo  = months % 12;
  if (years >= 1) return remMo > 0 ? `${years} yr ${remMo} mo` : `${years} year${years > 1 ? "s" : ""}`;
  if (months >= 1) return `${months} month${months > 1 ? "s" : ""}`;
  return `${days} day${days !== 1 ? "s" : ""}`;
}

interface Props {
  emp:     Employee | null;
  onClose: () => void;
}

export function EmployeeDrawer({ emp, onClose }: Props) {
  // Close on Escape
  React.useEffect(() => {
    if (!emp) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [emp, onClose]);

  const isOpen = !!emp;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Employee detail"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm font-semibold text-muted-foreground">Employee Profile</p>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        {emp && (
          <div className="flex-1 overflow-y-auto">
            {/* Hero */}
            <div className="flex flex-col items-center gap-3 border-b border-border px-6 py-6 text-center">
              <div className="relative">
                <Avatar emp={emp} size="lg" />
                {(() => {
                  const cfg = STATUS_CONFIG[emp.userStatus ?? "ACTIVE"] ?? STATUS_CONFIG.ACTIVE;
                  return (
                    <span
                      className={cn("absolute bottom-0.5 right-0.5 size-3.5 rounded-full border-2 border-background", cfg.dot)}
                      title={cfg.label}
                    />
                  );
                })()}
              </div>

              <div>
                <h2 className="text-lg font-bold leading-tight">{emp.name}</h2>
                {(emp.designationTitle ?? emp.jobTitle) && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {emp.designationTitle ?? emp.jobTitle}
                    {emp.designationLevel != null && (
                      <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold">
                        L{emp.designationLevel}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Chips row */}
              <div className="flex flex-wrap justify-center gap-1.5">
                {emp.employeeCode && (
                  <span className="rounded-full bg-muted px-3 py-1 font-mono text-xs font-semibold">
                    {emp.employeeCode}
                  </span>
                )}
                {ROLE_LABEL[emp.role ?? ""] && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {ROLE_LABEL[emp.role ?? ""] ?? emp.role}
                  </span>
                )}
                {(() => {
                  const cfg = STATUS_CONFIG[emp.userStatus ?? "ACTIVE"] ?? STATUS_CONFIG.ACTIVE;
                  return (
                    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", cfg.pill)}>
                      {cfg.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Contact */}
            <section className="border-b border-border px-5 py-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Contact</p>
              <div className="space-y-3">
                <InfoRow icon={<Mail className="size-3.5 text-muted-foreground" />} label="Email" value={emp.email} />
                <InfoRow icon={<Phone className="size-3.5 text-muted-foreground" />} label="Phone" value={emp.phone} />
              </div>
            </section>

            {/* Organisation */}
            <section className="border-b border-border px-5 py-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Organisation</p>
              <div className="space-y-3">
                <InfoRow
                  icon={<Building2 className="size-3.5 text-muted-foreground" />}
                  label="Department"
                  value={emp.departmentName ?? emp.department}
                />
                <InfoRow
                  icon={<Award className="size-3.5 text-muted-foreground" />}
                  label="Designation"
                  value={emp.designationTitle ?? emp.jobTitle}
                />
                {emp.managerName && (
                  <InfoRow
                    icon={<Network className="size-3.5 text-muted-foreground" />}
                    label="Reports To"
                    value={emp.managerName}
                  />
                )}
                <InfoRow
                  icon={<User2 className="size-3.5 text-muted-foreground" />}
                  label="Employment Type"
                  value={emp.employmentType ? (EMP_TYPE_LABEL[emp.employmentType] ?? emp.employmentType) : null}
                />
              </div>
            </section>

            {/* Work info */}
            <section className="border-b border-border px-5 py-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Work Info</p>
              <div className="space-y-3">
                <InfoRow
                  icon={<MapPin className="size-3.5 text-muted-foreground" />}
                  label="Location"
                  value={emp.workLocation ?? emp.location}
                />
                {emp.dateOfJoining && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Calendar className="size-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Joined</p>
                      <p className="text-sm font-medium">{formatDate(emp.dateOfJoining)}</p>
                      <p className="text-xs text-muted-foreground">{calcTenure(emp.dateOfJoining)} ago</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Skills */}
            {emp.skills && emp.skills.length > 0 && (
              <section className="px-5 py-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {emp.skills.map((s) => (
                    <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Quick actions */}
            <section className="px-5 pb-8 pt-2">
              <a
                href={`mailto:${emp.email}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Mail className="size-4" /> Send Email
              </a>
              {emp.phone && (
                <a
                  href={`tel:${emp.phone}`}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  <Phone className="size-4" /> Call
                </a>
              )}
            </section>
          </div>
        )}
      </aside>
    </>
  );
}
