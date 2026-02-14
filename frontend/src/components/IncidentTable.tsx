import React from "react";
import { Incident } from "../types";

interface Props {
  incidents: Incident[];
  total: number;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onPageChange: (page: number) => void;
  onSortChange: (column: string) => void;
  onSelectIncident: (id: number) => void;
  loading: boolean;
}

const columns: { key: keyof Incident | "actions"; label: string; sortable?: boolean }[] = [
  { key: "id", label: "ID", sortable: true },
  { key: "title", label: "Title", sortable: true },
  { key: "service", label: "Service", sortable: true },
  { key: "severity", label: "Severity", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "owner", label: "Owner" },
  { key: "createdAt", label: "Created", sortable: true },
  { key: "actions", label: "Actions" }
];

export const IncidentTable: React.FC<Props> = ({
  incidents,
  total,
  page,
  pageSize,
  sortBy,
  sortOrder,
  onPageChange,
  onSortChange,
  onSelectIncident,
  loading
}) => {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const handleSortClick = (key: string) => {
    onSortChange(key);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Incidents</h2>
        <span className="muted">
          {total} incident{total === 1 ? "" : "s"} found
        </span>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSortClick(col.key as string)}
                  className={col.sortable ? "sortable" : ""}
                >
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <span className="sort-indicator">
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="center">
                  Loading incidents...
                </td>
              </tr>
            ) : incidents.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="center">
                  No incidents match your criteria.
                </td>
              </tr>
            ) : (
              incidents.map(incident => (
                <tr key={incident.id}>
                  <td>{incident.id}</td>
                  <td className="truncate">{incident.title}</td>
                  <td>{incident.service}</td>
                  <td>
                    <span className={`badge badge-${incident.severity}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-status-${incident.status}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td>{incident.owner ?? "—"}</td>
                  <td>{new Date(incident.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn-link"
                      onClick={() => onSelectIncident(incident.id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button
          className="btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
        >
          Previous
        </button>
        <span className="muted">
          Page {page} of {totalPages}
        </span>
        <button
          className="btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
};

