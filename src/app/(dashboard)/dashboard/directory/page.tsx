import type { Metadata } from "next";
import { DirectoryView } from "./DirectoryView";

export const metadata: Metadata = { title: "Directory" };

export default function DirectoryPage() {
  return <DirectoryView />;
}
