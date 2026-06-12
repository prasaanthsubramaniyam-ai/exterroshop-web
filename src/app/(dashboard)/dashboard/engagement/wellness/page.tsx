import type { Metadata } from "next";
import { ActivitiesView } from "../activity/ActivitiesView";

export const metadata: Metadata = { title: "Wellness Programs" };

export default function WellnessPage() {
  return <ActivitiesView kind="WELLNESS" />;
}
