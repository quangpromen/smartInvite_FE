# SmartInvite — MASTER DEVELOPMENT PLAN v2.0 (Event-first / Multi-card / Personalized Guests)

> **Đọc trước khi code:** `AGENTS.md` → `CODEX_PLAN.md` → `EVENT_CARD_GUEST_LOGIC.md` → `FE_SCREEN_SPEC.md` → `UI-FIRST-GUIDE.md`.  
> **Ngày cập nhật:** 2026-10-16. **Ưu tiên hiện tại:** chỉ sửa/hoàn thiện FRONTEND bằng mock data; chưa có lệnh triển khai BE, migration hoặc VPS.  
> **Mục tiêu 14 ngày:** chủ dự án tạo và gửi được thiệp tốt nghiệp thật, quản lý khách RSVP và check-in; kiến trúc tiếp tục phục vụ nhiều user/many events/many cards.

## 0. SOURCE OF TRUTH & CÁCH AI AGENT LÀM VIỆC

1. **Inspect repository first**, xác minh file thật trước khi sửa. Starter hiện có Next.js App Router, prototype `public/ui-demo.html`, `public/smartinvite-ui.css`, `public/smartinvite-ui.js`, `src/app`, Docker/PostgreSQL/Caddy. Prototype dùng `localStorage`, chưa có nghiệp vụ server thật.
2. `EVENT_CARD_GUEST_LOGIC.md` là hợp đồng business rules (**BR-01..BR-15**). `FE_SCREEN_SPEC.md` quy định đường dẫn, màn hình, nút, interactions và FE acceptance (**FE01..FE17**). Trong trường hợp doc cũ hoặc prototype mâu thuẫn, áp dụng **v2**.
3. Dùng lại UI, style, ảnh tham chiếu và Docker hiện có; **refactor, không rewrite repo**. Không nhét UI thành một script HTML toàn cục; chuyển sang React/Next.js + TypeScript modules.
4. Phát triển từng phase/commit nhỏ; mỗi phase chạy được và có checklist test. Không đổi framework, không thêm package nặng, không tự deploy production khi chưa được user yêu cầu.
5. FE mock lưu fixture không chứa PII thật; phân biệt thông báo demo với lưu backend thành công. Tách các domain repository/adapter để sau này chuyển sang PostgreSQL/API.
6. DB baseline `001_init.sql` là migration lịch sử, **không sửa** nếu đã áp dụng; v2 sau này thêm migration `002_event_multi_cards.sql` (hoặc số kế tiếp chưa dùng).
7. An toàn production: permission server-side, unique RSVP/check-in, token hash, QR HMAC tách biệt, upload an toàn, input validation, rate limit, backup/restore test. Không bao giờ xem UI guard là phân quyền thật.
8. Report task outcome bằng: files modified, domain rules, tests executed/results, screenshot (nếu chạy được), known gaps, manual steps. Không khẳng định đã chạy test chưa chạy.

## 1. VISION & USE CASE

**SmartInvite là nền tảng tạo thiệp và quản lý khách theo sự kiện.** User tạo Event trước; trong Event có nhiều CardDesign; mỗi Guest thuộc Event được assign CardDesign và có thể có lời mời cá nhân; Invitation/RSVP/Check-in lấy Event làm tập hợp. Admin xem hoạt động hệ thống. User đầu tiên là chủ lễ tốt nghiệp.

**Thứ tự logic:** `Host -> Event -> many CardDesigns -> event-scoped Guests -> assign one card per guest -> personalization -> issue invitation link -> RSVP -> QR Check-in -> Event Dashboard`.

Một người tạo nhiều Event. Một Event có nhiều thiệp (ví dụ Gia đình/Bạn bè/Thầy cô). Một design áp dụng cho nhiều Guest cùng Event. Guest được customize thêm phần riêng. Khách được chuyển design nhưng RSVP/check-in không mất. Thông tin giờ/địa điểm là canonical ở Event, không copy độc lập vào từng card. **Không còn mô hình 1 Event = 1 CardDesign.**

### 1.1 In scope cho MVP

- Host/Admin auth cơ bản (sau khi FE mock hoàn thành); Events CRUD, status, event workspace.
- Card gallery per event; tạo card theo event, template selection, save draft, publish, default card, preview, basic effects.
- Guest list theo event, card assignment, personalization (xưng hô, lời nhắn), optional group, guest-specific preview.
- Invitation token per guest, public card, RSVP YES/NO/PENDING, số người đi kèm, event-level stats.
- Event-scoped QR check-in, CSV export, host/admin dashboard. Responsive/mobile.
- Self-host Ubuntu Desktop 1 vCPU/2 GB RAM với Next.js standalone, PostgreSQL 17, Caddy, Docker Compose, backup. Build off VPS.

### 1.2 Not in v0.1

- Canva canvas kéo-thả tự do, AI auto-design, Zalo API auto-send, ticket payment, marketplace, multi-event/global contact merge, realtime socket, Redis/microservices, multi-session complex ticketing.
- Album kỷ niệm, contact book across events, bulk advanced import/automation, per-guest hero photo nếu thiếu thời gian: P1.
- Không tự phát triển BE trong **task yêu cầu UI-first hiện tại**.

### 1.3 Priorities

`Event management + multi-card association -> guest assignment/personalization -> public invitation UI + RSVP mock -> dashboard/check-in mock -> integrate BE -> deploy`.

Để kịp thiệp tốt nghiệp thật, có thể cắt bớt theme/animations trước; không cắt tính đúng đắn của Event/Guest, xác thực và dữ liệu thật khi lên production.

## 2. REPO BASELINE & GIỮ TÀI NGUYÊN HIỆN CÓ

| File hiện hữu | Vai trò | Lưu ý |
|---|---|---|
| `src/app/page.tsx` | Home hiện tại điều hướng demo | chuyển thành landing/dashboard route khi refactor |
| `public/ui-demo.html`, `public/smartinvite-ui.{css,js}` | nguyên mẫu UI-first | chỉ làm tham chiếu; không dùng là app production |
| `src/app/api/health/route.ts` + `src/lib/db.ts` | health DB + pg | giữ khi FE refactor, không gọi DB từ client |
| `db/migrations/001_init.sql` | schema baseline 9 bảng | có `card_designs.event_id UNIQUE`, **phải sửa bằng migration mới về sau** |
| `compose.yml`, `Caddyfile`, `Dockerfile`, `scripts/*` | hạ tầng VPS | không phá deploy/backup/restore |
| `docs/ui-reference/*.png` | hình UI demo dashboard/editor/invite | giữ design language khi mở rộng |

Công nghệ mục tiêu FE: Next.js App Router, TypeScript strict, React, Tailwind nếu được đưa vào build ổn định, CSS hiện tại có thể refactor dùng lại, responsive và a11y. Không cần chuyển sang framework mới.

## 3. DOMAIN MODEL — HỢP ĐỒNG NGHIỆP VỤ

**Bắt buộc đọc đầy đủ [EVENT_CARD_GUEST_LOGIC.md](EVENT_CARD_GUEST_LOGIC.md)**, gồm relationship ERD, BR-01..BR-15, sequence F01..F08, migration và test M01..M20.

### 3.1 Entities

- `users`: ADMIN/HOST, owns events.
- `events`: source of truth title/type/date/time/location/timezone/deadline/status.
- `card_designs`: N per event. `title`, `audience_label`, `template_key`, `is_default`, `status`, `config` published, `draft_config`, version/revision.
- `guests`: N per event. `card_design_id` optional until assigned, `personalization` per guest, `group_name`, `plus_ones_allowed`.
- `invitations`: 0..1 current invitation per guest (`guest_id UNIQUE`), raw bearer token only shown on issuance, DB stores SHA-256 hash.
- `rsvp_responses`: 0..1 per invitation, status YES/NO; PENDING = no row.
- `check_ins`: 0..1 per invitation; QR signed token distinct from RSVP link.
- `event_staff`: explicit scoped permission; `audit_logs`: accountability.

Do NOT add card_id to RSVP. Do NOT put guest list into `CardDesign.config`. Do NOT store event time/address as editable independent card fields. Avoid duplicate guest RSVP fields as separate data sources.

### 3.2 Create Card must confirm Event

From event workspace: `Tạo thiệp` -> event context badge + confirmation -> card in same event. From global CTA: **mandatory event selection modal** (or create event) -> `Xác nhận tạo thiệp cho [event]` -> card editor. Event association immutable; cross-event duplication creates new card, not moves original.

### 3.3 Personalization render precedence

`Event canonical details (authoritative)` + `published CardDesign config` + `Guest whitelist overrides` + `Guest.displayName`. Render same reusable card component for editor preview, owner preview-as-guest, and public guest view, with mode/context props; never expose guest PII in OG/SEO preview.

### 3.4 Status rules

| Entity | Rules |
|---|---|
| Event | `DRAFT -> PUBLISHED -> FINISHED`, cancellation; PUBLISH requires ≥1 published design |
| CardDesign | `DRAFT/PUBLISHED/ARCHIVED`, published config only changes on explicit publish changes |
| Guest assignment | `card_design_id` must belong to SAME event; no public invitation without PUBLISHED assigned card |
| Invitation | active/revoked; reassignment does not rotate link; explicit reissue rotates token and QR version |
| RSVP | PENDING absent row, YES/NO upsert; before deadline, no guest NO after check-in |
| CheckIn | unique invitation, checkin counts real attendees including approved plus-ones |

### 3.5 Stats

Event totals calculated by joins within one event: `guests`, `yes`, `no`, `pending`, `expectedPeople`, `checkedInInvitations`, `arrivedPeople`. For per-card filter, use guest's current `card_design_id`. Reassign guest changes per-card segmentation **without** changing event totals or creating new RSVP. See domain spec section H.

## 4. UI/UX — SCREEN CONTRACT

**Bắt buộc đọc toàn bộ [FE_SCREEN_SPEC.md](FE_SCREEN_SPEC.md).** Các route bắt buộc:

```text
/
/login
/dashboard
/dashboard/events
/dashboard/events/new
/dashboard/events/[eventId]
/dashboard/events/[eventId]/settings
/dashboard/events/[eventId]/cards
/dashboard/events/[eventId]/cards/new
/dashboard/events/[eventId]/cards/[cardId]/editor
/dashboard/events/[eventId]/cards/[cardId]/preview
/dashboard/events/[eventId]/guests
/dashboard/events/[eventId]/guests/[guestId]
/dashboard/events/[eventId]/rsvp
/dashboard/events/[eventId]/check-in
/dashboard/events/[eventId]/reports
/dashboard/cards/new    # starts mandatory event chooser
/invite/[token]
/admin
```

### UI behavior highlights

- Event-scoped navigation with breadcrumb and event switcher. When switching event, reset selected guest/card/filter to prevent cross-event display.
- Events Index shows status, card count, guest count and create.
- Event Overview shows total and per-card breakdown and CTA manage cards/guests.
- Card Gallery shows A/B/C in same event; set default, new, duplicate, edit, preview, publish, block archive when guest assignments exist.
- Editor uses **draft vs published config**, 3 areas (tools/preview/inspector), canonical event fields read-only.
- Guest List supports assign design, bulk action, filter group/card/RSVP, detail personalization, personalized preview.
- Public guest page with envelope animation, RSVP controls, personalized greeting and event canonical details.
- Dashboard cross-route mock state deterministic, not independent arrays per screen; every save/action updates the same fixture store. Loading/empty/error/confirm/toast/mobile states included.
- Theme: preserve ivory/navy/champagne graduation and clean SaaS dashboard design. A11y, reduced-motion, alt, form labels, mobile 360/390 width no overflow.

## 5. DATABASE & MIGRATION PLAN (DO NOT EXECUTE IN CURRENT FE TASK)

Existing `001_init.sql`: `users`, `events`, `card_designs`, `guests`, `invitations`, `rsvp_responses`, `event_staff`, `check_ins`, `audit_logs`. `card_designs.event_id` currently UNIQUE; this must be removed through numbered migration while preserving existing data.

**Future `002_event_multi_cards.sql`** specification:
- `card_designs`: remove unique event_id, add index event_id + composite UNIQUE(id,event_id), title/audience_label/status/is_default/draft_config/published_at/revision, unique partial index only one default/event.
- `guests`: add assigned `card_design_id` nullable with composite FK `(card_design_id,event_id)` to card_designs, `personalization` validated JSON, group and timestamps, optional guest status.
- `events`: timezone, rsvp_deadline, map_url, attendance_options_enabled, updated_at.
- `invitations`: checkin_version for QR rotation. Keep guest_id UNIQUE.
- `rsvp_responses`: attendance_mode, updated_at; preserve status YES/NO only.
- Backfill single-card legacy assignments on events with a single CardDesign, retain IDs/RSVP/check-in, avoid auto publish incomplete config.
- Add indexes event/card/guest; service-level authorization and FK ownership verification.

Follow detailed steps in domain spec section E. Migrations **must** be additive where feasible, backed up, tested in temporary DB before production; never edit applied 001 or run DB scripts now.

## 6. API CONTRACT PLAN (LATER PHASE)

Next.js Route Handlers + `pg` parameterized SQL, service-layer auth/validation, DB transaction for cross-entity writes. Response `{data,meta?}` or `{error:{code,message,fields?}}`.

| Domain | Endpoints (proposed) | Constraints |
|---|---|---|
| Events | `GET/POST /api/events`; `GET/PATCH /api/events/:e`; `POST /api/events/:e/publish` | owner only, publish rule |
| Cards | `GET/POST /api/events/:e/cards`; `GET/PATCH /api/events/:e/cards/:c`; `PUT .../:c/draft`; `POST .../:c/publish`; `POST .../:c/archive` | card.event_id = e; no archive while assigned |
| Guest | `GET/POST /api/events/:e/guests`; `PATCH /api/events/:e/guests/:g`; `POST .../guests/bulk-assign-card` | guest belongs e, card belongs e, overrides whitelist |
| Invite | `POST .../guests/:g/reissue-link`; `GET /api/invitations/:token`; `PUT /api/invitations/:token/rsvp` | token hash, deadline, rate limit, event/card publication |
| Stats | `GET /api/events/:e/stats?cardId=&group=` | DB aggregate scoped to event |
| Check-in | `GET/POST /api/events/:e/checkins` | owner/event staff, idempotent UNIQUE |
| Admin | `GET /api/admin/summary` | ADMIN only; no cross-host PII |
| Upload | `POST /api/events/:e/assets` | MIME magic-byte check, size, owner scope |

Important: published personalized invite endpoint returns event canonical + assigned published card + guest approved overrides only; no user list, DB token hash, phone/email, or unrelated event assets. Token routes no-store/noindex and no personalized OG metadata. Must not implement backend in current FE-first task.

## 7. ACCESS / SECURITY

- Roles: `ADMIN`, `HOST`; `EVENT_STAFF` scoped by event; guest bearer link without login.
- Host only event with owner_id=session.user.id; `cardId` and `guestId` must also belong to that event on server, even if URL forged.
- Auth server cookie HttpOnly+Secure+SameSite; password hash Argon2id; CSRF/origin; rate limit login/RSVP; bootstrap admin server-only. No public signup required for first graduation event.
- Raw guest token CSPRNG ≥32 bytes, only SHA-256 stored; one-time issue UI; `Cấp lại link` invalidates old link & QR version; never log token.
- QR signed with separate purpose/secret (HMAC) binding invitation id/version, verify constant-time; scan never alone proves human identity.
- Upload validation image JPEG/PNG/WebP size limit+signature, file isolation; export CSV formula escaping; render text escaped, avoid XSS and cross-event asset access.
- No external trackers on personal invite URL, no indexing, no cache reuse between guests; Event data timestamps UTC and display timezone e.g. Asia/Ho_Chi_Minh.
- Safe deletes: warn or archive when historical RSVP/check-in; migration/DB destructive commands require explicit user approval.

## 8. ARCHITECTURE TARGET (FE FIRST)

```text
src/
├── app/
│   ├── (public)/page.tsx
│   ├── (public)/login/page.tsx
│   ├── (public)/invite/[token]/page.tsx
│   ├── (protected)/dashboard/page.tsx
│   ├── (protected)/dashboard/events/[...]/page.tsx
│   └── (protected)/admin/page.tsx
├── components/
│   ├── layout/              # AppShell, EventNav, EventBreadcrumb
│   ├── events/              # event form, list, overview
│   ├── cards/               # gallery, editor, published/draft preview
│   ├── guests/              # table, card assignment, personalization
│   ├── invitation/          # envelope, personalized card, RSVP mock
│   ├── checkin/             # scanner/check-in UI
│   └── ui/                  # shared dialogs, inputs, toast
├── features/
│   ├── events/              # types, hooks, mock repository
│   ├── cards/
│   ├── guests/
│   ├── invitations/
│   └── rsvp/
├── mocks/
│   ├── fixtures.ts          # 2 events; 3 cards under event E1
│   └── mock-store.ts        # cross-route consistent state
├── services/               # repository interfaces, mock adapters
├── server/                 # LATER: auth, services, pg, validation
└── lib/
    └── format-date.ts
```

No copying event/card/guest arrays into individual components. React components see typed view-models from repository interfaces. Avoid using `any`, avoid imperative DOM manipulation. Use only static fixture names, not actual private contacts in demo.

## 9. PHASES & DELIVERY ORDER

### PHASE 0 — Audit source/UI/docs
- Read complete docs and scan repo; confirm whether React components already added by user since ZIP.
- Baseline `npm install`, `npm run typecheck`, `npm run build` if environment allows. Inspect demo screens, capture screenshots when possible. Record findings before editing.

### PHASE 1A — New domain mock + Event navigation (UI-first)
- Build typed fixtures: **2 events; Event E1 contains Card A/B/C; E2 contains Card D**; 8–12 guests under E1, varied RSVP/assignments.
- Implement event list/create/detail/edit/settings, route hierarchy, event switching, status/empty/error, event-wide totals.
- UI rule: no orphan cards; global `Tạo thiệp` triggers event choice and confirmation.
- Acceptance FE01–FE04, FE09/FE15.

### PHASE 1B — Multi-card gallery and editor (UI-first)
- Event-specific card gallery; choose template, name card, default, duplicate, draft vs published, preview desktop/mobile and preview as guest.
- Make event info read-only in editor. Block archive while guests assigned. Support multiple cards concurrently per event without cross-contamination.
- Acceptance FE05/FE08/FE13.

### PHASE 1C — Guests + personalization + RSVP dashboard (UI-first)
- Event guest management: add/edit/group, assign/reassign card, guest-specific override form, preview, link status label, mock RSVP and stats per event/card.
- Guest preview render composited layers and preserve RSVP/check-in on reassign. No fake working production invite token.
- Acceptance FE06/FE07/FE10–FE12/FE14/FE16.

### PHASE 1D — Polish and prepare API integration
- Check-in/admin UI, responsive, a11y, 360/390px, confirmations, toast, skeleton/error, tests and screenshots.
- Record FE screenshots and what is still DEMO. Freeze UI interfaces before API.
- Acceptance FE15–FE17.

### PHASE 2 — Backend + migration (AFTER explicit approval)
- Safe migration v2; Auth.js/server session + bootstrap; owner/event isolation; events/cards APIs; published vs draft config and default logic; assets storage.
- Integration tests ensure 1 event many cards and cross-event FK protection.

### PHASE 3 — Guest links + real RSVP (AFTER approval)
- Event guest CRUD, personalization DB, token generation/rotate, guest public payload, RSVP transaction/quota/deadline, correct stats; test double response/cross-event.

### PHASE 4 — Check-in + Admin + security (AFTER approval)
- QR HMAC/signing/version, event staff permissions, transactional idempotency, CSV, admin summaries, abuse controls, privacy.

### PHASE 5 — Production pilot on VPS (AFTER approval)
- Backup + restore test, docker image build off-VPS, tagged deploy, Caddy TLS, health, smoke test real two devices, export offline guest list. No self-deploy or destructive commands without permission.

**14-day indicative target:** UI day 1–4; backend/auth 5–7; RSVP 8–9; check-in/admin 10–11; QA/deploy 12–14. Can adjust with actual progress, but keep Event-card-guest invariants intact.

## 10. TESTS / ACCEPTANCE

**Event/card/guest invariants:** See M01–M20 in `EVENT_CARD_GUEST_LOGIC.md`. **Frontend tasks:** FE01–FE17 in `FE_SCREEN_SPEC.md`.

Additional must-pass production tests:
- Unauthorized HOST cannot read/change another host's event/card/guest (including guessing IDs).
- Invitation only usable if event and assigned card published; token revoked/rotated returns 404 safely.
- Same guest on Event A and Event B keeps independent assignment, RSVP and check-in.
- A guest's personalized message is NOT shared with another guest using the same CardDesign.
- `SAVE DRAFT` on published design never changes public page until `PUBLISH CHANGES`.
- Correct totals when moving guest card A→B, no duplicate RSVP or check-in.
- Concurrent RSVP last valid update deterministic; double scan insert one record.
- Event detail updates propagate to all assigned cards; timezone display correct.
- Mobile Safari/Chrome, reduce-motion, expired RSVP, 404, malicious text/file, export CSV sanitized, uploads persist after restart, backup/restore on test DB.

Commands, where available: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`. If commands don't exist, add appropriate scripts during implementation or explicitly report unavailable. Never write PASS without execution.

## 11. PERFORMANCE/OPS REQUIREMENTS

- VPS Ubuntu Desktop 1 vCPU 2 GB, only Next.js standalone + PostgreSQL 17 + Caddy (Docker Compose). Build images on stronger local machine/CI; no next build on VPS.
- Connection pool small (~5, adjust with monitoring), pagination and indexes, light CSS animation, optimized images, no heavy SSR request loops. No Redis/Kafka or separate graph stack for MVP.
- No public 5432/3000, Caddy reverse proxy 80/443 TLS, log rotation, swap cautiously, persistent volume, backups daily and off-host encrypted copy.
- Keep `Dockerfile`, `compose.yml`, `Caddyfile`, `scripts/backup.sh`, `scripts/restore.sh`, `scripts/deploy-server.sh` unless explicitly modifying deployment after tests.
- Never use `docker compose down -v` production. Schema downgrade is not automatic when rolling back image. Freeze feature deploy before graduation event, export offline CSV.

## 12. DONE DEFINITION — FIRST REAL GRADUATION EVENT

- [ ] Owner creates graduation Event E, and creates cards A/B (or more) linked to E.
- [ ] Owner selects default design and assigns B to a subset of guests, customizes one guest greeting.
- [ ] Owner previews exactly what that guest will see, and publishes event and card(s).
- [ ] Guest link opens correctly on phone (greeting + card design + E time/location), RSVP is saved server-side.
- [ ] Different guest using same card sees own personalization, not other's.
- [ ] Move a guest from A to B without losing invitation link, RSVP or check-in.
- [ ] Event dashboard aggregates all guests; card filter works; PENDING/YES/NO/plus ones/check-in correct.
- [ ] HTTPS, backup restore verified, guest data private, host other event not exposed, CSV offline export ready.
- [ ] Typecheck/build/tests relevant pass, measured on VPS and mobile device before inviting real users.

## 13. AGENT PROMPT START

Read `ANTIGRAVITY_FE_PROMPT.md`, paste to Antigravity for **FRONTEND ONLY**. Request phase 0 + 1A first, then 1B/1C/1D after reviewing UI. Do not ask a single agent run to build database, auth, QR scanner, VPS deploy and UI simultaneously.

## 14. TECHNICAL REFERENCES (for later server phases)

- Next.js App Router / async request APIs: https://nextjs.org/docs/app
- PostgreSQL 17 `INSERT ... ON CONFLICT`: https://www.postgresql.org/docs/17/sql-insert.html
- Docker Ubuntu Engine: https://docs.docker.com/engine/install/ubuntu/
- Caddy reverse proxy: https://caddyserver.com/docs/caddyfile/directives/reverse_proxy

**Non-negotiable:** Event is parent of many CardDesigns; one EventGuest assigned one CardDesign; private guest override; RSVP/check-in belong to invitation and event, not CardDesign. Never replace these invariants with one-card-per-event shortcuts.
