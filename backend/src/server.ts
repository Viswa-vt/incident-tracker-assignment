import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { db, initDb, Incident } from "./db";
import {
  createIncidentSchema,
  updateIncidentSchema,
  CreateIncidentInput,
  UpdateIncidentInput
} from "./validation";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

initDb();

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

function runQuery<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows as T[]);
    });
  });
}

function runGet<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row as T | undefined);
    });
  });
}

function runExecute(
  sql: string,
  params: any[] = []
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

// POST /api/incidents
app.post("/api/incidents", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createIncidentSchema.parse(req.body) as CreateIncidentInput;
    const now = new Date().toISOString();

    const result = await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO incidents (title, service, severity, status, owner, summary, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          parsed.title,
          parsed.service,
          parsed.severity,
          parsed.status ?? "OPEN",
          parsed.owner ?? null,
          parsed.summary ?? null,
          now,
          now
        ],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID as number);
        }
      );
    });

    const created = await runGet<Incident>(
      "SELECT * FROM incidents WHERE id = ?",
      [result]
    );

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// GET /api/incidents (pagination, filtering, sorting)
app.get("/api/incidents", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt((req.query.pageSize as string) || "20", 10), 1),
      100
    );
    const search = (req.query.search as string) || "";
    const severity = (req.query.severity as string) || "";
    const status = (req.query.status as string) || "";
    const service = (req.query.service as string) || "";
    const owner = (req.query.owner as string) || "";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrderRaw = ((req.query.sortOrder as string) || "desc").toUpperCase();
    const sortOrder = sortOrderRaw === "ASC" ? "ASC" : "DESC";

    const allowedSortBy = new Set([
      "createdAt",
      "updatedAt",
      "severity",
      "status",
      "service",
      "title"
    ]);
    const sortColumn = allowedSortBy.has(sortBy) ? sortBy : "createdAt";

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (search) {
      whereClauses.push(
        "(title LIKE ? OR service LIKE ? OR owner LIKE ? OR summary LIKE ?)"
      );
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }

    if (severity) {
      whereClauses.push("severity = ?");
      params.push(severity);
    }

    if (status) {
      whereClauses.push("status = ?");
      params.push(status);
    }

    if (service) {
      whereClauses.push("service = ?");
      params.push(service);
    }

    if (owner) {
      whereClauses.push("owner = ?");
      params.push(owner);
    }

    const whereSql = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    const countRow = await runGet<{ count: number }>(
      `SELECT COUNT(*) as count FROM incidents ${whereSql}`,
      params
    );
    const total = countRow?.count ?? 0;

    const offset = (page - 1) * pageSize;
    const items = await runQuery<Incident>(
      `SELECT * FROM incidents
       ${whereSql}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const result: PaginatedResult<Incident> = {
      items,
      total,
      page,
      pageSize
    };

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/incidents/:id
app.get("/api/incidents/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const incident = await runGet<Incident>(
      "SELECT * FROM incidents WHERE id = ?",
      [id]
    );
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.json(incident);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/incidents/:id
app.patch("/api/incidents/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const parsed = updateIncidentSchema.parse(
      req.body
    ) as UpdateIncidentInput;

    const existing = await runGet<Incident>(
      "SELECT * FROM incidents WHERE id = ?",
      [id]
    );
    if (!existing) {
      return res.status(404).json({ message: "Incident not found" });
    }

    const now = new Date().toISOString();
    const updated: Incident = {
      ...existing,
      ...parsed,
      owner:
        parsed.owner === undefined
          ? existing.owner
          : parsed.owner ?? null,
      summary:
        parsed.summary === undefined
          ? existing.summary
          : parsed.summary ?? null,
      updatedAt: now
    };

    await runExecute(
      `UPDATE incidents
       SET title = ?, service = ?, severity = ?, status = ?, owner = ?, summary = ?, updatedAt = ?
       WHERE id = ?`,
      [
        updated.title,
        updated.service,
        updated.severity,
        updated.status,
        updated.owner ?? null,
        updated.summary ?? null,
        updated.updatedAt,
        id
      ]
    );

    const fresh = await runGet<Incident>(
      "SELECT * FROM incidents WHERE id = ?",
      [id]
    );

    res.json(fresh);
  } catch (err) {
    next(err);
  }
});

// Basic health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Error handler
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

