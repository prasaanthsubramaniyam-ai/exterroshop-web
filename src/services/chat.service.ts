import client, { unwrap } from "./api";
import type { Conversation, Message } from "@/types";

export const chatService = {
  async getOrCreateConversation(productId: number): Promise<Conversation> {
    const res = await client.post<{ data: Conversation }>(`/chat/conversations?productId=${productId}`);
    return unwrap<Conversation>(res);
  },
  async getConversations(): Promise<Conversation[]> {
    const res = await client.get<{ data: Conversation[] }>("/chat/conversations");
    return unwrap<Conversation[]>(res);
  },
  async getMessages(conversationId: number, page = 0, size = 30): Promise<Message[]> {
    const res = await client.get<{ data: Message[] | { content: Message[] } } | Message[] | { content: Message[] }>(
      `/chat/messages/${conversationId}?page=${page}&size=${size}`
    );
    // Backend may return either { data: Message[] } (new) or a Spring Page
    // (old: { content: [...] }) — handle both transparently.
    const body = unwrap<Message[] | { content: Message[] }>(
      res as { data: Message[] | { content: Message[] } }
    );
    if (Array.isArray(body)) return body;
    if (body && typeof body === "object" && "content" in body && Array.isArray((body as { content: unknown }).content)) {
      return (body as { content: Message[] }).content;
    }
    return [];
  },
  async sendMessage(conversationId: number, content: string): Promise<Message> {
    const res = await client.post<{ data: Message }>(
      `/chat/messages/${conversationId}`,
      { content }
    );
    return unwrap<Message>(res);
  },
  async markRead(conversationId: number): Promise<void> {
    await client.put(`/chat/messages/${conversationId}/read`);
  },
};
