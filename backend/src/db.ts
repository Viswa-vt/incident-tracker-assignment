import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

sqlite3.verbose();

const DB_PATH = path.join(__dirname, "..", "data", "incidents.db");

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(DB_PATH);

export function initDb() {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        service TEXT NOT NULL,
        severity TEXT NOT NULL CHECK (severity IN ('SEV1','SEV2','SEV3','SEV4')),
        status TEXT NOT NULL CHECK (status IN ('OPEN','MITIGATED','RESOLVED')),
        owner TEXT,
        summary TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )`
    );

    db.run(
      `CREATE INDEX IF NOT EXISTS idx_incidents_createdAt ON incidents (createdAt DESC)`
    );
    db.run(
      `CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status)`
    );
    db.run(
      `CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents (severity)`
    );
    db.run(
      `CREATE INDEX IF NOT EXISTS idx_incidents_service ON incidents (service)`
    );
  });
}

export interface Incident {
  id: number;
  title: string;
  service: string;
  severity: "SEV1" | "SEV2" | "SEV3" | "SEV4";
  status: "OPEN" | "MITIGATED" | "RESOLVED";
  owner?: string | null;
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
}

