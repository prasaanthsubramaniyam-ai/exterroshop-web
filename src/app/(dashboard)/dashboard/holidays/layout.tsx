"use client";

import * as React from "react";
import { SectionTabs } from "@/components/common/SectionTabs";
import { LEAVE_TABS } from "@/constants/navigation";

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SectionTabs tabs={LEAVE_TABS} />
      {children}
    </div>
  );
}
