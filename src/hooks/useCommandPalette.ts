"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { openCommand, closeCommand } from "@/store/slices/aiSlice";

export function useCommandPalette() {
  const dispatch   = useAppDispatch();
  const isOpen     = useAppSelector((s) => s.ai.isCommandOpen);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        dispatch(isOpen ? closeCommand() : openCommand());
      }
      if (e.key === "Escape" && isOpen) {
        dispatch(closeCommand());
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, isOpen]);

  return {
    isOpen,
    open:  () => dispatch(openCommand()),
    close: () => dispatch(closeCommand()),
  };
}
