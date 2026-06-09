"use client";

import * as React from "react";
import { Bell, Check, MessageCircle, Phone, PhoneOff, CalendarClock, CalendarCheck, CalendarX } from "lucide-react";
import { useRouter } from "next/navigation";
import { notificationService } from "@/services/notification.service";
import type { Notification } from "@/types";
import { formatTimeAgo } from "@/utils/format";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);

  const load = React.useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        notificationService.getAll(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch {}
  }, []);

  React.useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  // close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await notificationService.markRead(n.id);
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.type === "new_message" && n.referenceId) {
      router.push(`/dashboard/chat/${n.referenceId}`);
    } else if (n.referenceId && n.referenceType === "product") {
      router.push(`/dashboard/products/${n.referenceId}`);
    } else if (n.type?.includes("call_request")) {
      router.push("/dashboard/call-requests");
    } else if (n.type === "leave_applied") {
      router.push("/dashboard/approvals");
    } else if (n.type === "leave_approved" || n.type === "leave_rejected") {
      router.push("/dashboard/leave");
    }
  };

  const icon = (type: Notification["type"]) => {
    if (type === "new_message")           return <MessageCircle  className="size-4 text-primary" />;
    if (type === "call_request_accepted") return <Phone          className="size-4 text-green-500" />;
    if (type === "call_request_rejected") return <PhoneOff       className="size-4 text-destructive" />;
    if (type === "leave_applied")         return <CalendarClock  className="size-4 text-amber-500" />;
    if (type === "leave_approved")        return <CalendarCheck  className="size-4 text-emerald-500" />;
    if (type === "leave_rejected")        return <CalendarX      className="size-4 text-destructive" />;
    return <Phone className="size-4 text-primary" />;
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Check className="size-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface",
                    !n.isRead && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-surface">
                    {icon(n.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm", !n.isRead && "font-semibold")}>{n.title}</p>
                    {n.body && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{n.body}</p>}
                    <p className="mt-1 text-[11px] text-muted-foreground">{formatTimeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
