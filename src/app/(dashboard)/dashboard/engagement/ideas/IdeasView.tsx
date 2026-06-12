"use client";

import * as React from "react";
import {
  ArrowBigUp,
  Lightbulb,
  Loader2,
  Plus,
  Trash2,
  X,
  Edit3,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/utils/format";
import { ideasService, type Idea, type IdeaStatus } from "@/services/engagement.service";

const HR_ROLES = new Set(["HR", "MANAGER", "SUPER_ADMIN"]);

const STATUS_META: Record<IdeaStatus, { label: string; className: string }> = {
  NEW:       { label: "New",        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  REVIEWING: { label: "Reviewing",  className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  PLANNED:   { label: "Planned",    className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
  DONE:      { label: "Done",       className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  DECLINED:  { label: "Declined",   className: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
};
const STATUS_ORDER: IdeaStatus[] = ["NEW", "REVIEWING", "PLANNED", "DONE", "DECLINED"];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name} className="size-8 rounded-full object-cover" />
  ) : (
    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
      {initials(name)}
    </div>
  );
}

// ── Submit modal ─────────────────────────────────────────────────────────────

function SubmitModal({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: (i: Idea) => void;
}) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    if (!title.trim() || description.trim().length < 10) return;
    setBusy(true);
    try {
      const i = await ideasService.submit(title.trim(), description.trim());
      onSubmitted(i);
      dispatch(pushToast({ title: "Idea submitted 💡" }));
      onClose();
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't submit",
        description: (err as Error).message,
        variant: "destructive",
      }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Lightbulb className="size-4 text-primary" /> Share an idea
          </h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="idea-title">Title</Label>
          <Input
            id="idea-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            placeholder="What's your idea?"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idea-desc">Description</Label>
          <textarea
            id="idea-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={5}
            placeholder="Explain the problem this solves and how it could work…"
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-xs text-muted-foreground">
            {description.length}/2000 · min 10 characters
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={submit}
            loading={busy}
            disabled={!title.trim() || description.trim().length < 10}
          >
            Submit idea
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Status modal (HR only) ───────────────────────────────────────────────────

function StatusModal({
  idea,
  onClose,
  onUpdated,
}: {
  idea: Idea;
  onClose: () => void;
  onUpdated: (i: Idea) => void;
}) {
  const dispatch = useAppDispatch();
  const [status, setStatus] = React.useState<IdeaStatus>(idea.status);
  const [note, setNote] = React.useState(idea.statusNote ?? "");
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const updated = await ideasService.updateStatus(idea.id, status, note.trim() || undefined);
      onUpdated(updated);
      dispatch(pushToast({ title: "Status updated" }));
      onClose();
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't update",
        description: (err as Error).message,
        variant: "destructive",
      }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Edit3 className="size-4 text-primary" /> Update status
          </h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex flex-wrap gap-2">
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  status === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status-note">Note (optional)</Label>
          <textarea
            id="status-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Add context — e.g. 'Approved for Q3 sprint', 'Out of scope this year'"
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={busy}>Save</Button>
        </div>
      </div>
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────

function IdeaCard({
  idea,
  canManage,
  isAuthor,
  onVote,
  onEditStatus,
  onDelete,
}: {
  idea: Idea;
  canManage: boolean;
  isAuthor: boolean;
  onVote: () => void;
  onEditStatus: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-4">
      {/* Vote column */}
      <button
        type="button"
        onClick={onVote}
        className={cn(
          "flex w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all",
          idea.votedByMe
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        )}
        title={idea.votedByMe ? "Remove upvote" : "Upvote"}
      >
        <ArrowBigUp
          className={cn("size-5", idea.votedByMe && "fill-primary")}
          strokeWidth={idea.votedByMe ? 2.5 : 2}
        />
        <span className="text-sm font-bold tabular-nums">{idea.voteCount}</span>
      </button>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug">{idea.title}</h3>
          <span className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            STATUS_META[idea.status].className
          )}>
            {STATUS_META[idea.status].label}
          </span>
        </div>

        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
          {idea.description}
        </p>

        {idea.statusNote && (
          <div className="mt-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs">
            <span className="font-semibold">HR note: </span>
            <span className="text-muted-foreground">{idea.statusNote}</span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar name={idea.authorName} url={idea.authorAvatarUrl} />
            <span className="font-medium text-foreground">{idea.authorName}</span>
            <span>· {formatTimeAgo(idea.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            {canManage && (
              <button
                type="button"
                onClick={onEditStatus}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Update status"
              >
                <Edit3 className="size-4" />
              </button>
            )}
            {(canManage || isAuthor) && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function IdeasView() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const canManage = !!user?.role && HR_ROLES.has(user.role);

  const [sort, setSort] = React.useState<"newest" | "trending">("trending");
  const [statusFilter, setStatusFilter] = React.useState<IdeaStatus | "ALL">("ALL");
  const [ideas, setIdeas] = React.useState<Idea[] | null>(null);
  const [showSubmit, setShowSubmit] = React.useState(false);
  const [editingStatus, setEditingStatus] = React.useState<Idea | null>(null);

  const load = React.useCallback(() => {
    ideasService
      .list({ sort, status: statusFilter === "ALL" ? undefined : statusFilter })
      .then(setIdeas)
      .catch(() => setIdeas([]));
  }, [sort, statusFilter]);
  React.useEffect(load, [load]);

  const handleVote = async (i: Idea) => {
    try {
      const updated = await ideasService.toggleVote(i.id);
      setIdeas((prev) => prev?.map((x) => (x.id === updated.id ? updated : x)) ?? null);
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't vote",
        description: (err as Error).message,
        variant: "destructive",
      }));
    }
  };

  const handleDelete = async (i: Idea) => {
    if (!confirm("Delete this idea? This can't be undone.")) return;
    try {
      await ideasService.remove(i.id);
      setIdeas((prev) => prev?.filter((x) => x.id !== i.id) ?? null);
      dispatch(pushToast({ title: "Idea deleted" }));
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't delete",
        description: (err as Error).message,
        variant: "destructive",
      }));
    }
  };

  // Pipeline counts (board view summary)
  const counts: Record<IdeaStatus | "ALL", number> = {
    ALL: ideas?.length ?? 0,
    NEW: 0, REVIEWING: 0, PLANNED: 0, DONE: 0, DECLINED: 0,
  };
  ideas?.forEach((i) => { counts[i.status]++; });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Suggestions & Ideas"
        description="Share what could make Exterro better — upvote what you'd love to see."
        actions={
          <Button onClick={() => setShowSubmit(true)}>
            <Plus className="size-4" /> Share idea
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(["ALL", ...STATUS_ORDER] as const).map((s) => {
          const label = s === "ALL" ? "All" : STATUS_META[s].label;
          const active = statusFilter === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {label}{counts[s] > 0 && ` · ${counts[s]}`}
            </button>
          );
        })}
        <div className="ml-auto flex gap-1">
          {(["trending", "newest"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                sort === s
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {ideas === null && (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {ideas?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Lightbulb className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">No ideas yet</p>
          <Button className="mt-4" size="sm" onClick={() => setShowSubmit(true)}>
            <Plus className="size-4" /> Share the first one
          </Button>
        </div>
      )}
      {ideas && ideas.length > 0 && (
        <div className="space-y-3">
          {ideas.map((i) => (
            <IdeaCard
              key={i.id}
              idea={i}
              canManage={canManage}
              isAuthor={i.authorId === user?.id}
              onVote={() => handleVote(i)}
              onEditStatus={() => setEditingStatus(i)}
              onDelete={() => handleDelete(i)}
            />
          ))}
        </div>
      )}

      {showSubmit && (
        <SubmitModal
          onClose={() => setShowSubmit(false)}
          onSubmitted={(i) => setIdeas((prev) => [i, ...(prev ?? [])])}
        />
      )}

      {editingStatus && (
        <StatusModal
          idea={editingStatus}
          onClose={() => setEditingStatus(null)}
          onUpdated={(updated) =>
            setIdeas((prev) => prev?.map((x) => (x.id === updated.id ? updated : x)) ?? null)
          }
        />
      )}
    </div>
  );
}
