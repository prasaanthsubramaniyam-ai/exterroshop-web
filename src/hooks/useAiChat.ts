"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  pushMessage, setLoading, setActiveConversation,
  updateLastAssistantMessage,
} from "@/store/slices/aiSlice";
import { aiService } from "@/services/ai.service";
import type { AiMessage } from "@/types/ai.types";
import { usePathname } from "next/navigation";

export function useAiChat() {
  const dispatch     = useAppDispatch();
  const pathname     = usePathname();
  const messages     = useAppSelector((s) => s.ai.messages);
  const isLoading    = useAppSelector((s) => s.ai.isLoading);
  const convId       = useAppSelector((s) => s.ai.activeConversationId);

  const send = React.useCallback(async (text: string, eventType = "CHAT") => {
    if (!text.trim() || isLoading) return;

    const userMsg: AiMessage = { role: "user", content: text };
    dispatch(pushMessage(userMsg));

    const placeholder: AiMessage = { role: "assistant", content: "", isStreaming: true };
    dispatch(pushMessage(placeholder));
    dispatch(setLoading(true));

    try {
      const res = await aiService.chat({
        message: text,
        contextPage: pathname,
        conversationId: convId ?? undefined,
        eventType,
      });

      dispatch(setActiveConversation(res.conversationId));
      dispatch(updateLastAssistantMessage({
        id: res.messageId,
        content: res.reply,
        intent: res.intent,
        agentUsed: res.agentUsed,
        action: res.action,
        isStreaming: false,
      }));

      return res;
    } catch {
      dispatch(updateLastAssistantMessage({
        content: "Something went wrong. Please try again.",
        isStreaming: false,
      }));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, isLoading, convId, pathname]);

  return { messages, isLoading, send };
}
