"use client";

import * as React from "react";
import { X, Loader2, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import {
  surveysService,
  type Survey,
  type SubmitSurveyPayload,
} from "@/services/engagement.service";

type AnswerState = Record<number, { optionIds?: number[]; rating?: number; textValue?: string }>;

export function SurveyFillDrawer({
  surveyId,
  onClose,
  onSubmitted,
}: {
  surveyId: number;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const dispatch = useAppDispatch();
  const [survey, setSurvey] = React.useState<Survey | null>(null);
  const [answers, setAnswers] = React.useState<AnswerState>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    surveysService.get(surveyId).then(setSurvey).catch(() => onClose());
  }, [surveyId, onClose]);

  const setOption = (qId: number, optId: number, multi: boolean) => {
    setAnswers((prev) => {
      const cur = prev[qId]?.optionIds ?? [];
      const next = multi
        ? cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId]
        : [optId];
      return { ...prev, [qId]: { optionIds: next } };
    });
  };

  const submit = async () => {
    if (!survey) return;
    // Client-side required check
    for (const q of survey.questions) {
      if (!q.required) continue;
      const a = answers[q.id];
      const empty =
        (q.type === "SINGLE_CHOICE" || q.type === "MULTI_CHOICE") && !(a?.optionIds?.length) ||
        q.type === "RATING" && !a?.rating ||
        q.type === "TEXT" && !a?.textValue?.trim();
      if (empty) {
        dispatch(pushToast({ title: "Please answer all required questions", variant: "destructive" }));
        return;
      }
    }
    const payload: SubmitSurveyPayload = {
      answers: survey.questions
        .map((q) => ({ questionId: q.id, ...answers[q.id] }))
        .filter((a) => a.optionIds?.length || a.rating || a.textValue?.trim()),
    };
    setSubmitting(true);
    try {
      await surveysService.submit(survey.id, payload);
      dispatch(pushToast({ title: "Response submitted — thank you! 🙏" }));
      onSubmitted();
      onClose();
    } catch (err) {
      dispatch(pushToast({
        title: "Couldn't submit",
        description: (err as Error).message,
        variant: "destructive",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-lg flex-col bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">{survey?.title ?? "Survey"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {!survey ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {survey.description && (
                <p className="text-sm text-muted-foreground">{survey.description}</p>
              )}
              {survey.anonymous && (
                <div className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                  🔒 This survey is anonymous — your name is not recorded.
                </div>
              )}

              {survey.questions.map((q, idx) => (
                <div key={q.id} className="space-y-2.5">
                  <p className="text-sm font-medium">
                    {idx + 1}. {q.text}
                    {q.required && <span className="ml-1 text-destructive">*</span>}
                  </p>

                  {(q.type === "SINGLE_CHOICE" || q.type === "MULTI_CHOICE") && (
                    <div className="space-y-2">
                      {q.options.map((o) => {
                        const sel = answers[q.id]?.optionIds?.includes(o.id);
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => setOption(q.id, o.id, q.type === "MULTI_CHOICE")}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                              sel ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                            )}
                          >
                            <span className={cn(
                              "flex size-4 shrink-0 items-center justify-center border",
                              q.type === "MULTI_CHOICE" ? "rounded" : "rounded-full",
                              sel ? "border-primary bg-primary text-primary-foreground" : "border-border"
                            )}>
                              {sel && <CheckCircle2 className="size-3" />}
                            </span>
                            {o.text}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.type === "RATING" && (
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setAnswers((p) => ({ ...p, [q.id]: { rating: n } }))}
                          className="p-1"
                        >
                          <Star
                            className={cn(
                              "size-7 transition-colors",
                              (answers[q.id]?.rating ?? 0) >= n
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/40"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === "TEXT" && (
                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={answers[q.id]?.textValue ?? ""}
                      onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: { textValue: e.target.value } }))}
                      placeholder="Your answer…"
                      className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4">
              <Button className="w-full" onClick={submit} loading={submitting}>
                Submit response
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
