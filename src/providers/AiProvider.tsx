"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/store";
import { setContextPage, openCommand, closeCommand } from "@/store/slices/aiSlice";
import { useAppSelector } from "@/store";
import { AiDrawer }          from "@/components/ai/AiDrawer";
import { AiFab }             from "@/components/ai/AiFab";
import { AiCommandPalette }  from "@/components/ai/AiCommandPalette";

export function AiProvider({ children }: { children: React.ReactNode }) {
  const dispatch    = useAppDispatch();
  const pathname    = usePathname();
  const isCommandOpen = useAppSelector((s) => s.ai.isCommandOpen);

  // Sync current page into AI context
  React.useEffect(() => {
    dispatch(setContextPage(pathname));
  }, [pathname, dispatch]);

  // Global Cmd+K / Ctrl+K shortcut
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        dispatch(isCommandOpen ? closeCommand() : openCommand());
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, isCommandOpen]);

  return (
    <>
      {children}
      <AiDrawer />
      <AiFab />
      <AiCommandPalette />
    </>
  );
}
