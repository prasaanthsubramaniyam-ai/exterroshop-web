import type { Metadata } from "next";
import { AdminHubView } from "./AdminHubView";

export const metadata: Metadata = { title: "Employee Management" };

export default function AdminHubPage() {
  return <AdminHubView />;
}
