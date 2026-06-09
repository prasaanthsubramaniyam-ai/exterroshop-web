"use client";

import * as React from "react";
import {
  Megaphone, Pin, PinOff, Trash2, Plus, X,
  Loader2, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuth } from "@/hooks/useAuth";
import type { AnnouncementAudience } from "@/types";
import { formatTimeAgo } from "@/utils/format";
import { cn } from "@/lib/utils";

const CAN_MANAGE = new Set(["MANAGER", "HR", "SUPER_ADMIN"]);

const AUDIENCE_COLORS: Record<string, string> = {
  ALL:          "bg-muted text-muted-foreground",
  MANAGER_ONLY: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  HR_ONLY:      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};
const AUDIENCE_LABELS: Record<string, string> = {
  ALL:          "Everyone",
  MANAGER_ONLY: "Managers & above",
  HR_ONLY:      "HR & Admin only",
};

// ── Create modal ──────────────────────────────────────────────────────────────

interface CreateModalProps {
  onClose: () => void;
  onCreate: (p: { title: string; body: string; audience: AnnouncementAudience; pinned: boolean }) => Promise<unknown>;
}

function CreateModal({ onClose, onCreate }: CreateModalProps) {
  const [title,    setTitle]    = React.useState("");
  const [body,     setBody]     = React.useState("");
  const [audience, setAudience] = React.useState<AnnouncementAudience>("ALL");
  const [pinned,   setPinned]   = React.useState(false);
  const [saving,   setSaving]   = React.useState(false);
  const [error,    setError]    = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) { setError("Title and body are required"); return; }
    setSaving(true);
    try {
      await onCreate({ title: title.trim(), body: body.trim(), audience, pinned });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">New Announcement</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" /> {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="e.g. Office closure on 15th June"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Body */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Message *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Write your announcement here…"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Audience */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Audience</label>
            <div className="flex gap-2">
              {(["ALL", "MANAGER_ONLY", "HR_ONLY"] as AnnouncementAudience[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAudience(a)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    audience === a
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {AUDIENCE_LABELS[a]}
                </button>
              ))}
            </div>
          </div>

          {/* Pin toggle */}
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm">Pin this announcement</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function AnnouncementsView() {
  const { user }                                          = useAuth();
  const { announcements, loading, error, create, togglePin, remove } = useAnnouncements();
  const [showModal, setShowModal]                         = React.useState(false);
  const [expanded, setExpanded]                           = React.useState<Set<number>>(new Set());
  const [deleting, setDeleting]                           = React.useState<number | null>(null);

  const canManage = CAN_MANAGE.has(user?.role ?? "");

  const toggleExpand = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    setDeleting(id);
    try { await remove(id); } finally { setDeleting(null); }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4 md:p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950">
            <Megaphone className="size-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Announcements</h1>
            <p className="text-xs text-muted-foreground">
              {announcements.length} active
            </p>
          </div>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" /> Post
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty */}
      {!loading && announcements.length === 0 && (
        <div className="rounded-2xl border border-border bg-background py-14 text-center">
          <Megaphone className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">No announcements yet</p>
          {canManage && (
            <p className="mt-1 text-xs text-muted-foreground">
              Post the first announcement for your team
            </p>
          )}
        </div>
      )}

      {/* List */}
      {!loading && announcements.map((ann) => {
        const isExpanded = expanded.has(ann.id);
        const bodyPreview = ann.body.length > 150 && !isExpanded
          ? ann.body.slice(0, 150) + "…"
          : ann.body;

        return (
          <div
            key={ann.id}
            className={cn(
              "rounded-2xl border border-border bg-background p-5 transition-colors",
              ann.pinned && "border-amber-200 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/20"
            )}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {ann.pinned && <Pin className="mt-0.5 size-4 shrink-0 text-amber-500" />}
                <div className="min-w-0">
                  <p className="font-semibold leading-snug">{ann.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      AUDIENCE_COLORS[ann.audience] ?? AUDIENCE_COLORS.ALL
                    )}>
                      {AUDIENCE_LABELS[ann.audience] ?? ann.audience}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {ann.authorName} · {formatTimeAgo(ann.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Manager actions */}
              {canManage && (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => togglePin(ann.id)}
                    title={ann.pinned ? "Unpin" : "Pin"}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-amber-500"
                  >
                    {ann.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ann.id)}
                    disabled={deleting === ann.id}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    {deleting === ann.id
                      ? <Loader2 className="size-4 animate-spin" />
                      : <Trash2 className="size-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Body */}
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {bodyPreview}
            </p>
            {ann.body.length > 150 && (
              <button
                type="button"
                onClick={() => toggleExpand(ann.id)}
                className="mt-1.5 flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {isExpanded ? (
                  <><ChevronUp className="size-3" /> Show less</>
                ) : (
                  <><ChevronDown className="size-3" /> Read more</>
                )}
              </button>
            )}
          </div>
        );
      })}

      {/* Modal */}
      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreate={create}
        />
      )}
    </div>
  );
}
