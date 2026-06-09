import type { Metadata } from "next";
import { ProductsView } from "./ProductsView";

export const metadata: Metadata = {
  title: "Products",
};

export default function ProductsPage() {
  return <ProductsView />;
}
