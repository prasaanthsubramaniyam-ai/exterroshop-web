import * as React from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12 lg:text-primary-foreground">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.svg"
              width={32}
              height={32}
              alt="ExterroShop"
              className="brightness-0 invert"
              priority
            />
            <Image
              src="/logo-name.svg"
              width={120}
              height={28}
              alt="ExterroShop"
              className="brightness-0 invert"
              priority
            />
          </div>

          <div className="max-w-md">
            <h1 className="text-display-md font-semibold leading-tight tracking-tight">
              The marketplace for the people you already work with.
            </h1>
            <p className="mt-4 text-base text-primary-foreground/80">
              Buy and sell across Chennai, Coimbatore and Bangalore offices —
              with people you trust.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm text-primary-foreground/85">
            <Stat label="Active listings" value="1,240+" />
            <Stat label="Employees" value="3,500+" />
            <Stat label="Offices" value="3" />
          </div>
        </div>

        <div className="flex items-center justify-center bg-background p-6 sm:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xl font-semibold leading-tight">{value}</p>
      <p className="text-xs uppercase tracking-wider text-primary-foreground/70">
        {label}
      </p>
    </div>
  );
}
