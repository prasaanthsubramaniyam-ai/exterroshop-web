import client, { unwrap } from "./api";

// ── Expenses ──────────────────────────────────────────────────────────────────

export type ExpenseStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PAID";
export type ExpenseCategory = "TRAVEL" | "MEALS" | "ACCOMMODATION" | "EQUIPMENT" | "TRAINING" | "OTHER";

export interface ExpenseClaim {
  id:            number;
  employeeId:    number;
  employeeName:  string;
  department:    string | null;
  title:         string;
  category:      ExpenseCategory;
  amount:        number;
  currency:      string;
  date:          string;
  description:   string | null;
  receiptUrl:    string | null;
  status:        ExpenseStatus;
  approverNote:  string | null;
  submittedAt:   string;
  processedAt:   string | null;
  processedBy:   string | null;
}

export interface SubmitExpensePayload {
  title:       string;
  category:    ExpenseCategory;
  amount:      number;
  date:        string;
  description?: string;
  receiptUrl?: string;
}

// ── Payroll ───────────────────────────────────────────────────────────────────

export type PayrollStatus = "DRAFT" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface PayrollCycle {
  id:           number;
  period:       string;      // YYYY-MM
  status:       PayrollStatus;
  totalAmount:  number;
  headcount:    number;
  runBy:        string | null;
  runAt:        string | null;
  notes:        string | null;
  createdAt:    string;
}

export interface PayrollEntry {
  id:            number;
  cycleId:       number;
  employeeId:    number;
  employeeName:  string;
  department:    string | null;
  grossPay:      number;
  deductions:    number;
  netPay:        number;
  status:        "PENDING" | "PAID";
}

// ── Service ───────────────────────────────────────────────────────────────────

export const financeService = {
  // Expenses
  listExpenses: (status?: ExpenseStatus): Promise<ExpenseClaim[]> => {
    const qs = status ? `?status=${status}` : "";
    return client.get<{ data: ExpenseClaim[] }>(`/finance/expenses${qs}`).then((r) => unwrap(r));
  },

  submitExpense: (payload: SubmitExpensePayload): Promise<ExpenseClaim> =>
    client.post<{ data: ExpenseClaim }>("/finance/expenses", payload).then((r) => unwrap(r)),

  approveExpense: (id: number, note?: string): Promise<ExpenseClaim> =>
    client.patch<{ data: ExpenseClaim }>(`/finance/expenses/${id}/approve`, { note: note ?? null }).then((r) => unwrap(r)),

  rejectExpense: (id: number, note: string): Promise<ExpenseClaim> =>
    client.patch<{ data: ExpenseClaim }>(`/finance/expenses/${id}/reject`, { note }).then((r) => unwrap(r)),

  // Payroll
  listCycles: (): Promise<PayrollCycle[]> =>
    client.get<{ data: PayrollCycle[] }>("/finance/payroll/cycles").then((r) => unwrap(r)),

  getCycleEntries: (cycleId: number): Promise<PayrollEntry[]> =>
    client.get<{ data: PayrollEntry[] }>(`/finance/payroll/cycles/${cycleId}/entries`).then((r) => unwrap(r)),

  runCycle: (period: string, notes?: string): Promise<PayrollCycle> =>
    client.post<{ data: PayrollCycle }>("/finance/payroll/cycles", { period, notes }).then((r) => unwrap(r)),
};
