import type { Metadata } from "next";
import { AnnouncementsView } from "./AnnouncementsView";

export const metadata: Metadata = { title: "Announcements" };

export default function AnnouncementsPage() {
  return <AnnouncementsView />;
}
