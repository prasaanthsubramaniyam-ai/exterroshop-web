import client, { unwrap } from "./api";

/**
 * Designation — superset shape that satisfies BOTH:
 *  • the rich list pages (designationName, designationCode, levelName…)
 *  • the legacy @/types Designation shape (title, level:number, active…)
 */
export interface Designation {
  id: number;
  // legacy @/types-compatible fields
  title: string;
  level: number;
  active: boolean;
  // rich fields
  designationName: string;
  designationCode?: string;
  levelName?: string;
  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;
  description?: string;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  salaryGrade?: string;
  status: string;
  employeeCount: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Flexible payload — accepts both legacy and rich keys. */
export interface CreateDesignationPayload {
  title?: string;
  level?: number | string;
  active?: boolean;
  designationName?: string;
  designationCode?: string;
  levelName?: string;
  departmentId?: number | null;
  description?: string;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  salaryGrade?: string;
  status?: string;
}

interface DesignationDTORaw {
  id: number;
  designationCode?: string;
  designationName: string;
  level?: string | number | null;
  levelName?: string;
  departmentId?: number | null;
  departmentName?: string;
  departmentCode?: string;
  description?: string;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  salaryGrade?: string;
  status: string;
  employeeCount: number;
  createdAt?: string;
  updatedAt?: string;
}

function mapDesignation(d: DesignationDTORaw): Designation {
  const levelNum = d.level != null && d.level !== "" ? Number(d.level) : 0;
  return {
    id: d.id,
    title: d.designationName,
    level: Number.isNaN(levelNum) ? 0 : levelNum,
    active: d.status === "ACTIVE",
    designationName: d.designationName,
    designationCode: d.designationCode,
    levelName: d.levelName,
    departmentId: d.departmentId ?? undefined,
    departmentName: d.departmentName,
    departmentCode: d.departmentCode,
    description: d.description,
    minExperienceYears: d.minExperienceYears,
    maxExperienceYears: d.maxExperienceYears,
    salaryGrade: d.salaryGrade,
    status: d.status,
    employeeCount: d.employeeCount,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

/** Auto-generate a code from the title when none supplied (backend requires it). */
function codeFromTitle(title?: string): string | undefined {
  if (!title) return undefined;
  return title.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function toRequest(p: CreateDesignationPayload) {
  let status = p.status;
  if (!status && p.active !== undefined) status = p.active ? "ACTIVE" : "INACTIVE";
  const title = p.designationName ?? p.title;
  return {
    designationCode: p.designationCode ?? codeFromTitle(title),
    designationName: title,
    level: p.level != null ? String(p.level) : undefined,
    levelName: p.levelName,
    departmentId: p.departmentId ?? null,
    description: p.description,
    minExperienceYears: p.minExperienceYears,
    maxExperienceYears: p.maxExperienceYears,
    salaryGrade: p.salaryGrade,
    status,
  };
}

async function getAll(): Promise<Designation[]> {
  const res = await client.get("/designations");
  return unwrap<DesignationDTORaw[]>(res).map(mapDesignation);
}

async function getById(id: number): Promise<Designation> {
  const res = await client.get(`/designations/${id}`);
  return mapDesignation(unwrap<DesignationDTORaw>(res));
}

async function getByDepartment(departmentId: number): Promise<Designation[]> {
  const res = await client.get(`/designations/department/${departmentId}`);
  return unwrap<DesignationDTORaw[]>(res).map(mapDesignation);
}

async function getByLevel(level: string): Promise<Designation[]> {
  const res = await client.get(`/designations/level/${level}`);
  return unwrap<DesignationDTORaw[]>(res).map(mapDesignation);
}

async function create(payload: CreateDesignationPayload): Promise<Designation> {
  const res = await client.post("/designations", toRequest(payload));
  return mapDesignation(unwrap<DesignationDTORaw>(res));
}

async function update(id: number, payload: CreateDesignationPayload): Promise<Designation> {
  const res = await client.put(`/designations/${id}`, toRequest(payload));
  return mapDesignation(unwrap<DesignationDTORaw>(res));
}

async function remove(id: number): Promise<void> {
  await client.delete(`/designations/${id}`);
}

export const designationService = {
  // legacy-style names
  getAll,
  getById,
  create,
  update,
  remove,
  // rich-style aliases
  getAllDesignations: getAll,
  getDesignationById: getById,
  getDesignationsByDepartment: getByDepartment,
  getDesignationsByLevel: getByLevel,
  createDesignation: create,
  updateDesignation: update,
  deleteDesignation: remove,
};
