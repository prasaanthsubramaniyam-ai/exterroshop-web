import type { Metadata } from "next";
import { HomeView } from "./HomeView";

export const metadata: Metadata = {
  title: "Home",
};

export default function DashboardHomePage() {
  return <HomeView />;
}
