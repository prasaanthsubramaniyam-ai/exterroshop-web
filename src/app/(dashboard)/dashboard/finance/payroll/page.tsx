import { Banknote } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function PayrollPage() {
  return (
    <RoleGuard roles={["FINANCE", "SUPER_ADMIN"]}>
      <ComingSoon
        title="Payroll"
        description="Run payroll cycles, review salary breakdowns, manage deductions and generate payroll reports — coming in a future release."
        icon={Banknote}
      />
    </RoleGuard>
  );
}
