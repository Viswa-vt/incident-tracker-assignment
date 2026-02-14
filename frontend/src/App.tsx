import React, { useEffect, useState } from "react";
import { Incident } from "./types";
import { fetchIncidents, IncidentQuery } from "./api";
import { IncidentFilters } from "./components/IncidentFilters";
import { IncidentTable } from "./components/IncidentTable";
import { IncidentDetail } from "./components/IncidentDetail";
import { CreateIncidentForm } from "./components/CreateIncidentForm";

const DEFAULT_PAGE_SIZE = 20;

const App: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const loadIncidents = async (overrides: Partial<IncidentQuery> = {}) => {
    const query: IncidentQuery = {
      page,
      pageSize,
      search,
      severity: severity || undefined,
      status: status || undefined,
      sortBy,
      sortOrder,
      ...overrides
    };
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIncidents(query);
      setIncidents(data.items);
      setTotal(data.total);
      if (overrides.page) {
        setPage(overrides.page);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, severity, status, sortBy, sortOrder]);

  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    if (newPage > totalPages) return;
    setPage(newPage);
  };

  const handleCreated = () => {
    // Reload first page after creating an incident
    setPage(1);
    loadIncidents({ page: 1 });
  };

  const handleUpdated = () => {
    // Refresh current page and detail panel
    loadIncidents();
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Incident Tracker</h1>
          <p className="muted">
            Create, browse, and manage production incidents with server-side
            pagination.
          </p>
        </div>
      </header>
      <main className="layout">
        <section className="layout-main">
          <IncidentFilters
            search={searchInput}
            onSearchChange={v => {
              setSearchInput(v);
              setPage(1);
            }}
            severity={severity}
            onSeverityChange={v => {
              setSeverity(v);
              setPage(1);
            }}
            status={status}
            onStatusChange={v => {
              setStatus(v);
              setPage(1);
            }}
          />
          {error && <p className="error">{error}</p>}
          <IncidentTable
            incidents={incidents}
            total={total}
            page={page}
            pageSize={pageSize}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            onSelectIncident={id => setSelectedIncidentId(id)}
            loading={loading}
          />
        </section>
        <aside className="layout-side">
          <CreateIncidentForm onCreated={handleCreated} />
          <IncidentDetail
            incidentId={selectedIncidentId}
            onUpdated={handleUpdated}
          />
        </aside>
      </main>
    </div>
  );
};

export default App;

