import { RoleGuard } from "@/components/auth/RoleGuard";
import { AuditLogView } from "@/components/ems/audit/AuditLogView";

export const metadata = { title: "Audit Logs | ExterroShop EMS" };

export default function AuditLogsPage() {
  return (
    <RoleGuard roles={["SUPER_ADMIN"]}>
      <AuditLogView />
    </RoleGuard>
  );
}
