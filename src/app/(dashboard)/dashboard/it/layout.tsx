"use client";

import * as React from "react";
import { SectionTabs } from "@/components/common/SectionTabs";
import { IT_TABS } from "@/constants/navigation";

/** IT section layout — Assets · Help Desk. */
export default function ItLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SectionTabs tabs={IT_TABS} />
      {children}
    </div>
  );
}
