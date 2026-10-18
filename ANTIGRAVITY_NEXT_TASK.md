# SmartInvite — Antigravity Next Task: Recover Phase 1A Frontend Foundation

## Vai trò và phạm vi

Bạn là Senior Frontend Engineer của SmartInvite. Hãy tiếp tục từ source hiện tại bằng một **recovery sprint cho Phase 1A**. Source hiện tại vẫn là Next.js starter chuyển hướng sang prototype HTML/CSS/JavaScript cũ; Phase 1A chưa được triển khai thực tế.

Chỉ làm frontend bằng mock data. Không kết nối backend/database, không viết migration, không triển khai auth thật, không tạo QR thật và không deploy VPS.

Không tuyên bố một chức năng hoàn thành nếu route/component/interaction tương ứng chưa tồn tại và chưa được kiểm tra.

## 1. Mục tiêu cụ thể của lượt này

Hoàn thành nền tảng Event-first và phần chức năng Phase 1A có thể kiểm thử độc lập:

1. Chuyển ứng dụng chính từ redirect vào prototype tĩnh sang Next.js App Router + React + TypeScript.
2. Tạo domain types và normalized mock store thống nhất cho Event → CardDesign → EventGuest → Invitation → RSVP → CheckIn.
3. Tạo ít nhất 2 events; event thứ nhất có 3 cards A/B/C, event thứ hai có 1 card; dữ liệu guest/RSVP/check-in đa dạng và deterministic.
4. Triển khai AppShell, event navigation, event switcher, breadcrumb và các route Phase 1A.
5. Triển khai Events list/create/detail/settings và Card Gallery/create flow.
6. Bắt buộc chọn và xác nhận Event khi tạo card từ global CTA; không cho card mồ côi hoặc đổi event sau khi tạo.
7. Đảm bảo toàn bộ màn hình dùng chung một mock repository/store; mutation ở một route phải phản ánh ở route khác.
8. Sửa các vi phạm Critical/High nêu dưới đây trước khi mở rộng sang Phase 1B/1C.

Không triển khai đầy đủ card editor, guest personalization, public RSVP hoặc check-in trong lượt này. Với route thuộc phase sau, có thể tạo shell rõ ràng và nút disabled/“Sắp có”, nhưng không được mô phỏng sai nghiệp vụ.

## 2. File bắt buộc đọc trước khi sửa

Đọc đầy đủ theo đúng thứ tự:

1. `AGENTS.md`
2. `CODEX_PLAN.md`
3. `EVENT_CARD_GUEST_LOGIC.md`
4. `FE_SCREEN_SPEC.md`
5. `ANTIGRAVITY_FE_PROMPT.md`
6. `UI-FIRST-GUIDE.md`
7. `README.md`
8. `package.json`
9. Toàn bộ `src/`
10. `public/ui-demo.html`, `public/smartinvite-ui.css`, `public/smartinvite-ui.js`
11. `docs/ui-reference/*.png`

Trước khi code, báo ngắn gọn:

- source hiện có;
- route/component/type/mock nào đang thiếu;
- file dự kiến thêm/sửa;
- phạm vi chính xác của Phase 1A trong lượt này.

## 3. Hiện trạng đã review — không được hiểu nhầm là đã hoàn thành

### Module hiện có và hoạt động ở mức prototype cũ

- Next.js starter, root layout, global CSS starter.
- `/api/health` và lazy PostgreSQL pool; giữ nguyên, không gọi từ UI mock.
- Static prototype `public/ui-demo.html` + `public/smartinvite-ui.{css,js}`.
- Prototype có giao diện dashboard, một card editor, guest table, RSVP/check-in demo và admin mock trong cùng một script.
- Prototype có style ivory/navy/gold, một số breakpoint responsive và focus-visible cơ bản.

### Module chưa được triển khai theo v2

- Không có React feature components ngoài root layout/page.
- Không có App Router routes trong `FE_SCREEN_SPEC.md`.
- Không có TypeScript domain types.
- Không có normalized mock repository hoặc adapter interfaces.
- Không có Event list/create/detail/settings thực tế.
- Không có multi-card gallery/create/default/status.
- Không có event chooser + explicit confirmation cho global create-card.
- Không có event-scoped guest assignment/personalization.
- Không có draft/published card separation.
- Không có invitation lifecycle theo token mock.
- Không có stats derived từ joins.
- Không có loading/error/not-found/reduced-motion coverage đầy đủ.

## 4. Lỗi Critical/High bắt buộc sửa trong nền tảng mới

### Critical C1 — Ứng dụng chính vẫn redirect vào legacy prototype

`src/app/page.tsx` đang redirect tới `/ui-demo.html?view=dashboard`. Hãy thay bằng landing page React theo route contract. Prototype tĩnh được giữ làm tài liệu tham chiếu, không còn là app chính và không được nhúng bằng iframe.

### Critical C2 — Data model hiện tại sai domain contract

Không được tiếp tục shape `state = { design, guests }`, guest chứa trực tiếp `status` và `checked`.

Tạo normalized state tối thiểu:

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

RSVP và CheckIn phải join qua Invitation. `PENDING` được derive từ việc không có RSVP row, không lưu thành một nguồn RSVP thứ hai trên Guest.

### Critical C3 — Không có event-scoped routes và membership guards

Mọi route có `[eventId]` phải lookup event từ mock repository. Card lookup phải đồng thời kiểm tra `card.eventId === eventId`; guest lookup sau này cũng vậy. ID sai/cross-event phải render not-found/error an toàn, không fallback sang entity đầu tiên.

### Critical C4 — Không có luồng tạo card bắt buộc chọn Event

`/dashboard/cards/new` phải là blocking chooser. Không được tự chọn “event gần nhất”. Sau khi chọn phải hiện CTA chính xác `Xác nhận tạo thiệp cho [Tên event]`. Chỉ sau xác nhận mới chuyển tới `/dashboard/events/[eventId]/cards/new` hoặc tạo card theo flow đã mô tả.

### High H1 — Event canonical data không được nằm trong editable CardDesign config

Date/time/timezone/location/map/RSVP deadline thuộc Event. Card preview đọc từ Event. Không tạo các input editable độc lập cho chúng trong CardDesign.

### High H2 — Card draft và published config phải tách type ngay từ đầu

Mỗi `CardDesign` có `draftConfig`, `publishedConfig | null`, `status`, `revision`. Trong Phase 1A chỉ cần fixture/repository đúng và gallery/status đúng. Không nối legacy editor vào cùng object rồi gọi đó là draft.

### High H3 — Cross-route state phải thống nhất

Không khai báo arrays riêng trong từng page/component. Tất cả page đọc/ghi qua cùng store/repository. Tạo event/card ở một route phải xuất hiện ngay ở index, overview và gallery sau điều hướng.

### High H4 — Không phát sinh invitation URL bằng guest ID

Không tái sử dụng `?view=invite&guest=g1` trong app mới. Phase 1A chưa cần cấp link; action phải disabled với lý do nếu prerequisites/phase chưa sẵn sàng. Không giả vờ “copy existing link”.

### High H5 — Không mutate RSVP/check-in khi đổi entity không liên quan

Repository API phải thiết kế sao cho đổi `assignedCardDesignId` sau này chỉ cập nhật Guest. Tuyệt đối không reset invitation, RSVP hoặc check-in. RSVP update không được xóa check-in.

## 5. Logic nghiệp vụ bắt buộc tuân thủ

- User 1:N Event.
- Event 1:N CardDesign và Event 1:N EventGuest.
- Guest thuộc đúng một event và có tối đa một assigned CardDesign cùng event.
- CardDesign luôn có `eventId`; event association immutable.
- Một event tối đa một default card trong mock store.
- Card states: `DRAFT | PUBLISHED | ARCHIVED`.
- Event states: `DRAFT | PUBLISHED | FINISHED | CANCELLED`.
- Event chỉ publish được khi metadata hợp lệ và có ít nhất một published card.
- Không archive card còn guest active được assign; nếu là default phải xử lý replacement hoặc xác nhận không còn default.
- Guest personalization chỉ là whitelist override trên Guest, không nằm trong CardDesign.
- Invitation 0..1 per Guest; RSVP 0..1 và CheckIn 0..1 per Invitation.
- Event totals và per-card totals phải derive từ cùng normalized state.
- Chuyển assignment A→B không đổi event totals, invitation, RSVP hoặc check-in.
- Chỉ dùng fake guest data; không lưu PII thật.
- Tất cả mutation phải ghi rõ `Bản demo — chưa lưu trên server`.

## 6. Cấu trúc file/component dự kiến

Có thể điều chỉnh tên hợp lý, nhưng phải giữ separation tương đương:

```text
src/
  app/
    page.tsx
    login/page.tsx
    dashboard/page.tsx
    dashboard/layout.tsx
    dashboard/events/page.tsx
    dashboard/events/new/page.tsx
    dashboard/events/[eventId]/layout.tsx
    dashboard/events/[eventId]/page.tsx
    dashboard/events/[eventId]/settings/page.tsx
    dashboard/events/[eventId]/cards/page.tsx
    dashboard/events/[eventId]/cards/new/page.tsx
    dashboard/cards/new/page.tsx
    admin/page.tsx
  components/
    layout/AppShell.tsx
    layout/EventBreadcrumb.tsx
    layout/EventSwitcher.tsx
    events/EventCard.tsx
    events/EventForm.tsx
    events/EventOverviewKpis.tsx
    cards/CardGallery.tsx
    cards/CardTile.tsx
    cards/EventSelectDialog.tsx
    ui/ConfirmationDialog.tsx
    ui/EmptyState.tsx
    ui/LoadingState.tsx
    ui/Toast.tsx
  features/
    events/types.ts
    cards/types.ts
    guests/types.ts
    invitations/types.ts
    stats/selectors.ts
  mocks/
    fixtures.ts
    mock-store.tsx
  services/
    repositories.ts
    mock-repositories.ts
  lib/
    format-date.ts
```

Nếu dùng Context/Reducer, store provider đặt ở layout đủ cao để state tồn tại khi chuyển route client-side. Repository interfaces không được import React. Components không import fixture arrays trực tiếp.

## 7. Typed fixtures bắt buộc

Tạo dữ liệu deterministic:

- Ít nhất 2 users giả nếu cần minh họa ownership, nhưng UI host hiện tại chỉ dùng một mock owner.
- Event E1: lễ tốt nghiệp, đủ canonical metadata, có Card A/B/C.
- Event E2: event khác, có Card D.
- A/B/C phải có title, audience label, template key, status khác nhau hợp lý; ít nhất một published default card.
- E1 có 8–12 guests, gồm assigned/unassigned, nhiều group.
- Có active/not-created/revoked invitation examples.
- Có YES/NO và PENDING do thiếu RSVP row.
- Có ít nhất một valid check-in gắn với invitation của guest YES.
- Có ít nhất một guest personalization fixture để chuẩn bị Phase 1C.
- Không có card của E2 xuất hiện trong selector/gallery của E1.

Nếu persist demo state, dùng version key `smartinvite.ui.v2`. Không tự đọc shape v1 như v2. Có thể bỏ qua v1 an toàn hoặc viết migration/clear path rõ ràng; không làm hỏng app nếu JSON invalid.

## 8. Routes và chức năng phải hoàn thành trong lượt này

### `/`

- Landing React, không redirect static prototype.
- CTA `Tạo sự kiện` → `/dashboard/events/new`.
- CTA `Tạo thiệp` → `/dashboard/cards/new`.

### `/login`

- Login mock rõ nhãn demo; không gọi API/auth thật.

### `/dashboard`

- Tổng quan nhiều event từ repository.
- CTA tạo event và tạo card.
- Không hardcode “01 event/01 card”.

### `/dashboard/events`

- Search và filter status.
- Event card hiện title/date/status/card count/guest count/RSVP summary derived.
- Empty state có CTA.

### `/dashboard/events/new`

- Form: title, type, description, startsAt, endsAt, timezone, venue/location, map/address, RSVP deadline, attendance options.
- Validation tên 3–150 ký tự và thời gian hợp lệ.
- Save tạo Event không ép tạo card, rồi redirect tới overview.

### `/dashboard/events/[eventId]`

- Header, canonical metadata, KPIs và card breakdown.
- Breadcrumb + event switcher + workspace tabs.
- CTA cards/guests/reports/check-in/settings; phase sau có thể disabled rõ ràng nếu route chưa hoàn chỉnh.
- Event không tồn tại → not-found/error state.

### `/dashboard/events/[eventId]/settings`

- Edit canonical Event fields.
- Nếu event đã có guests/responses và thay time/location, hiển thị confirmation ảnh hưởng tất cả cards.
- Cancel không mutate; confirm mới save.

### `/dashboard/events/[eventId]/cards`

- Chỉ hiển thị cards thuộc event hiện tại.
- Card tile có title, audience, status, default marker, assigned guest count.
- Set default hoạt động và đảm bảo chỉ một default/event.
- Publish mock hoạt động với config hợp lệ.
- Archive bị block nếu còn guest assigned và giải thích lý do.
- Duplicate trong cùng event tạo ID mới; duplicate sang event khác phải chọn + confirm và tạo card mới, không đổi original.

### `/dashboard/events/[eventId]/cards/new`

- Hiện banner cố định `Thiệp này thuộc sự kiện: [Event]`.
- Template picker + card name + audience label.
- Có bước xác nhận event trước khi create.
- Event ID không editable.
- Tạo card xong xuất hiện trong gallery và overview.

### `/dashboard/cards/new`

- Blocking event chooser.
- Không thể submit khi chưa chọn.
- CTA xác nhận phải chứa tên event.
- Có link tạo event mới.

### Route phase sau

Tạo route shell/not-implemented state cho các URL còn lại chỉ khi cần giữ navigation ổn định. Không tạo hành vi sai để “đủ route”. Ưu tiên hoàn chỉnh routes Phase 1A ở trên.

## 9. UI/UX và responsive

- Tái sử dụng design language từ prototype: dashboard sáng, navy sidebar, ivory/champagne/gold invitation accents.
- Không copy toàn bộ legacy JS sang component hoặc dùng `dangerouslySetInnerHTML` để dựng app.
- Responsive phải kiểm tra ở 360, 390, 768 và 1280 px; không horizontal overflow ngoài table wrapper có chủ đích.
- Sidebar mobile có nút mở/đóng, backdrop, Escape và focus hợp lý.
- Form có label thật, error text liên kết bằng `aria-describedby`, focus-visible rõ.
- Dialog dùng semantic dialog, focus vào control đầu tiên, Escape đóng, trả focus về trigger.
- Có `prefers-reduced-motion` để tắt/giảm transitions và animations.
- Toast dùng wording `Đã cập nhật bản demo` hoặc tương đương, không nói đã lưu server.
- Có loading, empty, error và not-found states tái sử dụng.
- Mọi button phải hoạt động, disabled kèm lý do, hoặc được đánh dấu rõ “Sắp có”. Không để dead button.

## 10. Acceptance Criteria

### AC-A — Kiến trúc

- App chính chạy bằng Next.js React/TypeScript, không redirect tới static prototype.
- Có `src/components`, `src/features`, `src/mocks`, `src/services` hoặc separation tương đương.
- Không thêm feature logic mới vào `public/smartinvite-ui.js`.
- Không dùng `any` cho domain/state/repository public interfaces.

### AC-B — Typed domain/store

- Types biểu diễn đúng Event/Card/Guest/Invitation/RSVP/CheckIn.
- Fixtures có 2 events, E1 có A/B/C và E2 có D.
- RSVP/check-in không nằm trực tiếp trên Guest hoặc Card.
- Tất cả routes đọc cùng store; refresh behavior được mô tả rõ.

### AC-C — Event flows (FE01, FE09)

- Tạo Event mới → event xuất hiện ở index → overview có cards empty + CTA.
- Sửa location/time của Event có data liên quan → confirmation → mọi card preview/selectors sau này đọc metadata mới từ Event.
- Invalid event ID không fallback sang event khác.

### AC-D — Card flows (FE02–FE04)

- Tạo Card từ Event → association hiển thị và immutable.
- Global create-card không thể tiếp tục nếu chưa chọn event và phải xác nhận tên event.
- A/B/C hiện trong gallery E1; D chỉ hiện ở E2.
- Cross-event card URL hoặc lookup bị từ chối/not-found.

### AC-E — Card lifecycle foundation

- Một event chỉ có một default card.
- Archive assigned card bị block với assigned count.
- Duplicate sang event khác tạo entity mới với target `eventId`, original giữ nguyên.
- Card type có draft/published config tách biệt dù editor đầy đủ thuộc Phase 1B.

### AC-F — Quality (FE15–FE17 phần liên quan)

- UI usable tại 360/390/768/1280.
- Keyboard focus và dialog cơ bản hoạt động.
- Reduced-motion rule tồn tại.
- `npm run typecheck` pass.
- `npm run build` được chạy; nếu môi trường chặn filesystem/junction thì báo nguyên văn blocker, không claim pass.
- README có hướng dẫn xem app React mới và ghi rõ demo chưa lưu server.

## 11. Test cases bắt buộc thực hiện

1. M01/FE04: E1 có A/B/C; E2 không nhìn thấy A/B/C trong gallery hoặc selector.
2. M02/FE03: mở global create-card; nút submit disabled trước khi chọn; confirm chứa đúng tên event.
3. FE01: tạo một event không card; index và overview cập nhật từ cùng store.
4. FE02: tạo card trong event; `eventId` đúng và không có control đổi association.
5. Cross-event URL: dùng `eventId=E2` với `cardId` của E1 → not-found/error, không render card.
6. Set default B → A không còn default; E2 default không bị ảnh hưởng.
7. Archive card có guest assigned → không mutate status; dialog nêu số guest và hướng xử lý.
8. Duplicate A sang E2 → card mới có ID mới/eventId E2; A ở E1 không đổi.
9. Sửa event location rồi kiểm tra overview/card preview data dùng location mới.
10. Reload với localStorage v2 hợp lệ → state phục hồi; JSON hỏng hoặc v1 → fallback an toàn.
11. Chuyển event bằng EventSwitcher → route/event context đúng, filter/selection cục bộ được reset.
12. Keyboard: mở/đóng modal bằng keyboard/Escape, focus không bị mất.
13. Viewport 360/390/768/1280 không có overflow bất thường.
14. Chạy typecheck và build; ghi lại kết quả thật.

Nếu thêm unit tests, ưu tiên selectors/repository invariants: same-event assignment, single default, archive guard, derived stats và immutable event association. Không thêm test framework nặng nếu chưa cần; có thể dùng test runner nhẹ phù hợp với project.

## 12. Thứ tự thực hiện bắt buộc

Chia thành các task nhỏ và kiểm tra sau từng task:

1. **Task A1 — Domain/types/fixtures:** types, repository interfaces, normalized fixture và selectors thuần.
2. **Task A2 — Store/provider:** shared mock store, safe persistence v2, mutation guards.
3. **Task A3 — App shell/routes:** landing, dashboard shell, event workspace, breadcrumb/switcher, not-found.
4. **Task A4 — Event CRUD mock:** index/create/overview/settings + confirmations.
5. **Task A5 — Card gallery/create:** event-scoped gallery, global chooser, create/default/publish/duplicate/archive guards.
6. **Task A6 — QA:** responsive, keyboard, reduced motion, empty/loading/error, typecheck/build, README/report.

Sau mỗi task, giữ app chạy được. Không bắt đầu editor/guest detail nếu A1–A5 chưa đạt acceptance.

## 13. Tuyệt đối không thay đổi

- Không kết nối PostgreSQL hoặc gọi `/api/health` từ client UI.
- Không thêm API route nghiệp vụ, auth server, token thật, QR thật hoặc upload server.
- Không sửa `db/migrations/001_init.sql` và không tạo migration mới.
- Không sửa/xóa `compose.yml`, `Caddyfile`, `Dockerfile`, `scripts/backup.sh`, `scripts/restore.sh`, `scripts/deploy-server.sh` trừ khi user yêu cầu riêng.
- Không deploy VPS hoặc chạy lệnh Docker production.
- Không xóa prototype/assets/reference đang có; chỉ ngừng dùng prototype làm app chính.
- Không rewrite framework hoặc thêm dependency UI/state nặng khi React Context/Reducer và CSS hiện tại đủ dùng.
- Không lưu guest PII thật trong fixture/localStorage.
- Không dùng card ID trong RSVP/CheckIn và không duplicate RSVP state lên Guest.
- Không cho CardDesign chỉnh canonical event date/time/location/deadline.
- Không fake `Copy existing link` từ guest ID hoặc token hash.
- Không tuyên bố Phase 1B/1C/1D hoàn thành trong lượt Phase 1A này.

## 14. Báo cáo bắt buộc khi hoàn thành

Trả về:

1. Files added/modified.
2. Routes/screens đã chạy thực tế.
3. Business rules BR nào đã đáp ứng và evidence ngắn.
4. Acceptance/test cases đã chạy, kết quả từng case.
5. Lệnh typecheck/build/test đã chạy và output tổng quát.
6. Screenshot ở 390 px và 1280 px nếu môi trường cho phép.
7. Known gaps còn lại cho Phase 1B/1C/1D.
8. Mọi assumption/conflict; không che giấu blocker môi trường.

Kết thúc sau Phase 1A và chờ review trước khi triển khai Card Editor Phase 1B.
