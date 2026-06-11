import type { Metadata } from "next";
import { RecognitionView } from "./RecognitionView";

export const metadata: Metadata = { title: "Rewards & Recognition" };

export default function RecognitionPage() {
  return <RecognitionView />;
}
