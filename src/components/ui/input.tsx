import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, error, type = "text", ...props }, ref) => {
    const ring = error
      ? "border-destructive focus-within:ring-destructive/30"
      : "border-border focus-within:border-primary focus-within:ring-primary/20";
    return (
      <div
        className={cn(
          "group flex h-12 w-full items-center gap-2 rounded-lg border bg-background px-4 transition-all focus-within:ring-2",
          ring,
          className
        )}
      >
        {leftIcon ? (
          <span className="text-muted-foreground [&_svg]:size-5">{leftIcon}</span>
        ) : null}
        <input
          ref={ref}
          type={type}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        {rightIcon ? (
          <span className="text-muted-foreground [&_svg]:size-5">{rightIcon}</span>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
