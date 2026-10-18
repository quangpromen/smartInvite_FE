# Prompt cho Antigravity — Cập nhật SmartInvite Frontend theo Event-first & Multi-card (v2)

> **Dùng thế nào:** Mở nguyên thư mục `smartinvite/` trong Antigravity, bảo đảm các file `AGENTS.md`, `CODEX_PLAN.md`, `EVENT_CARD_GUEST_LOGIC.md`, `FE_SCREEN_SPEC.md` đều nằm ở root. Sao chép **toàn bộ phần PROMPT COPY-PASTE** dưới đây đưa vào chat Antigravity. Trước hết cho agent làm Phase 0 + 1A; kiểm tra giao diện trước khi cho tiếp 1B/1C/1D.

---

## PROMPT COPY-PASTE

Bạn là Senior Frontend Engineer + Product Architect của SmartInvite. Tôi đang xây một nền tảng tạo thiệp mời và quản lý sự kiện, với người dùng đầu tiên là chính tôi tổ chức lễ tốt nghiệp. Tôi có source Next.js và một prototype HTML/CSS/JS đã chạy. **Tôi muốn bạn CHỈ CẬP NHẬT FRONTEND theo nghiệp vụ mới, không xây backend lúc này, không xóa code cũ hoặc triển khai VPS.**

### 1) BẮT BUỘC ĐỌC FILE TRƯỚC KHI CHỈNH CODE

Đọc theo thứ tự:
1. `AGENTS.md`
2. `CODEX_PLAN.md`
3. `EVENT_CARD_GUEST_LOGIC.md` — bắt buộc tuân thủ BR-01..BR-15, M01..M20
4. `FE_SCREEN_SPEC.md` — routes, screens, FE01..FE17
5. `UI-FIRST-GUIDE.md`, `README.md`, `package.json`, `src/`, `public/ui-demo.html`, `public/smartinvite-ui.css`, `public/smartinvite-ui.js`, ảnh `docs/ui-reference/` nếu có.

Trước khi thay đổi, hãy liệt kê màn hình/file hiện có, thiếu gì so với v2, kế hoạch file sẽ thêm/sửa. Nếu tôi đang dùng phiên bản code mới hơn bản demo, bảo tồn những màn hình và tính năng hiện hữu. Không tự đoán file có tồn tại.

### 2) BUSINESS LOGIC MỚI — KHÔNG ĐƯỢC HIỂU SAI

- **Event làm trung tâm:** User có nhiều Event; một Event có nhiều mẫu/phiên bản thiệp `CardDesign` (ví dụ Event "Lễ tốt nghiệp" có thiệp "Gia đình", "Bạn bè", "Thầy cô").
- **Tạo event trước; tạo thiệp phải thuộc event.** Khi bấm `Tạo thiệp` từ nơi chưa có context, phải hiển thị dialog/wizard **Chọn sự kiện** hoặc tạo sự kiện mới, rồi **confirm** `Tạo thiệp cho [Tên sự kiện]`. Khi bấm trong Event workspace, phải hiển thị event đang gắn. Không tạo thiệp mồ côi. Card chỉ gắn một event, không đổi event sau khi tạo (muốn chuyển thì duplicate tạo bản mới).
- **Quản lý thiệp theo event:** Event Details có tab `Thiệp mời` (gallery), nhiều card và status DRAFT/PUBLISHED/ARCHIVED, default card, create/edit/preview/duplicate/archive, card assigned-guest count.
- **Danh sách khách theo event:** Guest chỉ thuộc đúng Event. Khi tạo khách, host chọn một mẫu thiệp thuộc cùng Event (mặc định lấy card default). Trong Guest Management cần filter by card/group/RSVP/checkin và bulk assign card.
- **Cá nhân hóa mỗi khách:** Guest Detail cho sửa `salutation`, `greeting`, `personalMessage`, `accentColor` (và ảnh nếu có điều kiện). Render trang khách bằng Event canonical + card published config + guest overrides + guest name. Có `Xem như khách [Tên]`. Tùy chỉnh cho G không ảnh hưởng H dù cùng sử dụng Card A.
- **Event owns shared data:** giờ, địa điểm, bản đồ, deadline chỉnh tại Event; tất cả card trong event phản ánh thay đổi; không được sửa từng card làm lệch Event.
- **RSVP & Check-in thuộc Invitation/Guest, không thuộc Card.** Một guest có tối đa một invitation active trong một Event. Nếu chuyển guest từ Card A sang B, **giữ nguyên** link invitation, RSVP và check-in; chỉ thay mẫu hiển thị, tổng event không đổi. Không tạo RSVP trùng khi một event có nhiều thiệp.
- **Draft != Published:** trong editor của card published, `Lưu bản nháp` chưa thay trang guest; chỉ `Công bố thay đổi` mới đổi bản public. Archive design còn guest assigned phải chặn và đề xuất gán lại.
- **Dữ liệu mô phỏng thống nhất**: ít nhất 2 Event, Event E1 có 3 card A/B/C và nhiều khách, Event E2 có 1 card. Stats tổng/nhóm/thiệp cập nhật đúng khi đổi assignment hay mock RSVP.

### 3) FE ROUTES PHẢI CÓ

- `/dashboard`, `/dashboard/events`, `/dashboard/events/new`
- `/dashboard/events/[eventId]` và `/dashboard/events/[eventId]/settings`
- `/dashboard/events/[eventId]/cards`, `/dashboard/events/[eventId]/cards/new`
- `/dashboard/events/[eventId]/cards/[cardId]/editor`, `/dashboard/events/[eventId]/cards/[cardId]/preview`
- `/dashboard/events/[eventId]/guests`, `/dashboard/events/[eventId]/guests/[guestId]`
- `/dashboard/events/[eventId]/rsvp`, `/dashboard/events/[eventId]/check-in`, `/dashboard/events/[eventId]/reports`
- `/dashboard/cards/new`: bắt buộc chọn Event trước khi chuyển route
- `/invite/[token]`: guest-facing invitation mô phỏng, không yêu cầu guest login
- `/login`, `/admin`, `/`.

Nếu trong repo đã có route tương đương, tái sử dụng và điều chỉnh URL hợp lý, báo mọi khác biệt. Event workspace phải có breadcrumb/tabs và event switcher rõ ràng.

### 4) CHẤT LƯỢNG UI MONG MUỐN

Giữ phong cách SmartInvite hiện có: Dashboard SaaS sáng, hiện đại, rõ ràng; thiệp tốt nghiệp màu ivory/navy/champagne, phong bì mở và hiệu ứng nhẹ. Editor 3 vùng (tools / live preview / properties), dropdown device preview, unsaved changes, Save Draft/Publish; Event info read-only trong editor với nút sang Event Settings. Guest Detail đẹp, có selector card + cá nhân hóa + preview đúng từng khách. Hoàn thiện responsive 360/390/768/1280, keyboard access, labels, loading/empty/error/toast/confirmation, reduced-motion.

Không chỉ vẽ giao diện tĩnh. **Tất cả hành động UI phải hoạt động bằng mock data typed**: tạo/sửa event, tạo card trong event, set default, publish mock, assign card, personalize guest, preview as guest, RSVP mock, report/filter. Không có nút giả bấm không làm gì. Nếu action ngoài scope, disable và giải thích.

### 5) KIẾN TRÚC FRONTEND

Next.js App Router + React + TypeScript strict. Tách rõ `src/components`, `src/features`, `src/mocks`, `src/services` (repository interfaces) và domain types. Chuyển demo HTML/CSS/JS sang React components có route riêng; không nhồi thêm code vào `public/smartinvite-ui.js`, không dùng iframe làm app chính. Mock fixtures là dữ liệu giả, tuyệt đối không có PII thật. Nếu dùng localStorage để giữ demo qua refresh, dùng namespace v2 và versioned migration; show banner `Bản demo — chưa lưu trên server`.

**Chưa triển khai API, PostgreSQL, authentication server, migration SQL, QR thực hay Docker deployment trong yêu cầu này.** Không xóa/đổi `compose.yml`, `Caddyfile`, `Dockerfile`, `db/migrations/001_init.sql` hoặc scripts deploy. Mọi interface nên thiết kế để có thể thay adapter mock -> API sau này mà không viết lại component.

### 6) TRIỂN KHAI CÓ KIỂM SOÁT

Thực hiện lần lượt, theo từng phần có thể xem ngay:

- **Bước A (làm trước):** Audit repo, bổ sung domain types, mock store với 2 events/4 cards và navigation event-first. Implement Events list/create/details/settings, Card Gallery và modal xác nhận Event khi tạo Card. Chỉ làm các phần này trong lượt đầu; cung cấp hướng dẫn chạy/test và tóm tắt trước khi chuyển bước.
- **Bước B (sau khi kiểm tra A):** Card Editor hỗ trợ nhiều card, config draft/published, default, preview live và guest-specific preview; reusing design.
- **Bước C:** Event Guests + assign card + personalization từng guest, mock RSVP/checkin giữ nguyên khi reassign; stats by Event/card/group.
- **Bước D:** Invitation guest mobile flow, dashboard/admin polish, responsive/a11y, error states, tests và screenshots.

Với mỗi bước, chạy `npm run typecheck`, `npm run build` và test/lint có sẵn (nếu có); không claim PASS khi chưa chạy. Sau khi hoàn tất gửi tôi: `files changed`, screens/routes mới, các logic BR đã đáp ứng, cách chạy, test results, bất kỳ conflict/assumption nào, screenshots nếu có thể. Không tự deploy VPS.

**Bây giờ chỉ bắt đầu BƯỚC A.** Hãy làm xong code theo mô tả, không chỉ giải thích lý thuyết, và báo kết quả để tôi xem giao diện.

---

## PROMPT TIẾP THEO — SAU KHI XEM XONG BƯỚC A

> Đã kiểm tra Bước A. Hãy đọc lại `EVENT_CARD_GUEST_LOGIC.md` và `FE_SCREEN_SPEC.md`, sau đó triển khai Bước B: event-specific multi-card editor, preview, draft vs published, default card, read-only event fields, preview-as-guest. Giữ mọi route Bước A đang hoạt động; chạy typecheck/build và báo thay đổi kèm screenshot.

## PROMPT TIẾP THEO — SAU KHI XEM XONG BƯỚC B

> Hãy triển khai Bước C theo spec: event-scoped guest CRUD UI, assign/reassign card, per-guest personalization, guest preview, mock RSVP state, event/card/group dashboard stats. Kiểm thử RSVP/check-in không bị reset khi đổi Card A→B, khách khác dùng A không thấy override của G, không assign cross-event. Không backend. Báo tests/screenshots.

## PROMPT HOÀN THIỆN FE — SAU KHI XEM XONG BƯỚC C

> Hãy triển khai Bước D: guest invitation mobile envelope + personalized card + RSVP mock, check-in/admin/report UI, empty/loading/error states, responsive 360/390/768/1280, a11y. Chạy FE01–FE17. Không backend, không deploy. Cập nhật README phần screen/navigation và xác nhận rõ demo chưa lưu server.
