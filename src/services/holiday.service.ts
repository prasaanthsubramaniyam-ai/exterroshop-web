"use client";

import client, { unwrap } from "./api";

export interface Holiday {
  id:        number;
  name:      string;
  date:      string;    // ISO date YYYY-MM-DD
  optional:  boolean;
  createdAt: string;
}

export interface CreateHolidayPayload {
  name:     string;
  date:     string;
  optional: boolean;
}

export const holidayService = {
  getByYear: (year?: number): Promise<Holiday[]> => {
    const y = year ?? new Date().getFullYear();
    return client.get<{ data: Holiday[] }>(`/holidays?year=${y}`).then((r) => unwrap(r));
  },

  create: (payload: CreateHolidayPayload): Promise<Holiday> =>
    client.post<{ data: Holiday }>("/holidays", payload).then((r) => unwrap(r)),

  delete: (id: number): Promise<void> =>
    client.delete(`/holidays/${id}`).then(() => undefined),
};
