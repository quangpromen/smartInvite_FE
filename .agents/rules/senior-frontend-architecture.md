# Senior Frontend Architecture Standards

This rule specifies the architectural principles, component structure, and code quality expectations for the SmartInvite project. Every code modification must adhere to these standards to maintain a robust, maintainable, and senior-grade codebase.

---

## 1. Architectural Boundaries & Feature Slicing

The codebase is organized in clear architectural layers. Never blur the boundaries between layers:

```
src/
├── app/               # Presentation routes & layouts (Next.js App Router)
│   ├── dashboard/     # Host / organizer protected views (eventId scoped)
│   ├── invite/        # Public guest invitation views (isolated, no host sidebar)
│   └── globals.css    # Global design tokens and foundational utility styles
├── components/        # Reusable presentation components
│   ├── ui/            # Atomic primitives (dialogs, toasts, empty/loading states)
│   ├── layout/        # AppShell, headers, event switchers, breadcrumbs
│   ├── cards/         # Card editors, card preview canvases, design pickers
│   ├── guests/        # Guest tables, assignment selectors, personalization modals
│   └── invitation/    # Envelope reveals, digital passes, RSVP forms, QR renders
├── features/          # Domain layer (business logic & contracts)
│   ├── events/        # Event entity types, validators, lifecycle states
│   ├── cards/         # CardDesign entity types (draft vs published config)
│   ├── guests/        # Guest entity, assignment models, personalization specs
│   ├── invitations/   # Public invitation resolver, token rotation, RSVP status
│   └── stats/         # Analytical selectors, per-card/event aggregations
├── services/          # Repository contracts & data-access abstractions
│   ├── repositories.ts       # Typed interfaces for Events, Cards, Guests, Invitations
│   └── mock-repositories.ts  # In-memory typed mock implementation for UI demo
├── mocks/             # Fixtures and deterministic seed data
│   ├── fixtures.ts           # Realistic multi-event, multi-card, multi-guest mocks
│   └── mock-store.tsx        # React Context provider wrapping repositories
└── lib/               # Shared cross-cutting utilities (formatting, db helpers)
```

### Invariant Rules:
1. **No Domain Logic in UI Components**: Calculations (e.g. attendance percentage, card assignment reclassification, RSVP deadline verification) belong in `src/features/<feature>/selectors.ts` or services, not inside JSX render bodies.
2. **Event-First Scoping**: Everything in the host dashboard is strictly scoped to an `eventId`. Cards, guests, and statistics can never exist or be queried as unattached orphans.
3. **Canonical Event Truth vs Guest Personalization**:
   - Event date, time, location, and RSVP deadline are canonical and shared across all card designs.
   - Individual guest personalization overrides (salutation, table, dietary notes) cannot alter canonical event details or QR verification integrity.

---

## 2. Next.js 16 & React 19 Senior Engineering Patterns

1. **Server Components by Default**:
   - Keep page routes and static layouts as Server Components.
   - Only add `'use client'` when state (`useState`), effects, browser event listeners (`onClick`, `onChange`), or browser APIs are required.
2. **Push Client Components Down to Leaves**:
   - Do not mark an entire route `page.tsx` as `'use client'` just because a modal or filter button is interactive.
   - Extract the interactive widget into a small leaf component (e.g., `<GuestFilters />`, `<ConfirmationDialog />`) and pass server-rendered props or children into it.
3. **Robust State Representation (Four-State Model)**:
   Every async or data-dependent view must explicitly handle four distinct states:
   - **Loading**: Render `<LoadingState />` or a content skeleton (never blank screen).
   - **Empty**: Render `<EmptyState />` with helpful illustration and a direct Call To Action button when no records exist.
   - **Error**: Render clear error feedback with a retry action (never unhandled rejection).
   - **Success/Idle**: Render complete, polished data tables, cards, or metrics.
4. **Hydration Integrity**:
   - Avoid client/server timestamp discrepancies. Use `format-date.ts` with consistent locale settings or client-side mounted guards for local time formatting.

---

## 3. Strict Type Safety & Clean Code Invariants

1. **Zero `any` Policy**: Every variable, function parameter, and API return must have an explicit, well-defined TypeScript type.
2. **Exhaustive Type Narrowing**: When handling union types (e.g. `CardStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'` or `RsvpStatus = 'ATTENDING' | 'DECLINED' | 'TENTATIVE' | 'PENDING'`), handle all variants explicitly and use `default: const _exhaustive: never = status;` to catch unhandled cases at compile time.
3. **Immutable State Updates**: Never mutate store objects or arrays in place (`arr.push()` or `obj.field = val`). Always return fresh objects/arrays (`[...arr, item]`, `{ ...obj, field: val }`).
4. **Deterministic Mock Service Testing**: All state alterations must be verifiable via `npm run test` (running typed test suites in `scripts/test-phase*.ts`).

---

## 4. Security & Privacy Guardrails

1. **No Real PII in LocalStorage**: Never persist confidential guest contact numbers or emails into insecure browser storage.
2. **Token Rotation & Hashing**:
   - Raw invitation tokens must not be exposed after hashing.
   - Link re-issuance must explicitly rotate the token and invalidate previous QR passes.
