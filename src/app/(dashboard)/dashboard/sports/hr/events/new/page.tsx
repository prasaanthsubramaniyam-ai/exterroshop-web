"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { sportsService, type CreateEventPayload } from "@/services/sports.service";
import { cn } from "@/lib/utils";


const EVENT_TYPES = [
  { value: "CRICKET",       label: "Cricket" },
  { value: "FOOTBALL",      label: "Football" },
  { value: "VOLLEYBALL",    label: "Volleyball" },
  { value: "BASKETBALL",    label: "Basketball" },
  { value: "BADMINTON",     label: "Badminton" },
  { value: "TABLE_TENNIS",  label: "Table Tennis" },
  { value: "CHESS",         label: "Chess" },
  { value: "CARROM",        label: "Carrom" },
  { value: "RUNNING",       label: "Running" },
  { value: "CYCLING",       label: "Cycling" },
  { value: "HACKATHON",     label: "Hackathon" },
  { value: "INNOVATION_DAY", label: "Innovation Day" },
  { value: "TEAM_BUILDING", label: "Team Building" },
  { value: "CSR_ACTIVITY",  label: "CSR Activity" },
  { value: "CULTURAL_EVENT", label: "Cultural Event" },
];

function Field({ label, children, error }: {
  label: string; children: React.ReactNode; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<CreateEventPayload & { category: string }>({
    title: "", description: "", eventType: "CRICKET", category: "SPORTS",
    location: "", eventDate: "", registrationStart: "", registrationEnd: "",
    maxParticipants: undefined, maxVolunteers: undefined, bannerUrl: "",
  });

  const set = (key: keyof typeof form, value: string | number | undefined) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.eventDate) {
      setError("Title and Event Date are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sportsService.createEvent({
        ...form,
        maxParticipants: form.maxParticipants || undefined,
        maxVolunteers:   form.maxVolunteers   || undefined,
        bannerUrl:       form.bannerUrl       || undefined,
      });
      router.push("/dashboard/sports/hr/events");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const isCorpEvent = ["HACKATHON","INNOVATION_DAY","TEAM_BUILDING","CSR_ACTIVITY","CULTURAL_EVENT"].includes(form.eventType);
  React.useEffect(() => {
    if (isCorpEvent) setForm((p) => ({ ...p, category: "CORPORATE" }));
    else setForm((p) => ({ ...p, category: "SPORTS" }));
  }, [form.eventType, isCorpEvent]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-xl border border-border p-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Create New Event</h1>
          <p className="text-sm text-muted-foreground">Fill in the details to create a sports or corporate event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Event type */}
        <Field label="Event Type *">
          <select
            value={form.eventType}
            onChange={(e) => set("eventType", e.target.value)}
            className={inputCls}
          >
            <optgroup label="Sports">
              {EVENT_TYPES.filter((_, i) => i < 10).map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </optgroup>
            <optgroup label="Corporate Events">
              {EVENT_TYPES.filter((_, i) => i >= 10).map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </optgroup>
          </select>
        </Field>

        {/* Title */}
        <Field label="Event Title *">
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Annual Cricket Tournament 2025"
            className={inputCls}
          />
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the event…"
            rows={3}
            className={cn(inputCls, "resize-y")}
          />
        </Field>

        {/* Location */}
        <Field label="Venue / Location">
          <input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. Ground A, Main Campus"
            className={inputCls}
          />
        </Field>

        {/* Date + times */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Event Date & Time *">
            <input
              type="datetime-local"
              value={form.eventDate}
              onChange={(e) => set("eventDate", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Registration Opens">
            <input
              type="datetime-local"
              value={form.registrationStart}
              onChange={(e) => set("registrationStart", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Registration Closes">
            <input
              type="datetime-local"
              value={form.registrationEnd}
              onChange={(e) => set("registrationEnd", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        {/* Limits */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Max Participants">
            <input
              type="number" min={1}
              value={form.maxParticipants ?? ""}
              onChange={(e) => set("maxParticipants", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Unlimited"
              className={inputCls}
            />
          </Field>
          <Field label="Max Volunteers">
            <input
              type="number" min={1}
              value={form.maxVolunteers ?? ""}
              onChange={(e) => set("maxVolunteers", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Unlimited"
              className={inputCls}
            />
          </Field>
        </div>

        {/* Banner URL */}
        <Field label="Banner Image URL">
          <input
            value={form.bannerUrl}
            onChange={(e) => set("bannerUrl", e.target.value)}
            placeholder="https://… or leave blank"
            className={inputCls}
          />
        </Field>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Creating…" : "Create Event (Draft)"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
