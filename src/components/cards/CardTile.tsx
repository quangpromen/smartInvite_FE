'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { CardDesign } from '@/features/cards/types';
import { useMockStore } from '@/mocks/mock-store';
import { formatCardStatus } from '@/lib/format-date';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { InvitationCard } from '@/components/invitation/InvitationCard';

interface CardTileProps {
  card: CardDesign;
  onDuplicateToOtherEvent?: (card: CardDesign) => void;
}

export function CardTile({ card, onDuplicateToOtherEvent }: CardTileProps) {
  const { db, cardsRepo, guestsRepo, showToast } = useMockStore();

  const [showArchiveAlert, setShowArchiveAlert] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showReassignArchiveModal, setShowReassignArchiveModal] = useState(false);
  const [replacementCardId, setReplacementCardId] = useState<string>('');
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const event = db.events.find((e) => e.id === card.eventId);

  // Count active guests assigned to this card
  const assignedGuests = db.guests.filter(
    (g) => g.eventId === card.eventId && g.assignedCardDesignId === card.id
  );
  const assignedCount = assignedGuests.length;

  // Other active cards in the same event
  const otherActiveCards = db.cardDesigns.filter(
    (c) => c.eventId === card.eventId && c.id !== card.id && c.status !== 'ARCHIVED'
  );

  const statusInfo = formatCardStatus(card.status);

  const handleSetDefault = () => {
    try {
      cardsRepo.setDefault(card.id, card.eventId);
      showToast(`Đã đặt "${card.title}" làm mẫu thiệp mặc định của sự kiện`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi đặt mặc định', 'error');
    }
  };

  const handlePublish = () => {
    try {
      cardsRepo.publish(card.id, card.eventId);
      showToast(`Đã xuất bản mẫu thiệp "${card.title}" thành công (Bản demo)`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi xuất bản', 'error');
    }
  };

  const handleDuplicateSameEvent = () => {
    try {
      const copy = cardsRepo.duplicate(card.id, card.eventId, card.eventId);
      showToast(`Đã nhân bản thành "${copy.title}" trong cùng sự kiện`, 'success');
      setShowDuplicateConfirm(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi nhân bản', 'error');
    }
  };

  const handleArchiveClick = () => {
    // Rule BR-07 / BR-21: Block archive if guests assigned, offer bulk reassign
    if (assignedCount > 0) {
      if (otherActiveCards.length > 0) {
        setReplacementCardId(otherActiveCards[0].id);
        setShowReassignArchiveModal(true);
      } else {
        setShowArchiveAlert(true);
      }
      return;
    }

    setShowArchiveConfirm(true);
  };

  const handleConfirmArchive = () => {
    try {
      cardsRepo.archive(card.id, card.eventId);
      showToast(`Đã lưu trữ mẫu thiệp "${card.title}"`, 'info');
      setShowArchiveConfirm(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi lưu trữ', 'error');
    }
  };

  const handleReassignAndArchive = () => {
    if (!replacementCardId) return;

    try {
      const guestIds = assignedGuests.map((g) => g.id);
      // Bulk reassign to chosen replacement card
      guestsRepo.bulkAssignCard(guestIds, replacementCardId, card.eventId);

      // If this card was default, set replacement as default
      if (card.isDefault) {
        cardsRepo.setDefault(replacementCardId, card.eventId);
      }

      // Archive this card now that active assignments = 0
      cardsRepo.archive(card.id, card.eventId);

      const targetCard = otherActiveCards.find((c) => c.id === replacementCardId);
      showToast(
        `Đã chuyển ${assignedCount} khách sang "${targetCard?.title || 'mẫu mới'}" và lưu trữ "${card.title}"!`,
        'success'
      );
      setShowReassignArchiveModal(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi chuyển khách và lưu trữ', 'error');
    }
  };

  return (
    <div
      className="panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: card.isDefault ? '2px solid var(--gold)' : '1px solid #eef0f3',
        position: 'relative',
        boxShadow: card.isDefault ? '0 6px 24px rgba(183, 151, 98, 0.15)' : undefined,
      }}
    >
      {/* Default Banner */}
      {card.isDefault && (
        <div
          style={{
            background: 'var(--gold)',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            textAlign: 'center',
            padding: '3px 0',
          }}
        >
          ★ MẪU THIỆP MẶC ĐỊNH
        </div>
      )}

      {/* Card Header & Preview */}
      <div
        style={{
          background:
            card.templateKey === 'rose'
              ? 'linear-gradient(135deg, #fff1ef, #fed7aa)'
              : card.templateKey === 'night'
              ? 'linear-gradient(135deg, #1e293b, #0f172a)'
              : card.templateKey === 'modern'
              ? 'linear-gradient(135deg, #0f172a, #0284c7)'
              : 'linear-gradient(135deg, #fdfbf7, #f5ebd9)',
          color: card.templateKey === 'night' || card.templateKey === 'modern' ? '#ffffff' : 'var(--ink)',
          padding: '24px 20px',
          minHeight: '140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.85,
            }}
          >
            Template: {card.templateKey}
          </span>
          <span className={statusInfo.tagClass}>{statusInfo.label}</span>
        </div>

        <div>
          <h4
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontWeight: 600,
              margin: '8px 0 4px',
              letterSpacing: '-0.3px',
            }}
          >
            {card.title}
          </h4>
          <span style={{ fontSize: '12px', opacity: 0.85 }}>
            {card.audienceLabel ? `Dành cho: ${card.audienceLabel}` : 'Mẫu thiệp chung'}
          </span>
        </div>
      </div>

      {/* Card Body & Assigned Guest Stats */}
      <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
          <span style={{ color: '#64748b' }}>Khách mời được gán:</span>
          <strong style={{ color: 'var(--ink)' }}>{assignedCount} khách</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8' }}>
          <span>Phiên bản: rev.{card.revision}</span>
          <span>{card.publishedConfig ? 'Đã công bố' : 'Bản nháp'}</span>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            marginTop: 'auto',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Primary Action Buttons: Edit & Preview */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              href={`/dashboard/events/${card.eventId}/cards/${card.id}/editor`}
              className="btn sm dark"
              style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
            >
              ✏️ Chỉnh sửa
            </Link>

            <Link
              href={`/dashboard/events/${card.eventId}/cards/${card.id}/preview`}
              className="btn sm"
              style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
            >
              👁 Xem trước
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {!card.isDefault && card.status !== 'ARCHIVED' && (
              <button
                type="button"
                className="btn sm"
                style={{ flex: 1 }}
                onClick={handleSetDefault}
                title="Đặt mẫu này làm mặc định cho khách mới"
              >
                ★ Đặt mặc định
              </button>
            )}

            {card.status === 'DRAFT' && (
              <button
                type="button"
                className="btn sm gold"
                style={{ flex: 1 }}
                onClick={handlePublish}
                title="Xuất bản để khách mời có thể xem mẫu thiệp này"
              >
                Công bố thiệp
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn sm"
              style={{ flex: 1 }}
              onClick={() => setShowDuplicateConfirm(true)}
            >
              Nhân bản
            </button>

            {onDuplicateToOtherEvent && (
              <button
                type="button"
                className="btn sm"
                style={{ flex: 1 }}
                onClick={() => onDuplicateToOtherEvent(card)}
              >
                Sao chép sang Event khác
              </button>
            )}

            {card.status !== 'ARCHIVED' && (
              <button
                type="button"
                className="btn sm red"
                onClick={handleArchiveClick}
                title="Lưu trữ mẫu thiệp khi không còn sử dụng"
              >
                Lưu trữ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Preview Modal */}
      {showPreviewModal && event && (
        <div
          className="modal-layer"
          onClick={() => setShowPreviewModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Xem nhanh: {card.title}</h3>
                <small style={{ color: '#64748b' }}>
                  {card.publishedConfig ? 'Bản công bố (Published)' : 'Bản nháp (Draft)'}
                </small>
              </div>
              <button type="button" className="round-btn" onClick={() => setShowPreviewModal(false)}>
                ✕
              </button>
            </div>

            <div className="full-invite" style={{ transform: 'none', padding: '10px', margin: '0 0 16px' }}>
              <InvitationCard card={card} event={event} mode="HOST_PREVIEW" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <Link
                href={`/dashboard/events/${card.eventId}/cards/${card.id}/preview`}
                className="btn sm gold"
              >
                Mở xem trước đầy đủ ↗
              </Link>
              <button type="button" className="btn sm" onClick={() => setShowPreviewModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate in same event confirmation */}
      <ConfirmationDialog
        isOpen={showDuplicateConfirm}
        title="Nhân bản mẫu thiệp trong cùng sự kiện"
        description={`Bạn có muốn tạo một bản sao mới của "${card.title}" trong sự kiện này không? Bản sao sẽ có ID mới và bắt đầu ở trạng thái Bản nháp (DRAFT).`}
        confirmText="Xác nhận nhân bản"
        onConfirm={handleDuplicateSameEvent}
        onCancel={() => setShowDuplicateConfirm(false)}
      />

      {/* Archive blocked alert dialog (when no alternative cards exist) */}
      <ConfirmationDialog
        isOpen={showArchiveAlert}
        title="Không thể lưu trữ mẫu thiệp"
        description={`Mẫu thiệp này đang được gán cho ${assignedCount} khách mời và sự kiện hiện không có mẫu thiệp thay thế nào khác. Vui lòng tạo một mẫu thiệp mới hoặc chuyển khách mời trước khi lưu trữ.`}
        confirmText="Đã hiểu"
        cancelText="Đóng"
        variant="primary"
        onConfirm={() => setShowArchiveAlert(false)}
        onCancel={() => setShowArchiveAlert(false)}
      />

      {/* Bulk Reassign & Archive Modal (Rule BR-07 / BR-21) */}
      {showReassignArchiveModal && (
        <div
          className="modal-layer"
          onClick={() => setShowReassignArchiveModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '95%' }}
          >
            <h3 style={{ margin: '0 0 8px', color: 'var(--navy)' }}>
              Chuyển khách mời &amp; Lưu trữ mẫu thiệp
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              Mẫu thiệp <strong>&quot;{card.title}&quot;</strong> hiện đang được gán cho{' '}
              <strong style={{ color: 'var(--navy)' }}>{assignedCount} khách mời</strong>.
              Theo quy tắc nghiệp vụ, bạn cần chọn một mẫu thiệp thay thế trong cùng sự kiện để chuyển toàn bộ khách mời trước khi lưu trữ.
            </p>

            <div className="form-block" style={{ marginBottom: '20px' }}>
              <label htmlFor="replacement-card-select">Chọn mẫu thiệp thay thế trong sự kiện:</label>
              <select
                id="replacement-card-select"
                value={replacementCardId}
                onChange={(e) => setReplacementCardId(e.target.value)}
                style={{ width: '100%', padding: '10px' }}
              >
                {otherActiveCards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.audienceLabel || 'Mẫu chung'}) {c.isDefault ? '★ Mặc định' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                background: '#f8fafc',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#475569',
                marginBottom: '20px',
                border: '1px solid #e2e8f0',
              }}
            >
              ℹ️ <strong>Lưu ý:</strong> Chuyển sang mẫu thiệp mới sẽ <em>giữ nguyên hoàn toàn</em> link mời, trạng thái RSVP và Check-in của toàn bộ khách mời.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setShowReassignArchiveModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn red"
                onClick={handleReassignAndArchive}
              >
                Chuyển khách &amp; Lưu trữ thiệp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive confirmation dialog for 0-assigned card */}
      <ConfirmationDialog
        isOpen={showArchiveConfirm}
        title="Xác nhận lưu trữ mẫu thiệp"
        description={`Bạn có chắc chắn muốn lưu trữ mẫu thiệp "${card.title}"? Mẫu thiệp này sẽ không còn hiển thị để gán cho khách mời mới.`}
        confirmText="Đồng ý lưu trữ"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleConfirmArchive}
        onCancel={() => setShowArchiveConfirm(false)}
      />
    </div>
  );
}
