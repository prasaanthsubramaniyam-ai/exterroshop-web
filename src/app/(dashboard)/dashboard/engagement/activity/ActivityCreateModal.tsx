"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import {
  activitiesService,
  type Activity,
  type ActivityKind,
} from "@/services/engagement.service";

export function ActivityCreateModal({
  kind,
  kindLabel,
  onClose,
  onCreated,
}: {
  kind: ActivityKind;
  kindLabel: string;
  onClose: () => void;
  onCreated: (a: Activity) => void;
}) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startsAt, setStartsAt] = React.useState("");
  const [endsAt, setEndsAt] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [capacity, setCapacity] = React.useState("");
  const [pointsReward, setPointsReward] = React.useState("20");
  const [saving, setSaving] = React.useState(false);

  const submit = async () => {
    if (!title.trim()) {
      dispatch(pushToast({ title: "Add a title", variant: "destructive" }));
      return;
    }
    setSaving(true);
    try {
      const a = await activitiesService.create({
        kind,
        title: title.trim(),
        description: description.trim() || undefined,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        location: location.trim() || undefined,
        capacity: capacity ? Number(capacity) : null,
        pointsReward: pointsReward ? Number(pointsReward) : 0,
      });
      onCreated(a);
      dispatch(pushToast({ title: `${kindLabel.slice(0, -1)} created 🎉` }));
      onClose();
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't create",
        description: (err as Error).message,
        variant: "destructive",
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Create {kindLabel.slice(0, -1).toLowerCase()}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="space-y-2">
            <Label htmlFor="a-title">Title</Label>
            <Input id="a-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={180} autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-desc">Description</Label>
            <textarea
              id="a-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="a-start">Starts</Label>
              <Input id="a-start" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-end">Ends</Label>
              <Input id="a-end" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-loc">Location</Label>
            <Input id="a-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Office / online / venue" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="a-cap">Capacity (blank = unlimited)</Label>
              <Input id="a-cap" type="number" min="0" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-pts">Points reward</Label>
              <Input id="a-pts" type="number" min="0" value={pointsReward} onChange={(e) => setPointsReward(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>Create</Button>
        </div>
      </div>
    </div>
  );
}
