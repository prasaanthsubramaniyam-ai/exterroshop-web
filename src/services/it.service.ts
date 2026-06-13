import client, { unwrap } from "./api";

// ── Assets ────────────────────────────────────────────────────────────────────

export type AssetStatus = "AVAILABLE" | "ASSIGNED" | "IN_REPAIR" | "RETIRED";
export type AssetType   = "LAPTOP" | "PHONE" | "MONITOR" | "KEYBOARD" | "MOUSE" | "OTHER";

export interface Asset {
  id:              number;
  assetTag:        string;
  name:            string;
  type:            AssetType;
  brand:           string | null;
  model:           string | null;
  serialNumber:    string | null;
  status:          AssetStatus;
  assignedToId:    number | null;
  assignedToName:  string | null;
  purchaseDate:    string | null;
  purchaseValue:   number | null;
  warrantyExpiry:  string | null;
  notes:           string | null;
  createdAt:       string;
}

export interface RegisterAssetPayload {
  assetTag:      string;
  name:          string;
  type:          AssetType;
  brand?:        string;
  model?:        string;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseValue?: number;
  warrantyExpiry?: string;
  notes?:        string;
}

// ── Tickets ───────────────────────────────────────────────────────────────────

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TicketStatus   = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketCategory = "HARDWARE" | "SOFTWARE" | "NETWORK" | "ACCESS" | "OTHER";

export interface Ticket {
  id:              number;
  title:           string;
  description:     string | null;
  category:        TicketCategory;
  priority:        TicketPriority;
  status:          TicketStatus;
  raisedById:      number;
  raisedByName:    string;
  assignedToId:    number | null;
  assignedToName:  string | null;
  resolution:      string | null;
  createdAt:       string;
  updatedAt:       string;
  resolvedAt:      string | null;
}

export interface RaiseTicketPayload {
  title:       string;
  description?: string;
  category:    TicketCategory;
  priority:    TicketPriority;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const itService = {
  // Assets
  listAssets: (status?: AssetStatus): Promise<Asset[]> => {
    const qs = status ? `?status=${status}` : "";
    return client.get<{ data: Asset[] }>(`/it/assets${qs}`).then((r) => unwrap(r));
  },

  registerAsset: (payload: RegisterAssetPayload): Promise<Asset> =>
    client.post<{ data: Asset }>("/it/assets", payload).then((r) => unwrap(r)),

  assignAsset: (id: number, employeeId: number): Promise<Asset> =>
    client.patch<{ data: Asset }>(`/it/assets/${id}/assign`, { employeeId }).then((r) => unwrap(r)),

  unassignAsset: (id: number): Promise<Asset> =>
    client.patch<{ data: Asset }>(`/it/assets/${id}/unassign`, {}).then((r) => unwrap(r)),

  updateAssetStatus: (id: number, status: AssetStatus): Promise<Asset> =>
    client.patch<{ data: Asset }>(`/it/assets/${id}/status`, { status }).then((r) => unwrap(r)),

  // Tickets
  listTickets: (status?: TicketStatus): Promise<Ticket[]> => {
    const qs = status ? `?status=${status}` : "";
    return client.get<{ data: Ticket[] }>(`/it/tickets${qs}`).then((r) => unwrap(r));
  },

  raiseTicket: (payload: RaiseTicketPayload): Promise<Ticket> =>
    client.post<{ data: Ticket }>("/it/tickets", payload).then((r) => unwrap(r)),

  resolveTicket: (id: number, resolution: string): Promise<Ticket> =>
    client.patch<{ data: Ticket }>(`/it/tickets/${id}/resolve`, { resolution }).then((r) => unwrap(r)),

  closeTicket: (id: number): Promise<Ticket> =>
    client.patch<{ data: Ticket }>(`/it/tickets/${id}/close`, {}).then((r) => unwrap(r)),

  assignTicket: (id: number, assigneeId: number): Promise<Ticket> =>
    client.patch<{ data: Ticket }>(`/it/tickets/${id}/assign`, { assigneeId }).then((r) => unwrap(r)),
};
