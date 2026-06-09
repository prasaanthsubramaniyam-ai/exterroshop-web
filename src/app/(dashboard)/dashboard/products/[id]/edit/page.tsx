import type { Metadata } from "next";
import { EditProductView } from "./EditProductView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  return <EditProductView productId={Number(id)} />;
}
