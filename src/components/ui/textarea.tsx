import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[120px] w-full rounded-lg border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        error
          ? "border-destructive focus:ring-destructive/30"
          : "border-border focus:border-primary focus:ring-primary/20",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
