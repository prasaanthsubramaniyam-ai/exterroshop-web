import { Receipt } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function ExpensesPage() {
  return (
    <RoleGuard roles={["FINANCE", "SUPER_ADMIN", "MANAGER", "HR"]}>
      <ComingSoon
        title="Expense Reports"
        description="Submit and track expense claims, view approval status, and manage reimbursements — coming in a future release."
        icon={Receipt}
      />
    </RoleGuard>
  );
}
