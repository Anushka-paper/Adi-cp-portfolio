import { getDb } from "@/lib/db";
import { platformSnapshots } from "@/lib/db/schema";
import type { PlatformSnapshot } from "@/lib/db/schema";

// Public pages must never hard-fail on a DB/config problem (PRD §1:
// "zero full-page errors"). Before a DATABASE_URL exists, or if the
// query fails, this returns an empty list and the UI shows an
// empty/loading state instead of crashing.
export async function getSnapshots(): Promise<PlatformSnapshot[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }
  try {
    const db = getDb();
    return await db.select().from(platformSnapshots);
  } catch {
    return [];
  }
}
