"use client";

import * as React from "react";
import { SectionTabs } from "@/components/common/SectionTabs";
import { CMS_TABS } from "@/constants/navigation";

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SectionTabs tabs={CMS_TABS} />
      {children}
    </div>
  );
}
