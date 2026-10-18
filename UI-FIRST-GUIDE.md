# SmartInvite — UI-first Prototype (10/2026)

> **V2 update (16/10/2026):** File này mô tả **prototype cũ** chỉ để xem giao diện; nó CHƯA hỗ trợ Event-first/multiple cards và personalization riêng từng guest. Để Antigravity sửa UI đúng mô hình mới, đọc `START_HERE_V2.md`, `EVENT_CARD_GUEST_LOGIC.md`, `FE_SCREEN_SPEC.md` và dùng prompt `ANTIGRAVITY_FE_PROMPT.md`. Không dùng prototype cũ để mời khách thật.

## Mục tiêu

Cho người tổ chức nhìn thấy UI SmartInvite và tương tác thử với thiệp tốt nghiệp **trước khi viết backend**. Bộ mã này được bổ sung vào SmartInvite VPS starter đã có Docker Compose, Caddy và PostgreSQL. UI hiện tại là prototype frontend độc lập (HTML/CSS/JavaScript), **không phải Next.js component hoàn thiện**. Có thể dùng trực tiếp qua `/ui-demo.html` trên Next.js hoặc mở file offline.

## Chạy ngay — không phải cài phần mềm

1. Mở thư mục `ui-preview`.
2. Nhấp đúp `ui-demo.html` để mở bằng Chrome/Edge.
3. Chọn các màn Dashboard, Thiết kế thiệp, Khách mời, Check-in và Admin từ menu.
4. Nhấn **Xem thiệp** để thử mở phong bì và RSVP.
5. Từ danh sách khách, bấm **Link** để sao chép lời mời mẫu có guest ID trong URL.

## Chạy bằng Next.js (phục vụ static files)

Yêu cầu Node.js tương thích với Next.js 16.

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. Root path sẽ chuyển sang `/ui-demo.html?view=dashboard`.

Các tệp giao diện:

- `public/ui-demo.html`: HTML shell, thẻ tải CSS/JS.
- `public/smartinvite-ui.css`: design system và giao diện responsive.
- `public/smartinvite-ui.js`: tương tác demo + điều hướng + `localStorage`.
- `src/app/page.tsx`: chuyển trang chủ tới UI preview.

Trang kiểm tra health/database từ starter vẫn giữ nguyên. Nếu chỉ xem giao diện thì không cần chạy PostgreSQL. Nếu muốn dùng health trong môi trường production, phải khởi động database đúng như README hạ tầng.

## Trạng thái các màn

| Màn | Hoạt động trong demo | Chưa có |
| --- | --- | --- |
| Dashboard | Cards, tỷ lệ RSVP, bảng khách từ demo data | Auth, số liệu server thực |
| Editor | Chỉnh nội dung trực tiếp, ba theme, xem mobile/desktop, lưu trình duyệt | Upload ảnh, lưu database, nhiều sự kiện, undo |
| Invitation | Phong bì tương tác, mở thiệp, RSVP giả lập | RSVP thật và bảo vệ link |
| Guests | Thêm/tìm/lọc, xuất CSV, copy link demo | Sync nhiều trình duyệt, nhập Excel, quản lý quyền |
| Check-in | Nút đánh dấu đến, chặn bấm trùng | QR xác thực, API idempotency, thiết bị đồng thời |
| Admin | Demo tổng quan và hoạt động | User thật, phân quyền, thống kê server |

**CẢNH BÁO:** Không gửi UI demo để thu nhận phản hồi thật; dữ liệu chỉ được lưu trong localStorage của từng trình duyệt, không tự đồng bộ và có thể bị xóa. Các liên kết guest và check-in hiện chỉ là mô phỏng.

## Lộ trình tích hợp thành sản phẩm

1. Chuyển shell CSS/HTML thành Next.js components: `AppShell`, `Sidebar`, `InvitationCanvas`, `GuestTable`.
2. Trước khi nối backend, chuẩn hóa mock thành **Event -> many CardDesigns -> event Guests -> Guest card assignments + personalization**; sau đó mới đưa state từ mock sang PostgreSQL và API có xác thực.
3. Tạo bảng / luồng `users`, `events`, `templates`, `guests`, `invitations`, `rsvps`, `checkins`.
4. Thêm owner-check, event permission, rate limiting, token mời ngẫu nhiên và backend check-in idempotent.
5. Thêm upload hình ảnh, bảo vệ dữ liệu khách mời, backup/restore, test trên mobile.

## Lưu ý khi đưa lên VPS

Vì `src/app/page.tsx` chuyển hướng sang static prototype, VPS sẽ chỉ hiển thị **demo UI**, không phải ứng dụng production có khả năng lưu RSVP thật. Khi đã tích hợp backend phải thay thế redirect bằng trang Dashboard Server/Client Components và không dùng `localStorage` làm nguồn dữ liệu.
