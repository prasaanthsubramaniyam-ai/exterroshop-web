"use client";

import * as React from "react";
import { X, Loader2, Star, Users } from "lucide-react";
import { surveysService, type SurveyResults as Results } from "@/services/engagement.service";

export function SurveyResults({
  surveyId,
  onClose,
}: {
  surveyId: number;
  onClose: () => void;
}) {
  const [results, setResults] = React.useState<Results | null>(null);

  React.useEffect(() => {
    surveysService.results(surveyId).then(setResults).catch(() => onClose());
  }, [surveyId, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-semibold">{results?.title ?? "Results"}</h2>
            {results && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" /> {results.responseCount} response{results.responseCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {!results ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : results.responseCount === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No responses yet.
          </div>
        ) : (
          <div className="flex-1 space-y-6 overflow-y-auto p-5">
            {results.questions.map((q, idx) => (
              <div key={q.questionId} className="space-y-3">
                <p className="text-sm font-medium">{idx + 1}. {q.text}</p>

                {/* Choice questions: bars */}
                {q.optionCounts && (
                  <div className="space-y-2">
                    {q.optionCounts.map((o) => (
                      <div key={o.optionId}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span>{o.text}</span>
                          <span className="font-medium text-muted-foreground">{o.count} · {o.percent}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${o.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rating: average + distribution */}
                {q.averageRating != null && q.ratingDistribution && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="size-5 fill-amber-400 text-amber-400" />
                      <span className="text-lg font-bold">{q.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">average</span>
                    </div>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = q.ratingDistribution![star - 1];
                      const total = q.ratingDistribution!.reduce((a, b) => a + b, 0) || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-8">{star}★</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-muted-foreground">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Text: raw answers */}
                {q.textAnswers && (
                  <div className="space-y-1.5">
                    {q.textAnswers.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No text responses.</p>
                    ) : (
                      q.textAnswers.map((t, i) => (
                        <div key={i} className="rounded-lg bg-muted px-3 py-2 text-sm">{t}</div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
