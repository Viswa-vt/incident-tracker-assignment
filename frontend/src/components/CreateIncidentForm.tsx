import React, { useState } from "react";
import { Incident, Severity, Status } from "../types";
import { createIncident } from "../api";

interface Props {
  onCreated: (incident: Incident) => void;
}

const severities: Severity[] = ["SEV1", "SEV2", "SEV3", "SEV4"];
const statuses: Status[] = ["OPEN", "MITIGATED", "RESOLVED"];

export const CreateIncidentForm: React.FC<Props> = ({ onCreated }) => {
  const [title, setTitle] = useState("");
  const [service, setService] = useState("");
  const [severity, setSeverity] = useState<Severity>("SEV3");
  const [status, setStatus] = useState<Status>("OPEN");
  const [owner, setOwner] = useState("");
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !service.trim()) {
      setError("Title and service are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await createIncident({
        title: title.trim(),
        service: service.trim(),
        severity,
        status,
        owner: owner.trim() || null,
        summary: summary.trim() || null
      });
      onCreated(created);
      setTitle("");
      setService("");
      setSeverity("SEV3");
      setStatus("OPEN");
      setOwner("");
      setSummary("");
    } catch (e) {
      console.error(e);
      setError("Failed to create incident");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Create incident</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="form-grid">
        <label className="field">
          <span>Title *</span>
          <input
            className="input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Describe the problem briefly"
          />
        </label>
        <label className="field">
          <span>Service *</span>
          <input
            className="input"
            value={service}
            onChange={e => setService(e.target.value)}
            placeholder="e.g. payments-service"
          />
        </label>
        <label className="field">
          <span>Severity</span>
          <select
            className="select"
            value={severity}
            onChange={e => setSeverity(e.target.value as Severity)}
          >
            {severities.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select
            className="select"
            value={status}
            onChange={e => setStatus(e.target.value as Status)}
          >
            {statuses.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Owner (optional)</span>
          <input
            className="input"
            value={owner}
            onChange={e => setOwner(e.target.value)}
          />
        </label>
        <label className="field field-full">
          <span>Summary (optional)</span>
          <textarea
            className="textarea"
            rows={3}
            value={summary}
            onChange={e => setSummary(e.target.value)}
          />
        </label>
        <div className="card-footer">
          <button
            type="submit"
            className="btn primary"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create incident"}
          </button>
        </div>
      </form>
    </div>
  );
};

