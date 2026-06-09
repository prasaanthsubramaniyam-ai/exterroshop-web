"use client";

import * as React from "react";
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { useCms } from "@/context/CmsContext";
import { cn } from "@/lib/utils";

const TYPE_STYLES = {
  info:    { bar: "bg-blue-50 text-blue-800 border-blue-200",    icon: Info },
  warning: { bar: "bg-yellow-50 text-yellow-800 border-yellow-200", icon: AlertTriangle },
  success: { bar: "bg-green-50 text-green-800 border-green-200",  icon: CheckCircle },
  error:   { bar: "bg-red-50 text-red-800 border-red-200",       icon: AlertCircle },
} as const;

type AnnouncementType = keyof typeof TYPE_STYLES;

export function AnnouncementBar() {
  const { cms, ready } = useCms();
  const [dismissed, setDismissed] = React.useState(false);

  const enabled  = cms("announcement.enabled",  "false") === "true";
  const message  = cms("announcement.message",  "");
  const rawType  = cms("announcement.type",     "info");
  const type     = (rawType in TYPE_STYLES ? rawType : "info") as AnnouncementType;

  // Reset dismissed state if the message changes (new announcement)
  const prevMessage = React.useRef(message);
  React.useEffect(() => {
    if (message !== prevMessage.current) {
      setDismissed(false);
      prevMessage.current = message;
    }
  }, [message]);

  if (!ready || !enabled || !message || dismissed) return null;

  const { bar, icon: Icon } = TYPE_STYLES[type];

  return (
    <div className={cn("flex items-center gap-3 border-b px-4 py-2 text-sm", bar)}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <p className="flex-1">{message}</p>
      <button
        onClick={() => setDismissed(true)}
        className="rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
