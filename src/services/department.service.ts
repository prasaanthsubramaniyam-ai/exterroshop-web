import client, { unwrap } from "./api";

/**
 * Department — superset shape that satisfies BOTH:
 *  • the rich list pages (departmentName, departmentCode, status, counts)
 *  • the legacy @/types Department shape (name, code, active, headId…)
 * The mapper fills every field from the backend DepartmentDTO.
 */
export interface Department {
  id: number;
  // legacy @/types-compatible fields
  name: string;
  code: string;
  headId?: number;
  headName?: string;
  parentId?: number;
  parentName?: string;
  active: boolean;
  // rich fields
  departmentName: string;
  departmentCode: string;
  description?: string;
  costCenter?: string;
  location?: string;
  status: string;
  employeeCount: number;
  teamCount: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Flexible payload — accepts both legacy and rich keys. */
export interface CreateDepartmentPayload {
  name?: string;
  code?: string;
  headId?: number | null;
  parentId?: number | null;
  active?: boolean;
  departmentName?: string;
  departmentCode?: string;
  departmentHeadId?: number | null;
  parentDepartmentId?: number | null;
  description?: string;
  costCenter?: string;
  location?: string;
  status?: string;
}

interface DepartmentDTORaw {
  id: number;
  departmentCode: string;
  departmentName: string;
  description?: string;
  departmentHead?: { id: number; name: string; email?: string } | null;
  parentDepartmentId?: number | null;
  parentDepartmentName?: string | null;
  costCenter?: string;
  location?: string;
  status: string;
  employeeCount: number;
  teamCount: number;
  createdAt?: string;
  updatedAt?: string;
}

function mapDepartment(d: DepartmentDTORaw): Department {
  return {
    id: d.id,
    name: d.departmentName,
    code: d.departmentCode,
    headId: d.departmentHead?.id,
    headName: d.departmentHead?.name,
    parentId: d.parentDepartmentId ?? undefined,
    parentName: d.parentDepartmentName ?? undefined,
    active: d.status === "ACTIVE",
    departmentName: d.departmentName,
    departmentCode: d.departmentCode,
    description: d.description,
    costCenter: d.costCenter,
    location: d.location,
    status: d.status,
    employeeCount: d.employeeCount,
    teamCount: d.teamCount,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

function toRequest(p: CreateDepartmentPayload) {
  let status = p.status;
  if (!status && p.active !== undefined) status = p.active ? "ACTIVE" : "INACTIVE";
  return {
    departmentName: p.departmentName ?? p.name,
    departmentCode: (p.departmentCode ?? p.code)?.toUpperCase(),
    description: p.description,
    departmentHeadId: p.departmentHeadId ?? p.headId ?? null,
    parentDepartmentId: p.parentDepartmentId ?? p.parentId ?? null,
    costCenter: p.costCenter,
    location: p.location,
    status,
  };
}

async function getAll(): Promise<Department[]> {
  const res = await client.get("/departments");
  return unwrap<DepartmentDTORaw[]>(res).map(mapDepartment);
}

async function getById(id: number): Promise<Department> {
  const res = await client.get(`/departments/${id}`);
  return mapDepartment(unwrap<DepartmentDTORaw>(res));
}

async function create(payload: CreateDepartmentPayload): Promise<Department> {
  const res = await client.post("/departments", toRequest(payload));
  return mapDepartment(unwrap<DepartmentDTORaw>(res));
}

async function update(id: number, payload: CreateDepartmentPayload): Promise<Department> {
  const res = await client.put(`/departments/${id}`, toRequest(payload));
  return mapDepartment(unwrap<DepartmentDTORaw>(res));
}

async function remove(id: number): Promise<void> {
  await client.delete(`/departments/${id}`);
}

export const departmentService = {
  // legacy-style names
  getAll,
  getById,
  create,
  update,
  remove,
  // rich-style aliases
  getAllDepartments: getAll,
  getDepartmentById: getById,
  createDepartment: create,
  updateDepartment: update,
  deleteDepartment: remove,
};
