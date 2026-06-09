"use client";

import * as React from "react";
import { Sparkles, Briefcase, Calendar } from "lucide-react";
import type { User } from "@/types";
import { ROLE_LABELS } from "@/constants/navigation";

interface Props {
  user: User | null;
}

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning",   emoji: "☀️" };
  if (h < 17) return { text: "Good afternoon", emoji: "🌤️" };
  return            { text: "Good evening",    emoji: "🌙" };
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  });
}

/** Returns e.g. "2 years 3 months" or "5 months" or "23 days" */
function calcTenure(dateOfJoining: string): string {
  const joined = new Date(dateOfJoining);
  const now    = new Date();
  const diffMs = now.getTime() - joined.getTime();
  if (diffMs < 0) return "";

  const days   = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30.44);
  const years  = Math.floor(months / 12);
  const remMo  = months % 12;

  if (years >= 1) {
    return remMo > 0
      ? `${years}y ${remMo}mo tenure`
      : `${years} year${years > 1 ? "s" : ""} tenure`;
  }
  if (months >= 1) return `${months} month${months > 1 ? "s" : ""} tenure`;
  return `${days} day${days !== 1 ? "s" : ""} tenure`;
}

export function GreetingCard({ user }: Props) {
  const { text, emoji } = getGreeting();
  const firstName  = user?.name?.split(" ")[0] ?? "there";
  const roleLabel  = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : "Employee";
  const tenure     = user?.dateOfJoining ? calcTenure(user.dateOfJoining) : null;
  const isInactive = user?.userStatus && user.userStatus !== "ACTIVE";

  return (
    <div className="relative overflow-hidden rounded-2xl text-white">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#8B1700] via-primary to-[#FF5020]" />

      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='white'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      {/* Glow blobs */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-12 -left-12 size-48 rounded-full bg-black/20 blur-3xl"  aria-hidden />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {/* Top tag row */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/15 backdrop-blur-sm">
              <Sparkles className="size-3 opacity-80" />
              Employee Management System
            </div>

            {/* Employee code chip */}
            {user?.employeeCode && (
              <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] font-semibold ring-1 ring-white/15 backdrop-blur-sm tracking-wider">
                {user.employeeCode}
              </div>
            )}

            {/* Inactive status warning */}
            {isInactive && (
              <div className="inline-flex items-center rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-semibold text-amber-200 ring-1 ring-amber-300/30 backdrop-blur-sm">
                {user!.userStatus!.replace(/_/g, " ")}
              </div>
            )}
          </div>

          {/* Greeting */}
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {emoji} {text}, {firstName}!
          </h1>

          {/* Meta row */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
            <span>{formatDate()}</span>

            {user?.designationTitle && (
              <>
                <span className="opacity-40">·</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="size-3 opacity-60" />
                  {user.designationTitle}
                </span>
              </>
            )}

            {user?.departmentName && (
              <>
                <span className="opacity-40">·</span>
                <span>{user.departmentName}</span>
              </>
            )}

            {!user?.departmentName && user?.department && (
              <>
                <span className="opacity-40">·</span>
                <span>{user.department}</span>
              </>
            )}

            {tenure && (
              <>
                <span className="opacity-40">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 opacity-60" />
                  {tenure}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right — role + location card */}
        <div className="shrink-0">
          <div className="rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur-sm ring-1 ring-white/15 min-w-[110px]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">Role</p>
            <p className="mt-0.5 text-sm font-bold">{roleLabel}</p>

            {user?.location && (
              <>
                <div className="my-2 h-px w-full bg-white/15" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">Location</p>
                <p className="mt-0.5 text-xs font-semibold">{user.location}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
