"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useCms } from "@/context/CmsContext";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  const { cms } = useCms();
  // app.logo.url      = icon image URL (32×32 square)
  // app.logo.name     = wordmark image URL (wide, e.g. "ExterroShop" text as SVG/PNG)
  const logoUrl     = cms("app.logo.url",  "");
  const wordmarkUrl = cms("app.logo.name", "");

  return (
    <Link
      href="/dashboard"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      {/* Icon — use CMS URL when set, otherwise the default SVG */}
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          width={32}
          height={32}
          alt="Logo"
          className="size-8 object-contain"
        />
      ) : (
        <Image
          src="/logo.svg"
          width={32}
          height={32}
          alt="Logo"
          priority
        />
      )}

      {/* Wordmark — use CMS wordmark image when set, otherwise the default SVG */}
      {showWordmark ? (
        wordmarkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={wordmarkUrl}
            height={32}
            alt="Wordmark"
            className="h-8 w-auto object-contain"
          />
        ) : (
          <Image
            src="/logo-name.svg"
            width={165}
            height={32}
            alt="ExterroShop"
            priority
          />
        )
      ) : null}
    </Link>
  );
}
