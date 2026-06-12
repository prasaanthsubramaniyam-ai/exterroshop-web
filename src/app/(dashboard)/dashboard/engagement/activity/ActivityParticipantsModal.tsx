"use client";

import * as React from "react";
import { X, Loader2, CheckCircle2, XCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import {
  activitiesService,
  type Activity,
  type ActivityParticipant,
} from "@/services/engagement.service";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const STATUS_TINT: Record<string, string> = {
  REGISTERED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  COMPLETED:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  NO_SHOW:    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export function ActivityParticipantsModal({
  activity,
  showHours,
  onClose,
  onChanged,
}: {
  activity: Activity;
  showHours: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const dispatch = useAppDispatch();
  const [participants, setParticipants] = React.useState<ActivityParticipant[] | null>(null);
  const [hoursDraft, setHoursDraft] = React.useState<Record<number, string>>({});
  const [pending, setPending] = React.useState<number | null>(null);

  const load = React.useCallback(() => {
    activitiesService.participants(activity.id).then((rows) => {
      setParticipants(rows);
      // Seed hour drafts
      setHoursDraft(Object.fromEntries(
        rows.map((p) => [p.userId, p.hoursLogged == null ? "" : String(p.hoursLogged)])
      ));
    }).catch(() => setParticipants([]));
  }, [activity.id]);

  React.useEffect(load, [load]);

  const mark = async (p: ActivityParticipant, status: "COMPLETED" | "NO_SHOW") => {
    setPending(p.userId);
    try {
      const hrs = showHours && status === "COMPLETED" && hoursDraft[p.userId]
        ? Number(hoursDraft[p.userId])
        : null;
      const updated = await activitiesService.markCompletion(
        activity.id, p.userId, status,
        Number.isFinite(hrs as number) ? (hrs as number) : null
      );
      setParticipants((prev) => prev?.map((x) => x.userId === p.userId ? updated : x) ?? null);
      if (status === "COMPLETED" && activity.pointsReward > 0) {
        dispatch(pushToast({
          title: `Completed — ${p.userName} +${activity.pointsReward} pts`,
        }));
      }
      onChanged();
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't update",
        description: (err as Error).message,
        variant: "destructive",
      }));
    } finally {
      setPending(null);
    }
  };

  const completedCount = participants?.filter((p) => p.status === "COMPLETED").length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-semibold">{activity.title}</h2>
            {participants && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                {participants.length} registered
                {activity.pointsReward > 0 && (
                  <> · {completedCount} completed · +{activity.pointsReward} pts each</>
                )}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {!participants ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : participants.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No participants yet.
          </div>
        ) : (
          <div className="flex-1 divide-y divide-border overflow-y-auto">
            {participants.map((p) => {
              const done = p.status === "COMPLETED";
              const noshow = p.status === "NO_SHOW";
              return (
                <div key={p.userId} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {p.userAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.userAvatarUrl} alt={p.userName} className="size-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {initials(p.userName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.userName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        <span className={cn("rounded-full px-1.5 py-0.5 font-medium", STATUS_TINT[p.status])}>
                          {p.status}
                        </span>
                        {p.hoursLogged != null && (
                          <> · {p.hoursLogged} hrs logged</>
                        )}
                      </p>
                    </div>
                  </div>

                  {showHours && !done && !noshow && (
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Hours"
                      value={hoursDraft[p.userId] ?? ""}
                      onChange={(e) => setHoursDraft((d) => ({ ...d, [p.userId]: e.target.value }))}
                      className="h-8 w-20 text-sm"
                    />
                  )}
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => mark(p, "COMPLETED")}
                      disabled={pending === p.userId || done}
                      className={cn(
                        "rounded-lg p-1.5 transition-colors",
                        done
                          ? "bg-emerald-100 text-emerald-700"
                          : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
                      )}
                      title="Mark completed"
                    >
                      <CheckCircle2 className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => mark(p, "NO_SHOW")}
                      disabled={pending === p.userId || noshow}
                      className={cn(
                        "rounded-lg p-1.5 transition-colors",
                        noshow
                          ? "bg-rose-100 text-rose-700"
                          : "text-muted-foreground hover:bg-rose-50 hover:text-rose-700"
                      )}
                      title="Mark no-show"
                    >
                      <XCircle className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
