import client, { unwrap } from "./api";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id:           number;
  action:       string;
  entityType:   string;
  entityId?:    number;
  actorId?:     number;
  actorName?:   string;
  actorEmail?:  string;
  oldValue?:    string;  // JSON string
  newValue?:    string;  // JSON string
  ipAddress?:   string;
  createdAt:    string;  // ISO datetime
}

export interface AuditLogPage {
  content:          AuditLogEntry[];
  totalElements:    number;
  totalPages:       number;
  number:           number;  // current page (0-based)
  size:             number;
}

export interface AuditLogFilters {
  action?:      string;
  entityType?:  string;
  actorId?:     number;
  from?:        string;   // "YYYY-MM-DD"
  to?:          string;   // "YYYY-MM-DD"
  page?:        number;
  size?:        number;
}

// ── Service ────────────────────────────────────────────────────────────────

const auditService = {
  getLogs: (filters: AuditLogFilters = {}): Promise<AuditLogPage> => {
    const params = new URLSearchParams();
    if (filters.action)      params.set("action",      filters.action);
    if (filters.entityType)  params.set("entityType",  filters.entityType);
    if (filters.actorId)     params.set("actorId",     String(filters.actorId));
    if (filters.from)        params.set("from",        filters.from);
    if (filters.to)          params.set("to",          filters.to);
    params.set("page", String(filters.page ?? 0));
    params.set("size", String(filters.size ?? 50));
    return client
      .get<{ data: AuditLogPage }>(`/audit-logs?${params.toString()}`)
      .then((r) => unwrap<AuditLogPage>(r));
  },

  getDistinctActions: (): Promise<string[]> =>
    client
      .get<{ data: string[] }>("/audit-logs/actions")
      .then((r) => unwrap<string[]>(r)),

  getDistinctEntityTypes: (): Promise<string[]> =>
    client
      .get<{ data: string[] }>("/audit-logs/entity-types")
      .then((r) => unwrap<string[]>(r)),
};

export default auditService;
