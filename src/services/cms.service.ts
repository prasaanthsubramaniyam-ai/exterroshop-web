import client, { unwrap } from "./api";

// ── Types ──────────────────────────────────────────────────────────────────

export type CmsValueType = "string" | "boolean" | "number" | "json" | "color" | "image_url";

export interface CmsSetting {
  id: number;
  settingKey: string;
  settingValue: string | null;
  category: string;
  label: string | null;
  description: string | null;
  valueType: CmsValueType;
  isPublic: boolean;
  updatedById: number | null;
  updatedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CmsSettingPayload = Omit<
  CmsSetting,
  "id" | "updatedById" | "updatedByName" | "createdAt" | "updatedAt"
>;

// ── Service ────────────────────────────────────────────────────────────────

export const cmsService = {
  // Public — no auth required
  getPublic: () =>
    client.get<{ data: CmsSetting[] }>("/cms/public").then(unwrap<CmsSetting[]>),

  getPublicMap: () =>
    client.get<{ data: Record<string, string> }>("/cms/public/map").then(unwrap<Record<string, string>>),

  // Admin — SUPER_ADMIN only
  getAll: () =>
    client.get<{ data: CmsSetting[] }>("/cms/settings").then(unwrap<CmsSetting[]>),

  getCategories: () =>
    client.get<{ data: string[] }>("/cms/settings/categories").then(unwrap<string[]>),

  getByCategory: (category: string) =>
    client
      .get<{ data: CmsSetting[] }>(`/cms/settings/category/${category}`)
      .then(unwrap<CmsSetting[]>),

  getById: (id: number) =>
    client.get<{ data: CmsSetting }>(`/cms/settings/${id}`).then(unwrap<CmsSetting>),

  create: (payload: CmsSettingPayload) =>
    client.post<{ data: CmsSetting }>("/cms/settings", payload).then(unwrap<CmsSetting>),

  update: (id: number, payload: CmsSettingPayload) =>
    client.put<{ data: CmsSetting }>(`/cms/settings/${id}`, payload).then(unwrap<CmsSetting>),

  /** Quick patch — update only the value of a setting by its key. */
  patchByKey: (key: string, value: string) =>
    client
      .patch<{ data: CmsSetting }>(`/cms/settings/key/${key}`, { value })
      .then(unwrap<CmsSetting>),

  /** Bulk update — pass a key→value map (e.g. from the theme editor). */
  bulkUpdate: (updates: Record<string, string>) =>
    client
      .patch<{ data: CmsSetting[] }>("/cms/settings/bulk", updates)
      .then(unwrap<CmsSetting[]>),

  delete: (id: number) => client.delete(`/cms/settings/${id}`),

  /** Upload a branding asset (PNG, SVG, JPG) to Cloudinary. Returns the secure URL. */
  uploadMedia: (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    return client
      .post<{ data: { url: string } }>("/cms/upload", formData, {
        headers: { "Content-Type": undefined },
      })
      .then((r) => unwrap<{ url: string }>(r).url);
  },
};
