import type { Metadata } from "next";
import { EngagementHubView } from "./EngagementHubView";

export const metadata: Metadata = { title: "Engagement" };

export default function EngagementPage() {
  return <EngagementHubView />;
}
