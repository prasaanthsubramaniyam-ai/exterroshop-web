"use client";

import * as React from "react";
import { Users, PlusCircle, Loader2 } from "lucide-react";
import { sportsService, type SportsTeam, type SportsEvent } from "@/services/sports.service";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function TeamsPage() {
  const [events, setEvents] = React.useState<SportsEvent[]>([]);
  const [teams, setTeams] = React.useState<SportsTeam[]>([]);
  const [selectedEvent, setSelectedEvent] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [teamName, setTeamName] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    sportsService.getAllEvents().then(setEvents).catch(() => {});
  }, []);

  const loadTeams = React.useCallback(async (eventId: string) => {
    if (!eventId) { setTeams([]); return; }
    setLoading(true);
    sportsService.getTeams(Number(eventId)).then(setTeams).catch(() => {}).finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadTeams(selectedEvent); }, [selectedEvent, loadTeams]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !teamName) return;
    setBusy(true);
    try {
      const team = await sportsService.createTeam(Number(selectedEvent), teamName);
      setTeams((prev) => [...prev, team]);
      setTeamName("");
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create team");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
          <Users className="size-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Teams</h1>
          <p className="text-sm text-muted-foreground">Create and manage event teams</p>
        </div>
      </div>

      {/* Event selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Select an event to view teams…</option>
          {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
        {selectedEvent && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="size-4" />
            New Team
          </button>
        )}
      </div>

      {/* Create team form */}
      {showForm && (
        <form onSubmit={handleCreate} className="flex gap-3 items-end rounded-2xl border border-border bg-background p-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium">Team Name</label>
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Team Alpha"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button type="submit" disabled={busy}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {busy ? "Creating…" : "Create"}
          </button>
        </form>
      )}

      {!selectedEvent ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Users className="size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">Select an event to manage teams</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2" /> Loading teams…
        </div>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
          <Users className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">No teams yet — create the first team</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div key={team.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{team.teamName}</h3>
                <span className="text-xs text-muted-foreground">{team.members.length} members</span>
              </div>
              {team.captainName && (
                <p className="text-xs text-muted-foreground mb-2">
                  Captain: <span className="font-medium text-foreground">{team.captainName}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {team.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-1.5">
                    {m.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatarUrl} alt={m.name} className="size-6 rounded-full object-cover" />
                    ) : (
                      <div className="size-6 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center">
                        {getInitials(m.name)}
                      </div>
                    )}
                    <span className="text-xs">{m.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
