import axios from "axios";
import { Incident, PaginatedIncidents, Severity, Status } from "./types";

const api = axios.create({
  baseURL: "http://localhost:4000"
});

export interface IncidentQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  severity?: Severity | "";
  status?: Status | "";
  service?: string;
  owner?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function fetchIncidents(
  query: IncidentQuery
): Promise<PaginatedIncidents> {
  const res = await api.get<PaginatedIncidents>("/api/incidents", {
    params: query
  });
  return res.data;
}

export async function fetchIncident(id: number): Promise<Incident> {
  const res = await api.get<Incident>(`/api/incidents/${id}`);
  return res.data;
}

export async function createIncident(
  payload: Omit<Incident, "id" | "createdAt" | "updatedAt">
): Promise<Incident> {
  const res = await api.post<Incident>("/api/incidents", payload);
  return res.data;
}

export async function updateIncident(
  id: number,
  payload: Partial<Omit<Incident, "id" | "createdAt" | "updatedAt">>
): Promise<Incident> {
  const res = await api.patch<Incident>(`/api/incidents/${id}`, payload);
  return res.data;
}

