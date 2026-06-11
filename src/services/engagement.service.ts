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
};
