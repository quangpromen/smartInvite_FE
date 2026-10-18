'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { formatDateTime } from '@/lib/format-date';
import { EventBreadcrumb } from '@/components/layout/EventBreadcrumb';

export default function GlobalNewCardPage() {
  const router = useRouter();
  const { db } = useMockStore();

  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const selectedEvent = db.events.find((e) => e.id === selectedEventId);

  const handleProceed = () => {
    if (!selectedEventId) return;
    router.push(`/dashboard/events/${selectedEventId}/cards/new`);
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <EventBreadcrumb
          items={[
            { label: 'Mẫu thiệp', href: '/dashboard' },
            { label: 'Tạo thiệp mới (Chọn sự kiện)' },
          ]}
        />
      </div>

      <div className="page-heading">
        <div>
          <span className="eyebrow">QUY TẮC BẮT BUỘC</span>
          <h1>Chọn sự kiện để tạo thiệp</h1>
          <p>
            Mọi mẫu thiệp trong SmartInvite đều phải thuộc về một sự kiện cụ thể. Không thể tạo thiệp mồ côi hoặc không xác định sự kiện.
          </p>
        </div>
      </div>

      <div className="panel" style={{ padding: '28px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: 'var(--navy)' }}>
          Bước 1: Chọn sự kiện đích
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
          Vui lòng chọn sự kiện mà mẫu thiệp này sẽ phục vụ. Thông tin thời gian và địa điểm của sự kiện sẽ tự động liên kết với mẫu thiệp.
        </p>

        {/* Radio List of Events */}
        <div
          role="radiogroup"
          aria-label="Danh sách các sự kiện hiện có"
          style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}
        >
          {db.events.map((ev) => {
            const isSelected = selectedEventId === ev.id;
            const cardCount = db.cardDesigns.filter((c) => c.eventId === ev.id).length;

            return (
              <label
                key={ev.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '16px 18px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid var(--navy)' : '1px solid #e2e8f0',
                  background: isSelected ? '#f8fafc' : '#ffffff',
                  boxShadow: isSelected ? '0 0 0 3px rgba(24, 38, 63, 0.08)' : undefined,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="global-event-selection"
                  value={ev.id}
                  checked={isSelected}
                  onChange={() => setSelectedEventId(ev.id)}
                  style={{ marginTop: '3px', width: '18px', height: '18px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <strong style={{ fontSize: '15px', color: 'var(--navy)' }}>{ev.title}</strong>
                    <span className="tag gray" style={{ fontSize: '10px' }}>
                      {cardCount} mẫu thiệp
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    🕒 {formatDateTime(ev.startsAt)} • 📍 {ev.locationName}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Helper to create new event */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '10px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#475569' }}>
            Bạn muốn tạo thiệp cho một sự kiện hoàn toàn mới?
          </div>
          <Link href="/dashboard/events/new" className="btn sm">
            + Tạo sự kiện mới
          </Link>
        </div>

        {/* Action Button: Disabled until event is selected, dynamic text */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
          <button type="button" className="btn" onClick={() => router.push('/dashboard')}>
            Quay lại Dashboard
          </button>
          <button
            type="button"
            disabled={!selectedEventId}
            className="btn dark"
            style={{ fontWeight: 700, padding: '10px 20px' }}
            onClick={handleProceed}
          >
            {selectedEvent
              ? `Xác nhận tạo thiệp cho "${selectedEvent.title}" →`
              : 'Chọn sự kiện để tiếp tục'}
          </button>
        </div>
      </div>
    </div>
  );
}
