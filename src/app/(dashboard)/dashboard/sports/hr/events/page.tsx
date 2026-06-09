"use client";

import * as React from "react";
import Link from "next/link";
import {
  Trophy, PlusCircle, Loader2, Trash2,
  Eye, Globe, Calendar, MapPin, Users, MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sportsService, type SportsEvent, EVENT_TYPE_LABELS, STATUS_STYLE,
} from "@/services/sports.service";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function HREventsPage() {
  const [events, setEvents] = React.useState<SportsEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<string>("ALL");
  const [actionId, setActionId] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState<number | null>(null);

  const load = () => {
    setLoading(true);
    sportsService.getAllEvents()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  React.useEffect(load, []);

  const statuses = ["ALL", "DRAFT", "PUBLISHED", "ONGOING", "COMPLETED", "CANCELLED"];
  const filtered = filter === "ALL" ? events : events.filter((e) => e.status === filter);

  const handlePublish = async (id: number) => {
    setBusy(id);
    try {
      const updated = await sportsService.publishEvent(id);
      setEvents((prev) => prev.map((e) => e.id === id ? updated : e));
    } finally { setBusy(null); setActionId(null); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setBusy(id);
    try {
      await sportsService.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } finally { setBusy(null); setActionId(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950">
            <Trophy className="size-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Events</h1>
            <p className="text-sm text-muted-foreground">Create and manage sports events</p>
          </div>
        </div>
        <Link
          href="/dashboard/sports/hr/events/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <PlusCircle className="size-4" />
          New Event
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
              filter === s ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
            )}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            <span className="ml-1.5 opacity-60">
              {s === "ALL" ? events.length : events.filter((e) => e.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Trophy className="size-10 text-muted-foreground/40" />
          <p className="font-medium">No events yet</p>
          <Link href="/dashboard/sports/hr/events/new" className="text-sm text-primary hover:underline">
            Create the first event
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => (
            <div key={event.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4"
            >
              {/* Banner thumb */}
              <div className="size-16 shrink-0 rounded-xl overflow-hidden bg-muted">
                {event.bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Trophy className="size-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-1">{event.title}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" /> {fmtDate(event.eventDate)}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" /> {event.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="size-3" /> {event.participantCount} participants
                  </span>
                </div>
              </div>

              {/* Status */}
              <span className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold hidden sm:inline-flex",
                STATUS_STYLE[event.status]
              )}>
                {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
              </span>

              {/* Actions */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setActionId(actionId === event.id ? null : event.id)}
                  className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                >
                  <MoreVertical className="size-4 text-muted-foreground" />
                </button>
                {actionId === event.id && (
                  <div className="absolute right-0 top-8 z-20 w-48 rounded-xl border border-border bg-background shadow-lg py-1">
                    {event.status === "DRAFT" && (
                      <button
                        onClick={() => handlePublish(event.id)}
                        disabled={busy === event.id}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-emerald-600"
                      >
                        <Globe className="size-4" />
                        {busy === event.id ? "Publishing…" : "Publish Event"}
                      </button>
                    )}
                    <Link
                      href={`/dashboard/sports/hr/events/${event.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => setActionId(null)}
                    >
                      <Eye className="size-4" />
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={busy === event.id}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-destructive"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
