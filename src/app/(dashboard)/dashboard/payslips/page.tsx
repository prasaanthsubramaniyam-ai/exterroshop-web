import type { Metadata } from "next";
import { PayslipsView } from "./PayslipsView";

export const metadata: Metadata = { title: "Payslips" };

export default function PayslipsPage() {
  return <PayslipsView />;
}
