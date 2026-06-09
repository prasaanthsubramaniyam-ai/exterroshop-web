import type { Metadata } from "next";
import { HolidaysView } from "./HolidaysView";

export const metadata: Metadata = { title: "Holiday Calendar" };

export default function HolidaysPage() {
  return <HolidaysView />;
}
