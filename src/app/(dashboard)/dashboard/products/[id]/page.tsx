import type { Metadata } from "next";
import { ProductDetailsView } from "./ProductDetailsView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Product · ${id}` };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductDetailsView productId={Number(id)} />;
}
