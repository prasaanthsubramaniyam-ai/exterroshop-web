"use client";

import client, { unwrap } from "./api";

export interface Payslip {
  id:             number;
  employeeId:     number;
  employeeName:   string;
  payPeriod:      string;   // YYYY-MM
  fileUrl:        string;
  fileName:       string;
  uploadedById:   number;
  uploadedByName: string;
  uploadedAt:     string;
}

export const payslipService = {
  getMyPayslips: (): Promise<Payslip[]> =>
    client.get<{ data: Payslip[] }>("/payslips/my").then((r) => unwrap(r)),

  getForEmployee: (employeeId: number): Promise<Payslip[]> =>
    client.get<{ data: Payslip[] }>(`/payslips/employee/${employeeId}`).then((r) => unwrap(r)),

  upload: (employeeId: number, payPeriod: string, file: File): Promise<Payslip> => {
    const form = new FormData();
    form.append("employeeId", String(employeeId));
    form.append("payPeriod",  payPeriod);
    form.append("file",       file);
    return client.post<{ data: Payslip }>("/payslips", form).then((r) => unwrap(r));
  },

  delete: (id: number): Promise<void> =>
    client.delete(`/payslips/${id}`).then(() => undefined),
};
