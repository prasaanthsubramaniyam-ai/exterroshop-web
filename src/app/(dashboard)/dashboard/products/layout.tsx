"use client";

import * as React from "react";
import { SectionTabs } from "@/components/common/SectionTabs";
import { MARKETPLACE_TABS } from "@/constants/navigation";

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SectionTabs tabs={MARKETPLACE_TABS} />
      {children}
    </div>
  );
}
