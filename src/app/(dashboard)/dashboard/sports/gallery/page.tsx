"use client";

import * as React from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { sportsService, type GalleryImage } from "@/services/sports.service";

export default function GalleryPage() {
  const [images, setImages] = React.useState<GalleryImage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lightbox, setLightbox] = React.useState<GalleryImage | null>(null);

  React.useEffect(() => {
    sportsService.getRecentGallery()
      .then(setImages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-pink-50 dark:bg-pink-950">
          <ImageIcon className="size-5 text-pink-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Photo Gallery</h1>
          <p className="text-sm text-muted-foreground">Moments from our sports & events</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2" /> Loading gallery…
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16">
          <ImageIcon className="size-10 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">No photos yet</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => setLightbox(img)}
              className="break-inside-avoid rounded-xl overflow-hidden cursor-pointer group relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt={img.caption ?? img.eventTitle}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs line-clamp-2">{img.caption}</p>
                </div>
              )}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                  {img.eventTitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
          >
            <X className="size-5" />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-3xl w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.imageUrl} alt={lightbox.caption ?? lightbox.eventTitle}
              className="w-full rounded-xl max-h-[80vh] object-contain" />
            {lightbox.caption && (
              <p className="mt-3 text-center text-white/80 text-sm">{lightbox.caption}</p>
            )}
            <p className="mt-1 text-center text-white/50 text-xs">{lightbox.eventTitle}</p>
          </div>
        </div>
      )}
    </div>
  );
}
