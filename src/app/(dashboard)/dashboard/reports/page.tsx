import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ReportsView } from "./ReportsView";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <RoleGuard roles={["MANAGER", "HR", "SUPER_ADMIN"]}>
      <ReportsView />
    </RoleGuard>
  );
}
