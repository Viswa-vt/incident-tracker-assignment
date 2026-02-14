import { db, initDb } from "./db";

initDb();

const services = [
  "payments-service",
  "auth-service",
  "user-service",
  "analytics-service",
  "notifications-service",
  "search-service"
];

const severities = ["SEV1", "SEV2", "SEV3", "SEV4"] as const;
const statuses = ["OPEN", "MITIGATED", "RESOLVED"] as const;

function randomChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTitle() {
  const prefixes = [
    "Error",
    "Latency spike",
    "Outage",
    "Data inconsistency",
    "Timeouts",
    "Throttling",
    "Deployment failure",
    "Memory leak detected"
  ];
  const suffixes = [
    "in EU region",
    "for checkout flow",
    "for login requests",
    "on background jobs",
    "on Kafka consumer",
    "for REST API",
    "on mobile clients",
    "on web clients"
  ];
  return `${randomChoice(prefixes)} ${randomChoice(suffixes)}`;
}

function randomOwner() {
  const owners = [
    "alice@company.com",
    "bob@company.com",
    "carol@company.com",
    "dave@company.com",
    "erin@company.com",
    null
  ];
  return randomChoice(owners);
}

function randomSummary() {
  const summaries = [
    "Investigating elevated error rates impacting customers.",
    "Mitigation in progress, rolling back recent deployment.",
    "Impact limited to a subset of users in APAC region.",
    "Working with infrastructure team to restore capacity.",
    "Issue mitigated, monitoring for recurrence.",
    "Incident resolved, preparing postmortem."
  ];
  return randomChoice(summaries);
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

async function seed() {
  console.log("Seeding incidents table with sample data...");

  await new Promise<void>((resolve, reject) => {
    db.run("DELETE FROM incidents", err => {
      if (err) return reject(err);
      resolve();
    });
  });

  await new Promise<void>((resolve, reject) => {
    const stmt = db.prepare(
      `INSERT INTO incidents (title, service, severity, status, owner, summary, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    db.serialize(() => {
      for (let i = 0; i < 200; i++) {
        const service = randomChoice(services);
        const severity = randomChoice(severities);
        const status = randomChoice(statuses);
        const owner = randomOwner();
        const summary = randomSummary();
        const createdAt = daysAgo(Math.floor(Math.random() * 60));
        const updatedAt = createdAt;

        stmt.run(
          randomTitle(),
          service,
          severity,
          status,
          owner,
          summary,
          createdAt,
          updatedAt
        );
      }
    });

    stmt.finalize(err => {
      if (err) return reject(err);
      resolve();
    });
  });

  console.log("Seeding complete.");
  db.close();
}

seed().catch(err => {
  console.error("Error during seeding:", err);
  process.exit(1);
});

