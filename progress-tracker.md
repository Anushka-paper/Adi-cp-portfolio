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
- [x] Vercel Cron config (6h cadence, `vercel.json`)
- [x] Unified rating timeline chart (Recharts) with table fallback for accessibility
- [x] Per-platform stat cards (current/max rating, rank, solved count)
- [ ] Activity heatmap (calendar-style, solved/submission counts)
- [ ] Editable bio/avatar/social links (curated content, no redeploy needed) — schema exists, no admin UI yet
- [x] "Last synced" relative timestamp per platform
- [ ] Responsive layout 320px–1440px+
- [ ] Accessibility pass (keyboard nav, focus states, `prefers-reduced-motion`, `prefers-color-scheme`)
- [ ] Deploy to Vercel

## Phase 1.1
- [ ] AtCoder adapter
- [ ] CodeChef adapter (scrape-based, feature-flaggable)
- [ ] Solved-by-tag / solved-by-difficulty breakdowns
- [ ] Admin "resync now" action
- [ ] On-demand revalidation

## Phase 1.2
- [ ] Featured/pinned items (up to 6)
- [ ] GitHub contributions panel
- [ ] OG image generation
- [ ] Theme polish (dark/light)

## Quality Gates (ongoing)
- [ ] Vitest + Testing Library unit tests
- [ ] Playwright smoke E2E
- [ ] Lighthouse CI (Perf ≥ 95, A11y = 100)
- [ ] Contract tests for LeetCode/CodeChef adapters against fixtures

## Notes / Decisions
- DB host (Neon vs Supabase): **TBD** — schema/client are host-agnostic (plain `postgres://` URL), so this only needs `DATABASE_URL` set whenever a host is picked. Home page gracefully renders an empty state until then.
- MVP platforms: Codeforces + LeetCode (per PRD default)
- `Index.html` is the legacy static page — will be retired once the Next.js app replaces it.
- To go live: provision Postgres, set `DATABASE_URL`/`CODEFORCES_HANDLE`/`LEETCODE_HANDLE`/`CRON_SECRET` env vars, run `npm run db:push`, then hit `/api/sync` once (or wait for the Vercel Cron).
