"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Eye,
  Globe,
  Languages,
  Lock,
  LogOut,
  Moon,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Settings"
        description="Customize your ExterroShop experience."
      />

      <SettingsGroup title="Notifications">
        <SettingsRow
          icon={<Bell className="size-5" />}
          label="Email notifications"
          description="Get updates about new messages and offers."
          control={<Switch defaultChecked />}
        />
        <SettingsRow
          icon={<Eye className="size-5" />}
          label="Profile visibility"
          description="Show your profile to other employees."
          control={<Switch defaultChecked />}
        />
      </SettingsGroup>

      <SettingsGroup title="Appearance">
        <SettingsRow
          icon={<Moon className="size-5" />}
          label="Dark mode"
          description="Coming soon."
          control={<Switch disabled />}
        />
        <SettingsRow
          icon={<Languages className="size-5" />}
          label="Language"
          description="English (India)"
        />
        <SettingsRow
          icon={<Globe className="size-5" />}
          label="Currency"
          description="Indian Rupee (₹)"
        />
      </SettingsGroup>

      <SettingsGroup title="Security">
        <SettingsRow
          icon={<Lock className="size-5" />}
          label="Change password"
          description="Update your account password."
          control={<Button size="sm" variant="outline">Change</Button>}
        />
      </SettingsGroup>

      <SettingsGroup title="Account">
        <SettingsRow
          icon={<LogOut className="size-5" />}
          label="Sign out"
          description="Sign out of all your devices."
          control={
            <Button size="sm" variant="outline" onClick={handleLogout}>
              Sign out
            </Button>
          }
        />
        <SettingsRow
          danger
          icon={<Trash2 className="size-5" />}
          label="Delete account"
          description="Permanently delete your account and listings."
          control={<Button size="sm" variant="outline" className="text-destructive">Delete</Button>}
        />
      </SettingsGroup>
    </div>
  );
}

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="divide-y divide-border rounded-lg border border-border/60 bg-card shadow-card">
        {children}
      </div>
    </section>
  );
}

function SettingsRow({
  icon,
  label,
  description,
  control,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  control?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-4 sm:p-5">
      <span
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center rounded-lg",
          danger
            ? "bg-destructive/10 text-destructive"
            : "bg-surface text-muted-foreground"
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            danger ? "text-destructive" : "text-foreground"
          )}
        >
          {label}
        </p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {control}
    </div>
  );
}

function Switch({
  defaultChecked,
  disabled,
}: {
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  const [checked, setChecked] = React.useState(!!defaultChecked);
  return (
    <button
      type="button"
      onClick={() => !disabled && setChecked((v) => !v)}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-border"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-card transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
