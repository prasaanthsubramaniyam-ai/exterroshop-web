import type { Metadata } from "next";
import { ChatConversationView } from "./ChatConversationView";

export const metadata: Metadata = { title: "Chat" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatConversationPage({ params }: PageProps) {
  const { id } = await params;
  return <ChatConversationView conversationId={Number(id)} />;
}
