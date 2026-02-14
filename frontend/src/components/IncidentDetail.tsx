import React, { useEffect, useState } from "react";
import { Incident, Status } from "../types";
import { fetchIncident, updateIncident } from "../api";

interface Props {
  incidentId: number | null;
  onUpdated: () => void;
}

const statuses: Status[] = ["OPEN", "MITIGATED", "RESOLVED"];

export const IncidentDetail: React.FC<Props> = ({ incidentId, onUpdated }) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!incidentId) {
      setIncident(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchIncident(incidentId)
      .then(setIncident)
      .catch(err => {
        console.error(err);
        setError("Failed to load incident");
      })
      .finally(() => setLoading(false));
  }, [incidentId]);

  const handleChange = (field: keyof Incident, value: string) => {
    if (!incident) return;
    setIncident({ ...incident, [field]: value });
  };

  const handleSave = async () => {
    if (!incident) return;
    setSaving(true);
    setError(null);
    try {
      await updateIncident(incident.id, {
        title: incident.title,
        service: incident.service,
        severity: incident.severity,
        status: incident.status,
        owner: incident.owner ?? undefined,
        summary: incident.summary ?? undefined
      });
      onUpdated();
    } catch (e) {
      console.error(e);
      setError("Failed to update incident");
    } finally {
      setSaving(false);
    }
  };

  if (!incidentId) {
    return (
      <div className="card">
        <h2 className="card-title">Incident details</h2>
        <p className="muted">Select an incident from the table to view details.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="card-title">Incident details</h2>
        <p>Loading incident...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="card">
        <h2 className="card-title">Incident details</h2>
        <p className="error">Incident not found.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Incident #{incident.id}</h2>
        <span className="muted">
          Last updated {new Date(incident.updatedAt).toLocaleString()}
        </span>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="form-grid">
        <label className="field">
          <span>Title</span>
          <input
            className="input"
            value={incident.title}
            onChange={e => handleChange("title", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Service</span>
          <input
            className="input"
            value={incident.service}
            onChange={e => handleChange("service", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Severity</span>
          <select
            className="select"
            value={incident.severity}
            onChange={e =>
              handleChange("severity", e.target.value as Incident["severity"])
            }
          >
            <option value="SEV1">SEV1</option>
            <option value="SEV2">SEV2</option>
            <option value="SEV3">SEV3</option>
            <option value="SEV4">SEV4</option>
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select
            className="select"
            value={incident.status}
            onChange={e =>
              handleChange("status", e.target.value as Incident["status"])
            }
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
            value={incident.owner ?? ""}
            onChange={e => handleChange("owner", e.target.value)}
          />
        </label>
        <label className="field field-full">
          <span>Summary (optional)</span>
          <textarea
            className="textarea"
            rows={4}
            value={incident.summary ?? ""}
            onChange={e => handleChange("summary", e.target.value)}
          />
        </label>
      </div>
      <div className="card-footer">
        <button
          className="btn primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
};

