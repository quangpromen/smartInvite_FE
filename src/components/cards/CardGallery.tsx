'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { CardDesign } from '@/features/cards/types';
import { useMockStore } from '@/mocks/mock-store';
import { CardTile } from './CardTile';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

interface CardGalleryProps {
  eventId: string;
}

export function CardGallery({ eventId }: CardGalleryProps) {
  const { db, cardsRepo, showToast } = useMockStore();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [duplicateTargetCard, setDuplicateTargetCard] = useState<CardDesign | null>(null);
  const [selectedTargetEventId, setSelectedTargetEventId] = useState<string>('');

  // Scoped strictly to this event!
  const eventCards = useMemo(() => {
    return db.cardDesigns.filter((c) => c.eventId === eventId);
  }, [db.cardDesigns, eventId]);

  const filteredCards = useMemo(() => {
    if (statusFilter === 'ALL') return eventCards;
    return eventCards.filter((c) => c.status === statusFilter);
  }, [eventCards, statusFilter]);

  const otherEvents = useMemo(() => {
    return db.events.filter((e) => e.id !== eventId);
  }, [db.events, eventId]);

  const handleDuplicateToOtherEventConfirm = () => {
    if (!duplicateTargetCard || !selectedTargetEventId) return;

    try {
      const targetEvent = db.events.find((e) => e.id === selectedTargetEventId);
      const copy = cardsRepo.duplicate(
        duplicateTargetCard.id,
        duplicateTargetCard.eventId,
        selectedTargetEventId
      );
      showToast(
        `Đã sao chép "${duplicateTargetCard.title}" sang sự kiện "${targetEvent?.title || selectedTargetEventId}" (Mã mới: ${copy.id})`,
        'success'
      );
      setDuplicateTargetCard(null);
      setSelectedTargetEventId('');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi sao chép sang sự kiện khác', 'error');
    }
  };

  return (
    <div>
      {/* Gallery Filter & Top Bar */}
      <div
        className="panel"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label htmlFor="card-status-filter" style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
            Lọc theo trạng thái:
          </label>
          <select
            id="card-status-filter"
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="ALL">Tất cả ({eventCards.length})</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </select>
        </div>

        <Link href={`/dashboard/events/${eventId}/cards/new`} className="btn dark">
          <span>➕</span>
          <span>Tạo mẫu thiệp mới</span>
        </Link>
      </div>

      {/* Cards Grid or Empty State */}
      {filteredCards.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredCards.map((card) => (
            <CardTile
              key={card.id}
              card={card}
              onDuplicateToOtherEvent={otherEvents.length > 0 ? (c) => setDuplicateTargetCard(c) : undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="✉️"
          title={statusFilter !== 'ALL' ? 'Không có mẫu thiệp trong mục này' : 'Sự kiện chưa có mẫu thiệp nào'}
          description={
            statusFilter !== 'ALL'
              ? 'Hãy chọn bộ lọc khác để xem các mẫu thiệp có sẵn.'
              : 'Một sự kiện có thể có nhiều mẫu thiệp riêng cho từng đối tượng (Gia đình, Bạn bè, Thầy cô).'
          }
          actionText={statusFilter !== 'ALL' ? 'Xem tất cả mẫu thiệp' : 'Tạo mẫu thiệp đầu tiên'}
          actionHref={statusFilter !== 'ALL' ? undefined : `/dashboard/events/${eventId}/cards/new`}
          onActionClick={statusFilter !== 'ALL' ? () => setStatusFilter('ALL') : undefined}
        />
      )}

      {/* Modal: Duplicate to other event */}
      {duplicateTargetCard && (
        <div className="modal-layer" role="presentation">
          <div className="modal" role="dialog" aria-modal="true">
            <h3 style={{ margin: '0 0 10px', fontSize: '20px' }}>
              Sao chép thiệp sang sự kiện khác
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
              Bạn đang sao chép mẫu <strong>&quot;{duplicateTargetCard.title}&quot;</strong>. Thao tác này sẽ tạo một bản ghi thiệp độc lập mới thuộc sự kiện đích và giữ nguyên mẫu thiệp hiện tại.
            </p>

            <div className="form-block" style={{ marginBottom: '20px' }}>
              <label htmlFor="target-event-select">Chọn sự kiện đích tiếp nhận:</label>
              <select
                id="target-event-select"
                className="select"
                value={selectedTargetEventId}
                onChange={(e) => setSelectedTargetEventId(e.target.value)}
              >
                <option value="">-- Chọn sự kiện đích --</option>
                {otherEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.eventType})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setDuplicateTargetCard(null);
                  setSelectedTargetEventId('');
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={!selectedTargetEventId}
                className="btn dark"
                onClick={handleDuplicateToOtherEventConfirm}
              >
                Xác nhận sao chép
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
