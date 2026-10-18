'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMockStore } from '@/mocks/mock-store';
import { formatDateTime } from '@/lib/format-date';

interface EventSelectDialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  onConfirm: (selectedEventId: string) => void;
  onCancel: () => void;
}

export function EventSelectDialog({
  isOpen,
  title = 'Chọn sự kiện cho mẫu thiệp',
  description = 'Mỗi mẫu thiệp bắt buộc phải thuộc về một sự kiện cụ thể và không thể chuyển đổi sau khi tạo.',
  onConfirm,
  onCancel,
}: EventSelectDialogProps) {
  const { db } = useMockStore();
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedEventId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedEvent = db.events.find((e) => e.id === selectedEventId);

  const handleConfirm = () => {
    if (!selectedEventId) return;
    onConfirm(selectedEventId);
  };

  return (
    <div
      className="modal-layer"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-select-title"
        style={{ width: 'min(540px, 100%)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px' }}>📅</span>
          <h3 id="event-select-title" style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
            {title}
          </h3>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
          {description}
        </p>

        {/* Blocking Radio List of Events */}
        <div
          role="radiogroup"
          aria-label="Danh sách sự kiện"
          style={{
            display: 'grid',
            gap: '10px',
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '4px',
            marginBottom: '16px',
          }}
        >
          {db.events.map((ev) => {
            const isSelected = selectedEventId === ev.id;
            return (
              <label
                key={ev.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid var(--navy)' : '1px solid #e2e8f0',
                  background: isSelected ? '#f8fafc' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="event-choice"
                  value={ev.id}
                  checked={isSelected}
                  onChange={() => setSelectedEventId(ev.id)}
                  style={{ marginTop: '3px', width: '16px', height: '16px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy)' }}>
                    {ev.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    🕒 {formatDateTime(ev.startsAt)} • 📍 {ev.locationName}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Link to create new event first */}
        <div style={{ marginBottom: '20px', fontSize: '12px', color: '#64748b' }}>
          Không thấy sự kiện bạn muốn?{' '}
          <Link
            href="/dashboard/events/new"
            onClick={onCancel}
            style={{ color: 'var(--violet)', fontWeight: 700, textDecoration: 'underline' }}
          >
            + Tạo sự kiện mới ngay
          </Link>
        </div>

        {/* Action Buttons with Dynamic Explicit Confirmation */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <button type="button" onClick={onCancel} className="btn">
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={!selectedEventId}
            onClick={handleConfirm}
            className="btn dark"
            style={{ fontWeight: 700 }}
          >
            {selectedEvent
              ? `Xác nhận tạo thiệp cho "${selectedEvent.title}" →`
              : 'Vui lòng chọn một sự kiện để tiếp tục'}
          </button>
        </div>
      </div>
    </div>
  );
}
