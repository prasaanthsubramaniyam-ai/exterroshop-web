import type { Metadata } from "next";
import { CreateProductView } from "./CreateProductView";

export const metadata: Metadata = {
  title: "Sell an item",
};

export default function NewProductPage() {
  return <CreateProductView />;
}
