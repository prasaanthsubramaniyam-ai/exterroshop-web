import type { Metadata } from "next";
import { SurveysView } from "./SurveysView";

export const metadata: Metadata = { title: "Surveys" };

export default function SurveysPage() {
  return <SurveysView />;
}
