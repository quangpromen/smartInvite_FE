import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 10% 10%, #fffaf5, transparent 50%), linear-gradient(135deg, #f7f3ec, #edf0f5)', color: 'var(--ink)' }}>
      {/* Header */}
      <header style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="mark" aria-hidden="true" style={{ width: '38px', height: '38px', fontSize: '18px' }}>
            S
          </div>
          <div>
            <span style={{ font: '700 20px Georgia, serif', color: 'var(--navy)' }}>SmartInvite</span>
            <span style={{ display: 'block', fontSize: '9px', letterSpacing: '1.5px', color: 'var(--gold)', fontWeight: 800 }}>
              EVENT-FIRST PLATFORM
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/dashboard" className="btn sm">
            Vào Dashboard
          </Link>
          <Link href="/login" className="btn sm dark">
            Đăng nhập Demo
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: '1040px', margin: '40px auto 80px', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 700, marginBottom: '24px' }}>
          <span>🎓</span>
          <span>Nền tảng thiệp mời & quản lý khách theo sự kiện</span>
        </div>

        <h1 style={{ font: '400 clamp(36px, 6vw, 64px) / 1.15 Georgia, serif', letterSpacing: '-1px', color: 'var(--navy)', margin: '0 0 20px' }}>
          Gửi trọn yêu thương <br />
          <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>đến từng vị khách quý</em>
        </h1>

        <p style={{ fontSize: 'clamp(14px, 2vw, 17px)', color: '#64748b', maxWidth: '640px', margin: '0 auto 36px', lineHeight: 1.8 }}>
          Mô hình Event-first hiện đại: Một sự kiện có nhiều phiên bản thiệp cho từng nhóm khách (Gia đình, Bạn bè, Thầy cô).
          Quản lý RSVP, thiệp cá nhân hóa và check-in QR tập trung.
        </p>

        {/* Primary CTAs */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
          <Link href="/dashboard/events/new" className="btn dark" style={{ padding: '12px 24px', fontSize: '14px' }}>
            <span>📅</span>
            <span>Tạo sự kiện mới</span>
          </Link>
          <Link href="/dashboard/cards/new" className="btn gold" style={{ padding: '12px 24px', fontSize: '14px' }}>
            <span>✉️</span>
            <span>Tạo thiệp mời</span>
          </Link>
          <Link href="/dashboard" className="btn" style={{ padding: '12px 20px', fontSize: '14px' }}>
            <span>📊</span>
            <span>Xem Dashboard Demo</span>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', textAlign: 'left', marginTop: '40px' }}>
          <div className="panel" style={{ padding: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>🎯</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px', color: 'var(--navy)' }}>
              1. Event làm trung tâm
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Thông tin ngày, giờ, địa điểm và hạn phản hồi được quản lý thống nhất tại Event. Mọi mẫu thiệp đều dùng chung dữ liệu chuẩn này.
            </p>
          </div>

          <div className="panel" style={{ padding: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>🎨</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px', color: 'var(--navy)' }}>
              2. Nhiều thiệp cho một sự kiện
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Tự do thiết kế nhiều mẫu thiệp (Thiệp Gia đình, Bạn bè, Khách VIP) mà không phải tách nhỏ sự kiện hoặc nhân đôi danh sách khách.
            </p>
          </div>

          <div className="panel" style={{ padding: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>✍️</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px', color: 'var(--navy)' }}>
              3. Cá nhân hóa từng khách mời
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Lời nhắn, lời chúc và cách xưng hô được gắn riêng cho từng vị khách. Đổi mẫu thiệp không làm mất link, RSVP hay trạng thái check-in.
            </p>
          </div>
        </div>

        {/* Demo Notice */}
        <div style={{ marginTop: '50px', padding: '16px 20px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
          <strong style={{ color: 'var(--navy)' }}>Lưu ý:</strong> Đây là bản thử nghiệm giao diện Frontend (Phase 1A). Dữ liệu được lưu trong trình duyệt thông qua Mock Repository và LocalStorage.
        </div>
      </main>
    </div>
  );
}
