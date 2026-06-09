"use client";

import * as React from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { tokenStorage } from "@/utils/storage";
import { API_BASE_URL } from "@/constants";

const WS_URL = API_BASE_URL.replace("/api/v1", "") + "/api/v1/ws";

interface UseWebSocketOptions {
  conversationId?: number;
  onMessage?: (msg: unknown) => void;
  onTyping?: (data: unknown) => void;
  onRead?: (data: unknown) => void;
}

export function useWebSocket({ conversationId, onMessage, onTyping, onRead }: UseWebSocketOptions = {}) {
  const clientRef = React.useRef<Client | null>(null);
  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        if (conversationId) {
          // Backend frames are { type, data, senderId } — unwrap `data` for callbacks,
          // but pass senderId alongside (typing/read use it to filter self-events).
          stompClient.subscribe(`/topic/conversation/${conversationId}`, (frame: IMessage) => {
            try {
              const env = JSON.parse(frame.body) as { type: string; data: unknown; senderId: number };
              onMessage?.(env.data);
            } catch {}
          });
          stompClient.subscribe(`/topic/typing/${conversationId}`, (frame: IMessage) => {
            try {
              const env = JSON.parse(frame.body) as { type: string; data: { typing: boolean }; senderId: number };
              onTyping?.({ typing: env.data?.typing, senderId: env.senderId });
            } catch {}
          });
          stompClient.subscribe(`/topic/read/${conversationId}`, (frame: IMessage) => {
            try {
              const env = JSON.parse(frame.body) as { type: string; data: unknown; senderId: number };
              onRead?.({ senderId: env.senderId });
            } catch {}
          });
        }
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
      clientRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const sendMessage = React.useCallback((conversationId: number, content: string) => {
    clientRef.current?.publish({
      destination: `/app/chat/send/${conversationId}`,
      body: JSON.stringify({ content }),
    });
  }, []);

  const sendTyping = React.useCallback((conversationId: number, typing: boolean) => {
    clientRef.current?.publish({
      destination: `/app/chat/typing/${conversationId}`,
      body: JSON.stringify({ typing }),
    });
  }, []);

  const sendRead = React.useCallback((conversationId: number) => {
    clientRef.current?.publish({
      destination: `/app/chat/read/${conversationId}`,
      body: JSON.stringify({}),
    });
  }, []);

  return { connected, sendMessage, sendTyping, sendRead };
}
