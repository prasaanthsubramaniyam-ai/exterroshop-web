import type { Metadata } from "next";
import { CallRequestsView } from "./CallRequestsView";

export const metadata: Metadata = { title: "Call Requests" };

export default function CallRequestsPage() {
  return <CallRequestsView />;
}
