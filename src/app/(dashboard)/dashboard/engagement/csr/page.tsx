import type { Metadata } from "next";
import { ActivitiesView } from "../activity/ActivitiesView";

export const metadata: Metadata = { title: "CSR Activities" };

export default function CsrPage() {
  return <ActivitiesView kind="CSR" />;
}
