# SmartInvite — Changelog kế hoạch 1.0 -> 2.0

**2026-10-16.** Chỉ cập nhật tài liệu dành cho AI; không sửa/triển khai source chạy production.

| Trước (v1) | Sau (v2) |
|---|---|
| One event = one card (`card_designs.event_id UNIQUE`) | One event has many CardDesigns; migrate constraint after FE |
| Chỉ route `/events/:eventId/editor` | Card gallery + `/events/:eventId/cards/:cardId/editor` |
| Card có thể khởi tạo theo event ngầm định | Tạo card bắt buộc chọn và **confirm Event** |
| Một design cho mọi khách | Mỗi Guest được gán design thuộc Event, có personalization riêng |
| Event fields nằm chung editor | Event canonical data read-only trên editor; sửa trong Event Settings |
| Save draft và publish dễ lẫn | Draft config khác published config, explicit Publish Changes |
| Dashboard tập trung tổng event | Dashboard tổng event + filter per-card/group, không đếm khách trùng |
| Thiếu hành vi khi đổi mẫu cho khách | Reassign Card giữ Invitation token, RSVP & Check-in |
| Không rõ archive card | Block archive nếu còn guests được assign; prompt reassign |
| Một Event mẫu trong demo | Typed fixtures: 2 events, E1 ít nhất 3 card và nhiều guests |
| Plan có FE chung | `FE_SCREEN_SPEC.md` chi tiết từng route/hành động/test |
| Prompts chủ yếu cho Codex | `ANTIGRAVITY_FE_PROMPT.md` dùng được trực tiếp, làm A/B/C/D |

### Compatibility & Migration

- Giữ `001_init.sql` nguyên vẹn để bảo toàn những nơi đã từng chạy; không sửa schema chỉ để phục vụ FE mock.
- Sau khi frontend được duyệt, triển khai `002_event_multi_cards.sql` (hoặc số tiếp theo) để bỏ unique `card_designs.event_id`, thêm `(guests.card_design_id,event_id)` FK cùng event, personalization và draft/published configuration.
- Giữ nguyên Docker Compose/Caddy/backup và root source code để Antigravity phát triển tiếp thay vì bắt đầu lại.
