'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { InvitationCard } from '@/components/invitation/InvitationCard';
import { formatDateTime, formatCardStatus } from '@/lib/format-date';
import type { CardConfig, CardThemeKey } from '@/features/cards/types';

export default function CardEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { db, cardsRepo, showToast } = useMockStore();

  const eventId = typeof params?.eventId === 'string' ? params.eventId : '';
  const cardId = typeof params?.cardId === 'string' ? params.cardId : '';

  const event = db.events.find((e) => e.id === eventId);
  const card = db.cardDesigns.find((c) => c.id === cardId && c.eventId === eventId);

  // Local editor draft state initialized from card's draftConfig
  const [draft, setDraft] = useState<CardConfig>(() => {
    return (
      card?.draftConfig || {
        theme: 'classic',
        headline: 'LỄ TỐT NGHIỆP',
        subHeadline: 'GRADUATION CEREMONY',
        invitationCopy: 'Trân trọng kính mời quý vị và các bạn đến chung vui trong ngày trọng đại.',
        signature: 'Ban Tổ Chức',
        showCapArt: true,
        showFlowerArt: true,
        envelopeStyle: 'ivory',
      }
    );
  });

  const [activeTab, setActiveTab] = useState<'content' | 'theme' | 'art' | 'envelope'>('content');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('mobile');
  const [selectedGuestId, setSelectedGuestId] = useState<string>(''); // For preview-as-guest
  const [isDirty, setIsDirty] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaveTargetUrl, setLeaveTargetUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync draft state if card changes externally
  useEffect(() => {
    if (card && !isDirty) {
      setDraft(card.draftConfig);
    }
  }, [card, isDirty]);

  if (!event || !card) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }} aria-hidden="true">
          ⚠️
        </div>
        <h2 style={{ font: '400 24px Georgia, serif', color: 'var(--navy)', margin: '0 0 10px' }}>
          Mẫu thiệp không tồn tại
        </h2>
        <p style={{ color: '#64748b', fontSize: '13px', maxWidth: '420px', margin: '0 auto 20px' }}>
          Mẫu thiệp này không thuộc sự kiện hiện tại hoặc đã bị xóa.
        </p>
        <Link href={`/dashboard/events/${eventId}/cards`} className="btn dark">
          Quay lại Bộ sưu tập thiệp
        </Link>
      </div>
    );
  }

  // Active guests assigned to this card for persona preview
  const eventGuests = db.guests.filter((g) => g.eventId === event.id);
  const selectedGuest = eventGuests.find((g) => g.id === selectedGuestId);

  // Check if draft has unpublished changes vs publishedConfig
  const hasUnpublishedChanges = useMemo(() => {
    if (!card.publishedConfig) return true; // Never published
    return JSON.stringify(card.draftConfig) !== JSON.stringify(card.publishedConfig) || isDirty;
  }, [card.draftConfig, card.publishedConfig, isDirty]);

  const updateDraftField = <K extends keyof CardConfig>(field: K, value: CardConfig[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    try {
      cardsRepo.update(card.id, { draftConfig: draft }, event.id);
      setIsDirty(false);
      showToast('Đã lưu bản nháp thiết kế thiệp (Demo)', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Có lỗi khi lưu bản nháp', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishConfirm = () => {
    try {
      // First save draft, then publish
      cardsRepo.update(card.id, { draftConfig: draft }, event.id);
      cardsRepo.publish(card.id, event.id);
      setIsDirty(false);
      setShowPublishConfirm(false);
      showToast(`Đã công bố cập nhật mẫu thiệp "${card.title}" thành công!`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Có lỗi khi công bố thiệp', 'error');
    }
  };

  const handleNavigateAway = (targetUrl: string) => {
    if (isDirty) {
      setLeaveTargetUrl(targetUrl);
      setShowLeaveConfirm(true);
    } else {
      router.push(targetUrl);
    }
  };

  const statusBadge = formatCardStatus(card.status);

  // Simulated card preview object
  const previewCard = {
    ...card,
    draftConfig: draft,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleNavigateAway(`/dashboard/events/${event.id}/cards`)}
            className="btn sm"
            style={{ padding: '6px 12px' }}
          >
            ← Danh sách thiệp
          </button>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            <span>{event.title}</span> &gt; <strong style={{ color: 'var(--navy)' }}>{card.title}</strong>
          </div>
          <span className={statusBadge.tagClass}>{statusBadge.label}</span>
          {hasUnpublishedChanges && card.publishedConfig && (
            <span className="tag gold" style={{ fontSize: '11px' }}>
              ● Có thay đổi chưa công bố
            </span>
          )}
          {isDirty && (
            <span className="tag red" style={{ fontSize: '11px' }}>
              Chưa lưu
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Link
            href={`/dashboard/events/${event.id}/cards/${card.id}/preview`}
            className="btn sm"
            title="Xem trang thiệp hoàn chỉnh"
          >
            👁 Xem trước
          </Link>

          <button
            type="button"
            className="btn sm"
            disabled={!isDirty || isSaving}
            onClick={handleSaveDraft}
            title="Lưu vào bản nháp. Khách mời vẫn nhìn thấy bản đã công bố trước đó."
          >
            {isSaving ? 'Đang lưu...' : 'Lưu bản nháp'}
          </button>

          <button
            type="button"
            className="btn sm gold"
            onClick={() => setShowPublishConfirm(true)}
            title="Công bố các thay đổi để khách mời thấy phiên bản mới nhất"
          >
            {card.status === 'PUBLISHED' ? 'Công bố thay đổi' : 'Xuất bản thiệp'}
          </button>
        </div>
      </div>

      {/* Canonical Event Notice Banner (Read-only reminder) */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderLeft: '4px solid var(--navy)',
          borderRadius: '8px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          fontSize: '12px',
          color: '#475569',
        }}
      >
        <div>
          <strong style={{ color: 'var(--navy)' }}>Thông tin sự kiện chuẩn (Canonical): </strong>
          <span>
            {formatDateTime(event.startsAt)} • {event.locationName} ({event.locationAddress || 'Chưa cập nhật'})
          </span>
          <span style={{ display: 'block', color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
            Thông tin này dùng chung cho mọi mẫu thiệp và chỉ đọc trong trình biên tập thiết kế.
          </span>
        </div>
        <Link
          href={`/dashboard/events/${event.id}/settings`}
          className="btn sm"
          style={{ fontSize: '11px', padding: '4px 10px' }}
        >
          Sửa thông tin sự kiện ↗
        </Link>
      </div>

      {/* 3-Panel Editor Workspace (Desktop 3 columns / Mobile stacked) */}
      <div
        className="editor-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 250px) minmax(420px, 1fr) minmax(280px, 320px)',
          gap: '12px',
          alignItems: 'start',
        }}
      >
        {/* PANEL 1: Tools & Sections Navigator */}
        <div className="panel editor-tools-panel" style={{ padding: '16px' }}>
          <h3
            style={{
              margin: '0 0 12px',
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#64748b',
            }}
          >
            Thành phần thiết kế
          </h3>

          <div style={{ display: 'grid', gap: '6px' }}>
            <button
              type="button"
              className={`nav-btn ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
              style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
            >
              <span aria-hidden="true">✍️</span>
              <span style={{ fontWeight: 600 }}>Nội dung &amp; Lời mời</span>
            </button>

            <button
              type="button"
              className={`nav-btn ${activeTab === 'theme' ? 'active' : ''}`}
              onClick={() => setActiveTab('theme')}
              style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
            >
              <span aria-hidden="true">🎨</span>
              <span style={{ fontWeight: 600 }}>Màu sắc &amp; Mẫu theme</span>
            </button>

            <button
              type="button"
              className={`nav-btn ${activeTab === 'art' ? 'active' : ''}`}
              onClick={() => setActiveTab('art')}
              style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
            >
              <span aria-hidden="true">✨</span>
              <span style={{ fontWeight: 600 }}>Họa tiết &amp; Trang trí</span>
            </button>

            <button
              type="button"
              className={`nav-btn ${activeTab === 'envelope' ? 'active' : ''}`}
              onClick={() => setActiveTab('envelope')}
              style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
            >
              <span aria-hidden="true">✉️</span>
              <span style={{ fontWeight: 600 }}>Kiểu dáng phong bì</span>
            </button>
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
              <strong>Đối tượng hướng tới:</strong>
            </div>
            <input
              type="text"
              value={card.audienceLabel || ''}
              onChange={(e) => cardsRepo.update(card.id, { audienceLabel: e.target.value }, event.id)}
              placeholder="VD: Gia đình, Bạn bè, Thầy cô..."
              style={{ fontSize: '13px' }}
            />
            <small style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
              Ghi chú giúp bạn dễ dàng gán khách mời đúng nhóm.
            </small>
          </div>
        </div>

        {/* PANEL 2: Live Interactive Canvas / Preview */}
        <div
          className="panel editor-preview-panel"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#eceff3',
            minHeight: '620px',
            position: 'relative',
          }}
        >
          {/* Canvas Toolbar: Device Toggle & Persona Picker */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '16px',
              padding: '6px 12px',
              background: '#ffffff',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {/* Device Switcher */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setDeviceView('mobile')}
                style={{
                  border: 'none',
                  background: deviceView === 'mobile' ? '#ffffff' : 'transparent',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: deviceView === 'mobile' ? 700 : 500,
                  cursor: 'pointer',
                  color: deviceView === 'mobile' ? 'var(--navy)' : '#64748b',
                  boxShadow: deviceView === 'mobile' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                📱 Mobile (390px)
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('desktop')}
                style={{
                  border: 'none',
                  background: deviceView === 'desktop' ? '#ffffff' : 'transparent',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: deviceView === 'desktop' ? 700 : 500,
                  cursor: 'pointer',
                  color: deviceView === 'desktop' ? 'var(--navy)' : '#64748b',
                  boxShadow: deviceView === 'desktop' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                💻 Desktop
              </button>
            </div>

            {/* Persona Switcher: Preview as guest */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="preview-guest-select" style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                Xem như khách:
              </label>
              <select
                id="preview-guest-select"
                value={selectedGuestId}
                onChange={(e) => setSelectedGuestId(e.target.value)}
                style={{ fontSize: '12px', padding: '4px 8px', maxWidth: '170px' }}
              >
                <option value="">(Bản gốc của mẫu)</option>
                {eventGuests.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.fullName} {g.assignedCardDesignId === card.id ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Card Canvas Container */}
          <div
            style={{
              width: deviceView === 'mobile' ? '380px' : '100%',
              maxWidth: deviceView === 'mobile' ? '390px' : '520px',
              transition: 'all 0.25s ease',
            }}
          >
            <InvitationCard
              card={previewCard}
              event={event}
              guest={selectedGuest}
              mode="EDITOR_PREVIEW"
            />
          </div>

          {selectedGuest && (
            <div
              style={{
                marginTop: '12px',
                padding: '6px 14px',
                background: '#e0f2fe',
                borderRadius: '20px',
                fontSize: '11px',
                color: '#0369a1',
                textAlign: 'center',
              }}
            >
              Đang mô phỏng hiển thị cho khách mời: <strong>{selectedGuest.fullName}</strong>
            </div>
          )}
        </div>

        {/* PANEL 3: Properties Inspector Panel */}
        <div className="panel editor-inspector-panel" style={{ padding: '20px' }}>
          <h3
            style={{
              margin: '0 0 14px',
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#64748b',
            }}
          >
            Tùy chỉnh chi tiết
          </h3>

          {/* Tab 1: Content */}
          {activeTab === 'content' && (
            <div style={{ display: 'grid', gap: '14px' }}>
              <div className="form-block">
                <label htmlFor="editor-headline">Tiêu đề thiệp (Headline)</label>
                <input
                  id="editor-headline"
                  type="text"
                  value={draft.headline}
                  onChange={(e) => updateDraftField('headline', e.target.value)}
                  placeholder="VD: LỄ TỐT NGHIỆP"
                />
              </div>

              <div className="form-block">
                <label htmlFor="editor-subheadline">Phụ đề (Sub-headline)</label>
                <input
                  id="editor-subheadline"
                  type="text"
                  value={draft.subHeadline || ''}
                  onChange={(e) => updateDraftField('subHeadline', e.target.value)}
                  placeholder="VD: GRADUATION DAY 2026"
                />
              </div>

              <div className="form-block">
                <label htmlFor="editor-copy">Lời mời chung (Invitation Copy)</label>
                <textarea
                  id="editor-copy"
                  rows={4}
                  value={draft.invitationCopy}
                  onChange={(e) => updateDraftField('invitationCopy', e.target.value)}
                  placeholder="Nhập nội dung lời mời chung cho mẫu thiệp này..."
                  style={{ lineHeight: 1.5 }}
                />
              </div>

              <div className="form-block">
                <label htmlFor="editor-sig">Chữ ký / Lời kết (Signature)</label>
                <input
                  id="editor-sig"
                  type="text"
                  value={draft.signature}
                  onChange={(e) => updateDraftField('signature', e.target.value)}
                  placeholder="VD: Ban Tổ Chức, Thân ái..."
                />
              </div>

              {draft.theme === 'campus' && (
                <fieldset
                  style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', display: 'grid', gap: '12px', margin: 0 }}
                >
                  <legend style={{ fontSize: '12px', fontWeight: 700, color: '#475569', padding: '0 6px' }}>
                    Thẻ Campus — văn bản hiển thị
                  </legend>
                  {(
                    [
                      ['brandLabel', 'Thương hiệu / trường', 'VD: ĐẠI HỌC FPT'],
                      ['kicker', 'Dòng mở đầu', 'VD: TRÂN TRỌNG KÍNH MỜI'],
                      ['headlineAccent', 'Phần nhấn màu trong tiêu đề', 'VD: 2026 (phải nằm trong tiêu đề)'],
                      ['heroImageUrl', 'Đường dẫn ảnh campus', '/assets/campus/fpt-campus-hero.jpg'],
                      ['heroImageAlt', 'Mô tả ảnh (alt)', 'Mô tả ngắn cho người dùng máy đọc màn hình'],
                      ['mapLabel', 'Nhãn nút bản đồ', 'Xem chỉ đường'],
                      ['rsvpHeading', 'Tiêu đề RSVP', 'BẠN SẼ THAM DỰ CHỨ?'],
                      ['rsvpYesLabel', 'Nhãn nút “Sẽ tham dự”', 'Tôi sẽ tham dự'],
                      ['rsvpNoLabel', 'Nhãn nút “Không thể”', 'Rất tiếc, tôi không thể'],
                      ['closingLine', 'Lời kết dưới RSVP', 'Hẹn gặp bạn tại ngày đặc biệt này.'],
                    ] as const
                  ).map(([field, label, placeholder]) => (
                    <div className="form-block" key={field}>
                      <label htmlFor={`editor-${field}`}>{label}</label>
                      <input
                        id={`editor-${field}`}
                        type="text"
                        value={draft[field] ?? ''}
                        onChange={(e) => updateDraftField(field, e.target.value)}
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                  <small style={{ color: '#64748b', fontSize: '11px' }}>
                    Ngày giờ, địa điểm và bản đồ lấy từ Sự kiện; lời chào “Kính gửi …” lấy từ Khách mời. Phụ đề ở trên là dòng tên nổi bật (ví dụ tên tân cử nhân).
                  </small>
                </fieldset>
              )}
            </div>
          )}

          {/* Tab 2: Theme & Colors */}
          {activeTab === 'theme' && (
            <div style={{ display: 'grid', gap: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                Chọn phong cách theme:
              </label>

              {[
                { key: 'classic', name: 'Classic Ivory', color: '#B79762', bg: '#fbf5eb' },
                { key: 'rose', name: 'Rose Pastel', color: '#e11d48', bg: '#fff1ef' },
                { key: 'night', name: 'Midnight Navy', color: '#38bdf8', bg: '#0f172a' },
                { key: 'modern', name: 'Modern Clean', color: '#2563eb', bg: '#0284c7' },
                { key: 'campus', name: 'Campus Sunrise (FPT)', color: '#e9571c', bg: '#fdf3e6' },
              ].map((th) => {
                const isSelected = draft.theme === th.key;
                return (
                  <button
                    key={th.key}
                    type="button"
                    onClick={() => updateDraftField('theme', th.key as CardThemeKey)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid var(--navy)' : '1px solid #e2e8f0',
                      background: isSelected ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: th.bg,
                          border: `2px solid ${th.color}`,
                          display: 'inline-block',
                        }}
                        aria-hidden="true"
                      />
                      <strong style={{ fontSize: '13px', color: 'var(--navy)' }}>{th.name}</strong>
                    </div>
                    {isSelected && <span style={{ color: 'var(--navy)', fontWeight: 800 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 3: Art & Decorations */}
          {activeTab === 'art' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '13px', color: 'var(--navy)' }}>
                    Biểu tượng Mũ tốt nghiệp
                  </strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Hiển thị họa tiết mũ cử nhân trang trọng</span>
                </div>
                <input
                  type="checkbox"
                  checked={draft.showCapArt !== false}
                  onChange={(e) => updateDraftField('showCapArt', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '13px', color: 'var(--navy)' }}>
                    Hoa văn trang trí viền
                  </strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Họa tiết hoa văn thanh nhã hai góc thiệp</span>
                </div>
                <input
                  type="checkbox"
                  checked={draft.showFlowerArt !== false}
                  onChange={(e) => updateDraftField('showFlowerArt', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {/* Tab 4: Envelope Style */}
          {activeTab === 'envelope' && (
            <div style={{ display: 'grid', gap: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                Màu sắc phong bì khi khách mở thiệp:
              </label>

              {[
                { key: 'ivory', name: 'Phong bì Ngà Vàng (Ivory Gold)', bg: '#fdfbf7', border: '#b79762' },
                { key: 'navy', name: 'Phong bì Xanh Navy (Royal Navy)', bg: '#182741', border: '#b79762' },
                { key: 'burgundy', name: 'Phong bì Đỏ Rượu (Burgundy)', bg: '#7f1d1d', border: '#fde047' },
              ].map((env) => {
                const isSelected = (draft.envelopeStyle || 'ivory') === env.key;
                return (
                  <button
                    key={env.key}
                    type="button"
                    onClick={() => updateDraftField('envelopeStyle', env.key as 'ivory' | 'navy' | 'burgundy')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--navy)' : '1px solid #e2e8f0',
                      background: isSelected ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '18px',
                          borderRadius: '3px',
                          background: env.bg,
                          border: `1px solid ${env.border}`,
                          display: 'inline-block',
                        }}
                        aria-hidden="true"
                      />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)' }}>
                        {env.name}
                      </span>
                    </div>
                    {isSelected && <span style={{ fontWeight: 800 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog: Publish Changes */}
      <ConfirmationDialog
        isOpen={showPublishConfirm}
        title="Xác nhận công bố thay đổi thiết kế thiệp"
        description={`Bạn có chắc chắn muốn công bố các thay đổi của "${card.title}"? Phiên bản mới sẽ lập tức hiển thị cho tất cả khách mời được gán mẫu thiệp này khi họ mở thư mời.`}
        confirmText="Đồng ý công bố"
        cancelText="Hủy bỏ"
        variant="primary"
        onConfirm={handlePublishConfirm}
        onCancel={() => setShowPublishConfirm(false)}
      />

      {/* Confirmation Dialog: Leave with unsaved changes */}
      <ConfirmationDialog
        isOpen={showLeaveConfirm}
        title="Thay đổi chưa được lưu"
        description="Bạn có thay đổi bản nháp chưa được lưu. Nếu rời khỏi trang bây giờ, các chỉnh sửa chưa lưu sẽ bị mất."
        confirmText="Rời khỏi trang"
        cancelText="Ở lại tiếp tục sửa"
        variant="danger"
        onConfirm={() => {
          setShowLeaveConfirm(false);
          setIsDirty(false);
          router.push(leaveTargetUrl);
        }}
        onCancel={() => setShowLeaveConfirm(false)}
      />
    </div>
  );
}
