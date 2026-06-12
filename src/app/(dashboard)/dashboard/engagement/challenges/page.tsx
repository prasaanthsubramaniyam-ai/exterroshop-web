import type { Metadata } from "next";
import { ActivitiesView } from "../activity/ActivitiesView";

export const metadata: Metadata = { title: "Challenges" };

export default function ChallengesPage() {
  return <ActivitiesView kind="CHALLENGE" />;
}
