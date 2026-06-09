"use client";

import * as React from "react";
import { Phone, PhoneCall, PhoneMissed, Clock } from "lucide-react";
import { callRequestService } from "@/services/callRequest.service";
import type { CallRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";

interface Props {
  productId: number;
  sellerId: number;
  currentUserId?: number;
}

export function CallRequestButton({ productId, sellerId, currentUserId }: Props) {
  const dispatch = useAppDispatch();
  const [request, setRequest] = React.useState<CallRequest | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(true);

  // Load existing request on mount
  React.useEffect(() => {
    if (!currentUserId || currentUserId === sellerId) { setFetching(false); return; }
    callRequestService.myRequests()
      .then((reqs) => {
        const found = reqs.find((r) => r.productId === productId);
        if (found) setRequest(found);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [productId, currentUserId, sellerId]);

  if (!currentUserId || currentUserId === sellerId) return null;
  if (fetching) return null;

  const handleRequest = async () => {
    setLoading(true);
    try {
      const req = await callRequestService.create(productId);
      setRequest(req);
      dispatch(pushToast({ title: "Call request sent!", variant: "success" }));
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to send request";
      dispatch(pushToast({ title: msg, variant: "destructive" }));
    } finally {
      setLoading(false);
    }
  };

  if (!request) {
    return (
      <Button onClick={handleRequest} loading={loading} className="w-full gap-2">
        <Phone className="size-4" />
        Request Call
      </Button>
    );
  }

  if (request.status === "PENDING") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3">
        <Clock className="size-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Call request pending…</span>
      </div>
    );
  }

  if (request.status === "ACCEPTED") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <div className="flex items-center gap-2 text-green-700">
          <PhoneCall className="size-4" />
          <span className="text-sm font-semibold">Call request accepted!</span>
        </div>
        {request.ownerPhone && (
          <a
            href={`tel:${request.ownerPhone}`}
            className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <Phone className="size-4" />
            {request.ownerPhone}
          </a>
        )}
      </div>
    );
  }

  if (request.status === "REJECTED") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
        <PhoneMissed className="size-4 text-destructive" />
        <span className="text-sm text-destructive">Call request declined</span>
      </div>
    );
  }

  return null;
}
