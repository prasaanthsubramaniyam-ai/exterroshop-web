"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { centerService, wellnessServiceApi, staffService, bookingService } from "@/services/wellness.service";
import type { WellnessCenter, WellnessService, StaffProfile, AvailableSlot } from "@/types/wellness";
import { format } from "date-fns";

type Step = "center" | "service" | "staff" | "datetime" | "confirm";

export default function BookAppointmentPage() {
  const router = useRouter();

  const [step, setStep] = React.useState<Step>("center");
  const [centers, setCenters] = React.useState<WellnessCenter[]>([]);
  const [services, setServices] = React.useState<WellnessService[]>([]);
  const [staffList, setStaffList] = React.useState<StaffProfile[]>([]);
  const [slots, setSlots] = React.useState<AvailableSlot[]>([]);

  const [selected, setSelected] = React.useState({
    center: null as WellnessCenter | null,
    service: null as WellnessService | null,
    staff: null as StaffProfile | null,
    date: format(new Date(), "yyyy-MM-dd"),
    slot: null as AvailableSlot | null,
    notes: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setLoading(true);
    centerService.getAll().then(setCenters).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  const selectCenter = (center: WellnessCenter) => {
    setSelected((s) => ({ ...s, center, service: null, staff: null, slot: null }));
    setLoading(true);
    Promise.all([wellnessServiceApi.getAll(), staffService.getByCenter(center.id)])
      .then(([svcs, staff]) => {
        setServices(svcs);
        setStaffList(staff);
        setStep("service");
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  const selectService = (service: WellnessService) => {
    setSelected((s) => ({ ...s, service, staff: null, slot: null }));
    setStep("staff");
  };

  const selectStaff = (staff: StaffProfile) => {
    setSelected((s) => ({ ...s, staff, slot: null }));
    setStep("datetime");
    loadSlots(staff.id, selected.date, selected.service!.id);
  };

  const loadSlots = (staffId: number, date: string, serviceId: number) => {
    setLoading(true);
    staffService.getSlots(staffId, date, serviceId)
      .then(setSlots)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  const onDateChange = (date: string) => {
    setSelected((s) => ({ ...s, date, slot: null }));
    if (selected.staff && selected.service) {
      loadSlots(selected.staff.id, date, selected.service.id);
    }
  };

  const confirm = async () => {
    if (!selected.center || !selected.service || !selected.staff || !selected.slot) return;
    setSubmitting(true);
    setError("");
    try {
      await bookingService.create({
        centerId: selected.center.id,
        serviceId: selected.service.id,
        staffId: selected.staff.id,
        bookingDate: selected.date,
        startTime: selected.slot.startTime,
        notes: selected.notes || undefined,
      });
      router.push("/wellness/bookings/my");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Booking failed. Please try again.");
      setSubmitting(false);
    }
  };

  const STEPS: Step[] = ["center", "service", "staff", "datetime", "confirm"];
  const stepIdx = STEPS.indexOf(step);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Book Appointment</h1>
        <p className="text-muted-foreground text-sm mt-1">Choose your beauty service in a few steps</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {["Center", "Service", "Staff", "Date & Time", "Confirm"].map((label, i) => (
          <React.Fragment key={label}>
            <div className={`flex items-center gap-2 ${i <= stepIdx ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${i < stepIdx ? "bg-primary text-white" : i === stepIdx ? "border-2 border-primary text-primary" : "border border-border"}`}>
                {i < stepIdx ? "✓" : i + 1}
              </div>
              <span className="text-xs hidden sm:block">{label}</span>
            </div>
            {i < 4 && <div className={`h-px flex-1 ${i < stepIdx ? "bg-primary" : "bg-border"}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        )}

        {!loading && step === "center" && (
          <StepSection title="Select a Beauty Service Center">
            {centers.map((c) => (
              <OptionCard key={c.id} title={c.name} sub={c.location} badge={c.genderType.replace("_", " ")} onClick={() => selectCenter(c)} />
            ))}
          </StepSection>
        )}

        {!loading && step === "service" && (
          <StepSection title="Select a Service">
            {services.map((s) => (
              <OptionCard
                key={s.id}
                title={s.name}
                sub={s.description ?? ""}
                badge={`${s.durationMinutes} min`}
                onClick={() => selectService(s)}
              />
            ))}
          </StepSection>
        )}

        {!loading && step === "staff" && (
          <StepSection title="Select Staff">
            {staffList.map((s) => (
              <OptionCard
                key={s.id}
                title={s.userName}
                sub={s.specialization ?? "General"}
                badge={`${s.workingStart}–${s.workingEnd}`}
                onClick={() => selectStaff(s)}
              />
            ))}
          </StepSection>
        )}

        {!loading && step === "datetime" && (
          <div className="space-y-5">
            <h2 className="font-semibold text-lg">Pick a Date & Time</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={selected.date}
                min={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => onDateChange(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Available Slots</label>
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No slots available for this date.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => (
                    <button
                      key={slot.startTime}
                      disabled={!slot.available}
                      onClick={() => setSelected((s) => ({ ...s, slot }))}
                      className={`rounded-lg border py-2 text-xs font-medium transition-colors ${
                        !slot.available
                          ? "cursor-not-allowed border-border bg-muted text-muted-foreground line-through"
                          : selected.slot?.startTime === slot.startTime
                          ? "border-primary bg-primary text-white"
                          : "border-border hover:border-primary hover:text-primary"
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              disabled={!selected.slot}
              onClick={() => setStep("confirm")}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-5">
            <h2 className="font-semibold text-lg">Confirm Booking</h2>
            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
              <Row label="Center" value={selected.center?.name ?? ""} />
              <Row label="Service" value={selected.service?.name ?? ""} />
              <Row label="Staff" value={selected.staff?.userName ?? ""} />
              <Row label="Date" value={selected.date} />
              <Row label="Time" value={selected.slot?.startTime ?? ""} />
              <Row label="Duration" value={`${selected.service?.durationMinutes ?? 0} min`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes (optional)</label>
              <textarea
                rows={3}
                value={selected.notes}
                onChange={(e) => setSelected((s) => ({ ...s, notes: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Any special requests?"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setStep("datetime")}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={confirm}
                disabled={submitting}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-70 hover:bg-primary/90 transition-colors"
              >
                {submitting ? "Booking…" : "Confirm Booking"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-lg">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function OptionCard({ title, sub, badge, onClick }: { title: string; sub: string; badge: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center justify-between rounded-xl border border-border p-4 hover:border-primary hover:bg-primary/5 transition-colors group"
    >
      <div>
        <p className="font-medium group-hover:text-primary">{title}</p>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>
      <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs">{badge}</span>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
