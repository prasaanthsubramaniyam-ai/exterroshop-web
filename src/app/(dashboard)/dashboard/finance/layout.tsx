"use client";

import * as React from "react";
import { SectionTabs } from "@/components/common/SectionTabs";
import { FINANCE_TABS } from "@/constants/navigation";

/** Finance section layout — Expenses · Payroll (payroll gated to FINANCE/SA). */
export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SectionTabs tabs={FINANCE_TABS} />
      {children}
    </div>
  );
}
