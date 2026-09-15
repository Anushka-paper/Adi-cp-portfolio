# Progress Tracker — CP Portfolio

Tracks build progress against [CP-Portfolio-PRD.md](./CP-Portfolio-PRD.md) and [design.md](./design.md).
Legend: `[ ]` not started · `[~]` in progress · `[x]` done

---

## Phase 0 — Project Setup
- [x] Scaffold Next.js 16 (App Router, TypeScript, Tailwind v4)
- [x] Add shadcn/ui + Radix primitives
- [x] Add Motion (Framer Motion) for animation
- [x] Configure ESLint + strict TypeScript
- [ ] Set up Drizzle ORM + Postgres connection (Neon/Supabase — TBD)
- [ ] Env var scaffolding (.env.example)
- [x] Install Playwright (for future smoke E2E + visual checks)

## Phase 1 — MVP (per PRD §5 Phased Rollout)
- [x] Profile card component (per design.md spec — dark glass card, lime glow accent)
- [ ] Codeforces adapter (`fetchProfile → NormalizedProfile`)
- [ ] LeetCode adapter (GraphQL, unofficial — isolated behind adapter)
- [ ] Postgres schema: snapshots table (`data`, `fetched_at`, `status`)
- [ ] `/api/sync` route — calls adapters, writes snapshots
- [ ] Vercel Cron config (6h cadence)
- [ ] Unified rating timeline chart (Recharts)
- [ ] Per-platform stat cards (current/max rating, rank, delta)
- [ ] Activity heatmap (calendar-style, solved/submission counts)
- [ ] Editable bio/avatar/social links (curated content, no redeploy needed)
- [ ] "Last synced" relative timestamp per platform
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
- DB host (Neon vs Supabase): **TBD**
- MVP platforms: Codeforces + LeetCode (per PRD default)
- `Index.html` is the legacy static page — will be retired once the Next.js app replaces it.
