import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '56px', marginBottom: '16px' }} aria-hidden="true">
        🔍
      </div>
      <h1 style={{ font: '400 32px Georgia, serif', color: 'var(--navy)', margin: '0 0 10px' }}>
        404 — Không tìm thấy trang hoặc dữ liệu
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '460px', margin: '0 0 24px', lineHeight: 1.6 }}>
        Sự kiện, mẫu thiệp hoặc trang bạn đang truy cập không tồn tại, hoặc mã nhận diện không thuộc phạm vi sự kiện hiện tại (Cross-event Guard).
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/dashboard" className="btn dark">
          Quay lại Bảng điều khiển
        </Link>
        <Link href="/dashboard/events" className="btn">
          Xem danh sách Sự kiện
        </Link>
      </div>
    </div>
  );
}
