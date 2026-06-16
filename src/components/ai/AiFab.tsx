"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleDrawer } from "@/store/slices/aiSlice";
import { cn } from "@/lib/utils";

export function AiFab() {
  const dispatch   = useAppDispatch();
  const isOpen     = useAppSelector((s) => s.ai.isDrawerOpen);
  const isLoading  = useAppSelector((s) => s.ai.isLoading);

  return (
    <button
      onClick={() => dispatch(toggleDrawer())}
      aria-label={isOpen ? "Close Exterro AI" : "Open Exterro AI"}
      className={cn(
        "fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6",
        "flex h-13 w-13 items-center justify-center rounded-full shadow-lg",
        "transition-all duration-200 hover:scale-105 active:scale-95",
        "bg-gradient-to-br from-primary to-orange-500 text-white",
        isLoading && "animate-pulse",
        isOpen && "rotate-45",
      )}
      style={{ width: 52, height: 52 }}
    >
      <span className="text-xl font-light select-none">✦</span>
    </button>
  );
}
