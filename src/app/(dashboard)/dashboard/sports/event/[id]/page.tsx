"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy, MapPin, Calendar, Users, UserCheck, Loader2,
  ArrowLeft, CheckCircle2, XCircle, Clock, AlertCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sportsService,
  type SportsEvent,
  type SportsRegistration,
  type SportsTeam,
  type SportsResult,
  EVENT_TYPE_LABELS,
  STATUS_STYLE,
  type RegistrationType,
} from "@/services/sports.service";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const REG_STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  PENDING:    { label: "Registration Pending",   icon: Clock,        cls: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  APPROVED:   { label: "Registration Approved",  icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  REJECTED:   { label: "Registration Rejected",  icon: XCircle,      cls: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
  WAITLISTED: { label: "Waitlisted",             icon: AlertCircle,  cls: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400" },
};

// ── Registration button ───────────────────────────────────────────────────────

function RegButton({
  label, description, icon: Icon, type, existing, canRegister, onRegister, loading,
}: {
  label: string;
  description: string;
  icon: React.ElementType;
  type: RegistrationType;
  existing?: SportsRegistration;
  canRegister: boolean;
  onRegister: (t: RegistrationType) => Promise<void>;
  loading: boolean;
}) {
  if (existing) {
    const sc = REG_STATUS_CONFIG[existing.status];
    const StatusIcon = sc.icon;
    return (
      <div className={cn(
        "flex items-center gap-3 rounded-2xl border px-5 py-4",
        existing.status === "APPROVED"
          ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"
          : "border-border bg-muted/30"
      )}>
        <div className={cn("flex size-10 items-center justify-center rounded-xl shrink-0", sc.cls)}>
          <StatusIcon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{label}</p>
          <p className={cn("text-xs mt-0.5", sc.cls.split(" ").slice(-2).join(" "))}>{sc.label}</p>
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold shrink-0", sc.cls)}>
          {existing.status.charAt(0) + existing.status.slice(1).toLowerCase()}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => onRegister(type)}
      disabled={!canRegister || loading}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all",
        canRegister
          ? "border-primary/30 hover:border-primary hover:shadow-md hover:shadow-primary/10 active:scale-[0.98]"
          : "border-border opacity-60 cursor-not-allowed",
        "bg-background"
      )}
    >
      <div className={cn(
        "flex size-10 items-center justify-center rounded-xl shrink-0 transition-colors",
        canRegister ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}>
        {loading ? <Loader2 className="size-5 animate-spin" /> : <Icon className="size-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {canRegister && <ChevronRight className="size-4 text-muted-foreground shrink-0" />}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [event,       setEvent]       = React.useState<SportsEvent | null>(null);
  const [myRegs,      setMyRegs]      = React.useState<SportsRegistration[]>([]);
  const [teams,       setTeams]       = React.useState<SportsTeam[]>([]);
  const [results,     setResults]     = React.useState<SportsResult[]>([]);
  const [loading,     setLoading]     = React.useState(true);
  const [regLoading,  setRegLoading]  = React.useState<RegistrationType | null>(null);
  const [error,       setError]       = React.useState<string | null>(null);
  const [successMsg,  setSuccessMsg]  = React.useState<string | null>(null);
  const [nowMs, setNowMs] = React.useState(() => Date.now());

  const eventId = Number(id);

  // Refresh "now" every minute so registration windows auto-update
  React.useEffect(() => {
    const id2 = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(id2);
  }, []);

  React.useEffect(() => {
    if (!eventId) return;
    Promise.all([
      sportsService.getEventById(eventId),
      sportsService.getMyRegistrations(),
      sportsService.getTeams(eventId),
      sportsService.getEventResults(eventId),
    ])
      .then(([ev, allRegs, teamList, resultList]) => {
        setEvent(ev);
        setMyRegs(allRegs.filter((r) => r.eventId === eventId));
        setTeams(teamList);
        setResults(resultList);
      })
      .catch(() => setError("Failed to load event details."))
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleRegister = async (type: RegistrationType) => {
    setError(null);
    setSuccessMsg(null);
    setRegLoading(type);
    try {
      const reg = await sportsService.register(eventId, type);
      setMyRegs((prev) => [...prev.filter((r) => r.registrationType !== type), reg]);
      setSuccessMsg(
        type === "PARTICIPANT"
          ? "Successfully registered as Participant! Awaiting HR approval."
          : "Successfully registered as Volunteer! Awaiting HR approval."
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registration failed. Please try again.");
    } finally {
      setRegLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin mr-2" /> Loading event…
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Trophy className="size-10 text-muted-foreground/40" />
        <p className="font-medium">{error ?? "Event not found."}</p>
        <Link href="/dashboard/sports" className="text-sm text-primary hover:underline">
          Back to events
        </Link>
      </div>
    );
  }

  // Registration state helpers
  const participantReg = myRegs.find((r) => r.registrationType === "PARTICIPANT");
  const volunteerReg   = myRegs.find((r) => r.registrationType === "VOLUNTEER");
  const regOpen = (event.status === "PUBLISHED" || event.status === "ONGOING")
    && (!event.registrationEnd   || new Date(event.registrationEnd).getTime()   > nowMs)
    && (!event.registrationStart || new Date(event.registrationStart).getTime() <= nowMs);

  const participantsFull = event.maxParticipants != null
    && event.participantCount >= event.maxParticipants;
  const volunteersFull = event.maxVolunteers != null
    && event.volunteerCount >= event.maxVolunteers;

  const canJoinAsParticipant = regOpen && !participantReg && !participantsFull;
  const canJoinAsVolunteer   = regOpen && !volunteerReg   && !volunteersFull;

  const slotsLeft = event.maxParticipants != null
    ? Math.max(0, event.maxParticipants - event.participantCount) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to events
      </button>

      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden h-48 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent">
        {event.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.bannerUrl} alt={event.title}
            className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
              {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
            </span>
            <span className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              STATUS_STYLE[event.status]
            )}>
              {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight">{event.title}</h1>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
          <XCircle className="size-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 px-4 py-3">
          <CheckCircle2 className="size-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">{successMsg}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          {event.description && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">About</h2>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5">
              <Calendar className="size-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Date & Time</p>
                <p className="text-sm font-semibold mt-0.5">{fmtDate(event.eventDate)}</p>
                <p className="text-xs text-muted-foreground">{fmtTime(event.eventDate)}</p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5">
                <MapPin className="size-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Venue</p>
                  <p className="text-sm font-semibold mt-0.5">{event.location}</p>
                </div>
              </div>
            )}

            {event.registrationEnd && (
              <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5">
                <Clock className="size-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Registration Closes</p>
                  <p className="text-sm font-semibold mt-0.5">{fmtDateTime(event.registrationEnd)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5">
              <Users className="size-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Participants</p>
                <p className="text-sm font-semibold mt-0.5">
                  {event.participantCount}
                  {event.maxParticipants != null && ` / ${event.maxParticipants}`}
                  {slotsLeft != null && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} left)
                    </span>
                  )}
                </p>
                {event.maxParticipants != null && (
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden w-24">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${Math.min(100, (event.participantCount / event.maxParticipants) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Teams */}
          {teams.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Teams</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {teams.map((team) => (
                  <div key={team.id} className="rounded-xl border border-border bg-background p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm">{team.teamName}</p>
                      <span className="text-xs text-muted-foreground">{team.members.length} members</span>
                    </div>
                    {team.captainName && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Captain: <span className="font-medium text-foreground">{team.captainName}</span>
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {team.members.slice(0, 5).map((m) => (
                        m.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={m.id} src={m.avatarUrl} alt={m.name}
                            title={m.name}
                            className="size-6 rounded-full object-cover ring-1 ring-background" />
                        ) : (
                          <div key={m.id} title={m.name}
                            className="size-6 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center ring-1 ring-background">
                            {getInitials(m.name)}
                          </div>
                        )
                      ))}
                      {team.members.length > 5 && (
                        <div className="size-6 rounded-full bg-muted text-muted-foreground text-[9px] font-bold flex items-center justify-center">
                          +{team.members.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Results</h2>
              {results.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {r.winnerTeamName && (
                      <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5">
                        <Trophy className="size-5 text-amber-500 shrink-0" />
                        <div>
                          <p className="text-[10px] font-semibold text-amber-600 uppercase">Winner 🥇</p>
                          <p className="text-sm font-bold">{r.winnerTeamName}</p>
                        </div>
                      </div>
                    )}
                    {r.runnerUpTeamName && (
                      <div className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-900/40 px-3 py-2.5">
                        <Trophy className="size-5 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Runner-up 🥈</p>
                          <p className="text-sm font-bold">{r.runnerUpTeamName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {r.remarks && (
                    <p className="mt-2 text-xs text-muted-foreground">{r.remarks}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — registration panel */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Register</h2>

          {/* Registration not open */}
          {!regOpen && event.status === "PUBLISHED" && event.registrationStart
            && new Date(event.registrationStart).getTime() > nowMs && (
            <div className="rounded-xl bg-muted/50 border border-border px-4 py-3 text-sm text-muted-foreground text-center">
              <Clock className="size-4 mx-auto mb-1" />
              Registration opens {fmtDateTime(event.registrationStart)}
            </div>
          )}

          {(event.status === "COMPLETED" || event.status === "CANCELLED") && (
            <div className="rounded-xl bg-muted/50 border border-border px-4 py-3 text-sm text-muted-foreground text-center">
              {event.status === "COMPLETED" ? "This event has ended." : "This event was cancelled."}
            </div>
          )}

          {event.status === "DRAFT" && (
            <div className="rounded-xl bg-muted/50 border border-border px-4 py-3 text-sm text-muted-foreground text-center">
              Event registration is not yet open.
            </div>
          )}

          {/* Registration buttons */}
          {(regOpen || participantReg || volunteerReg) && (
            <div className="space-y-3">
              <RegButton
                label="Participate"
                description={
                  participantsFull && !participantReg
                    ? "All participant slots are filled"
                    : canJoinAsParticipant
                    ? event.maxParticipants != null
                      ? `${slotsLeft} slot${slotsLeft !== 1 ? "s" : ""} remaining`
                      : "Open registration"
                    : participantReg
                    ? "You have registered"
                    : "Registration closed"
                }
                icon={Users}
                type="PARTICIPANT"
                existing={participantReg}
                canRegister={canJoinAsParticipant}
                onRegister={handleRegister}
                loading={regLoading === "PARTICIPANT"}
              />

              <RegButton
                label="Volunteer"
                description={
                  volunteersFull && !volunteerReg
                    ? "All volunteer slots are filled"
                    : canJoinAsVolunteer
                    ? event.maxVolunteers != null
                      ? `${Math.max(0, event.maxVolunteers - event.volunteerCount)} slot${Math.max(0, event.maxVolunteers - event.volunteerCount) !== 1 ? "s" : ""} remaining`
                      : "Open for volunteers"
                    : volunteerReg
                    ? "You have registered"
                    : "Registration closed"
                }
                icon={UserCheck}
                type="VOLUNTEER"
                existing={volunteerReg}
                canRegister={canJoinAsVolunteer}
                onRegister={handleRegister}
                loading={regLoading === "VOLUNTEER"}
              />
            </div>
          )}

          {/* My registrations summary */}
          {(participantReg || volunteerReg) && (
            <Link
              href="/dashboard/sports/my-registrations"
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              View all my registrations
              <ChevronRight className="size-3.5" />
            </Link>
          )}

          {/* Volunteer info */}
          {event.maxVolunteers != null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCheck className="size-4 shrink-0 text-teal-500" />
              <span>
                {event.volunteerCount}/{event.maxVolunteers} volunteers registered
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
