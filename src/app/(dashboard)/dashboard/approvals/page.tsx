import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ApprovalsView } from "./ApprovalsView";

export const metadata: Metadata = { title: "Approvals" };

export default function ApprovalsPage() {
  return (
    <RoleGuard roles={["MANAGER", "HR", "SUPER_ADMIN"]}>
      <ApprovalsView />
    </RoleGuard>
  );
}
