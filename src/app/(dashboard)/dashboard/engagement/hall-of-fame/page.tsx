import type { Metadata } from "next";
import { HallOfFameView } from "./HallOfFameView";

export const metadata: Metadata = { title: "Hall of Fame" };

export default function HallOfFamePage() {
  return <HallOfFameView />;
}
