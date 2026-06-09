"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
          Something went wrong
        </p>
        <h1 className="mt-2 text-display-sm font-semibold tracking-tight">
          We hit an unexpected error
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "Please try again or reload the page."}
        </p>
        <Button onClick={reset} className="mt-6">
          Try again
        </Button>
      </div>
    </div>
  );
}
