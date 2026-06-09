import client, { unwrap } from "./api";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Employee {
  id:               number;
  name:             string;
  email:            string;
  phone?:           string;
  department?:      string;
  jobTitle?:        string;
  avatarUrl?:       string;
  location?:        string;
  workLocation?:    string;
  role?:            string;
  gender?:          string;
  employeeId?:      string;
  dateOfJoining?:   string;   // "YYYY-MM-DD"
  managerId?:       number;
  managerName?:     string;
  managerAvatarUrl?: string;
  createdAt:        string;

  // ── V16 EMS fields ───────────────────────────────────────────────────────
  employeeCode?:     string;
  designationTitle?: string;
  designationLevel?: number;
  departmentName?:   string;
  departmentCode?:   string;
  userStatus?:       string;
  employmentType?:   string;
  skills?:           string[];
}

export interface DirectoryFilters {
  search?:     string;
  location?:   string;
  department?: string;
  role?:       string;
}

// ── Service ────────────────────────────────────────────────────────────────

export const directoryService = {
  getAll: (filters?: DirectoryFilters): Promise<Employee[]> => {
    const p = new URLSearchParams();
    if (filters?.search)     p.set("search",     filters.search);
    if (filters?.location)   p.set("location",   filters.location);
    if (filters?.department) p.set("department", filters.department);
    if (filters?.role)       p.set("role",       filters.role);
    const qs = p.toString();
    return client
      .get<{ data: Employee[] }>(`/directory/employees${qs ? "?" + qs : ""}`)
      .then((r) => unwrap(r));
  },

  getById: (id: number): Promise<Employee> =>
    client.get<{ data: Employee }>(`/directory/employees/${id}`).then((r) => unwrap(r)),

  getDepartments: (): Promise<string[]> =>
    client.get<{ data: string[] }>("/directory/departments").then((r) => unwrap(r)),

  getMyTeam: (): Promise<Employee[]> =>
    client.get<{ data: Employee[] }>("/directory/my-team").then((r) => unwrap(r)),

  getColleagues: (): Promise<Employee[]> =>
    client.get<{ data: Employee[] }>("/directory/colleagues").then((r) => unwrap(r)),
};
