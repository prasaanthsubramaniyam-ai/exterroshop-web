"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import { clubsService, type Club } from "@/services/engagement.service";
import { CLUB_COLORS, SUGGESTED_ICONS } from "./clubColors";

export function ClubCreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (c: Club) => void;
}) {
  const dispatch = useAppDispatch();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [icon, setIcon] = React.useState("🎯");
  const [color, setColor] = React.useState("blue");
  const [saving, setSaving] = React.useState(false);

  const submit = async () => {
    if (name.trim().length < 3) {
      dispatch(pushToast({ title: "Name must be at least 3 characters", variant: "destructive" }));
      return;
    }
    setSaving(true);
    try {
      const c = await clubsService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color,
      });
      onCreated(c);
      dispatch(pushToast({ title: "Club created 🎉 You're its admin." }));
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
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Start a club</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {/* Live preview */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <div className={cn("flex size-12 items-center justify-center rounded-xl text-xl",
              CLUB_COLORS.find((c) => c.slug === color)?.tint)}>
              {icon}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{name || "Club name"}</p>
              <p className="truncate text-xs text-muted-foreground">{description || "Short description"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="club-name">Name</Label>
            <Input id="club-name" value={name} onChange={(e) => setName(e.target.value)}
              maxLength={140} placeholder="e.g. Chess Club" autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="club-desc">Description (optional)</Label>
            <textarea id="club-desc" value={description} onChange={(e) => setDescription(e.target.value)}
              maxLength={1000} rows={2}
              placeholder="What's this club for?"
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-1.5">
              {SUGGESTED_ICONS.map((i) => (
                <button key={i} type="button" onClick={() => setIcon(i)}
                  className={cn("flex size-9 items-center justify-center rounded-lg text-lg transition-colors",
                    icon === i ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80")}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Colour</Label>
            <div className="flex flex-wrap gap-2">
              {CLUB_COLORS.map((c) => (
                <button key={c.slug} type="button" onClick={() => setColor(c.slug)}
                  className={cn("flex size-8 items-center justify-center rounded-lg transition-all",
                    c.tint,
                    color === c.slug ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "")}
                  title={c.slug}
                >
                  {color === c.slug && <span className="text-sm">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>Create club</Button>
        </div>
      </div>
    </div>
  );
}
