import * as React from "react";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/wellness";

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-600",
  NO_SHOW: "bg-orange-100 text-orange-800",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[status])}>
      {status.replace("_", " ")}
    </span>
  );
}
