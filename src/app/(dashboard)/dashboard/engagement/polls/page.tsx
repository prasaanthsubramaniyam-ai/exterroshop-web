import type { Metadata } from "next";
import { PollsView } from "./PollsView";

export const metadata: Metadata = { title: "Polls" };

export default function PollsPage() {
  return <PollsView />;
}
