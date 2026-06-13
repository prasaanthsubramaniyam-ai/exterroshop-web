"use client";

import * as React from "react";
import { Download, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { reportsInsightsService } from "@/services/reports-insights.service";

interface ExportButtonProps {
  reportType: string;
  format?: "XLSX" | "CSV" | "PDF";
  className?: string;
}

export function ExportButton({ reportType, format = "XLSX", className }: ExportButtonProps) {
  const dispatch = useAppDispatch();
  const [state, setState] = React.useState<"idle" | "loading" | "done">("idle");

  async function handleClick() {
    setState("loading");
    try {
      await reportsInsightsService.createExport({ reportType, exportFormat: format });
      setState("done");
      dispatch(pushToast({
        title: "Export queued",
        description: `Your ${format} export will be ready in the Export Center shortly.`,
      }));
      setTimeout(() => setState("idle"), 3000);
    } catch {
      setState("idle");
      dispatch(pushToast({
        title: "Export failed",
        description: "Could not queue the export. Please try again.",
        variant: "destructive",
      }));
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={state !== "idle"}
      className={cn(
        "flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60 transition-colors",
        className
      )}
      title={`Export as ${format}`}
    >
      {state === "loading" ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : state === "done" ? (
        <Check className="size-3.5 text-emerald-600" />
      ) : (
        <Download className="size-3.5" />
      )}
      {state === "done" ? "Queued" : `Export ${format}`}
    </button>
  );
}
