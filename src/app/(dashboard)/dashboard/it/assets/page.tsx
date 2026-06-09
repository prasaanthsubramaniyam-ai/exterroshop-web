import { Monitor } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function AssetsPage() {
  return (
    <RoleGuard roles={["IT_ADMIN", "SUPER_ADMIN"]}>
      <ComingSoon
        title="IT Assets"
        description="Track laptops, phones and equipment assigned to employees, manage asset lifecycle and generate inventory reports — coming in a future release."
        icon={Monitor}
      />
    </RoleGuard>
  );
}
