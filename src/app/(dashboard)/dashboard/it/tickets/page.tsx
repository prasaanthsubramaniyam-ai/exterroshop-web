import { LifeBuoy } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function HelpDeskPage() {
  return (
    <RoleGuard roles={["IT_ADMIN", "SUPER_ADMIN"]}>
      <ComingSoon
        title="Help Desk"
        description="Raise IT support tickets, track resolution status and manage your IT requests — coming in a future release."
        icon={LifeBuoy}
      />
    </RoleGuard>
  );
}
