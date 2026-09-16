import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit is a standalone CLI, unlike Next.js it doesn't auto-load
// .env.local, so we load it explicitly here.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
