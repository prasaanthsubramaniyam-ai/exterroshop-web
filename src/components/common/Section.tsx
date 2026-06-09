import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({
  title,
  href,
  hrefLabel = "See all",
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between">
        <h2 className="text-display-xs font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-600"
          >
            {hrefLabel}
            <ArrowRight className="size-4" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
