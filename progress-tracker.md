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
- [x] Unified rating timeline chart (Recharts) with table fallback for accessibility
- [x] Per-platform stat cards (current/max rating, rank, solved count)
- [x] Activity heatmap (calendar-style, solved/submission counts) — 26-week grid, per-platform tooltip, text-table fallback
- [x] Editable bio/avatar/social links (curated content, no redeploy needed) — `/admin` behind single-credential auth (signed HMAC cookie), server-action form, home page reads from DB with default fallback
- [x] "Last synced" relative timestamp per platform
- [x] Responsive layout 320px–1440px+ — verified via screenshots at both breakpoints, no horizontal overflow
- [x] Accessibility pass — `prefers-reduced-motion` gates the card entrance animation, `prefers-color-scheme` now drives the CSS token dark palette (was previously wired to an unused `.dark` class), shadcn primitives (Button/Card/Badge) provide focus-visible rings and keyboard nav for free, charts/heatmap have `sr-only` table fallbacks
- [x] Deploy to Vercel — **live** at adi-cp-portfolio.vercel.app, connected to a Neon Postgres DB via Vercel's integration, real Codeforces + LeetCode data synced and rendering (handle: joyboy24)

## Phase 1.1
- [x] AtCoder adapter — `atcoder.jp/users/<user>/history/json` for rating history, kenkoooo's `ac_rank` endpoint for solved count, rank derived from AtCoder's known color-tier thresholds (no submission calendar available from these sources, so `activityCalendar` stays empty for this platform). Verified live.
- [ ] CodeChef adapter (scrape-based, feature-flaggable) — no public API exists; needs an HTML scraper, high breakage risk per PRD §3
- [ ] CSES — no per-user public API or profile endpoint exists at all; not syncable the way CF/LC/AtCoder are. Would need a manual/curated value instead of a real adapter.
- [ ] ICPC — not a personal-rating platform (team/regional contest results, no user API); would need a manually-curated "achievement" entry rather than a sync adapter.
- [ ] Solved-by-tag / solved-by-difficulty breakdowns
- [ ] Admin "resync now" action
- [ ] On-demand revalidation

## Phase 1.2
- [ ] Featured/pinned items (up to 6)
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
