"use client";

import * as React from "react";
import {
  Loader2,
  Plus,
  Calendar,
  MapPin,
  Users,
  Award,
  Trash2,
  XCircle,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import { activitiesService, type Activity, type ActivityKind } from "@/services/engagement.service";
import { KIND_META } from "./ActivityKindMeta";
import { ActivityCreateModal } from "./ActivityCreateModal";
import { ActivityParticipantsModal } from "./ActivityParticipantsModal";

const HR_ROLES = new Set(["HR", "MANAGER", "SUPER_ADMIN"]);

function formatRange(start: string | null, end: string | null): string | null {
  if (!start && !end) return null;
  const fmt = (s: string) =>
    new Date(s).toLocaleString("en-IN", {
      day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
    });
  if (start && end) return `${fmt(start)} → ${fmt(end)}`;
  return fmt((start ?? end)!);
}

export function ActivitiesView({ kind }: { kind: ActivityKind }) {
  const meta = KIND_META[kind];
  const Icon = meta.icon;
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const canManage = !!user?.role && HR_ROLES.has(user.role);

  const [items, setItems] = React.useState<Activity[] | null>(null);
  const [filter, setFilter] = React.useState<"OPEN" | "ALL">("OPEN");
  const [creating, setCreating] = React.useState(false);
  const [viewing, setViewing] = React.useState<Activity | null>(null);
  const [busy, setBusy] = React.useState<number | null>(null);

  const load = React.useCallback(() => {
    activitiesService.list(kind).then(setItems).catch(() => setItems([]));
  }, [kind]);
  React.useEffect(load, [load]);

  const toggleRegister = async (a: Activity) => {
    setBusy(a.id);
    try {
      const updated = a.myStatus
        ? await activitiesService.unregister(a.id)
        : await activitiesService.register(a.id);
      setItems((prev) => prev?.map((x) => (x.id === updated.id ? updated : x)) ?? null);
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't update registration",
        description: (err as Error).message,
        variant: "destructive",
      }));
    } finally {
      setBusy(null);
    }
  };

  const close = async (a: Activity) => {
    if (!confirm(`Close "${a.title}"? Registrations and completions will be locked.`)) return;
    try {
      await activitiesService.close(a.id);
      load();
    } catch (err) {
      dispatch(pushToast({ title: "Couldn't close", description: (err as Error).message, variant: "destructive" }));
    }
  };

  const remove = async (a: Activity) => {
    if (!confirm(`Delete "${a.title}" and all registrations?`)) return;
    try {
      await activitiesService.remove(a.id);
      setItems((prev) => prev?.filter((x) => x.id !== a.id) ?? null);
    } catch (err) {
      dispatch(pushToast({ title: "Couldn't delete", description: (err as Error).message, variant: "destructive" }));
    }
  };

  const visible = (items ?? []).filter((a) => filter === "ALL" || a.status === "OPEN");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title={meta.title}
        description={meta.description}
        actions={
          canManage ? (
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Create
            </Button>
          ) : undefined
        }
      />

      {/* Filter chips */}
      <div className="flex gap-2">
        {(["OPEN", "ALL"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {f === "OPEN" ? "Open" : "All"}
          </button>
        ))}
      </div>

      {items === null && (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {visible.length === 0 && items !== null && (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Icon className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">No {meta.title.toLowerCase()} yet</p>
          {canManage && (
            <Button className="mt-4" size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Create the first one
            </Button>
          )}
        </div>
      )}

      {visible.map((a) => {
        const closed = a.status === "CLOSED";
        const registered = a.myStatus === "REGISTERED";
        const completed = a.myStatus === "COMPLETED";
        const range = formatRange(a.startsAt, a.endsAt);
        const full = a.capacity != null && a.registrationCount >= a.capacity && !registered;

        return (
          <div key={a.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start gap-4">
              <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", meta.tint)}>
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{a.title}</h3>
                  {closed && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                      Closed
                    </span>
                  )}
                  {a.pointsReward > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      <Award className="size-3" /> +{a.pointsReward} pts
                    </span>
                  )}
                </div>
                {a.description && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{a.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {range && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" /> {range}
                    </span>
                  )}
                  {a.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" /> {a.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" />
                    {a.registrationCount}{a.capacity ? ` / ${a.capacity}` : ""} registered
                  </span>
                </div>
              </div>

              {canManage && (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => setViewing(a)}
                    title="Participants"
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ClipboardList className="size-4" />
                  </button>
                  {!closed && (
                    <button
                      onClick={() => close(a)}
                      title="Close"
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <XCircle className="size-4" />
                    </button>
                  )}
                  <button
                    onClick={() => remove(a)}
                    title="Delete"
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="mt-4 flex items-center justify-between">
              {completed ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="size-4" /> Completed
                  {a.pointsReward > 0 && <> · +{a.pointsReward} pts earned</>}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {closed ? "Locked" : full ? "Full" : "Open for registration"}
                </span>
              )}
              {!closed && !completed && (
                <Button
                  variant={registered ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleRegister(a)}
                  loading={busy === a.id}
                  disabled={!registered && full}
                >
                  {registered ? "Withdraw" : meta.registerCta}
                </Button>
              )}
            </div>
          </div>
        );
      })}

      {creating && (
        <ActivityCreateModal
          kind={kind}
          kindLabel={meta.title}
          onClose={() => setCreating(false)}
          onCreated={(a) => setItems((prev) => [a, ...(prev ?? [])])}
        />
      )}

      {viewing && (
        <ActivityParticipantsModal
          activity={viewing}
          showHours={meta.showHours}
          onClose={() => setViewing(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}
