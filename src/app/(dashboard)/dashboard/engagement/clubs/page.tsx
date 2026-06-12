import type { Metadata } from "next";
import { ClubsView } from "./ClubsView";

export const metadata: Metadata = { title: "Clubs & Communities" };

export default function ClubsPage() {
  return <ClubsView />;
}
