import type { Metadata } from "next";
import { CelebrationsView } from "./CelebrationsView";

export const metadata: Metadata = { title: "Celebrations" };

export default function CelebrationsPage() {
  return <CelebrationsView />;
}
