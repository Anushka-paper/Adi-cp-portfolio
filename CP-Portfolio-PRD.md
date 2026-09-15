# Product Requirements Document — Competitive Programming Profile Portfolio

**Type:** Single-user personal portfolio (live auto-sync)
**Owner:** You
**Status:** Draft v1.0
**Last updated:** September 15, 2026

---

## 1. Executive Summary

**Problem Statement.** A competitive programmer's achievements are fragmented across Codeforces, LeetCode, CodeChef, and AtCoder, each with a different UI and rating scale. There's no single, recruiter-friendly page that proves skill at a glance and stays current without manual upkeep.

**Proposed Solution.** A single-user portfolio site that auto-syncs stats from each platform's API on a schedule, normalizes them into one view (unified rating timeline, per-platform cards, problem-solving heatmap, contest history), and renders fast, accessible, shareable pages.

**Success Criteria (measurable KPIs).**
- Home route achieves **Lighthouse Performance ≥ 95** and **Accessibility = 100** on mobile throttled 4G.
- **Largest Contentful Paint < 1.5s** and **CLS < 0.1** on a mid-tier mobile device.
- Platform stats are **never more than 6 hours stale**, with a visible "last synced" timestamp per platform.
- A failed sync on one platform **degrades gracefully** (shows last-good cached data) with **zero full-page errors**.
- Cold-start-to-content (no build changes) served entirely from cache/ISR in **< 200ms TTFB** from a Vercel edge region.

---

## 2. User Experience & Functionality

### User Personas

- **Primary — You (the owner).** Wants a zero-maintenance page that always reflects current ratings, plus an occasional manual override (pinned problems, custom bio, featured contests).
- **Secondary — Recruiter / peer visitor.** Lands from a résumé link or social bio, scans for 20–40 seconds, wants credible proof of skill and a link back to source profiles.

### User Stories & Acceptance Criteria

**Story 1 — As the owner, I want stats to sync automatically so my page is never out of date.**
- A scheduled job refreshes all connected platforms at least every 6 hours.
- Each platform card shows a relative "last synced" label (e.g., "2h ago").
- Manual "resync now" is available in an authenticated admin view and completes within 30s or reports a per-platform failure reason.

**Story 2 — As a visitor, I want a unified rating view so I can judge skill without knowing each platform's scale.**
- A combined timeline chart overlays each platform's rating history with distinct series and a legend.
- Each platform card shows current rating, max rating, rank/title (e.g., Codeforces "Expert"), and delta since last contest.
- Ratings link out to the canonical source profile in a new tab with `rel="noopener"`.

**Story 3 — As a visitor, I want to see problem-solving activity so I can gauge consistency.**
- A calendar heatmap (GitHub-style) aggregates solved-problem / submission counts across platforms.
- Tooltips show the date and per-platform breakdown.
- Totals show solved-by-difficulty and solved-by-tag (top N tags).

**Story 4 — As the owner, I want to curate content so the page tells my story, not just numbers.**
- Editable bio, avatar, and social links.
- Ability to pin up to 6 "featured" items (a hard problem solved, a contest placement, an editorial written).
- Content edits persist and render without a redeploy.

**Story 5 — As a visitor on any device, I want a fast, accessible page.**
- Fully responsive from 320px to 1440px+.
- Keyboard-navigable; visible focus states; charts have text/table fallbacks.
- Respects `prefers-reduced-motion` and `prefers-color-scheme`.

### Non-Goals (explicitly out of scope for v1)

- Multi-user sign-up, public profile directory, or social features.
- Head-to-head comparison against other users.
- Real-time (sub-hour) live contest tracking or websocket updates.
- Writing/hosting editorials or a blog CMS (may return in a later phase).
- Mobile native apps.

---

## 3. Data & Integration Requirements

This is a data-aggregation product, so integration reliability is the core engineering risk. Each source differs in API maturity — this must be designed for, not assumed away.

| Platform | Access method | Official? | Notes / risk |
|---|---|---|---|
| **Codeforces** | REST API (`user.info`, `user.rating`, `user.status`) | ✅ Official, public | Most stable. Rate-limited; requires backoff. |
| **LeetCode** | GraphQL endpoint (`userProfile`, `submitStats`, calendar) | ⚠️ Unofficial | No documented public contract; schema can change. Needs a normalization adapter + contract tests. |
| **AtCoder** | AtCoder Problems API (kenkoooo dataset) + profile scrape | ⚠️ Community/unofficial | Rating history via community datasets; verify caching etiquette. |
| **CodeChef** | HTML scrape / unofficial endpoints | ⚠️ Unofficial, fragile | Highest breakage risk. Isolate behind an adapter; feature-flag off if it breaks. |
| **GitHub** (optional) | REST/GraphQL API | ✅ Official | For a contributions panel, if desired. |

**Evaluation / reliability strategy.**
- Each platform sits behind a typed **adapter interface** (`fetchProfile → NormalizedProfile`) so a broken source is swappable and independently testable.
- **Contract tests** run against recorded fixtures; a nightly canary hits live endpoints and alerts on schema drift.
- Every sync writes to a cache table with a `fetched_at` and `status` (`ok` / `stale` / `failed`), so the UI can always render last-good data.
- Accuracy check: normalized rating/rank must match the source profile for a set of known snapshots (manual golden-record verification before launch).

---

## 4. Technical Specifications

### Recommended Stack (current as of Sep 2026)

Verified against latest stable releases at time of writing.

- **Framework:** Next.js **16.3** (App Router, React Server Components, Server Actions, Turbopack builds).
- **UI runtime:** React **19.2**.
- **Language:** TypeScript **5.x** (strict mode, typed routes).
- **Styling:** Tailwind CSS **v4** (Oxide engine, OKLCH tokens, CSS-native `@theme` — no `tailwind.config.ts`).
- **Components:** **shadcn/ui** (CLI v2, copy-into-repo, Radix primitives for accessibility).
- **Animation:** **Motion** (formerly Framer Motion), gated on `prefers-reduced-motion`.
- **Charts:** **Recharts** for rating timelines; a lightweight calendar-heatmap component for activity. (visx as an alternative if custom rendering is needed.)
- **Data fetching (client):** **TanStack Query** for cache hydration and background refetch of the admin view.
- **Persistence / cache:** **Postgres** (Neon or Supabase) via **Drizzle ORM** — stores normalized snapshots so pages never depend on a live third-party call at request time.
- **Rate-limit / ephemeral cache:** **Upstash Redis** (optional) for per-platform request throttling.
- **Scheduling:** **Vercel Cron** invoking a sync route on a 6-hour cadence.
- **Deployment:** **Vercel** with ISR + on-demand revalidation.
- **Quality gates:** ESLint, TypeScript strict, Vitest + Testing Library, Playwright for a smoke E2E, Lighthouse CI in the pipeline.

*Rationale:* This is the mainstream, AI-tooling-friendly, production-proven React stack in 2026. Every layer has a distinct role with no overlap, and shadcn's copy-in model means no UI-library version lock.

### Architecture Overview (data flow)

```
Vercel Cron (every 6h)
        │
        ▼
  /api/sync route  ──►  Platform Adapters ──►  external APIs
        │                    │ (normalize)      (CF / LC / AtCoder / CC / GitHub)
        │                    ▼
        │              Postgres (Drizzle)  ◄─ writes snapshots {data, fetched_at, status}
        │                    │
        ▼                    ▼
 revalidateTag(...)   Public pages (RSC) read from DB, served via ISR
        │
        ▼
   Visitor request ──► edge/ISR cache ──► HTML (last-good data, always)
```

- **Read path is decoupled from third parties.** Public pages read only from Postgres, so a visitor request never blocks on a flaky external API.
- **Write path is the scheduled sync**, which is the only place external calls happen; failures are contained per-adapter.
- On successful sync, `revalidateTag` refreshes affected ISR pages.

### Integration Points

- External: platform APIs listed in §3.
- Internal: Postgres (snapshots + curated content), optional Redis (throttle), Vercel Cron (trigger), Vercel Blob or similar (avatar/asset hosting if not using a URL).

### Security & Privacy

- **Single-user, so auth is minimal:** an admin edit surface protected by a single credential (e.g., Auth.js with a single provider, or a signed admin cookie). Public pages are read-only and unauthenticated.
- **No visitor PII collected.** If analytics are added, use a privacy-preserving, cookieless provider.
- **Secrets** (API keys, DB URL) in Vercel environment variables, never client-exposed.
- **Scraped sources:** respect robots/ToS and rate limits; cache aggressively to minimize requests; attribute source links.
- **Input safety:** curated content fields are sanitized before render.

---

## 5. Risks & Roadmap

### Technical Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Unofficial APIs (LeetCode/CodeChef) change or break | Stale or missing data | Adapter isolation, contract tests, canary alerts, graceful last-good fallback, per-platform feature flag |
| Rate limiting / IP blocks on scraping | Sync failures | Backoff + jitter, 6h cadence, Redis throttle, cached reads |
| Rating-scale mismatch confuses visitors | Misleading page | Normalize + label each scale; keep native rank titles; link to source |
| Chart/animation cost on low-end mobile | Poor Lighthouse score | Lazy-load charts, `prefers-reduced-motion`, static SSR fallback tables |
| Data drift vs. source | Credibility loss | Golden-record verification pre-launch; visible "last synced" |

### Phased Rollout

**MVP (v1.0)** — Codeforces + LeetCode adapters, unified rating timeline, per-platform cards, activity heatmap, editable bio/links, scheduled sync, deployed on Vercel, meets all §1 KPIs.

**v1.1** — Add AtCoder + CodeChef adapters; solved-by-tag and solved-by-difficulty breakdowns; "resync now" admin action; on-demand revalidation.

**v1.2** — Featured/pinned items, GitHub contributions panel, OG image generation for shareable link previews, optional dark/light theme polish.

**v2.0** — Optional public "editorials/notes" section, more granular contest analytics, and (if ever desired) opening the door to multi-user — which would require re-scoping auth, data isolation, and a profile directory.

---

## Open Questions / TBD

- Preferred DB host: **Neon vs. Supabase** (both fine; Supabase adds auth if you later go multi-user).
- Which platforms are must-have for MVP vs. deferrable (default assumption: Codeforces + LeetCode first).
- Domain/hosting: custom domain on Vercel?
- Do you want a GitHub contributions panel in v1, or defer to v1.2?
