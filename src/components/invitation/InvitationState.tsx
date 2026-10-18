'use client';

import React from 'react';
import Link from 'next/link';
import type { InvitationResolutionReason } from '@/features/invitations/types';

interface InvitationStateProps {
  reason: InvitationResolutionReason | 'LOADING' | 'ERROR';
  message?: string;
  customTitle?: string;
}

export function InvitationState({ reason, message, customTitle }: InvitationStateProps) {
  let title = customTitle || 'Không thể mở thư mời';
  let desc = message || 'Đã có lỗi xảy ra khi truy cập liên kết này.';
  let iconBg = '#fee2e2';
  let iconColor = '#dc2626';

  switch (reason) {
    case 'LOADING':
      title = 'Đang tải thư mời...';
      desc = 'Hệ thống đang kiểm tra tính hợp lệ của liên kết.';
      iconBg = '#f1f5f9';
      iconColor = '#64748b';
      break;

    case 'TOKEN_NOT_FOUND':
      title = 'Liên kết không tồn tại';
      desc = message || 'Mã thư mời không tồn tại trên hệ thống. Vui lòng kiểm tra lại đường dẫn bạn đã nhận.';
      break;

    case 'INVITATION_REVOKED':
      title = 'Liên kết đã bị thu hồi';
      desc = message || 'Lời mời này đã được thu hồi hoặc cấp lại bằng một liên kết mới. Vui lòng liên hệ người tổ chức để nhận liên kết mới nhất.';
      iconBg = '#fff7ed';
      iconColor = '#ea580c';
      break;

    case 'GUEST_NOT_FOUND':
      title = 'Không tìm thấy thông tin khách mời';
      desc = message || 'Dữ liệu khách mời gắn với lời mời này không tồn tại trong sự kiện.';
      break;

    case 'GUEST_UNASSIGNED':
      title = 'Thư mời đang chuẩn bị';
      desc = message || 'Chủ sự kiện chưa gán mẫu thiệp cụ thể cho bạn. Vui lòng kiểm tra lại sau.';
      iconBg = '#fef3c7';
      iconColor = '#d97706';
      break;

    case 'CARD_NOT_FOUND':
    case 'CARD_CROSS_EVENT':
      title = 'Lỗi cấu hình thiệp mời';
      desc = message || 'Mẫu thiệp được gán không hợp lệ hoặc không thuộc sự kiện này.';
      break;

    case 'EVENT_DRAFT':
      title = 'Sự kiện chưa công bố';
      desc = message || 'Sự kiện này hiện đang ở trạng thái bản thảo nội bộ. Khách mời chưa thể xem thiệp vào lúc này.';
      iconBg = '#fef3c7';
      iconColor = '#d97706';
      break;

    case 'EVENT_CANCELLED':
      title = 'Sự kiện đã bị hủy';
      desc = message || 'Rất tiếc, sự kiện này đã được thông báo hủy tổ chức bởi người tổ chức.';
      iconBg = '#fef2f2';
      iconColor = '#b91c1c';
      break;

    case 'EVENT_FINISHED':
      title = 'Sự kiện đã kết thúc';
      desc = message || 'Sự kiện này đã diễn ra xong. Cảm ơn sự quan tâm của bạn!';
      iconBg = '#f1f5f9';
      iconColor = '#475569';
      break;

    case 'CARD_DRAFT':
      title = 'Mẫu thiệp chưa xuất bản';
      desc = message || 'Mẫu thiệp này đang là bản nháp chỉnh sửa của chủ sự kiện và chưa được công bố tới khách.';
      iconBg = '#fef3c7';
      iconColor = '#d97706';
      break;

    case 'CARD_ARCHIVED':
      title = 'Mẫu thiệp đã được lưu trữ';
      desc = message || 'Mẫu thiệp này đã ngừng sử dụng. Vui lòng liên hệ người tổ chức để được hỗ trợ.';
      iconBg = '#f1f5f9';
      iconColor = '#64748b';
      break;

    default:
      break;
  }

  return (
    <div className="invite-view" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div
        className="panel"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '36px 28px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: iconBg,
            color: iconColor,
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 20px',
          }}
        >
          {reason === 'LOADING' ? (
            <div
              style={{
                width: '28px',
                height: '28px',
                border: '3px solid #cbd5e1',
                borderTopColor: '#6366f1',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>

        <h2 style={{ font: '400 24px Georgia, serif', color: 'var(--navy)', margin: '0 0 10px' }}>
          {title}
        </h2>

        <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.7, margin: '0 0 24px' }}>
          {desc}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <Link href="/" className="btn sm">
            Trang chủ SmartInvite
          </Link>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <span className="tag gray" style={{ fontSize: '10px' }}>
            SmartInvite Guest Security • Mã lỗi: {reason}
          </span>
        </div>
      </div>
    </div>
  );
}
