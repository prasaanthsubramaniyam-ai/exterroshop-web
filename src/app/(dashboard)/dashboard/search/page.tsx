import type { Metadata } from "next";
import { SearchView } from "./SearchView";

export const metadata: Metadata = { title: "Search results" };

export default function SearchPage() {
  return <SearchView />;
}
