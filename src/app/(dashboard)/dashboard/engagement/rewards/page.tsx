import type { Metadata } from "next";
import { RewardsStoreView } from "./RewardsStoreView";

export const metadata: Metadata = { title: "Rewards Store" };

export default function RewardsStorePage() {
  return <RewardsStoreView />;
}
