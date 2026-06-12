import client, { unwrap } from "./api";

export type Occasion = "BIRTHDAY" | "WORK_ANNIVERSARY";

export interface Celebration {
  employeeId: number;
  name: string;
  avatarUrl: string | null;
  department: string | null;
  occasion: Occasion;
  date: string;        // ISO date
  daysUntil: number;
  today: boolean;
  years: number | null;
  wishCount: number;
}

export interface CelebrationWish {
  id: number;
  authorId: number;
  authorName: string;
  authorAvatarUrl: string | null;
  message: string;
  createdAt: string;
}

export const engagementService = {
  async getCelebrations(days = 30): Promise<Celebration[]> {
    const res = await client.get<{ data: Celebration[] }>(
      `/engagement/celebrations?days=${days}`
    );
    return unwrap<Celebration[]>(res);
  },

  async getWishes(employeeId: number, occasion: Occasion): Promise<CelebrationWish[]> {
    const res = await client.get<{ data: CelebrationWish[] }>(
      `/engagement/celebrations/${employeeId}/wishes?occasion=${occasion}`
    );
    return unwrap<CelebrationWish[]>(res);
  },

  async postWish(
    celebrantId: number,
    occasion: Occasion,
    message: string
  ): Promise<CelebrationWish> {
    const res = await client.post<{ data: CelebrationWish }>(
      "/engagement/celebrations/wishes",
      { celebrantId, occasion, message }
    );
    return unwrap<CelebrationWish>(res);
  },

  // ── Polls ────────────────────────────────────────────────────────────────

  async listPolls(): Promise<Poll[]> {
    const res = await client.get<{ data: Poll[] }>("/engagement/polls");
    return unwrap<Poll[]>(res);
  },

  async getPoll(id: number): Promise<Poll> {
    const res = await client.get<{ data: Poll }>(`/engagement/polls/${id}`);
    return unwrap<Poll>(res);
  },

  async createPoll(payload: CreatePollPayload): Promise<Poll> {
    const res = await client.post<{ data: Poll }>("/engagement/polls", payload);
    return unwrap<Poll>(res);
  },

  async votePoll(id: number, optionIds: number[]): Promise<Poll> {
    const res = await client.post<{ data: Poll }>(
      `/engagement/polls/${id}/vote`,
      { optionIds }
    );
    return unwrap<Poll>(res);
  },

  async closePoll(id: number): Promise<Poll> {
    const res = await client.patch<{ data: Poll }>(`/engagement/polls/${id}/close`);
    return unwrap<Poll>(res);
  },

  async deletePoll(id: number): Promise<void> {
    await client.delete(`/engagement/polls/${id}`);
  },
};

export interface PollOption {
  id: number;
  text: string;
  voteCount: number;
  percent: number;
}

export interface Poll {
  id: number;
  question: string;
  multiSelect: boolean;
  anonymous: boolean;
  status: "OPEN" | "CLOSED";
  createdBy: number;
  createdByName: string;
  createdAt: string;
  closesAt: string | null;
  closedAt: string | null;
  totalVoters: number;
  options: PollOption[];
  myVotes: number[];
}

export interface CreatePollPayload {
  question: string;
  options: string[];
  multiSelect?: boolean;
  anonymous?: boolean;
  closesAt?: string | null;
}

// ── Recognition ──────────────────────────────────────────────────────────────

export interface Recognition {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatarUrl: string | null;
  recipientId: number;
  recipientName: string;
  recipientAvatarUrl: string | null;
  badge: string;
  badgeLabel: string;
  badgeEmoji: string;
  message: string;
  points: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  avatarUrl: string | null;
  department: string | null;
  points: number;
}

export const recognitionService = {
  async feed(page = 0, size = 20): Promise<Recognition[]> {
    const res = await client.get<{ data: Recognition[] }>(
      `/engagement/recognition/feed?page=${page}&size=${size}`
    );
    return unwrap<Recognition[]>(res);
  },

  async give(recipientId: number, badge: string, message: string): Promise<Recognition> {
    const res = await client.post<{ data: Recognition }>("/engagement/recognition", {
      recipientId,
      badge,
      message,
    });
    return unwrap<Recognition>(res);
  },

  async leaderboard(period: "month" | "all" = "month", limit = 10): Promise<LeaderboardEntry[]> {
    const res = await client.get<{ data: LeaderboardEntry[] }>(
      `/engagement/recognition/leaderboard?period=${period}&limit=${limit}`
    );
    return unwrap<LeaderboardEntry[]>(res);
  },

  async badges(): Promise<Record<string, [string, string]>> {
    const res = await client.get<{ data: Record<string, [string, string]> }>(
      "/engagement/recognition/badges"
    );
    return unwrap<Record<string, [string, string]>>(res);
  },

  async myPoints(): Promise<number> {
    const res = await client.get<{ data: number }>("/engagement/recognition/my-points");
    return unwrap<number>(res);
  },
};

// ── Ideas ────────────────────────────────────────────────────────────────────

export type IdeaStatus = "NEW" | "REVIEWING" | "PLANNED" | "DONE" | "DECLINED";

export interface Idea {
  id: number;
  authorId: number;
  authorName: string;
  authorAvatarUrl: string | null;
  title: string;
  description: string;
  status: IdeaStatus;
  statusNote: string | null;
  voteCount: number;
  votedByMe: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ideasService = {
  async list(opts: { status?: IdeaStatus; sort?: "newest" | "trending" } = {}): Promise<Idea[]> {
    const params = new URLSearchParams();
    if (opts.status) params.set("status", opts.status);
    if (opts.sort) params.set("sort", opts.sort);
    const qs = params.toString();
    const res = await client.get<{ data: Idea[] }>(`/engagement/ideas${qs ? `?${qs}` : ""}`);
    return unwrap<Idea[]>(res);
  },

  async submit(title: string, description: string): Promise<Idea> {
    const res = await client.post<{ data: Idea }>("/engagement/ideas", { title, description });
    return unwrap<Idea>(res);
  },

  async toggleVote(id: number): Promise<Idea> {
    const res = await client.post<{ data: Idea }>(`/engagement/ideas/${id}/vote`);
    return unwrap<Idea>(res);
  },

  async updateStatus(id: number, status: IdeaStatus, note?: string): Promise<Idea> {
    const res = await client.patch<{ data: Idea }>(`/engagement/ideas/${id}/status`, {
      status,
      note: note ?? null,
    });
    return unwrap<Idea>(res);
  },

  async remove(id: number): Promise<void> {
    await client.delete(`/engagement/ideas/${id}`);
  },
};
