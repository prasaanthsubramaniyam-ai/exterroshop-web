import client, { unwrap } from "./api";
import type { CallRequest } from "@/types";

export const callRequestService = {
  async create(productId: number): Promise<CallRequest> {
    const res = await client.post<{ data: CallRequest }>(`/call-requests/create?productId=${productId}`);
    return unwrap<CallRequest>(res);
  },
  async myRequests(): Promise<CallRequest[]> {
    const res = await client.get<{ data: CallRequest[] }>("/call-requests/my-requests");
    return unwrap<CallRequest[]>(res);
  },
  async incoming(): Promise<CallRequest[]> {
    const res = await client.get<{ data: CallRequest[] }>("/call-requests/incoming");
    return unwrap<CallRequest[]>(res);
  },
  async accept(id: number): Promise<CallRequest> {
    const res = await client.put<{ data: CallRequest }>(`/call-requests/accept/${id}`);
    return unwrap<CallRequest>(res);
  },
  async reject(id: number): Promise<CallRequest> {
    const res = await client.put<{ data: CallRequest }>(`/call-requests/reject/${id}`);
    return unwrap<CallRequest>(res);
  },
};
