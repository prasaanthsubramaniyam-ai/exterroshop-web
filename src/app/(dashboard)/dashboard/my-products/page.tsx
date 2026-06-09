import type { Metadata } from "next";
import { MyProductsView } from "./MyProductsView";

export const metadata: Metadata = { title: "My products" };

export default function MyProductsPage() {
  return <MyProductsView />;
}
