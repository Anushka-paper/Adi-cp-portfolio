import { NextResponse } from "next/server";
import { runSync } from "@/lib/sync";

export const dynamic = "force-dynamic";

// Triggered by Vercel Cron daily (see vercel.json) or manually via the
// admin "resync now" action (src/app/admin/actions.ts, which calls
// runSync() directly rather than hitting this route over HTTP).
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const outcome = await runSync();
    return NextResponse.json(outcome);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `DB setup failed: ${message}` }, { status: 500 });
  }
}
