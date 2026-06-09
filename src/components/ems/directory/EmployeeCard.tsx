"use client";

import * as React from "react";
import { MapPin, Briefcase, Phone, Mail, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Employee } from "@/services/directory.service";

// ── Role metadata ──────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN:   "Super Admin",
  IT_ADMIN:      "IT Admin",
  FINANCE:       "Finance",
  MANAGER:       "Manager",
  HR:            "HR",
  STAFF:         "Beauty Staff",
  EMPLOYEE_USER: "Employee",
};

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN:   "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  IT_ADMIN:      "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  FINANCE:       "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  MANAGER:       "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  HR:            "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  STAFF:         "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
  EMPLOYEE_USER: "bg-muted text-muted-foreground",
};

const STATUS_DOT: Record<string, string> = {
  ACTIVE:       "bg-emerald-500",
  ON_NOTICE:    "bg-amber-400",
  INACTIVE:     "bg-gray-400",
  SUSPENDED:    "bg-red-500",
};

// ── Avatar ─────────────────────────────────────────────────────────────────

export function Avatar({ emp, size = "md" }: { emp: Employee; size?: "sm" | "md" | "lg" }) {
  const initials = emp.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const szCls    = size === "sm" ? "size-9 text-xs"
                 : size === "lg" ? "size-16 text-xl"
                 :                 "size-12 text-sm";
  if (emp.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={emp.avatarUrl} alt={emp.name}
        className={cn("rounded-full object-cover ring-2 ring-border", szCls)} />
    );
  }
  return (
    <div className={cn(
      "flex items-center justify-center rounded-full bg-primary/10 font-bold text-primary ring-2 ring-border",
      szCls,
    )}>
      {initials}
    </div>
  );
}

// ── Level badge ─────────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: number }) {
  const colors = [
    "", // 0 unused
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",    // L1
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",    // L2
    "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",     // L3
    "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",     // L4
    "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400", // L5
    "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400", // L6
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400", // L7
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400", // L8
    "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",         // L9
    "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",         // L10
  ];
  return (
    <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold", colors[level] ?? colors[1])}>
      L{level}
    </span>
  );
}

// ── Tenure helper ──────────────────────────────────────────────────────────

function tenure(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  if (ms < 0) return "";
  const days   = Math.floor(ms / 86400000);
  const months = Math.floor(days / 30.44);
  const years  = Math.floor(months / 12);
  const remMo  = months % 12;
  if (years >= 1) return remMo > 0 ? `${years}y ${remMo}mo` : `${years}yr`;
  if (months >= 1) return `${months}mo`;
  return `${days}d`;
}

// ── EmployeeCard ───────────────────────────────────────────────────────────

interface Props {
  emp:      Employee;
  layout?:  "card" | "row";
  onClick?: (emp: Employee) => void;
}

export function EmployeeCard({ emp, layout = "card", onClick }: Props) {
  const roleLabel  = ROLE_LABEL[emp.role ?? ""] ?? "Employee";
  const roleColor  = ROLE_COLOR[emp.role ?? ""] ?? ROLE_COLOR.EMPLOYEE_USER;
  const statusDot  = STATUS_DOT[emp.userStatus ?? "ACTIVE"] ?? STATUS_DOT.ACTIVE;
  const deptName   = emp.departmentName ?? emp.department;
  const titleText  = emp.designationTitle ?? emp.jobTitle;
  const tenureText = emp.dateOfJoining ? tenure(emp.dateOfJoining) : null;

  // ── Row layout ─────────────────────────────────────────────────────────────

  if (layout === "row") {
    return (
      <button
        type="button"
        onClick={() => onClick?.(emp)}
        className="group flex w-full items-center gap-4 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/60 hover:border-border"
      >
        <div className="relative shrink-0">
          <Avatar emp={emp} size="sm" />
          <span className={cn("absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background", statusDot)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold truncate">{emp.name}</p>
            {emp.employeeCode && (
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {emp.employeeCode}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {titleText ?? deptName ?? emp.email}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", roleColor)}>
              {roleLabel}
            </span>
            {emp.designationLevel != null && <LevelBadge level={emp.designationLevel} />}
          </div>
          {emp.location && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MapPin className="size-2.5" />{emp.location}
            </span>
          )}
        </div>

        <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    );
  }

  // ── Card layout ────────────────────────────────────────────────────────────

  return (
    <button
      type="button"
      onClick={() => onClick?.(emp)}
      className="group flex w-full flex-col gap-3 rounded-2xl border border-border bg-background p-5 text-left transition-all hover:shadow-md hover:border-primary/30"
    >
      {/* Top row: avatar + status dot + role badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="relative">
          <Avatar emp={emp} size="lg" />
          <span
            className={cn("absolute bottom-0.5 right-0.5 size-3 rounded-full border-2 border-background", statusDot)}
            title={emp.userStatus ?? "ACTIVE"}
          />
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", roleColor)}>
            {roleLabel}
          </span>
          {emp.designationLevel != null && <LevelBadge level={emp.designationLevel} />}
        </div>
      </div>

      {/* Name + designation */}
      <div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-semibold leading-tight">{emp.name}</p>
          {emp.employeeCode && (
            <span className="font-mono text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
              {emp.employeeCode}
            </span>
          )}
        </div>
        {titleText && (
          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{titleText}</p>
        )}
      </div>

      {/* Meta */}
      <div className="space-y-1.5 text-xs text-muted-foreground">
        {deptName && (
          <div className="flex items-center gap-1.5">
            <Briefcase className="size-3.5 shrink-0" />
            <span className="truncate">{deptName}</span>
          </div>
        )}
        {(emp.workLocation ?? emp.location) && (
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            {emp.workLocation ?? emp.location}
            {tenureText && (
              <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                {tenureText}
              </span>
            )}
          </div>
        )}
        {!emp.workLocation && !emp.location && tenureText && (
          <div className="flex items-center justify-end">
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">{tenureText}</span>
          </div>
        )}
        {emp.email && (
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate">{emp.email}</span>
          </div>
        )}
        {emp.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="size-3.5 shrink-0" />
            {emp.phone}
          </div>
        )}
      </div>

      {/* Skills */}
      {emp.skills && emp.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {emp.skills.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-primary">
              {s}
            </span>
          ))}
          {emp.skills.length > 3 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{emp.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Manager */}
      {emp.managerName && (
        <div className="rounded-xl bg-muted/50 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Reports to: </span>
          <span className="font-medium">{emp.managerName}</span>
        </div>
      )}
    </button>
  );
}
