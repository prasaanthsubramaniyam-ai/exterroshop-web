import client, { unwrap } from "./api";
import type { Designation } from "@/types";

export interface CreateDesignationPayload {
  title: string;
  level: number;
  departmentId?: number | null;
}

export interface UpdateDesignationPayload extends Partial<CreateDesignationPayload> {
  active?: boolean;
}

export const designationService = {
  /** Fetch all active designations, optionally filtered by department */
  getAll(departmentId?: number): Promise<Designation[]> {
    const params = departmentId ? { departmentId } : undefined;
    return client.get("/designations", { params }).then(unwrap);
  },

  getById(id: number): Promise<Designation> {
    return client.get(`/designations/${id}`).then(unwrap);
  },

  create(payload: CreateDesignationPayload): Promise<Designation> {
    return client.post("/designations", payload).then(unwrap);
  },

  update(id: number, payload: UpdateDesignationPayload): Promise<Designation> {
    return client.put(`/designations/${id}`, payload).then(unwrap);
  },
};
