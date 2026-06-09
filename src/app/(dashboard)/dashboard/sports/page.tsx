"use client";

import * as React from "react";
import Link from "next/link";
import {
  Trophy, MapPin, Calendar, Users, UserCheck, Loader2,
  ChevronRight, Search, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sportsService,
  type SportsEvent,
  EVENT_TYPE_LABELS,
  STATUS_STYLE,
} from "@/services/sports.service";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function isRegistrationOpen(event: SportsEvent): boolean {
  const now = Date.now();
  if (event.registrationEnd && new Date(event.registrationEnd).getTime() < now) return false;
  if (event.registrationStart && new Date(event.registrationStart).getTime() > now) return false;
  return event.status === "PUBLISHED" || event.status === "ONGOING";
}

function EventCard({ event }: { event: SportsEvent }) {
  const open = isRegistrationOpen(event);
  const slotsLeft = event.maxParticipants != null
    ? Math.max(0, event.maxParticipants - event.participantCount) : null;

  return (
    <div className="group rounded-2xl border border-border bg-background overflow-hidden hover:shadow-md transition-all hover:border-primary/30">
      {/* Banner */}
      <div className="relative h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
        {event.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.bannerUrl} alt={event.title}
            className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
            {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
          </span>
          <span className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            STATUS_STYLE[event.status]
          )}>
            {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-base leading-snug line-clamp-2 mb-2">{event.title}</h3>

        <div className="space-y-1 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" />
            <span>{fmtDate(event.eventDate)} · {fmtTime(event.eventDate)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {/* Slots bar */}
        {event.maxParticipants != null && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1">
                <Users className="size-3" /> {event.participantCount} participants
              </span>
              <span>{slotsLeft} slots left</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, (event.participantCount / event.maxParticipants!) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Volunteers */}
        {event.maxVolunteers != null && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <UserCheck className="size-3.5 shrink-0" />
            <span>{event.volunteerCount}/{event.maxVolunteers} volunteers</span>
          </div>
        )}

        <Link
          href={`/dashboard/sports/event/${event.id}`}
          className={cn(
            "flex items-center justify-center gap-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
            open
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-default"
          )}
        >
          {open ? "View & Register" : "View Details"}
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function UpcomingEventsPage() {
  const [events, setEvents] = React.useState<SportsEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<string>("ALL");

  React.useEffect(() => {
    sportsService.getPublishedEvents()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["ALL", "SPORTS", "CORPORATE"];
  const filtered = events.filter((e) => {
    if (filter !== "ALL" && e.category !== filter) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950">
            <Trophy className="size-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Sports & Events</h1>
            <p className="text-sm text-muted-foreground">Upcoming events open for registration</p>
          </div>
        </div>
        <Link
          href="/dashboard/sports/my-registrations"
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <ClipboardList className="size-4" />
          My Registrations
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                filter === c ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
              )}
            >
              {c === "ALL" ? "All" : c.charAt(0) + c.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin mr-2" /> Loading events…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <Trophy className="size-10 text-muted-foreground/40" />
          <p className="font-medium">No upcoming events</p>
          <p className="text-sm text-muted-foreground">Check back soon for new events!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

