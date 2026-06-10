import client, { unwrap } from "./api";

export interface Permission {
  id: number;
  code: string;
  name: string;
  category: string;
  description?: string;
}

export interface RolePermissions {
  role: string;
  permissions: string[];
}

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN:   "Super Admin",
  HR:            "HR",
  MANAGER:       "Manager",
  FINANCE:       "Finance",
  IT_ADMIN:      "IT Admin",
  EMPLOYEE_USER: "Employee",
  STAFF:         "Staff",
};

export const rolesService = {
  getPermissions: (): Promise<Permission[]> =>
    client.get("/rbac/permissions").then((r) => unwrap<Permission[]>(r)),

  getMatrix: (): Promise<RolePermissions[]> =>
    client.get("/rbac/matrix").then((r) => unwrap<RolePermissions[]>(r)),

  setRolePermissions: (role: string, permissions: string[]): Promise<string[]> =>
    client.put(`/rbac/roles/${role}/permissions`, { permissions }).then((r) => unwrap<string[]>(r)),

  getMyPermissions: (): Promise<string[]> =>
    client.get("/rbac/my-permissions").then((r) => unwrap<string[]>(r)),
};
