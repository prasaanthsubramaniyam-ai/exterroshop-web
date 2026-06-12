import type { Metadata } from "next";
import { ClubDetailView } from "./ClubDetailView";

export const metadata: Metadata = { title: "Club" };

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClubDetailView clubId={Number(id)} />;
}
