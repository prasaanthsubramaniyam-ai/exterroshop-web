import type { Metadata } from "next";
import { SecurityView } from "./SecurityView";

export const metadata: Metadata = { title: "Security · ExterroPeople" };

export default function SecurityPage() {
  return <SecurityView />;
}
