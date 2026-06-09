"use client";

import * as React from "react";
import { ImageIcon, PlusCircle, Loader2, Trash2, X } from "lucide-react";
import { sportsService, type GalleryImage, type SportsEvent } from "@/services/sports.service";

export default function HRGalleryPage() {
  const [events, setEvents] = React.useState<SportsEvent[]>([]);
  const [images, setImages] = React.useState<GalleryImage[]>([]);
  const [selectedEvent, setSelectedEvent] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ imageUrl: "", caption: "" });
  const [busy, setBusy] = React.useState(false);
  const [lightbox, setLightbox] = React.useState<GalleryImage | null>(null);

  React.useEffect(() => {
    sportsService.getAllEvents().then(setEvents).catch(() => {});
    sportsService.getRecentGallery().then(setImages).catch(() => {});
  }, []);

  const loadEventGallery = (eventId: string) => {
    setSelectedEvent(eventId);
    if (!eventId) {
      sportsService.getRecentGallery().then(setImages).catch(() => {});
      return;
    }
    setLoading(true);
    sportsService.getEventGallery(Number(eventId)).then(setImages).catch(() => {}).finally(() => setLoading(false));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !form.imageUrl) return;
    setBusy(true);
    try {
      const img = await sportsService.uploadGalleryImage(Number(selectedEvent), form.imageUrl, form.caption || undefined);
      setImages((prev) => [img, ...prev]);
      setForm({ imageUrl: "", caption: "" });
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload");
    } finally { setBusy(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this image?")) return;
    try {
      await sportsService.deleteGalleryImage(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const inputCls = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-pink-50 dark:bg-pink-950">
            <ImageIcon className="size-5 text-pink-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Gallery Management</h1>
            <p className="text-sm text-muted-foreground">Upload and manage event photos</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="size-4" />
          Upload Photo
        </button>
      </div>

      {/* Event filter */}
      <select
        value={selectedEvent}
        onChange={(e) => loadEventGallery(e.target.value)}
        className={inputCls}
      >
        <option value="">All Events (Recent 20)</option>
        {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
      </select>

      {/* Upload form */}
      {showForm && (
        <form onSubmit={handleUpload} className="rounded-2xl border border-border bg-background p-5 space-y-4">
          <h3 className="font-semibold">Upload Photo</h3>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Event *</label>
            <select value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className={inputCls}>
              <option value="">Select event…</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Image URL *</label>
            <input value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder="https://…" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Caption</label>
            <input value={form.caption} onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
              placeholder="Optional caption…" className={inputCls} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={busy}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? "Uploading…" : "Upload"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2" /> Loading…
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <ImageIcon className="size-10 text-muted-foreground/40" />
          <p className="font-medium">No photos uploaded yet</p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative rounded-xl overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt={img.caption ?? img.eventTitle}
                onClick={() => setLightbox(img)}
                className="w-full aspect-square object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300" />
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-2 right-2 rounded-full bg-black/60 hover:bg-destructive p-1.5 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="size-3 text-white" />
              </button>
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs line-clamp-1">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}>
            <X className="size-5" />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-3xl w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.imageUrl} alt={lightbox.caption ?? lightbox.eventTitle}
              className="w-full rounded-xl max-h-[80vh] object-contain" />
            {lightbox.caption && (
              <p className="mt-3 text-center text-white/80 text-sm">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
