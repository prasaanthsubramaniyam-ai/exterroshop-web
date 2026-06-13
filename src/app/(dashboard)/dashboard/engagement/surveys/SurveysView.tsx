"use client";

import * as React from "react";
import {
  ClipboardList,
  Loader2,
  Plus,
  BarChart3,
  Lock,
  CheckCircle2,
  Trash2,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { formatTimeAgo } from "@/utils/format";
import { surveysService, type Survey } from "@/services/engagement.service";
import { SurveyFillDrawer } from "./SurveyFillDrawer";
import { SurveyBuilder } from "./SurveyBuilder";
import { SurveyResults } from "./SurveyResults";

const HR_ROLES = new Set(["HR", "MANAGER", "SUPER_ADMIN"]);

export function SurveysView() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const canManage = !!user?.role && HR_ROLES.has(user.role);

  const [surveys, setSurveys] = React.useState<Survey[] | null>(null);
  const [filling, setFilling] = React.useState<number | null>(null);
  const [building, setBuilding] = React.useState(false);
  const [viewingResults, setViewingResults] = React.useState<number | null>(null);

  const load = React.useCallback(() => {
    surveysService.list().then(setSurveys).catch(() => setSurveys([]));
  }, []);
  React.useEffect(load, [load]);

  const closeSurvey = async (s: Survey) => {
    if (!confirm(`Close "${s.title}"? No more responses will be accepted.`)) return;
    try {
      await surveysService.close(s.id);
      load();
    } catch (err) {
      dispatch(pushToast({ title: "Couldn't close", description: (err as Error).message, variant: "destructive" }));
    }
  };

  const deleteSurvey = async (s: Survey) => {
    if (!confirm(`Delete "${s.title}" and all its responses?`)) return;
    try {
      await surveysService.remove(s.id);
      setSurveys((prev) => prev?.filter((x) => x.id !== s.id) ?? null);
    } catch (err) {
      dispatch(pushToast({ title: "Couldn't delete", description: (err as Error).message, variant: "destructive" }));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Surveys"
        description="Share your feedback — and help shape what comes next."
        actions={
          canManage ? (
            <Button onClick={() => setBuilding(true)}>
              <Plus className="size-4" /> Create survey
            </Button>
          ) : undefined
        }
      />

      {surveys === null && (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {surveys?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <ClipboardList className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">No surveys yet</p>
          {canManage && (
            <Button className="mt-4" size="sm" onClick={() => setBuilding(true)}>
              <Plus className="size-4" /> Create the first one
            </Button>
          )}
        </div>
      )}

      {surveys?.map((s) => {
        const closed = s.status === "CLOSED";
        const done = s.respondedByMe;
        return (
          <div key={s.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{s.title}</h3>
                  {s.anonymous && (
                    <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <Lock className="size-2.5" /> Anonymous
                    </span>
                  )}
                  {closed && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                      Closed
                    </span>
                  )}
                </div>
                {s.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {s.questions.length} question{s.questions.length !== 1 ? "s" : ""} ·{" "}
                  {s.responseCount} response{s.responseCount !== 1 ? "s" : ""} · {formatTimeAgo(s.createdAt)}
                </p>
              </div>

              {/* Manage actions */}
              {canManage && (
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => setViewingResults(s.id)} title="Results"
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <BarChart3 className="size-4" />
                  </button>
                  {!closed && (
                    <button onClick={() => closeSurvey(s)} title="Close"
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <XCircle className="size-4" />
                    </button>
                  )}
                  <button onClick={() => deleteSurvey(s)} title="Delete"
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="mt-4">
              {done ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="size-4" /> You've responded
                </span>
              ) : closed ? (
                <span className="text-sm text-muted-foreground">This survey is closed</span>
              ) : (
                <Button size="sm" onClick={() => setFilling(s.id)}>Take survey</Button>
              )}
            </div>
          </div>
        );
      })}

      {filling != null && (
        <SurveyFillDrawer surveyId={filling} onClose={() => setFilling(null)} onSubmitted={load} />
      )}
      {building && <SurveyBuilder onClose={() => setBuilding(false)} onCreated={load} />}
      {viewingResults != null && (
        <SurveyResults surveyId={viewingResults} onClose={() => setViewingResults(null)} />
      )}
    </div>
  );
}
