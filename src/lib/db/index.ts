import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazily created so the module can be imported (e.g. by scripts or
// route handlers) even when DATABASE_URL isn't set yet — callers get
// a clear error only when they actually try to query.
let client: postgres.Sql | null = null;

function getClient(): postgres.Sql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add your Postgres connection string.",
    );
  }
  client ??= postgres(url);
  return client;
}

export function getDb() {
  return drizzle(getClient(), { schema });
}
