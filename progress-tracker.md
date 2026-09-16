# Progress Tracker — CP Portfolio

Tracks build progress against [CP-Portfolio-PRD.md](./CP-Portfolio-PRD.md) and [design.md](./design.md).
Legend: `[ ]` not started · `[~]` in progress · `[x]` done

---

## Phase 0 — Project Setup
- [x] Scaffold Next.js 16 (App Router, TypeScript, Tailwind v4)
- [x] Add shadcn/ui + Radix primitives
- [x] Add Motion (Framer Motion) for animation
- [x] Configure ESLint + strict TypeScript
- [x] Set up Drizzle ORM + Postgres connection (schema + client ready; actual Neon/Supabase instance still TBD — see Notes)
- [x] Env var scaffolding (.env.example)
- [x] Install Playwright (for future smoke E2E + visual checks)

## Phase 1 — MVP (per PRD §5 Phased Rollout)
- [x] Profile card component (per design.md spec — dark glass card, lime glow accent)
- [x] Codeforces adapter (`fetchProfile → NormalizedProfile`) — verified live against the real API
- [x] LeetCode adapter (GraphQL, unofficial — isolated behind adapter) — verified live
- [x] Postgres schema: snapshots table (`data`, `fetched_at`, `status`) + curated content table
- [x] `/api/sync` route — calls adapters, writes snapshots, degrades per-platform on failure
- [x] Vercel Cron config (`vercel.json`) — daily cadence; see Notes on the Hobby plan limit
- [x] Unified rating timeline chart — now a themed area chart (`@subframe/core`'s `AreaChart`, recolored to this app's own series palette instead of its default teal, dark mode follows the app's own theme toggle) with forward-filled per-platform ratings so the area doesn't gap between contests, plus a table fallback for accessibility
- [x] Per-platform stat cards (current/max rating, rank, solved count)
- [x] Activity heatmap — now a GitHub-style calendar (`src/components/ui/git-hub-calendar.tsx`, `date-fns`-based) with per-platform tooltip breakdown and a text-table fallback
- [x] Editable bio/avatar/social links (curated content, no redeploy needed) — `/admin` behind single-credential auth (signed HMAC cookie), server-action form, home page reads from DB with default fallback
- [x] "Last synced" relative timestamp per platform
- [x] Responsive layout 320px–1440px+ — verified via screenshots at 320/768/1440px, no horizontal page overflow. Desktop (lg+) now uses a bento grid (12-col: rating chart 7/12, activity 5/12, platform/achievement cards 4/12 each = 3 per row) instead of a single vertical stack; tablet is 2-col, mobile is 1-col.
- [x] Accessibility pass — `prefers-reduced-motion` gates the card entrance animation, `prefers-color-scheme` now drives the CSS token dark palette (was previously wired to an unused `.dark` class), shadcn primitives (Button/Card/Badge) provide focus-visible rings and keyboard nav for free, charts/heatmap have `sr-only` table fallbacks
- [x] Deploy to Vercel — **live** at adi-cp-portfolio.vercel.app, connected to a Neon Postgres DB via Vercel's integration, real Codeforces + LeetCode data synced and rendering (handle: joyboy24)

## Phase 1.1
- [x] AtCoder adapter — `atcoder.jp/users/<user>/history/json` for rating history, kenkoooo's `ac_rank` endpoint for solved count, rank derived from AtCoder's known color-tier thresholds (no submission calendar available from these sources, so `activityCalendar` stays empty for this platform). Verified live.
- [ ] CodeChef adapter (scrape-based, feature-flaggable) — no public API exists; needs an HTML scraper, high breakage risk per PRD §3
- [ ] CSES — no per-user public API or profile endpoint exists at all; not syncable the way CF/LC/AtCoder are. Would need a manual/curated value instead of a real adapter.
- [ ] ICPC — not a personal-rating platform (team/regional contest results, no user API); would need a manually-curated "achievement" entry rather than a sync adapter.
- [ ] Solved-by-tag / solved-by-difficulty breakdowns
- [ ] Admin "resync now" action
- [x] On-demand revalidation — `revalidatePath("/")` after every sync (was previously a no-op `revalidateTag` call that tagged nothing; see Notes)
- [x] Avatar upload via Vercel Blob — `/admin` now has a file upload (PNG/JPEG/WebP/GIF, 5MB max) alongside the URL field, saved via `@vercel/blob`'s `put()`. **Needs a Vercel Blob store created + `BLOB_READ_WRITE_TOKEN` set before this works in production** — not done yet, see Notes.

## Phase 1.2
- [x] Featured/pinned items (up to 6) — pulled forward from v1.2 to cover CodeChef/CSES/ICPC, which have no live-sync path (see Phase 1.1 notes). Editable via `/admin` (title/description/link), rendered as an "Achievements" section. Verified end-to-end with Playwright (add → save → renders on home page).
- [ ] GitHub contributions panel
- [ ] OG image generation
- [ ] Theme polish (dark/light)

## Quality Gates (ongoing)
- [x] Vitest unit/contract tests for adapters (`npm run test`) — Codeforces + LeetCode, fixture-mocked `fetch`, cover success + failure paths
- [x] Playwright smoke E2E (`npm run test:e2e`) — home page renders without crashing (no DB configured), copy-email interaction
- [ ] Lighthouse CI (Perf ≥ 95, A11y = 100)
- [x] Contract tests for LeetCode + AtCoder adapters against fixtures (CodeChef adapter doesn't exist — no public API to test against)

## Notes / Decisions
- DB host (Neon vs Supabase): **TBD** — schema/client are host-agnostic (plain `postgres://` URL), so this only needs `DATABASE_URL` set whenever a host is picked. Home page gracefully renders an empty state until then.
- MVP platforms: Codeforces + LeetCode (per PRD default)
- `Index.html` is the legacy static page — will be retired once the Next.js app replaces it.
- To go live: provision Postgres, set `DATABASE_URL`/`CODEFORCES_HANDLE`/`LEETCODE_HANDLE`/`CRON_SECRET`/`ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET` env vars, run `npm run db:push`, then hit `/api/sync` once (or wait for the Vercel Cron). Visit `/admin` to edit bio/avatar/name/role/email.
- Admin auth flow (redirect-to-login, wrong-password rejection, successful login) verified end-to-end with Playwright.
- **Cron cadence deviates from PRD §1's "never more than 6h stale" KPI**: Vercel's Hobby plan only allows cron jobs to run once per day, so `vercel.json` runs `/api/sync` daily instead of every 6h. First deploy failed for exactly this reason (schedule was `0 */6 * * *`). Options if fresher data matters: upgrade to Vercel Pro (restores 6h cadence), or ship the "resync now" admin action from Phase 1.1 sooner so the owner can manually trigger a sync between daily runs.
- **`revalidateTag("platform-snapshots")` was a real bug, not just a naming choice**: nothing in the codebase ever read data through a cache actually tagged `"platform-snapshots"`, so it was a silent no-op — the home page kept serving its build-time (empty) snapshot forever no matter how many times `/api/sync` succeeded. Fixed by switching to `revalidatePath("/")`, which actually invalidates the page that changed.
- **Avatar upload needs a Vercel Blob store**: go to the Vercel project → Storage tab → Create → Blob. This auto-adds `BLOB_READ_WRITE_TOKEN` to the project's env vars (same pattern as the Neon integration). Until that exists, the "Upload" button in `/admin` will fail with an upload error — the URL field still works as a fallback either way.
- **`sr-only` doesn't reliably hide `<table>` elements**: `position: absolute` doesn't blockify `display: table` the way it does for inline elements, so a table's own auto-layout sizing can override the tiny width/height `sr-only` relies on — it ends up an invisible-but-still-full-size absolutely-positioned box that silently bloats `document.documentElement.scrollHeight` (found via a real ~8000px page-height discrepancy). Fix: put `sr-only` on a `<div>` wrapper around the table, never on the `<table>` itself. Applies to both the rating chart's and the heatmap's accessible-table fallbacks.
- **Third-party UI components integrated this session**: `src/components/ui/git-hub-calendar.tsx` (GitHub-style activity calendar, `date-fns`-based, user-supplied component adapted to take a `renderTooltip` callback so per-platform breakdowns survived the swap) and `src/components/ui/area-chart.tsx` (`@subframe/core`'s `AreaChart`, recolored from its default teal to this app's own palette and wired to follow the app's theme toggle instead of forcing dark mode).
