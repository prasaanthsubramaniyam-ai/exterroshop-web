import client, { unwrap } from "./api";

export interface OnboardEmployeePayload {
  name: string;
  email: string;
  phone: string;
  gender?: string;
  role: string;
  departmentId?: number;
  teamId?: number;
  designationId?: number;
  managerId?: number;
  employmentType?: string;
  jobTitle?: string;
  dateOfJoining?: string; // YYYY-MM-DD
  location?: string;
  password?: string;
}

export interface OnboardResult {
  employee: {
    id: number;
    name: string;
    email: string;
    employeeCode?: string;
    role?: string;
  };
  employeeCode: string;
  tempPassword: string;
  passwordGenerated: boolean;
}

export const employeeService = {
  onboard: (payload: OnboardEmployeePayload): Promise<OnboardResult> =>
    client.post("/admin/employees", payload).then((r) => unwrap<OnboardResult>(r)),
};
