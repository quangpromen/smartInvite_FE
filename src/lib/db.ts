import { Pool } from "pg";

let pool: Pool | undefined;

// Lazy initialization avoids requiring a production DB secret during `next build`.
export function getDbPool(): Pool {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");
  pool = new Pool({
    connectionString: url,
    max: 3,
    connectionTimeoutMillis: 2_000,
    idleTimeoutMillis: 30_000,
    application_name: "smartinvite",
  });
  return pool;
}
