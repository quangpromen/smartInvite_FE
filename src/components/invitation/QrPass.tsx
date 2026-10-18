'use client';

import React from 'react';
import type { CheckIn } from '@/features/invitations/types';
import { formatDateTime } from '@/lib/format-date';

interface QrPassProps {
  guestFullName: string;
  eventTitle: string;
  invitationId: string;
  plusOnes: number;
  attendanceMode?: 'CEREMONY' | 'PHOTOS' | 'BOTH';
  checkIn?: CheckIn;
}

export function QrPass({
  guestFullName,
  eventTitle,
  invitationId,
  plusOnes,
  attendanceMode,
  checkIn,
}: QrPassProps) {
  const totalAttendees = 1 + plusOnes;

  return (
    <div className="qr-pass-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span
          style={{
            fontSize: '10px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#bfa77b',
            fontWeight: 800,
          }}
        >
          THẺ CHECK-IN SỰ KIỆN
        </span>
        <span
          className="tag"
          style={{
            background: checkIn ? '#10b981' : '#f59e0b',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 700,
          }}
        >
          {checkIn ? '✓ ĐÃ CHECK-IN' : 'CHỜ CHECK-IN'}
        </span>
      </div>

      <h4>{guestFullName}</h4>
      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{eventTitle}</p>

      {/* Styled QR Code SVG Graphic */}
      <div className="qr-code-graphic">
        <svg
          width="140"
          height="140"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Mã QR tham dự"
        >
          {/* Outer Border */}
          <rect width="100" height="100" rx="8" fill="#ffffff" />
          {/* Top-Left Finder */}
          <rect x="8" y="8" width="28" height="28" rx="4" fill="#17243c" />
          <rect x="14" y="14" width="16" height="16" rx="2" fill="#ffffff" />
          <rect x="18" y="18" width="8" height="8" rx="1" fill="#17243c" />
          {/* Top-Right Finder */}
          <rect x="64" y="8" width="28" height="28" rx="4" fill="#17243c" />
          <rect x="70" y="14" width="16" height="16" rx="2" fill="#ffffff" />
          <rect x="74" y="18" width="8" height="8" rx="1" fill="#17243c" />
          {/* Bottom-Left Finder */}
          <rect x="8" y="64" width="28" height="28" rx="4" fill="#17243c" />
          <rect x="14" y="70" width="16" height="16" rx="2" fill="#ffffff" />
          <rect x="18" y="74" width="8" height="8" rx="1" fill="#17243c" />
          {/* Decorative Pattern Dots */}
          <rect x="42" y="10" width="6" height="6" rx="1" fill="#17243c" />
          <rect x="52" y="10" width="6" height="6" rx="1" fill="#17243c" />
          <rect x="42" y="20" width="6" height="6" rx="1" fill="#17243c" />
          <rect x="42" y="30" width="6" height="6" rx="1" fill="#17243c" />
          <rect x="52" y="26" width="6" height="6" rx="1" fill="#17243c" />
          <rect x="10" y="42" width="6" height="6" rx="1" fill="#17243c" />
          <rect x="20" y="42" width="6" height="6" rx="1" fill="#17243c" />
          <rect x="30" y="42" width="6" height="6" rx="1" fill="#17243c" />
          <rect x="42" y="42" width="16" height="16" rx="2" fill="#b18f61" />
          <rect x="64" y="42" width="6" height="6" rx="1" fill="#17243c" />
          <rect x="76" y="42" width="14" height="6" rx="1" fill="#17243c" />
          <rect x="42" y="64" width="6" height="6" rx="1" fill="#17243c" />
          <rect x="52" y="70" width="6" height="6" rx="1" fill="#17243c" />
          <rect x="42" y="80" width="6" height="6" rx="1" fill="#17243c" />
          <rect x="64" y="64" width="8" height="8" rx="1" fill="#17243c" />
          <rect x="78" y="64" width="12" height="6" rx="1" fill="#17243c" />
          <rect x="64" y="78" width="12" height="6" rx="1" fill="#17243c" />
          <rect x="82" y="78" width="8" height="8" rx="1" fill="#17243c" />
        </svg>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          textAlign: 'left',
          fontSize: '11px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '10px',
          padding: '10px 14px',
          marginTop: '6px',
        }}
      >
        <div>
          <span style={{ color: '#94a3b8', display: 'block' }}>Số người tham dự:</span>
          <strong style={{ color: '#ffffff', fontSize: '13px' }}>
            {totalAttendees} người {plusOnes > 0 && `(kèm +${plusOnes})`}
          </strong>
        </div>
        <div>
          <span style={{ color: '#94a3b8', display: 'block' }}>Hình thức tham dự:</span>
          <strong style={{ color: '#ffffff', fontSize: '12px' }}>
            {attendanceMode === 'CEREMONY'
              ? 'Dự lễ tốt nghiệp'
              : attendanceMode === 'PHOTOS'
              ? 'Chụp ảnh kỷ niệm'
              : 'Cả hai (Lễ & Chụp ảnh)'}
          </strong>
        </div>
        {checkIn && (
          <div style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
            <span style={{ color: '#34d399' }}>✓ Check-in ghi nhận: {formatDateTime(checkIn.checkedInAt)}</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: '12px', fontSize: '10px', color: '#94a3b8', lineHeight: 1.5 }}>
        Mã vé: <code style={{ color: '#cbd5e1' }}>{invitationId.slice(0, 12)}</code> • Vui lòng xuất trình mã này khi đến địa điểm sự kiện.
      </div>
    </div>
  );
}
