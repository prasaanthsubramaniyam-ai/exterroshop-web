"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { closeDrawer } from "@/store/slices/aiSlice";
import { AiDrawerHeader }     from "./AiDrawerHeader";
import { AiSuggestedActions } from "./AiSuggestedActions";
import { AiChatThread }       from "./AiChatThread";
import { AiChatInput }        from "./AiChatInput";
import { cn } from "@/lib/utils";

export function AiDrawer() {
  const dispatch = useAppDispatch();
  const isOpen   = useAppSelector((s) => s.ai.isDrawerOpen);

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) dispatch(closeDrawer());
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, isOpen]);

  // Prevent body scroll when open on mobile
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => dispatch(closeDrawer())}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Exterro AI Assistant"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-background shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          "sm:w-[400px] sm:border-l sm:border-border",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <AiDrawerHeader />

        {/* Context suggestions */}
        <div className="border-b border-border">
          <AiSuggestedActions />
        </div>

        {/* Chat thread — scrollable */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <AiChatThread />
        </div>

        {/* Sticky input */}
        <AiChatInput eventType="CHAT" />
      </div>
    </>
  );
}
