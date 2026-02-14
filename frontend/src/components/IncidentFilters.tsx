import React from "react";
import { Severity, Status } from "../types";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  severity: string;
  onSeverityChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
}

const severities: Severity[] = ["SEV1", "SEV2", "SEV3", "SEV4"];
const statuses: Status[] = ["OPEN", "MITIGATED", "RESOLVED"];

export const IncidentFilters: React.FC<Props> = ({
  search,
  onSearchChange,
  severity,
  onSeverityChange,
  status,
  onStatusChange
}) => {
  return (
    <div className="filters">
      <input
        className="input"
        type="text"
        placeholder="Search title, service, owner, summary..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
      />
      <select
        className="select"
        value={severity}
        onChange={e => onSeverityChange(e.target.value)}
      >
        <option value="">All Severities</option>
        {severities.map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        className="select"
        value={status}
        onChange={e => onStatusChange(e.target.value)}
      >
        <option value="">All Statuses</option>
        {statuses.map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
};

