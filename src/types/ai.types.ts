export interface AiAction {
  type: "NAVIGATE" | "APPLY_LEAVE" | "CHECK_IN" | "OPEN_FORM" | "NONE";
  url?: string;
  label?: string;
  data?: Record<string, unknown>;
}

export interface AiMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  agentUsed?: string;
  createdAt?: string;
  action?: AiAction;
  isStreaming?: boolean;
}

export interface AiConversation {
  id: number;
  title: string;
  contextPage?: string;
  createdAt: string;
  updatedAt: string;
  messages?: AiMessage[];
}

export interface AiChatResponse {
  conversationId: number;
  messageId: number;
  reply: string;
  intent: string;
  agentUsed: string;
  action: AiAction;
}

export interface AiSummary {
  greeting: string;
  pendingApprovals: number;
  checkedInToday: boolean;
  leaveBalance: number;
  engagementPoints: number;
  engagementRank: number;
  suggestedActions: string[];
  recentActivities: Array<{
    type: string;
    title: string;
    timeAgo: string;
  }>;
}

export type AiEventType = "CHAT" | "COMMAND" | "FAB" | "HEADER" | "SUGGESTION";

export interface AiSuggestion {
  label: string;
  prompt: string;
  icon: string;
  url?: string;
}
