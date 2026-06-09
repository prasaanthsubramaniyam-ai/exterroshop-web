"use client";

import * as React from "react";
import {
  Bell, Check, MessageCircle, Phone, PhoneOff,
  CalendarClock, CalendarCheck, CalendarX, Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { notificationService } from "@/services/notification.service";
import type { Notification } from "@/types";
import { formatTimeAgo } from "@/utils/format";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  new_message:           { icon: MessageCircle, color: "text-primary",        label: "New message"     },
  call_request_received: { icon: Phone,         color: "text-primary",        label: "Call request"    },
  call_request_accepted: { icon: Phone,         color: "text-emerald-500",    label: "Call accepted"   },
  call_request_rejected: { icon: PhoneOff,      color: "text-destructive",    label: "Call rejected"   },
  leave_applied:         { icon: CalendarClock, color: "text-amber-500",      label: "Leave request"   },
  leave_approved:        { icon: CalendarCheck, color: "text-emerald-500",    label: "Leave approved"  },
  leave_rejected:        { icon: CalendarX,     color: "text-destructive",    label: "Leave rejected"  },
};

function navTarget(n: Notification): string | null {
  if (n.type === "new_message" && n.referenceId) return `/dashboard/chat/${n.referenceId}`;
  if (n.referenceType === "product" && n.referenceId) return `/dashboard/products/${n.referenceId}`;
  if (n.type?.includes("call_request"))  return "/dashboard/call-requests";
  if (n.type === "leave_applied")        return "/dashboard/approvals";
  if (n.type === "leave_approved" || n.type === "leave_rejected") return "/dashboard/leave";
  return null;
}

export function NotificationsView() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading]             = React.useState(true);

  React.useEffect(() => {
    notificationService.getAll()
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await notificationService.markRead(n.id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
      );
    }
    const target = navTarget(n);
    if (target) router.push(target);
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Bell className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Notifications</h1>
            <p className="text-xs text-muted-foreground">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            <Check className="size-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty */}
      {!loading && notifications.length === 0 && (
        <div className="rounded-2xl border border-border bg-background py-14 text-center">
          <Bell className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">No notifications yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            You&apos;ll see leave updates and messages here
          </p>
        </div>
      )}

      {/* List */}
      {!loading && notifications.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          {notifications.map((n, idx) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.call_request_received;
            const Icon = meta.icon;
            const target = navTarget(n);

            return (
              <button
                key={n.id}
                type="button"
                onClick={() => handleClick(n)}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50",
                  idx > 0 && "border-t border-border/60",
                  !n.isRead && "bg-primary/5"
                )}
              >
                {/* Icon */}
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className={cn("size-4", meta.color)} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm", !n.isRead && "font-semibold")}>{n.title}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  {n.body && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground">{meta.label}</p>
                </div>

                {/* Unread dot */}
                {!n.isRead && (
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                )}

                {/* Nav arrow */}
                {target && (
                  <span className="mt-2 text-muted-foreground/40 text-xs">›</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
