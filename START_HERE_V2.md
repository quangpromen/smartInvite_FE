# SmartInvite v2 — Bắt đầu tại đây (dành cho chủ dự án & AI coding agent)

**Bạn đang nâng cấp từ demo một event/một card thành sản phẩm Event-first:** một event có nhiều card; mỗi guest trong event được gán một card và có nội dung cá nhân riêng. Mục tiêu gần là hoàn thiện Frontend bằng mock data để xem giao diện và tương tác thử; không thay backend lúc này.

## Bộ file cập nhật

1. `AGENTS.md` — chỉ dẫn ngắn bắt buộc cho Antigravity/Codex.
2. `CODEX_PLAN.md` — kế hoạch master, phase, routes, database/API sau này, QA, VPS constraints.
3. `EVENT_CARD_GUEST_LOGIC.md` — **nghiệp vụ source of truth** (ERD, quan hệ, invariant, event/card/guest/status, API/DB contract).
4. `FE_SCREEN_SPEC.md` — tất cả màn FE và tương tác, route, mock data, test.
5. `ANTIGRAVITY_FE_PROMPT.md` — prompt sẵn copy, chia Bước A/B/C/D.
6. `UI-FIRST-GUIDE.md` — chỉ dẫn UI demo gốc và cách nâng cấp.
7. `CHANGELOG_PLAN_V2.md` — thay đổi so với plan cũ.

## Trong Antigravity

- Mở thư mục `smartinvite` làm Workspace, không mở lẻ từng file.
- Paste **PROMPT COPY-PASTE** trong `ANTIGRAVITY_FE_PROMPT.md`.
- Chỉ làm **Bước A** trước. Sau đó vào `npm run dev` xem `/dashboard/events`, tạo Event, vào card gallery và chọn event khi tạo card global.
- Khi UI đạt ý, lần lượt chạy Bước B, C, D theo prompts ở cuối file. Khi FE hoàn thiện, mới yêu cầu phase backend ở `CODEX_PLAN.md`.

## Những gì ZIP này KHÔNG tuyên bố

- Source HTML/CSS/JS bên trong vẫn là prototype cũ **chưa tự động được chuyển thành FE mới**; tài liệu này để AI coding agent chỉnh code cho đúng.
- Chưa chạy PostgreSQL migrations mới; database baseline vẫn ràng buộc `card_designs.event_id UNIQUE`. AI phải tạo migration additive sau khi FE xong và có sự cho phép.
- Link, RSVP, QR trong UI demo chỉ là mô phỏng; không dùng để nhận RSVP của bạn bè thật.
- Bộ hạ tầng production Docker Compose/Caddy/PostgreSQL được giữ nguyên từ gói cũ.
