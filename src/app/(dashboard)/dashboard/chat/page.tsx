import type { Metadata } from "next";
import { ChatListView } from "./ChatListView";

export const metadata: Metadata = { title: "Chats" };

export default function ChatPage() {
  return <ChatListView />;
}
