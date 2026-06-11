"use client";

import * as React from "react";
import { SectionTabs } from "@/components/common/SectionTabs";
import { useAuth } from "@/hooks/useAuth";
import {
  SPORTS_EMPLOYEE_TABS,
  SPORTS_HR_TABS,
} from "@/constants/navigation";

/**
 * Sports & Events section layout — one sidebar entry, role-aware tabs here.
 * HR / SUPER_ADMIN manage events; everyone else gets the participant view.
 */
export default function SportsLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isHr = user?.role === "HR" || user?.role === "SUPER_ADMIN";
  const tabs = isHr ? SPORTS_HR_TABS : SPORTS_EMPLOYEE_TABS;

  return (
    <div>
      <SectionTabs tabs={tabs} />
      {children}
    </div>
  );
}
