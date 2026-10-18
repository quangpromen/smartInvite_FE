# SmartInvite — UI Screen Specification (Event-first, multi-card, guest-personalized)

**Version 2.0, UI-first.** Đây là tài liệu màn hình và tương tác cho Antigravity/Codex. Đọc `EVENT_CARD_GUEST_LOGIC.md` để biết nghiệp vụ đúng. Giao diện tiếng Việt, responsive 360/390/768/1280, dùng mock typed trước khi API thật.

## 1. Navigation và IA

**Sidebar host:** Tổng quan | Sự kiện | Mẫu thiệp (thư viện chung) | Tài khoản.  
**Event workspace (breadcrumb cố định):** Dashboard > Sự kiện > `[Tên event]` với tabs `Tổng quan | Thiệp mời | Khách mời | RSVP | Check-in | Báo cáo | Cài đặt sự kiện`.

Khách xem `/invite/[token]` không có sidebar host/admin. Admin sử dụng shell riêng.

| Route | User | Màn hình & hành động bắt buộc |
|---|---|---|
| `/` | Public | Landing + demo template, CTA `Tạo sự kiện` / `Tạo thiệp`; CTA card phải đi qua chọn event |
| `/login` | Host/Admin | UI login mock với nhãn demo |
| `/dashboard` | Host | Tổng các event, recent activity, create-event CTA |
| `/dashboard/events` | Host | Event list: tìm kiếm, status, card count, guest count; empty state |
| `/dashboard/events/new` | Host | Form tạo event: title, type, date/time, timezone, location, description, RSVP deadline |
| `/dashboard/events/[eventId]` | Owner | Event overview: header, metadata, KPIs, card breakdown, RSVP, actions |
| `/dashboard/events/[eventId]/settings` | Owner | Sửa event data và status, cảnh báo tác động nhiều thiệp/khách |
| `/dashboard/events/[eventId]/cards` | Owner | Card gallery chỉ của event, add/new/default/status/preview/duplicate/archive |
| `/dashboard/events/[eventId]/cards/new` | Owner | Template picker -> đặt tên card -> confirm thuộc event -> editor |
| `/dashboard/events/[eventId]/cards/[cardId]/editor` | Owner | Editor 3 panel: tools, preview, properties; Save Draft / Publish/Update |
| `/dashboard/events/[eventId]/cards/[cardId]/preview` | Owner | Desktop/mobile and optional `View as guest` chooser, no public token |
| `/dashboard/events/[eventId]/guests` | Owner | Guest table: add/edit, assign design, filter/group, bulk assign, RSVP/check-in status |
| `/dashboard/events/[eventId]/guests/[guestId]` | Owner | Guest detail: name, group, assigned card, personalization, preview, RSVP, link status |
| `/dashboard/events/[eventId]/rsvp` | Owner | Phản hồi theo event, grouped by card/group, pending/yes/no, expected persons |
| `/dashboard/events/[eventId]/check-in` | Owner/Staff | Camera QR UI, search guest, scan result, already checked in state |
| `/dashboard/events/[eventId]/reports` | Owner | Statistics and export mock; filter by card/group/time |
| `/dashboard/cards/new` | Owner | **Mandatory choose Event modal** then redirect to event-specific `cards/new` |
| `/invite/[token]` | Guest | Envelope -> personalized card -> RSVP -> result/QR mock, no login |
| `/admin` | Admin | System users/events/cards counts; no unrelated host guest PII |

**Routes are contracts, not automatic permission.** When FE uses mock, add route guards as UX only; real auth/authorization is backend task.

## 2. Specific screens, components & acceptance

### S01 — Events index
- `CreateEventButton`, `EventCard`, `EventStatusBadge`, `EventSearch`, `EventFilter`.
- Event card shows title, date, status, `N mẫu thiệp`, `N khách`, RSVP counts; click card to enter event workspace.
- Empty state: `Bạn chưa có sự kiện nào` + `Tạo sự kiện đầu tiên`.
- Delete/cancel must show confirmation; don't imply real deletion in demo.

### S02 — Create/Edit Event form
- Fields: event name (3..150), event type (Graduation / Birthday / Wedding / Workshop / Other), description, startsAt/endsAt, timezone, venue, address/map, RSVP deadline, attendance options.
- Save creates event **without** forcing creation of a card; redirect event overview with CTA `Tạo thiệp đầu tiên`.
- After event has guests/responses, changing time/location must show `Thay đổi này sẽ cập nhật tất cả thiệp trong sự kiện. Bạn muốn tiếp tục?`.
- Do not put event date/time/location in editable CardDesign fields; editor may choose visibility/layout only.

### S03 — Event overview
- Breadcrumb and event switcher; cards with `Số mẫu thiệp`, `Khách mời`, `Đồng ý`, `Không tham gia`, `Chưa phản hồi`, `Đã check-in`.
- Cards breakdown: name, status, assigned guests and YES response count; selecting card filters event stats (and can navigate to card).
- Actions: `Tạo thiệp`, `Thêm khách`, `Xem báo cáo`, `Check-in`, `Sửa sự kiện`.
- Show 3 card designs A/B/C inside same Event E.

### S04 — Event card gallery
- Separate items for each design, with preview thumbnail, title, target audience, status, default marker, assigned guest count.
- Actions: `Chỉnh sửa`, `Xem trước`, `Đặt mặc định`, `Nhân bản`, `Công bố`, `Lưu trữ`.
- `Lưu trữ` if assigned guests >0: block, explain count, offer `Chuyển khách sang thiệp khác`; if default, choose replacement default before archival.
- `Nhân bản sang event khác` requires choosing target event and confirming; does not move original card.
- If only one published design: show `Mặc định` prominently.

### S05 — Global Create Card event confirmation
- If activated outside event: a **blocking** modal/wizard with `Chọn sự kiện`, event list, `Tạo sự kiện mới`, and CTA `Xác nhận tạo thiệp cho [event title]`.
- No submit until event selected; never infer last event without visible confirmation.
- If activated from event workspace: show a fixed banner `Thiệp này thuộc sự kiện: [Event]` + confirm at creation; do not allow changing `event_id` later.

### S06 — Card editor
- Header: breadcrumb Event > Thiệp > Card name; name editable; badge `Nháp`/`Đã xuất bản`; audience label; `Lưu bản nháp`, `Xem trước`, `Xuất bản/Công bố thay đổi`.
- Left sidebar tabs: Mẫu/Trang trí, Nội dung, Ảnh, Màu/Font, Hiệu ứng, RSVP layout. Center is live card preview; right inspector for selected block/properties.
- Editor fields are **design only**: headline, public invitation copy, general signature, background/hero photo, typography, transitions, themed sections, envelope effects. Event time/address displayed in preview **read-only canonical**, with link `Sửa thông tin sự kiện`.
- `Save draft` updates local mock draft only; for PUBLISHED card **guest preview remains at last published config**. `Công bố thay đổi` swaps to published config after valid confirmation.
- Preview device toggle mobile/desktop. Host optional pick guest -> preview overrides; switching guests must not accidentally save override into global card.
- Unsaved changes confirm navigation. Validate text length/colors/assets. Respect reduced-motion.

### S07 — Guest management
- Always scoped event E. Table columns: name, group, assigned card, RSVP, plus ones, check-in, link status, actions.
- Search/filter by group/card/RSVP/check-in; bulk select and `Gán mẫu thiệp` (dropdown only published cards within E when link active).
- `Thêm khách`: fullName, group, contact optional, plusOnesAllowed, assignedCardDesignId (default preselect), optional personalization.
- Click guest -> detail sidepanel/page. Unassigned guest shows clear `Chưa gán thiệp` and disabled issue-link with reason.
- Editable status of RSVP via host administrative flow is **not the same** as guest response; label and audit later.
- No global contact book or merging across events in MVP.

### S08 — Guest detail / personalized card
- Header with name, event, assigned-card selector, status chips.
- Tabs/panels `Thông tin`, `Cá nhân hóa thiệp`, `Xác nhận`, `Link mời`.
- Personalization fields: xưng hô (Anh/Chị/Bạn/...), greeting, personal message, accent color; optional photo if feature flag.
- Two previews: `Thiệp gốc của mẫu` vs `Thiệp gửi cho [guest]` (clear difference).
- `Lưu cá nhân hóa` changes guest override only, not CardDesign; confirmation if public link already active.
- `Cấp link` uses mock one-time URL only in UI-first (explicit `Demo`); `Cấp lại link` warns old link/QR revoked. `Sao chép` possible only if raw link is in current one-time UI state, not fake regeneration from token hash.
- Changing assignment preserves RSVP/check-in and active link, with confirmation `Khách sẽ thấy mẫu thiệp mới khi mở lại link`.

### S09 — Invitation viewer guest
- Load event, assigned *published* card and approved guest overrides; first envelope, then personalized card.
- Display guest name/greeting, card design copy, **canonical** event date/location, countdown/map, RSVP form.
- States: loading, valid-PENDING, YES, NO, deadline-closed, invalid/revoked, event-cancelled, assigned-card-unpublished, error.
- PENDING no RSVP record; YES shows QR placeholder only in mock; NO shows thank you; guest can change until deadline, subject to check-in.
- Preview host mode and public mode differentiated; no editor shortcuts on public mode.

### S10 — RSVP and event reports
- Event totals from guest/invitation joins. Toggle whole-event vs per-card and per-group counts. `responseRate` denominator documented, avoid counting each design as separate event.
- Drill down YES/NO/PENDING and export CSV with distinct count units: guests, expected people, arrived people.
- Charts show data fixture, not random numbers generated every render.

### S11 — Check-in and admin
- Check-in UI selects event from event context, reads QR and manual search; displays guest name/event/checkin state after authorized scan. Mock scan cannot claim actual check-in persisted.
- Admin shows counts users/events/card designs with filters; no PII list of guests from other hosts.

## 3. UI state design and data-layer isolation

Recommended domain mock state:

```ts
type MockDb = {
  users: User[];
  events: Event[];
  cardDesigns: CardDesign[];
  guests: EventGuest[];
  invitations: Invitation[];
  rsvpResponses: RsvpResponse[];
  checkIns: CheckIn[];
};
```

- Source test fixtures: **2 events**, at least **3 cards under first event**, **1 card under second event**, **8-12 guests under first**, examples of assigned/unassigned guests, personalized greeting, YES/NO/PENDING/checked-in. Events and card configs are distinct and deterministic.
- Implement repository interface `EventRepository`, `CardRepository`, `GuestRepository`, `InvitationRepository` with in-memory/mock adapters (or mock store). React components never import demo arrays directly into unrelated screens. Later replace adapter with API while preserving interfaces.
- If storing demo state in localStorage for refresh, version key to `smartinvite.ui.v2` and **use fake names only**; guard parse/migrate old `smartinvite.ui.v1` if reusing demo state. Show demo banner.
- Use `eventId` from route for every event-scoped query; if event missing show not found; switching event resets guest/card selections and filters.
- Editing guest personalization must not mutate card's base config. Editing card draft must not mutate published config.
- All interactive controls need behavior/disabled reason: no dead buttons.
- Canceled modal does not mutate state, save does; toast differentiates `Đã cập nhật bản demo` and eventual `Đã lưu` when real API exists.

## 4. Reusable frontend components

`AppShell`, `EventBreadcrumb`, `EventSwitcher`, `EventOverviewKpis`, `EventForm`, `CardGallery`, `CardTile`, `EventSelectDialog`, `CardEditor`, `CardDraftToolbar`, `CardPreview`, `GuestTable`, `GuestFormDialog`, `CardAssignmentSelector`, `GuestPersonalizationForm`, `PersonalizedCardPreview`, `RsvpStatusBadge`, `RsvpForm`, `QrPass`, `CheckInPanel`, `StatsFilters`, `ConfirmationDialog`, `EmptyState`, `LoadingState`, `Toast`.

Design target: preserve existing graduation ivory/navy/gold and SaaS dashboard styling. Do NOT transplant prototype via iframe; port into React components. No new heavy drag/drop canvas dependency for MVP.

## 5. UI-first detailed acceptance tests

- FE01 Create Event E; event appears on index; enter E then cards empty with CTA.
- FE02 Create Card A from E; event association visible & immutable.
- FE03 Global Create Card -> cannot proceed without choosing E, then explicit confirm.
- FE04 Create Card B/C in E; all show in E card gallery, none in other event.
- FE05 Set default Card B; new guest G initially gets B.
- FE06 Assign Card A to G; guest row and preview update, card B unchanged.
- FE07 Personalize message for G; guest H on same Card A still sees base content.
- FE08 Change Card A draft text; published public mock still shows older version until Publish.
- FE09 Update Event location; all cards show new location without editing each design.
- FE10 RSVP for G YES; event KPIs update, no duplicated answer after re-submit.
- FE11 Reassign G to Card B; RSVP and check-in unchanged, card filter changes.
- FE12 Attempt to assign Card belonging to Event E2 -> blocked.
- FE13 Try archiving Card with guests -> blocked, explains reassignment.
- FE14 Guest without card cannot issue usable invite URL.
- FE15 Mobile 360/390px, desktop 1280px, form validation, error/empty/loading states, keyboard nav.
- FE16 Each button works in mock or explicitly disabled with reason; no unimplemented API calls.
- FE17 Build/typecheck success (or document exact tool/environment blocker), README startup notes.

## 6. Sequencing for Antigravity: don't code everything in one uncontrolled pass

1. Inspect repository (`AGENTS.md`, `CODEX_PLAN.md`, `EVENT_CARD_GUEST_LOGIC.md`, this file, UI demo and active Next.js components). Report delta.
2. Implement typed domain fixture/repositories and event-aware AppShell/navigation/routes. **No BE work**.
3. Implement event index/create/detail/settings and EventCardGallery/create with required confirmation.
4. Implement editor with base published/draft configs, guest-specific preview.
5. Implement guest management + per guest assignment/personalization, RSVP/check-in mock integrated across screens.
6. QA mobile/desktop, update notes/screenshots, tests and code summary.
