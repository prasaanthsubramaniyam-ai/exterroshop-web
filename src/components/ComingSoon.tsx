import * as React from "react";
import { Construction, type LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function ComingSoon({ title, description, icon: Icon = Construction }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="size-8 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground max-w-sm">
          {description ?? "This module is coming soon. Check back in a future release."}
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
        In Development
      </span>
    </div>
  );
}
