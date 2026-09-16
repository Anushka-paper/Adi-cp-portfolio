import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { platformSnapshots } from "@/lib/db/schema";
import { adapters } from "@/lib/platforms";
import type { Platform, SyncResult } from "@/lib/platforms/types";

export const dynamic = "force-dynamic";

const HANDLES: Partial<Record<Platform, string>> = {
  codeforces: process.env.CODEFORCES_HANDLE,
  leetcode: process.env.LEETCODE_HANDLE,
  atcoder: process.env.ATCODER_HANDLE,
};

// Triggered by Vercel Cron every 6h (see vercel.json) or manually via
// the admin "resync now" action. This is the only place external
// platform APIs are called — public pages read exclusively from the
// DB, so a flaky third party never blocks a visitor request.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let db: ReturnType<typeof getDb>;
  try {
    db = getDb();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `DB setup failed: ${message}` }, { status: 500 });
  }

  const results: SyncResult[] = [];

  for (const [platform, adapter] of Object.entries(adapters) as [
    Platform,
    (typeof adapters)[Platform],
  ][]) {
    const handle = HANDLES[platform];
    if (!adapter || !handle) {
      continue; // adapter not built yet, or handle not configured
    }

    try {
      const profile = await adapter.fetchProfile(handle);
      await db
        .insert(platformSnapshots)
        .values({
          platform,
          status: "ok",
          data: profile,
          error: null,
          fetchedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: platformSnapshots.platform,
          set: {
            status: "ok",
            data: profile,
            error: null,
            fetchedAt: new Date(),
          },
        });
      results.push({ platform, status: "ok", profile });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Last-good data stays in place; only the status/error columns
      // are updated so the UI can show "stale" instead of erroring.
      try {
        await db
          .update(platformSnapshots)
          .set({ status: "failed", error: message })
          .where(eq(platformSnapshots.platform, platform));
      } catch {
        // DB itself may be unreachable — the result below still
        // reports the original failure either way.
      }
      results.push({ platform, status: "failed", profile: null, error: message });
    }
  }

  // The home page is statically prerendered, so without this it would
  // keep serving the build-time snapshot forever regardless of what
  // just got written to the DB above.
  revalidatePath("/");

  return NextResponse.json({ syncedAt: new Date().toISOString(), results });
}
