import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AiMessage, AiConversation, AiSummary } from "@/types/ai.types";

interface AiState {
  isDrawerOpen: boolean;
  isCommandOpen: boolean;
  activeConversationId: number | null;
  messages: AiMessage[];
  conversations: AiConversation[];
  summary: AiSummary | null;
  isLoading: boolean;
  contextPage: string;
}

const initialState: AiState = {
  isDrawerOpen: false,
  isCommandOpen: false,
  activeConversationId: null,
  messages: [],
  conversations: [],
  summary: null,
  isLoading: false,
  contextPage: "/dashboard",
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    openDrawer(state) {
      state.isDrawerOpen = true;
      state.isCommandOpen = false;
    },
    closeDrawer(state) {
      state.isDrawerOpen = false;
    },
    toggleDrawer(state) {
      state.isDrawerOpen = !state.isDrawerOpen;
      if (state.isDrawerOpen) state.isCommandOpen = false;
    },
    openCommand(state) {
      state.isCommandOpen = true;
      state.isDrawerOpen = false;
    },
    closeCommand(state) {
      state.isCommandOpen = false;
    },
    toggleCommand(state) {
      state.isCommandOpen = !state.isCommandOpen;
    },
    setContextPage(state, action: PayloadAction<string>) {
      state.contextPage = action.payload;
    },
    pushMessage(state, action: PayloadAction<AiMessage>) {
      state.messages.push(action.payload);
    },
    setMessages(state, action: PayloadAction<AiMessage[]>) {
      state.messages = action.payload;
    },
    updateLastAssistantMessage(state, action: PayloadAction<Partial<AiMessage>>) {
      const last = [...state.messages].reverse().find((m) => m.role === "assistant");
      if (last) Object.assign(last, action.payload);
    },
    setConversations(state, action: PayloadAction<AiConversation[]>) {
      state.conversations = action.payload;
    },
    setActiveConversation(state, action: PayloadAction<number | null>) {
      state.activeConversationId = action.payload;
    },
    setSummary(state, action: PayloadAction<AiSummary>) {
      state.summary = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    clearMessages(state) {
      state.messages = [];
      state.activeConversationId = null;
    },
  },
});

export const {
  openDrawer, closeDrawer, toggleDrawer,
  openCommand, closeCommand, toggleCommand,
  setContextPage,
  pushMessage, setMessages, updateLastAssistantMessage,
  setConversations, setActiveConversation,
  setSummary, setLoading, clearMessages,
} = aiSlice.actions;

export default aiSlice.reducer;
