# Design Spec — Profile Card

A dark, glass-surfaced profile card with a lime "glow" accent, a live status row, avatar + identity block, and two action buttons. This document captures the visual language of the component so it can be reused, restyled, or handed to engineering.

---

## 1. Overview

**Component:** `profile-card` (dark identity card)
**Surface:** Single elevated card on a transparent page, with a colored glow bleeding out from behind its lower edge.
**Personality:** Modern, high-contrast, "developer portfolio." Near-black card, a single vivid lime accent, generous rounding, soft depth.

**Anatomy (top → bottom):**
1. **Status row** — pulsing dot + status label (left), clock icon + local time (right)
2. **Identity block** — circular avatar, name, role
3. **Action row** — two equal buttons (primary action, copy email)
4. **Glow caption** — lime glow slab behind the card with a centered "Zap + tagline" label peeking out beneath it

---

## 2. Design Tokens

### 2.1 Color

| Token | Value | Usage |
|---|---|---|
| Card surface | `radial-gradient(120% 120% at 30% 10%, #1a1a1a 0%, #0f0f10 60%, #0b0b0c 100%)` | Card background — off-center dark radial, lighter at top-left |
| Accent / glow | `lime-400` `#a3e635` @ 90% opacity | Glow slab behind card |
| Glow shadow | `rgba(163, 230, 53, 0.8)` | `0 40px 80px -16px` colored drop shadow |
| Status (default) | `lime-500` `#84cc16` | Availability dot (overridable via `statusColor`) |
| Text / primary | `#ffffff` | Name, button labels, icons |
| Text / secondary | `neutral-300` `#d4d4d4` | Status label, time |
| Text / tertiary | `neutral-400` `#a3a3a3` | Role |
| On-accent text | `#000000` | Tagline text sitting over the lime glow |
| Button surface | `white / 10%` | Action button fill |
| Button surface (hover) | `white / 15%` | Action button hover |
| Avatar ring | `white / 10%` | 2px ring around avatar |

**Accent discipline:** exactly one accent color (lime) carries the whole design — the glow, the status dot, and nothing else. Keep it that way; a second accent would break the look.

### 2.2 Typography

| Element | Size | Weight | Tracking | Color | Notes |
|---|---|---|---|---|---|
| Name | `text-xl` (20px) → `sm:text-2xl` (24px) | 600 semibold | `tracking-tight` (−0.025em) | white | `truncate` on overflow |
| Role | `text-sm` (14px) | 400 | normal | neutral-400 | — |
| Status label | `text-sm` (14px) | 400 | normal | neutral-300 | `select-none` |
| Time | `text-sm` (14px) | 400 | normal | neutral-300 | `tabular-nums` |
| Tagline (glow) | `text-sm` (14px) | 500 medium | normal | black | centered |
| Button label | `text-sm` (14px) | 500 medium | normal | white | inherited from button base |

No custom font is specified — inherits the app's default sans stack. `tabular-nums` on the clock keeps the time from shifting width.

### 2.3 Spacing & Sizing

| Token | Value | Applied to |
|---|---|---|
| Card padding | `p-6` (24px) → `sm:p-8` (32px) | Card content |
| Card max width | `max-w-3xl` (768px) | Card |
| Header → body gap | `mb-6` (24px) | Below status row |
| Body → actions gap | `mt-6` (24px) | Above button row |
| Name → role gap | `mt-0.5` (2px) | — |
| Avatar row gap | `gap-5` (20px) | Avatar ↔ identity |
| Status row gap | `gap-2` (8px) | Dot ↔ label, icon ↔ time |
| Button row gap | `gap-4` (16px) | Between buttons |
| Avatar | `56 × 56px` (`h-14 w-14`) | Circular |
| Status dot | `10 × 10px` (`h-2.5 w-2.5`) | Circular |
| Icons | `16 × 16px` (`h-4 w-4`) | All lucide icons |
| Button height | `48px` (`h-12`) | Action buttons |

### 2.4 Radius

| Token | Value | Applied to |
|---|---|---|
| Card | `28px` (`rounded-[28px]`) | Card + glow slab |
| Button | `16px` (`rounded-2xl`) | Action buttons |
| Avatar / dot | `9999px` (`rounded-full`) | Avatar, status dot |

Rounding is deliberately large and consistent — the card and its glow share the exact same 28px radius so the glow reads as a shadow of the card, not a separate shape.

### 2.5 Elevation & Effects

| Effect | Value | Purpose |
|---|---|---|
| Card shadow | `shadow-2xl` | Lifts card off the page |
| Glow shadow | `0 40px 80px -16px rgba(163,230,53,0.8)` | Colored bloom under the card |
| Avatar ring | `ring-2 ring-white/10` | Subtle separation from surface |
| Card border | `border-0` | Borderless; depth comes from gradient + shadow |

The glow is a separate slab positioned behind the card (`z-0` vs card `z-10`), pinned to the lower portion (`top-[72%]`, `-bottom-10`) so color only escapes from the bottom edge.

### 2.6 Motion

| Motion | Spec | Trigger |
|---|---|---|
| Card entrance | opacity `0→1`, translateY `8px→0`, `duration 0.4s`, `ease-out` | On mount (Framer Motion) |
| Status dot | `animate-pulse` (infinite) | Always, signals "live" |
| Copy feedback | label swaps to "Copied" for `1500ms` | On copy click |

---

## 3. Layout Structure

```
┌─────────────────────────────────────────────┐
│  ● Available for work        🕐 3:42PM        │  ← status row (justify-between)
│                                               │
│  (avatar)  Berat Berkay                       │  ← identity block
│            Developer                          │
│                                               │
│  ┌── + Hire Me ──┐  ┌── ⧉ Copy Email ──┐     │  ← action row (1 col → 2 col @ sm)
│  └───────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────┘
        ▓▓▓▓▓▓ lime glow bleeds out ▓▓▓▓▓▓
              ⚡ Currently High on Creativity      ← tagline over glow
```

- **Status row:** `flex justify-between`, two clusters each `flex items-center gap-2`.
- **Identity block:** `flex flex-wrap items-center gap-5` — wraps gracefully on very narrow widths.
- **Action row:** `grid grid-cols-1 sm:grid-cols-2 gap-4` — stacks on mobile, side-by-side from the `sm` breakpoint. Buttons are left-aligned (`justify-start`) with icon-then-label.

---

## 4. States & Variants

Driven entirely by props — no internal theming beyond the copy interaction.

| Prop | Default | Controls |
|---|---|---|
| `name` | "Berat Berkay" | Heading |
| `role` | "Developer" | Subtitle |
| `email` | (sample) | Clipboard payload |
| `avatarSrc` | (remote URL) | Avatar image |
| `statusText` | "Available for work" | Status label |
| `statusColor` | `bg-lime-500` | Status dot color — the one supported recolor |
| `glowText` | "Currently High on Creativity" | Tagline over the glow |
| `className` | — | Outer wrapper overrides |

**Interaction states:**
- **Button / rest:** `bg-white/10` → **hover:** `bg-white/15`. Focus ring inherited from the shadcn button base (`ring-2 ring-ring ring-offset-2`).
- **Copy / idle:** "Copy Email" → **active:** "Copied" for 1.5s → reverts.
- **Status dot:** continuously pulsing to imply a live/available signal.

---

## 5. Behavior Notes & Recommendations

Observations from the source, with suggested hardening if this becomes a production component:

- **The clock is static.** `timeText` is computed once via `useMemo(…, [])`, so it renders the mount time and never ticks. If a live clock is intended, drive it with an interval (and account for `tabular-nums` already being in place to avoid width jitter).
- **Motion ignores user preference.** The entrance animation always runs. Recommend gating it behind `prefers-reduced-motion` (skip or shorten the transform) for accessibility.
- **"Hire Me" has no handler.** It's a visual placeholder — wire it to a mailto, contact modal, or link before shipping.
- **Copy has a silent failure path.** The `catch {}` swallows clipboard errors; consider a fallback (select-and-copy) or an error toast.
- **Contrast:** `neutral-400` role text on the dark gradient is low-emphasis by design; verify it still meets contrast targets for your minimum readable size, or bump to `neutral-300` if it's important info.
- **Wrapper width:** the outer wrapper uses `w-xl` while the card uses `max-w-3xl`. `w-xl` is not a standard utility — confirm it resolves in your Tailwind config, or replace with an explicit width/`max-w-*` to avoid an unstyled wrapper.

---

## 6. Reuse Checklist

To reproduce this look on another card:

- [ ] Dark **radial gradient** surface, borderless, `shadow-2xl`, `rounded-[28px]`.
- [ ] Exactly **one accent** (lime) used for the glow + a status signal.
- [ ] **Glow slab** behind the card, same radius, pinned to the bottom edge, colored drop shadow.
- [ ] Text hierarchy in **white → neutral-300 → neutral-400**.
- [ ] Translucent **`white/10` surfaces** for controls, `white/15` on hover.
- [ ] Consistent **16px** control radius, **48px** control height.
- [ ] Subtle **entrance fade+rise** and a **pulsing** live indicator.
- [ ] Icons at a uniform **16px** (lucide: `Clock`, `Plus`, `Copy`, `Zap`).
