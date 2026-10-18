'use client';

import React, { useState } from 'react';
import type { CardDesign } from '@/features/cards/types';

interface CardAssignmentSelectorProps {
  currentCardId: string | null;
  availableCards: CardDesign[];
  guestName: string;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (cardId: string | null) => void;
}

export function CardAssignmentSelector({
  currentCardId,
  availableCards,
  guestName,
  isOpen,
  onClose,
  onAssign,
}: CardAssignmentSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(currentCardId);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onAssign(selectedId);
    onClose();
  };

  return (
    <div className="modal-layer" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="assign-modal-title">
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <h3 id="assign-modal-title">Gán mẫu thiệp cho khách</h3>
        <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748b' }}>
          Chọn mẫu thiệp mời hiển thị cho khách <strong>{guestName}</strong>. Chỉ hiển thị các mẫu thiệp thuộc cùng sự kiện.
        </p>

        <div style={{ display: 'grid', gap: '8px', maxHeight: '280px', overflowY: 'auto', marginBottom: '16px' }}>
          {/* Option: Unassigned */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: selectedId === null ? '2px solid #6366f1' : '1px solid #e2e8f0',
              background: selectedId === null ? '#f5f3ff' : '#ffffff',
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="card-assign"
              checked={selectedId === null}
              onChange={() => setSelectedId(null)}
            />
            <div>
              <strong style={{ fontSize: '13px', display: 'block', color: '#475569' }}>
                Chưa gán mẫu thiệp
              </strong>
              <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                Khách sẽ không thể xem nội dung thiệp mời cho đến khi được gán.
              </small>
            </div>
          </label>

          {/* Cards belonging to same event */}
          {availableCards.map((card) => {
            const isSelected = selectedId === card.id;
            return (
              <label
                key={card.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  background: isSelected ? '#f5f3ff' : '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="card-assign"
                  checked={isSelected}
                  onChange={() => setSelectedId(card.id)}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '13px', color: '#1e293b' }}>{card.title}</strong>
                    {card.isDefault && <span className="tag" style={{ fontSize: '9px' }}>Mặc định</span>}
                    {card.status === 'DRAFT' && <span className="tag pending" style={{ fontSize: '9px' }}>Bản nháp</span>}
                  </div>
                  <small style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>
                    Đối tượng: {card.audienceLabel || 'Chung'} • Chủ đề: {card.templateKey}
                  </small>
                </div>
              </label>
            );
          })}
        </div>

        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '11.5px',
            color: '#64748b',
            lineHeight: 1.5,
            marginBottom: '16px',
          }}
        >
          💡 <strong>Quy tắc nghiệp vụ:</strong> Chuyển mẫu thiệp không làm thay đổi đường dẫn mời, phản hồi RSVP hoặc dữ liệu check-in đã ghi nhận.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" className="btn sm" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn sm dark" onClick={handleConfirm}>
            Xác nhận gán thiệp
          </button>
        </div>
      </div>
    </div>
  );
}
