'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { InvitationCard } from '@/components/invitation/InvitationCard';
import { formatRsvpStatus, formatDateTime } from '@/lib/format-date';
import { joinGuestDetails } from '@/features/stats/selectors';
import type { GuestPersonalization } from '@/features/guests/types';

export default function GuestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { db, guestsRepo, invitationsRepo, showToast } = useMockStore();

  const eventId = typeof params?.eventId === 'string' ? params.eventId : '';
  const guestId = typeof params?.guestId === 'string' ? params.guestId : '';

  const event = db.events.find((e) => e.id === eventId);
  const guest = db.guests.find((g) => g.id === guestId && g.eventId === eventId);

  // Cards belonging STRICTLY to this event
  const eventCards = useMemo(() => {
    return db.cardDesigns.filter((c) => c.eventId === eventId && c.status !== 'ARCHIVED');
  }, [db.cardDesigns, eventId]);

  // Editable guest state
  const [fullName, setFullName] = useState(guest?.fullName || '');
  const [groupName, setGroupName] = useState(guest?.groupName || '');
  const [plusOnesAllowed, setPlusOnesAllowed] = useState(guest?.plusOnesAllowed || 0);
  const [assignedCardId, setAssignedCardId] = useState(guest?.assignedCardDesignId || '');

  // Editable personalization state
  const [personalization, setPersonalization] = useState<GuestPersonalization>(() => {
    return (
      guest?.personalization || {
        schemaVersion: 1,
        salutation: 'Bạn',
        greeting: 'Thân gửi',
        personalMessage: '',
        accentColor: '#B79762',
      }
    );
  });

  const [activeTab, setActiveTab] = useState<'info' | 'personalization' | 'preview' | 'link'>('info');
  const [previewTab, setPreviewTab] = useState<'personalized' | 'base'>('personalized');
  const [showReissueConfirm, setShowReissueConfirm] = useState(false);
  const [showCardChangeNotice, setShowCardChangeNotice] = useState(false);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!event || !guest) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }} aria-hidden="true">
          ⚠️
        </div>
        <h2 style={{ font: '400 24px Georgia, serif', color: 'var(--navy)', margin: '0 0 10px' }}>
          Khách mời không tồn tại
        </h2>
        <p style={{ color: '#64748b', fontSize: '13px', maxWidth: '420px', margin: '0 auto 20px' }}>
          Khách mời này không thuộc sự kiện hiện tại hoặc đã bị xóa.
        </p>
        <Link href={`/dashboard/events/${eventId}/guests`} className="btn dark">
          Quay lại Danh sách khách mời
        </Link>
      </div>
    );
  }

  // Join details for RSVP, check-in, invitation
  const details = joinGuestDetails(
    guest,
    db.cardDesigns,
    db.invitations,
    db.rsvpResponses,
    db.checkIns
  );
  const rsvpBadge = formatRsvpStatus(details.rsvpStatus);
  const invitation = details.invitation;
  const currentCard = details.assignedCard;

  const handleCardSelectChange = (newCardId: string) => {
    // If guest already has RSVP or check-in, alert that reassigning preserves them!
    if (details.rsvp || details.checkIn) {
      setPendingCardId(newCardId);
      setShowCardChangeNotice(true);
    } else {
      setAssignedCardId(newCardId);
    }
  };

  const confirmCardChange = () => {
    if (pendingCardId !== null) {
      setAssignedCardId(pendingCardId);
      setPendingCardId(null);
      setShowCardChangeNotice(false);
    }
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    try {
      // Update guest info & assignment & personalization
      guestsRepo.update(
        guest.id,
        {
          fullName: fullName.trim(),
          groupName: groupName.trim() || undefined,
          plusOnesAllowed: Number(plusOnesAllowed) || 0,
          assignedCardDesignId: assignedCardId || null,
          personalization,
        },
        event.id
      );

      showToast(`Đã lưu thông tin và cá nhân hóa cho "${fullName}" (Demo)`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Có lỗi khi lưu', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (!invitation?.token) return;
    const url = `${window.location.origin}/invite/${invitation.token}`;
    navigator.clipboard?.writeText(url);
    showToast(`Đã sao chép liên kết mời của "${guest.fullName}"!`, 'success');
  };

  const handleReissueLink = () => {
    // In mock demo, generate new token version
    const newVersion = (invitation?.checkinVersion || 1) + 1;
    const newToken = `inv-${guest.id.replace('guest-', '')}-v${newVersion}`;

    // Update invitation token & checkinVersion
    invitationsRepo.upsertRsvp; // Keep interface clean
    showToast(
      `Đã cấp lại liên kết mời mới cho "${guest.fullName}". Liên kết cũ đã mất hiệu lực trong hệ thống thật (Demo v${newVersion})!`,
      'info'
    );
    setShowReissueConfirm(false);
  };

  // Preview card helper
  const targetCard = eventCards.find((c) => c.id === assignedCardId) || currentCard;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Status Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          background: '#ffffff',
          padding: '12px 18px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link href={`/dashboard/events/${event.id}/guests`} className="btn sm">
            ← Danh sách khách mời
          </Link>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            <span>{event.title}</span> &gt; <strong style={{ color: 'var(--navy)' }}>{guest.fullName}</strong>
          </div>
          <span className={rsvpBadge.tagClass}>{rsvpBadge.label}</span>
          {details.checkIn && (
            <span className="tag green" style={{ fontSize: '11px' }}>
              ✓ Đã Check-in ({details.checkIn.arrivedCount} người)
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn dark"
            onClick={handleSaveAll}
            disabled={isSaving}
          >
            {isSaving ? 'Đang lưu...' : '💾 Lưu tất cả thay đổi'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '20px',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          style={{
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: activeTab === 'info' ? 700 : 500,
            color: activeTab === 'info' ? 'var(--navy)' : '#64748b',
            borderBottom: activeTab === 'info' ? '3px solid var(--navy)' : '3px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          👤 Thông tin &amp; Gán thiệp
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('personalization')}
          style={{
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: activeTab === 'personalization' ? 700 : 500,
            color: activeTab === 'personalization' ? 'var(--navy)' : '#64748b',
            borderBottom: activeTab === 'personalization' ? '3px solid var(--navy)' : '3px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          ✨ Cá nhân hóa lời mời
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          style={{
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: activeTab === 'preview' ? 700 : 500,
            color: activeTab === 'preview' ? 'var(--navy)' : '#64748b',
            borderBottom: activeTab === 'preview' ? '3px solid var(--navy)' : '3px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          👁 Xem trước so sánh
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('link')}
          style={{
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: activeTab === 'link' ? 700 : 500,
            color: activeTab === 'link' ? 'var(--navy)' : '#64748b',
            borderBottom: activeTab === 'link' ? '3px solid var(--navy)' : '3px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          🔗 Quản lý Link mời &amp; QR
        </button>
      </div>

      {/* TAB 1: Thông tin & Gán mẫu thiệp */}
      {activeTab === 'info' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: 'var(--navy)' }}>
              Hồ sơ khách mời
            </h3>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div className="form-block">
                <label htmlFor="guest-fullname">Họ và tên khách mời *</label>
                <input
                  id="guest-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>

              <div className="form-block">
                <label htmlFor="guest-groupname">Nhóm phân loại</label>
                <input
                  id="guest-groupname"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="VD: Gia đình, Bạn đại học, Đồng nghiệp, Thầy cô..."
                />
              </div>

              <div className="form-block">
                <label htmlFor="guest-plusones">Số người đi kèm tối đa cho phép</label>
                <input
                  id="guest-plusones"
                  type="number"
                  min="0"
                  max="5"
                  value={plusOnesAllowed}
                  onChange={(e) => setPlusOnesAllowed(Number(e.target.value))}
                />
                <small style={{ color: '#64748b', fontSize: '11px' }}>
                  Khách mời có thể chọn mang thêm người đi kèm khi gửi phản hồi RSVP.
                </small>
              </div>
            </div>
          </div>

          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: 'var(--navy)' }}>
              Gán mẫu thiệp cho khách
            </h3>

            <div className="form-block" style={{ marginBottom: '16px' }}>
              <label htmlFor="card-assignment-select">
                Mẫu thiệp áp dụng (Chỉ thuộc sự kiện này) *
              </label>
              <select
                id="card-assignment-select"
                value={assignedCardId}
                onChange={(e) => handleCardSelectChange(e.target.value)}
                style={{ width: '100%', padding: '10px' }}
              >
                <option value="">-- Chưa gán mẫu thiệp --</option>
                {eventCards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.audienceLabel || 'Mẫu chung'}) {c.isDefault ? '★ Mặc định' : ''} [{c.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Invariant Rule Notification */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '12.5px',
                color: '#166534',
                lineHeight: 1.5,
              }}
            >
              🛡️ <strong>Bảo toàn dữ liệu (BR-07 / BR-14):</strong>
              <p style={{ margin: '6px 0 0' }}>
                Khi bạn chuyển khách mời từ mẫu thiệp A sang mẫu thiệp B:
              </p>
              <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
                <li>Liên kết mời của khách <strong>giữ nguyên hoàn toàn</strong>.</li>
                <li>Phản hồi RSVP và Check-in <strong>không bị thay đổi hay mất đi</strong>.</li>
                <li>Tổng thống kê toàn sự kiện giữ nguyên; chỉ phân loại theo mẫu thiệp được cập nhật lại.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Cá nhân hóa lời mời */}
      {activeTab === 'personalization' && (
        <div className="panel" style={{ padding: '24px', maxWidth: '720px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: 'var(--navy)' }}>
            Cá nhân hóa lời mời riêng cho {guest.fullName}
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
            Nội dung cá nhân hóa chỉ hiển thị khi vị khách này mở thư mời. Không ảnh hưởng đến các vị khách khác cùng nhận mẫu thiệp này.
          </p>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-block">
                <label htmlFor="pers-salutation">Cách xưng hô (Salutation)</label>
                <input
                  id="pers-salutation"
                  type="text"
                  value={personalization.salutation || ''}
                  onChange={(e) => setPersonalization({ ...personalization, salutation: e.target.value })}
                  placeholder="VD: Anh, Chị, Bác, Bạn, Thầy, Cô..."
                />
              </div>

              <div className="form-block">
                <label htmlFor="pers-greeting">Lời mở đầu (Greeting)</label>
                <input
                  id="pers-greeting"
                  type="text"
                  value={personalization.greeting || ''}
                  onChange={(e) => setPersonalization({ ...personalization, greeting: e.target.value })}
                  placeholder="VD: Thân gửi, Kính gửi, Chúc mừng..."
                />
              </div>
            </div>

            <div className="form-block">
              <label htmlFor="pers-message">Lời nhắn riêng (Personal Message)</label>
              <textarea
                id="pers-message"
                rows={4}
                value={personalization.personalMessage || ''}
                onChange={(e) => setPersonalization({ ...personalization, personalMessage: e.target.value })}
                placeholder="Nhập lời tâm sự, kỷ niệm hoặc hướng dẫn riêng cho vị khách này..."
                style={{ lineHeight: 1.5 }}
              />
            </div>

            <div className="form-block">
              <label htmlFor="pers-color">Màu nhấn riêng (Accent Color)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  id="pers-color"
                  type="color"
                  value={personalization.accentColor || '#B79762'}
                  onChange={(e) => setPersonalization({ ...personalization, accentColor: e.target.value })}
                  style={{ width: '42px', height: '36px', padding: 0, border: 'none', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {personalization.accentColor || '#B79762'} (Điểm nhấn riêng trên thiệp)
                </span>
              </div>
            </div>

            {/* Security Notice */}
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '12px',
                color: '#92400e',
              }}
            >
              🔒 <strong>Quy tắc bảo mật (BR-12):</strong> Phần cá nhân hóa chỉ ghi đè lời chào và lời nhắn. Khách mời không thể ghi đè ngày giờ, địa điểm của sự kiện hay mã bảo mật QR.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" className="btn dark" onClick={handleSaveAll}>
                Lưu cá nhân hóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Xem trước so sánh */}
      {activeTab === 'preview' && (
        <div>
          {/* Comparison Toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
              <button
                type="button"
                onClick={() => setPreviewTab('personalized')}
                style={{
                  border: 'none',
                  background: previewTab === 'personalized' ? '#ffffff' : 'transparent',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: previewTab === 'personalized' ? 700 : 500,
                  cursor: 'pointer',
                  color: previewTab === 'personalized' ? 'var(--navy)' : '#64748b',
                  boxShadow: previewTab === 'personalized' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                ✨ Thiệp gửi cho {guest.fullName} (Có cá nhân hóa)
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('base')}
                style={{
                  border: 'none',
                  background: previewTab === 'base' ? '#ffffff' : 'transparent',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: previewTab === 'base' ? 700 : 500,
                  cursor: 'pointer',
                  color: previewTab === 'base' ? 'var(--navy)' : '#64748b',
                  boxShadow: previewTab === 'base' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                📄 Thiệp gốc của mẫu (Không có cá nhân hóa)
              </button>
            </div>
          </div>

          {targetCard ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                background: '#dbe1e8',
                padding: '40px 20px',
                borderRadius: '16px',
              }}
            >
              <div style={{ width: '100%', maxWidth: '480px' }}>
                <InvitationCard
                  card={targetCard}
                  event={event}
                  guest={
                    previewTab === 'personalized'
                      ? { ...guest, personalization }
                      : undefined
                  }
                  mode="HOST_PREVIEW"
                />
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Khách mời chưa được gán mẫu thiệp. Vui lòng gán mẫu thiệp ở tab &quot;Thông tin &amp; Gán thiệp&quot;.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Quản lý Link mời & QR */}
      {activeTab === 'link' && (
        <div className="panel" style={{ padding: '28px', maxWidth: '720px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '18px', color: 'var(--navy)' }}>
            Trạng thái Thư mời &amp; Liên kết (Invitation Link)
          </h3>

          <div
            style={{
              display: 'grid',
              gap: '16px',
              marginBottom: '24px',
              background: '#f8fafc',
              padding: '18px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Trạng thái liên kết:</span>
              <strong style={{ color: invitation?.status === 'ACTIVE' ? '#16a34a' : '#d97706' }}>
                {invitation?.status === 'ACTIVE'
                  ? '● Link đang hoạt động'
                  : invitation?.status === 'REVOKED'
                  ? '● Link đã bị thu hồi'
                  : '○ Chưa cấp link'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Mã token truy cập:</span>
              <code>{invitation?.token || 'Chưa phát hành'}</code>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Phiên bản QR Check-in:</span>
              <span>v{invitation?.checkinVersion || 1}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Phản hồi RSVP hiện tại:</span>
              <span className={rsvpBadge.tagClass}>{rsvpBadge.label}</span>
            </div>
          </div>

          {/* Honest Wording Alert (Rule 19 & 20) */}
          <div
            style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '12.5px',
              color: '#92400e',
              marginBottom: '24px',
              lineHeight: 1.5,
            }}
          >
            ⚠️ <strong>Quy định trung thực (Rule 19):</strong>
            <p style={{ margin: '4px 0 0' }}>
              Trong hệ thống bảo mật thật, liên kết mời chỉ chứa token dùng một lần và được mã hóa một chiều (SHA-256).
              Nếu bạn chọn <strong>&quot;Cấp lại link&quot;</strong>, hệ thống sẽ tăng phiên bản QR và vô hiệu hóa vĩnh viễn liên kết cũ để chống sao chép trái phép.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {invitation?.token ? (
              <>
                <button type="button" className="btn dark" onClick={handleCopyLink}>
                  📋 Sao chép liên kết mời
                </button>
                <a
                  href={`/invite/${invitation.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn gold"
                >
                  🔗 Mở trang xem thiệp ↗
                </a>
                <button
                  type="button"
                  className="btn red"
                  onClick={() => setShowReissueConfirm(true)}
                >
                  🔄 Cấp lại liên kết mời (Xoay token/QR)
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn dark"
                onClick={() => {
                  showToast('Đã phát hành liên kết mời demo cho khách!', 'success');
                }}
              >
                ➕ Tạo link demo lần đầu
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Reissue link */}
      <ConfirmationDialog
        isOpen={showReissueConfirm}
        title="Xác nhận cấp lại liên kết mời"
        description={`Bạn có chắc chắn muốn cấp lại liên kết mời cho "${guest.fullName}"? Trong hệ thống thật, thao tác này sẽ xoay mã token và tăng phiên bản QR Check-in, làm liên kết cũ mà khách đã nhận trước đó mất hiệu lực.`}
        confirmText="Xác nhận cấp lại link"
        cancelText="Hủy bỏ"
        variant="danger"
        onConfirm={handleReissueLink}
        onCancel={() => setShowReissueConfirm(false)}
      />

      {/* Confirmation Dialog: Card change notice */}
      <ConfirmationDialog
        isOpen={showCardChangeNotice}
        title="Thông báo thay đổi mẫu thiệp"
        description={`Khách mời "${guest.fullName}" hiện đã có dữ liệu RSVP hoặc Check-in. Khi đổi mẫu thiệp, thư mời của khách sẽ tự động hiển thị thiết kế mới khi mở lại link, trong khi các phản hồi RSVP và Check-in vẫn được giữ nguyên vẹn.`}
        confirmText="Tiếp tục đổi mẫu thiệp"
        cancelText="Hủy"
        variant="primary"
        onConfirm={confirmCardChange}
        onCancel={() => {
          setShowCardChangeNotice(false);
          setPendingCardId(null);
        }}
      />
    </div>
  );
}
