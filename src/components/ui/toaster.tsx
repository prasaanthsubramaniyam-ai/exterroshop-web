"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { dismissToast } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const VARIANTS: Record<string, { icon: React.ReactNode; classes: string }> = {
  default: { icon: null, classes: "border-border" },
  success: {
    icon: <CheckCircle2 className="size-5 text-success" />,
    classes: "border-success/30",
  },
  destructive: {
    icon: <AlertCircle className="size-5 text-destructive" />,
    classes: "border-destructive/30",
  },
};

const TOAST_TTL = 4000;

export function Toaster() {
  const toasts = useAppSelector((s) => s.ui.toasts);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(dismissToast(t.id)), TOAST_TTL)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const variant = VARIANTS[t.variant ?? "default"] ?? VARIANTS.default;
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border bg-background p-4 shadow-lg animate-slide-up",
              variant.classes
            )}
          >
            {variant.icon}
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
              {t.description ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dispatch(dismissToast(t.id))}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
