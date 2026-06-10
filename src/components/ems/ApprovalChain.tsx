"use client";

import { Check, X, Clock, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaveApprovalStep } from "@/services/leave.service";

const STEP_ICON = {
  APPROVED: Check,
  REJECTED: X,
  PENDING:  Clock,
  SKIPPED:  Minus,
} as const;

const STEP_STYLE = {
  APPROVED: "bg-emerald-500 border-emerald-500 text-white",
  REJECTED: "bg-red-500 border-red-500 text-white",
  PENDING:  "border-amber-400 text-amber-500",
  SKIPPED:  "border-border text-muted-foreground",
} as const;

/** Compact horizontal stepper visualising a leave request's approval chain. */
export function ApprovalChain({ chain, currentStep }: {
  chain?: LeaveApprovalStep[];
  currentStep?: number;
}) {
  if (!chain || chain.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chain.map((step, i) => {
        const Icon = STEP_ICON[step.status];
        const isCurrent = step.status === "PENDING" && step.stepOrder === currentStep;
        const who = step.approverName ?? step.label;
        return (
          <div key={step.stepOrder} className="flex items-center gap-1.5">
            <span
              className={cn(
                "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                STEP_STYLE[step.status],
                isCurrent && "ring-2 ring-amber-300/50"
              )}
              title={`${who}${step.actedByName ? ` · ${step.status.toLowerCase()} by ${step.actedByName}` : ""}`}
            >
              <Icon className="size-3" />
              {who}
            </span>
            {i < chain.length - 1 && <span className="text-muted-foreground/40 text-xs">→</span>}
          </div>
        );
      })}
    </div>
  );
}
