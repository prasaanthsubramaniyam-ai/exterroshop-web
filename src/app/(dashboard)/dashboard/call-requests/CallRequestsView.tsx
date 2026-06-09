"use client";

import * as React from "react";
import { Phone, PhoneCall, PhoneMissed, Clock, Check, X } from "lucide-react";
import { callRequestService } from "@/services/callRequest.service";
import type { CallRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { formatTimeAgo } from "@/utils/format";
import { cn } from "@/lib/utils";

export function CallRequestsView() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = React.useState<"incoming" | "sent">("incoming");
  const [incoming, setIncoming] = React.useState<CallRequest[]>([]);
  const [sent, setSent] = React.useState<CallRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([callRequestService.incoming(), callRequestService.myRequests()])
      .then(([inc, my]) => { setIncoming(inc); setSent(my); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const accept = async (id: number) => {
    try {
      const updated = await callRequestService.accept(id);
      setIncoming((prev) => prev.map((r) => r.id === id ? updated : r));
      dispatch(pushToast({ title: "Request accepted", variant: "success" }));
    } catch { dispatch(pushToast({ title: "Failed", variant: "destructive" })); }
  };

  const reject = async (id: number) => {
    try {
      const updated = await callRequestService.reject(id);
      setIncoming((prev) => prev.map((r) => r.id === id ? updated : r));
      dispatch(pushToast({ title: "Request rejected", variant: "destructive" }));
    } catch { dispatch(pushToast({ title: "Failed", variant: "destructive" })); }
  };

  const statusBadge = (status: CallRequest["status"]) => {
    if (status === "PENDING") return <span className="flex items-center gap-1 text-xs text-amber-600"><Clock className="size-3" /> Pending</span>;
    if (status === "ACCEPTED") return <span className="flex items-center gap-1 text-xs text-green-600"><PhoneCall className="size-3" /> Accepted</span>;
    return <span className="flex items-center gap-1 text-xs text-destructive"><PhoneMissed className="size-3" /> Rejected</span>;
  };

  const list = tab === "incoming" ? incoming : sent;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-display-sm font-semibold tracking-tight">Call Requests</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-surface p-1">
        {(["incoming", "sent"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-all",
              tab === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t} {t === "incoming" ? `(${incoming.filter(r => r.status === "PENDING").length})` : `(${sent.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border p-4">
              <div className="h-4 w-1/2 rounded bg-surface" />
              <div className="mt-2 h-3 w-1/3 rounded bg-surface" />
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <Phone className="size-12 opacity-40" />
          <p className="text-sm">No {tab} call requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((req) => (
            <div key={req.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{req.productTitle}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {tab === "incoming" ? req.requesterName : `To: ${req.ownerName}`}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    {statusBadge(req.status)}
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(req.createdAt)}</span>
                  </div>
                  {req.status === "ACCEPTED" && req.ownerPhone && tab === "sent" && (
                    <a href={`tel:${req.ownerPhone}`} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                      <Phone className="size-4" /> {req.ownerPhone}
                    </a>
                  )}
                </div>
                {tab === "incoming" && req.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => reject(req.id)} className="gap-1 text-destructive hover:border-destructive/50">
                      <X className="size-3.5" /> Reject
                    </Button>
                    <Button size="sm" onClick={() => accept(req.id)} className="gap-1">
                      <Check className="size-3.5" /> Accept
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
