import client, { unwrap } from "./api";
import type { Department } from "@/types";

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  headId?: number | null;
  parentId?: number | null;
}

export interface UpdateDepartmentPayload extends Partial<CreateDepartmentPayload> {
  active?: boolean;
}

export const departmentService = {
  /** Fetch all active departments */
  getAll(): Promise<Department[]> {
    return client.get("/departments").then(unwrap);
  },

  getById(id: number): Promise<Department> {
    return client.get(`/departments/${id}`).then(unwrap);
  },

  create(payload: CreateDepartmentPayload): Promise<Department> {
    return client.post("/departments", payload).then(unwrap);
  },

  update(id: number, payload: UpdateDepartmentPayload): Promise<Department> {
    return client.put(`/departments/${id}`, payload).then(unwrap);
  },
};
