"use client";

import * as React from "react";
import { Medal, Trophy, Loader2, PlusCircle } from "lucide-react";
import { sportsService, type SportsEvent, type SportsResult, type SportsTeam } from "@/services/sports.service";

export default function HRResultsPage() {
  const [results, setResults] = React.useState<SportsResult[]>([]);
  const [events, setEvents] = React.useState<SportsEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const [form, setForm] = React.useState({ eventId: "", winnerTeamId: "", runnerUpTeamId: "", remarks: "" });
  const [teams, setTeams] = React.useState<SportsTeam[]>([]);

  React.useEffect(() => {
    Promise.all([sportsService.getAllResults(), sportsService.getAllEvents()])
      .then(([r, e]) => { setResults(r); setEvents(e.filter((ev) => ev.status !== "DRAFT")); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (!form.eventId) { setTeams([]); return; }
    sportsService.getTeams(Number(form.eventId)).then(setTeams).catch(() => {});
  }, [form.eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.eventId) return;
    setBusy(true);
    try {
      const result = await sportsService.publishResult(Number(form.eventId), {
        winnerTeamId:   form.winnerTeamId   ? Number(form.winnerTeamId)   : undefined,
        runnerUpTeamId: form.runnerUpTeamId ? Number(form.runnerUpTeamId) : undefined,
        remarks: form.remarks || undefined,
      });
      setResults((prev) => [result, ...prev]);
      setShowForm(false);
      setForm({ eventId: "", winnerTeamId: "", runnerUpTeamId: "", remarks: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to publish result");
    } finally { setBusy(false); }
  };

  const inputCls = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950">
            <Medal className="size-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Results</h1>
            <p className="text-sm text-muted-foreground">Publish event results and winners</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="size-4" />
          Publish Result
        </button>
      </div>

      {/* Publish form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-background p-5 space-y-4">
          <h3 className="font-semibold">Publish New Result</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Event *</label>
              <select value={form.eventId} onChange={(e) => setForm((p) => ({ ...p, eventId: e.target.value }))} className={inputCls}>
                <option value="">Select event…</option>
                {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Winner Team</label>
              <select value={form.winnerTeamId} onChange={(e) => setForm((p) => ({ ...p, winnerTeamId: e.target.value }))} className={inputCls}>
                <option value="">None / Individual</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.teamName}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Runner-up Team</label>
              <select value={form.runnerUpTeamId} onChange={(e) => setForm((p) => ({ ...p, runnerUpTeamId: e.target.value }))} className={inputCls}>
                <option value="">None</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.teamName}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Remarks</label>
              <input value={form.remarks} onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
                placeholder="Optional remarks…" className={inputCls} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={busy}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? "Publishing…" : "Publish"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2" /> Loading…
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Medal className="size-10 text-muted-foreground/40" />
          <p className="font-medium">No results published yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((r) => (
            <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950 shrink-0">
                <Trophy className="size-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{r.eventTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {r.winnerTeamName ? `🥇 ${r.winnerTeamName}` : ""}
                  {r.runnerUpTeamName ? ` · 🥈 ${r.runnerUpTeamName}` : ""}
                </p>
              </div>
              {r.remarks && <p className="text-xs text-muted-foreground line-clamp-1 hidden sm:block max-w-xs">{r.remarks}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
