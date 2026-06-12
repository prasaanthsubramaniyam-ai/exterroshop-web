import type { Metadata } from "next";
import { IdeasView } from "./IdeasView";

export const metadata: Metadata = { title: "Suggestions & Ideas" };

export default function IdeasPage() {
  return <IdeasView />;
}
