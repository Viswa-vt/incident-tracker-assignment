export type Severity = "SEV1" | "SEV2" | "SEV3" | "SEV4";
export type Status = "OPEN" | "MITIGATED" | "RESOLVED";

export interface Incident {
  id: number;
  title: string;
  service: string;
  severity: Severity;
  status: Status;
  owner?: string | null;
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedIncidents {
  items: Incident[];
  total: number;
  page: number;
  pageSize: number;
}

