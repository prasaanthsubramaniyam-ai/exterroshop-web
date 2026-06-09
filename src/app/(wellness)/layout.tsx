import * as React from "react";
import { WellnessSidebar } from "@/components/wellness/WellnessSidebar";
import { AuthGate } from "@/app/(dashboard)/AuthGate";

export default function WellnessLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="flex min-h-screen bg-background">
        <WellnessSidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </AuthGate>
  );
}
