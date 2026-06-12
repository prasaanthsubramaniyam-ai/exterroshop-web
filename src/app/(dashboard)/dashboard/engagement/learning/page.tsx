import type { Metadata } from "next";
import { ActivitiesView } from "../activity/ActivitiesView";

export const metadata: Metadata = { title: "Learning Events" };

export default function LearningPage() {
  return <ActivitiesView kind="LEARNING" />;
}
