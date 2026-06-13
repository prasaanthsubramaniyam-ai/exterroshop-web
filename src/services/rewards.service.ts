import client, { unwrap } from "./api";

// ── Catalog ───────────────────────────────────────────────────────────────────

export type RewardCategory = "VOUCHER" | "MERCHANDISE" | "EXPERIENCE" | "DONATION" | "OTHER";

export interface RewardItem {
  id:          number;
  name:        string;
  description: string | null;
  imageUrl:    string | null;
  pointsCost:  number;
  category:    RewardCategory;
  stock:       number | null;  // null = unlimited
  active:      boolean;
  createdBy:   number;
  createdAt:   string;
}

export interface CreateRewardItemPayload {
  name:        string;
  description?: string;
  imageUrl?:   string;
  pointsCost:  number;
  category:    RewardCategory;
  stock?:      number | null;
}

// ── Redemptions ───────────────────────────────────────────────────────────────

export type RedemptionStatus = "PENDING" | "FULFILLED" | "REJECTED";

export interface Redemption {
  id:              number;
  userId:          number;
  userName:        string;
  userAvatarUrl:   string | null;
  itemId:          number;
  itemName:        string;
  pointsCost:      number;
  status:          RedemptionStatus;
  adminNote:       string | null;
  requestedAt:     string;
  processedAt:     string | null;
  processedByName: string | null;
}

// ── Department leaderboard ────────────────────────────────────────────────────

export interface DeptLeaderboardEntry {
  rank:       number;
  department: string;
  totalPoints: number;
  memberCount: number;
  avgPoints:  number;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const rewardsService = {
  // Catalog
  listItems: (): Promise<RewardItem[]> =>
    client.get<{ data: RewardItem[] }>("/engagement/rewards/catalog").then((r) => unwrap(r)),

  createItem: (payload: CreateRewardItemPayload): Promise<RewardItem> =>
    client.post<{ data: RewardItem }>("/engagement/rewards/catalog", payload).then((r) => unwrap(r)),

  toggleItem: (id: number, active: boolean): Promise<RewardItem> =>
    client.patch<{ data: RewardItem }>(`/engagement/rewards/catalog/${id}/toggle?active=${active}`, {}).then((r) => unwrap(r)),

  // Redemptions — employee
  redeem: (itemId: number): Promise<Redemption> =>
    client.post<{ data: Redemption }>("/engagement/rewards/redeem", { itemId }).then((r) => unwrap(r)),

  myRedemptions: (): Promise<Redemption[]> =>
    client.get<{ data: Redemption[] }>("/engagement/rewards/redemptions/my").then((r) => unwrap(r)),

  // Redemptions — HR / SUPER_ADMIN
  allRedemptions: (status?: RedemptionStatus): Promise<Redemption[]> => {
    const qs = status ? `?status=${status}` : "";
    return client.get<{ data: Redemption[] }>(`/engagement/rewards/redemptions${qs}`).then((r) => unwrap(r));
  },

  processRedemption: (id: number, status: "FULFILLED" | "REJECTED", note?: string): Promise<Redemption> =>
    client.patch<{ data: Redemption }>(`/engagement/rewards/redemptions/${id}`, { status, adminNote: note ?? null }).then((r) => unwrap(r)),

  // Department leaderboard
  deptLeaderboard: (period: "month" | "all" = "month"): Promise<DeptLeaderboardEntry[]> =>
    client.get<{ data: DeptLeaderboardEntry[] }>(`/engagement/recognition/leaderboard/dept?period=${period}`).then((r) => unwrap(r)),
};
