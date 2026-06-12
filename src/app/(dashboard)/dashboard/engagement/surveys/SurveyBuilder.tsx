"use client";

import * as React from "react";
import { X, Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import {
  surveysService,
  type QuestionType,
  type CreateSurveyPayload,
} from "@/services/engagement.service";

interface DraftQuestion {
  text: string;
  type: QuestionType;
  required: boolean;
  options: string[];
}

const TYPES: { value: QuestionType; label: string }[] = [
  { value: "SINGLE_CHOICE", label: "Single choice" },
  { value: "MULTI_CHOICE", label: "Multiple choice" },
  { value: "RATING", label: "Rating (1-5)" },
  { value: "TEXT", label: "Text answer" },
];

const isChoice = (t: QuestionType) => t === "SINGLE_CHOICE" || t === "MULTI_CHOICE";

export function SurveyBuilder({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [anonymous, setAnonymous] = React.useState(false);
  const [questions, setQuestions] = React.useState<DraftQuestion[]>([
    { text: "", type: "SINGLE_CHOICE", required: true, options: ["", ""] },
  ]);
  const [saving, setSaving] = React.useState(false);

  const updateQ = (i: number, patch: Partial<DraftQuestion>) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  const addQuestion = () =>
    setQuestions((qs) => [...qs, { text: "", type: "SINGLE_CHOICE", required: true, options: ["", ""] }]);

  const removeQuestion = (i: number) =>
    setQuestions((qs) => qs.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!title.trim()) {
      dispatch(pushToast({ title: "Add a survey title", variant: "destructive" }));
      return;
    }
    const cleaned = questions
      .map((q) => ({
        text: q.text.trim(),
        type: q.type,
        required: q.required,
        options: isChoice(q.type) ? q.options.map((o) => o.trim()).filter(Boolean) : undefined,
      }))
      .filter((q) => q.text);

    if (cleaned.length === 0) {
      dispatch(pushToast({ title: "Add at least one question", variant: "destructive" }));
      return;
    }
    for (const q of cleaned) {
      if (isChoice(q.type) && (q.options?.length ?? 0) < 2) {
        dispatch(pushToast({
          title: `"${q.text}" needs at least 2 options`,
          variant: "destructive",
        }));
        return;
      }
    }

    const payload: CreateSurveyPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      anonymous,
      questions: cleaned,
    };
    setSaving(true);
    try {
      await surveysService.create(payload);
      dispatch(pushToast({ title: "Survey created 📋" }));
      onCreated();
      onClose();
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't create survey",
        description: (err as Error).message,
        variant: "destructive",
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Create survey</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Meta */}
          <div className="space-y-2">
            <Label htmlFor="s-title">Title</Label>
            <Input id="s-title" value={title} onChange={(e) => setTitle(e.target.value)}
              maxLength={180} placeholder="e.g. Q3 Employee Engagement Pulse" autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-desc">Description (optional)</Label>
            <textarea id="s-desc" value={description} onChange={(e) => setDescription(e.target.value)}
              maxLength={1000} rows={2}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)}
              className="rounded border-border" />
            Anonymous responses (don't record who answered)
          </label>

          {/* Questions */}
          <div className="space-y-3">
            <Label>Questions</Label>
            {questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <div className="flex items-start gap-2">
                  <GripVertical className="mt-2 size-4 shrink-0 text-muted-foreground/40" />
                  <div className="flex-1 space-y-2.5">
                    <Input
                      value={q.text}
                      onChange={(e) => updateQ(i, { text: e.target.value })}
                      maxLength={500}
                      placeholder={`Question ${i + 1}`}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={q.type}
                        onChange={(e) => {
                          const type = e.target.value as QuestionType;
                          updateQ(i, {
                            type,
                            options: isChoice(type) && q.options.length < 2 ? ["", ""] : q.options,
                          });
                        }}
                        className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                      >
                        {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <input type="checkbox" checked={q.required}
                          onChange={(e) => updateQ(i, { required: e.target.checked })}
                          className="rounded border-border" />
                        Required
                      </label>
                      {questions.length > 1 && (
                        <button type="button" onClick={() => removeQuestion(i)}
                          className="ml-auto rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>

                    {isChoice(q.type) && (
                      <div className="space-y-1.5 pl-1">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <Input
                              value={opt}
                              onChange={(e) => {
                                const opts = [...q.options];
                                opts[oi] = e.target.value;
                                updateQ(i, { options: opts });
                              }}
                              maxLength={200}
                              placeholder={`Option ${oi + 1}`}
                              className="h-8 text-sm"
                            />
                            {q.options.length > 2 && (
                              <button type="button"
                                onClick={() => updateQ(i, { options: q.options.filter((_, x) => x !== oi) })}
                                className="text-muted-foreground hover:text-destructive">
                                <X className="size-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button"
                          onClick={() => updateQ(i, { options: [...q.options, ""] })}
                          className="text-xs font-medium text-primary hover:underline">
                          + Add option
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addQuestion} className="w-full">
              <Plus className="size-4" /> Add question
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={saving}>Create survey</Button>
        </div>
      </div>
    </div>
  );
}
