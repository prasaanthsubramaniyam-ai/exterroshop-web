import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toasts: Toast[];
}

const initialState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapsed(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    pushToast(state, action: PayloadAction<Omit<Toast, "id">>) {
      state.toasts.push({
        id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        ...action.payload,
      });
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleSidebar, setSidebarOpen,
  toggleSidebarCollapsed, setSidebarCollapsed,
  pushToast, dismissToast,
} = uiSlice.actions;
export default uiSlice.reducer;
