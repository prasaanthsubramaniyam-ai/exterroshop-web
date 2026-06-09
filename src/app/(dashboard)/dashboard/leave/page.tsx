import type { Metadata } from "next";
import { LeaveView } from "./LeaveView";

export const metadata: Metadata = { title: "Leave" };

export default function LeavePage() {
  return <LeaveView />;
}
