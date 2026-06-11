"use client";

import * as React from "react";
import {
  BarChart3,
  Plus,
  Loader2,
  X,
  Trash2,
  Lock,
  Users,
  CheckCircle2,
  Eye,
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
import {
  engagementService,
  type Poll,
  type CreatePollPayload,
} from "@/services/engagement.service";

const MANAGE_ROLES = new Set(["MANAGER", "HR", "SUPER_ADMIN"]);

// ── Create modal ──────────────────────────────────────────────────────────────

function CreatePollModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: Poll) => void;
}) {
  const dispatch = useAppDispatch();
  const [question, setQuestion] = React.useState("");
  const [options, setOptions] = React.useState<string[]>(["", ""]);
  const [multi, setMulti] = React.useState(false);
  const [anonymous, setAnonymous] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const updateOption = (idx: number, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === idx ? value : o)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || trimmed.length < 2) {
      dispatch(pushToast({
        title: "Missing details",
        description: "Add a question and at least 2 options.",
        variant: "destructive",
      }));
      return;
    }
    setSaving(true);
    try {
      const payload: CreatePollPayload = {
        question: question.trim(),
        options: trimmed,
        multiSelect: multi,
        anonymous,
      };
      const p = await engagementService.createPoll(payload);
      onCreated(p);
      dispatch(pushToast({ title: "Poll posted 🗳️" }));
      onClose();
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't create poll",
        description: (err as Error).message,
        variant: "destructive",
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">New poll</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="q">Question</Label>
          <Input
            id="q"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={280}
            placeholder="What should we have for the Friday team lunch?"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label>Options</Label>
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={o}
                onChange={(e) => updateOption(i, e.target.value)}
                maxLength={140}
                placeholder={`Option ${i + 1}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => setOptions((p) => p.filter((_, idx) => idx !== i))}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remove option"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
          {options.length < 8 && (
            <button
              type="button"
              onClick={() => setOptions((p) => [...p, ""])}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="size-3.5" /> Add option
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={multi} onChange={(e) => setMulti(e.target.checked)} />
            Allow multiple choices
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            Anonymous
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Post poll</Button>
        </div>
      </form>
    </div>
  );
}

// ── Poll card ─────────────────────────────────────────────────────────────────

function PollCard({
  poll,
  canManage,
  onChanged,
  onDeleted,
}: {
  poll: Poll;
  canManage: boolean;
  onChanged: (p: Poll) => void;
  onDeleted: (id: number) => void;
}) {
  const dispatch = useAppDispatch();
  const [busy, setBusy] = React.useState(false);
  const [working, setWorking] = React.useState<number | null>(null);

  const isOpen = poll.status === "OPEN";
  const hasVoted = poll.myVotes.length > 0;

  const cast = async (optionId: number) => {
    if (!isOpen || busy) return;
    setWorking(optionId);
    try {
      let next: number[];
      if (poll.multiSelect) {
        next = poll.myVotes.includes(optionId)
          ? poll.myVotes.filter((id) => id !== optionId)
          : [...poll.myVotes, optionId];
        if (next.length === 0) {
          // can't unvote everything: cast at least one — keep current selection
          setWorking(null);
          return;
        }
      } else {
        next = [optionId];
      }
      const updated = await engagementService.votePoll(poll.id, next);
      onChanged(updated);
    } catch (err) {
      dispatch(pushToast({
        title: "Vote failed",
        description: (err as Error).message,
        variant: "destructive",
      }));
    } finally {
      setWorking(null);
    }
  };

  const close = async () => {
    setBusy(true);
    try {
      onChanged(await engagementService.closePoll(poll.id));
      dispatch(pushToast({ title: "Poll closed" }));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this poll? Votes will be lost.")) return;
    setBusy(true);
    try {
      await engagementService.deletePoll(poll.id);
      onDeleted(poll.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug">{poll.question}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {poll.createdByName} · {formatTimeAgo(poll.createdAt)}
            {poll.multiSelect && " · Multiple answers"}
            {poll.anonymous && " · Anonymous"}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
            isOpen
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>

      {/* Options */}
      <div className="mt-4 space-y-2">
        {poll.options.map((o) => {
          const chosen = poll.myVotes.includes(o.id);
          const showResults = hasVoted || !isOpen;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => cast(o.id)}
              disabled={!isOpen || working !== null}
              className={cn(
                "relative w-full overflow-hidden rounded-xl border px-4 py-2.5 text-left text-sm transition-all",
                chosen
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/50",
                !isOpen && "cursor-default opacity-90"
              )}
            >
              {/* Result bar */}
              {showResults && (
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 transition-[width] duration-500",
                    chosen ? "bg-primary/20" : "bg-muted"
                  )}
                  style={{ width: `${o.percent}%` }}
                  aria-hidden
                />
              )}

              <span className="relative flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-medium">
                  {chosen && <CheckCircle2 className="size-4 text-primary" />}
                  {o.text}
                </span>
                {showResults && (
                  <span className="shrink-0 text-xs font-semibold tabular-nums">
                    {o.percent}% · {o.voteCount}
                  </span>
                )}
                {working === o.id && <Loader2 className="size-4 animate-spin" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="size-3.5" />
          {poll.totalVoters} voter{poll.totalVoters === 1 ? "" : "s"}
          {!isOpen && poll.closedAt && ` · closed ${formatTimeAgo(poll.closedAt)}`}
        </span>
        {canManage && (
          <div className="flex items-center gap-1">
            {isOpen && (
              <button
                type="button"
                onClick={close}
                disabled={busy}
                className="flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-muted hover:text-foreground"
                title="Close voting"
              >
                <Lock className="size-3.5" /> Close
              </button>
            )}
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-destructive/10 hover:text-destructive"
              title="Delete poll"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function PollsView() {
  const { user } = useAuth();
  const canManage = !!user?.role && MANAGE_ROLES.has(user.role);
  const [polls, setPolls] = React.useState<Poll[] | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const [filter, setFilter] = React.useState<"all" | "open" | "closed">("all");

  React.useEffect(() => {
    engagementService.listPolls().then(setPolls).catch(() => setPolls([]));
  }, []);

  const updatePoll = (p: Poll) =>
    setPolls((prev) => prev?.map((x) => (x.id === p.id ? p : x)) ?? [p]);
  const dropPoll = (id: number) =>
    setPolls((prev) => prev?.filter((x) => x.id !== id) ?? []);

  const filtered = (polls ?? []).filter((p) =>
    filter === "all" ? true : filter === "open" ? p.status === "OPEN" : p.status === "CLOSED"
  );

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Polls"
        description="Quick pulse checks. Vote, watch results, change your mind."
        actions={
          canManage ? (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="size-4" /> New poll
            </Button>
          ) : null
        }
      />

      {/* Filter pills */}
      <div className="flex items-center gap-2">
        {(["all", "open", "closed"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {polls === null && (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {polls && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <BarChart3 className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">
            {polls.length === 0 ? "No polls yet" : "No polls match this filter"}
          </p>
          {canManage && polls.length === 0 && (
            <Button className="mt-4" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="size-4" /> Create the first poll
            </Button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((p) => (
          <PollCard
            key={p.id}
            poll={p}
            canManage={canManage || (user?.id != null && user.id === p.createdBy)}
            onChanged={updatePoll}
            onDeleted={dropPoll}
          />
        ))}
      </div>

      {/* Privacy hint */}
      {polls && polls.length > 0 && (
        <p className="flex items-center gap-1.5 text-center text-xs text-muted-foreground">
          <Eye className="size-3" /> Your individual choice is visible to HR unless the poll is marked Anonymous.
        </p>
      )}

      {showCreate && (
        <CreatePollModal
          onClose={() => setShowCreate(false)}
          onCreated={(p) => setPolls((prev) => [p, ...(prev ?? [])])}
        />
      )}
    </div>
  );
}
