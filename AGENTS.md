# AGENTS.md — SmartInvite coding agent instructions (v2.0)

**First read, in order:** `CODEX_PLAN.md`, `EVENT_CARD_GUEST_LOGIC.md`, `FE_SCREEN_SPEC.md`, then inspect repo. These are the v2 source of truth for both Codex and Antigravity. `ANTIGRAVITY_FE_PROMPT.md` explains the currently requested UI task.

## Absolute business rules

- **Event-first**: User owns many events. One Event has many CardDesigns. A Guest is event-scoped and is assigned **one** CardDesign of **that same event**. Optional approved personalization overrides are **per guest**. A Guest has at most one active invitation record; RSVP and Check-in belong to invitation, NOT to card.
- Creating a card from outside the event must show **choose event + explicit confirmation**. Never make orphan card. Event association is immutable; copy-to-event creates new CardDesign.
- Event date/time/location/RSVP deadline are canonical and shared by all designs. Card editor cannot independently override these fields. Guest personalization cannot override canonical Event info or QR/RSVP security.
- Multi-card state + one default card/event; CardDesign has DRAFT/PUBLISHED/ARCHIVED and draft vs published config. Never expose saved draft to guest before Publish Changes. Block archive if guests still assigned.
- Moving guest Card A→B keeps invitation link, RSVP and check-in unchanged. Event totals unchanged; per-card breakdown reclassifies. Reissue link explicitly rotates RSVP token + QR version.
- Preserve existing DB baseline; `001_init.sql` includes the OLD unique constraint (`card_designs.event_id UNIQUE`). After UI mock phases and user approval, create numbered migration to drop **that** uniqueness and add composite FK `(guests.card_design_id,guests.event_id)` to `(card_designs.id,card_designs.event_id)`; do not mutate already applied migrations.

## Implementation mode NOW

- **UI-first ONLY**: audit existing Next.js/static demo; refactor rather than recreate; use typed mock repository with at least two events, 3 cards under one event, various guests and RSVP states. Fully working frontend interactions (event CRUD mock, card create/edit/publish mock, event confirmation modal, guest assignment/customization/preview, stats filtering), clearly labeled DEMO. Do not connect PostgreSQL/auth/backend, and do not deploy VPS until explicitly requested.
- Preserve ivory/navy/gold graduation design and SaaS layout; responsive 360/390/768/1280 px; accessibility, `prefers-reduced-motion`, empty/loading/error states.
- In protected UI use eventId routing; in public guest UI don't show host/sidebar. Mock role guards are not security. Never store real guest PII in localStorage.
- Separate `src/features`, `src/components`, `src/services`/mocks. Don't append new feature logic to `public/smartinvite-ui.js`. Avoid heavy dependencies and unnecessary framework migration.

## Senior UI/UX & Architecture Standards (ui-ux-pro-max skills)

On EVERY coding task, apply the appropriate installed skill from `.agents/skills/` to ensure senior-grade UI/UX and clean architecture:
- **`ui-ux-pro-max`**: Design intelligence & search tool. Query rules/tokens via `node .agents/skills/ui-ux-pro-max/scripts/search.mjs "<query>" --domain ux` or `--stack nextjs` or `--design-system`.
- **`design-system`**: Token architecture (primitive → semantic → component), CSS variables, typography and spacing scales.
- **`ui-styling`**: Accessible component patterns, mobile-first responsive layouts, focus trapping, dark/light contrast.
- **`banner-design`**: Digital invitation card visual hierarchy, envelopes, QR passes, and badges.
- **`brand`**: Elegant visual identity, formal typography combinations (Playfair/Serif + Inter/Sans), color mood balance.

### Pre-Delivery Verification Matrix:
1. **WCAG 2.1 AA Accessibility**: Minimum 4.5:1 text contrast, accessible focus rings, `aria-label` on icon triggers, `<label>` on all inputs.
2. **Touch Targets**: Minimum 44×44px tappable area, >= 8px touch spacing, `cursor: pointer` on clickables.
3. **Responsive Breakpoints**: Verified at 360px, 390px, 768px, and 1280px with zero horizontal scroll.
4. **Resilient UX States**: Explicit loading skeleton/spinner, empty state with CTA, error fallback, and success state.
5. **Architectural Purity**: Clean boundaries (`src/features`, `src/components`, `src/services`), Server Components by default, Client Components pushed down to leaf nodes, zero `any` in TypeScript.

## Engineering and operation

- No secrets in repo/logs; raw invitation token not recoverable from SHA-256 hash. Do not fake `Copy existing link` after hashing; explicit one-time issuance and reissue/rotation.
- Server-phase (later): verify owner+event+card+guest membership on server; unique RSVP, idempotent check-in, separate QR/HMAC purpose, rate limit, input validation, safe asset upload and CSV export.
- VPS later: Ubuntu Desktop 1 vCPU/2 GB, Next.js standalone, Docker Compose/Caddy/PostgreSQL 17; build image off VPS; do not destroy volumes or auto-deploy production.
- Work per phase specified in `CODEX_PLAN.md`, currently phase 0 + 1A then next UI phases. Run typecheck/build/tests where available; state exactly what was run. Report files changed, business rules covered, tests, gaps, how to view UI.
- When unsure, implement the safest event-scoped mock behavior, note decision, never silently rewrite domain rules.

