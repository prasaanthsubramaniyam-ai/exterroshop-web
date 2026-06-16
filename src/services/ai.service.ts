import api from "./api";
import type { AiChatResponse, AiConversation, AiSummary } from "@/types/ai.types";

const BASE = "/ai";

export const aiService = {
  chat(params: {
    message: string;
    contextPage?: string;
    conversationId?: number;
    eventType?: string;
  }): Promise<AiChatResponse> {
    return api.post(`${BASE}/chat`, params).then((r) => r.data.data);
  },

  getConversations(): Promise<AiConversation[]> {
    return api.get(`${BASE}/conversations`).then((r) => r.data.data);
  },

  getConversation(id: number): Promise<AiConversation> {
    return api.get(`${BASE}/conversations/${id}`).then((r) => r.data.data);
  },

  getSummary(): Promise<AiSummary> {
    return api.get(`${BASE}/summary`).then((r) => r.data.data);
  },
};
