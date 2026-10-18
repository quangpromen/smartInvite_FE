'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { InvitationCard } from '@/components/invitation/InvitationCard';
import { formatDateTime, formatCardStatus } from '@/lib/format-date';

export default function CardPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { db } = useMockStore();

  const eventId = typeof params?.eventId === 'string' ? params.eventId : '';
  const cardId = typeof params?.cardId === 'string' ? params.cardId : '';

  const event = db.events.find((e) => e.id === eventId);
  const card = db.cardDesigns.find((c) => c.id === cardId && c.eventId === eventId);

  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('mobile');
  const [versionView, setVersionView] = useState<'published' | 'draft'>('published');
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');

  if (!event || !card) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--navy)' }}>Mẫu thiệp không tồn tại</h2>
        <Link href={`/dashboard/events/${eventId}/cards`} className="btn dark">
          Quay lại danh sách thiệp
        </Link>
      </div>
    );
  }

  const eventGuests = db.guests.filter((g) => g.eventId === event.id);
  const selectedGuest = eventGuests.find((g) => g.id === selectedGuestId);

  // Pick config based on versionView toggle
  const activeConfig =
    versionView === 'draft' || !card.publishedConfig ? card.draftConfig : card.publishedConfig;

  const previewCard = {
    ...card,
    publishedConfig: activeConfig,
    draftConfig: activeConfig,
  };

  const statusBadge = formatCardStatus(card.status);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="eyebrow" style={{ margin: 0 }}>XEM TRƯỚC MẪU THIỆP (HOST PREVIEW)</span>
            <span className={statusBadge.tagClass}>{statusBadge.label}</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', color: 'var(--navy)' }}>{card.title}</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Thuộc sự kiện: <strong>{event.title}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href={`/dashboard/events/${event.id}/cards/${card.id}/editor`}
            className="btn gold"
          >
            ✏️ Mở trình chỉnh sửa
          </Link>
          <Link
            href={`/dashboard/events/${event.id}/cards`}
            className="btn"
          >
            Quay lại danh sách thiệp
          </Link>
        </div>
      </div>

      {/* Control Bar: Device Switcher, Version Switcher, Persona Switcher */}
      <div
        className="panel"
        style={{
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Device Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Khung nhìn:</span>
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
            <button
              type="button"
              onClick={() => setDeviceView('mobile')}
              style={{
                border: 'none',
                background: deviceView === 'mobile' ? '#ffffff' : 'transparent',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: deviceView === 'mobile' ? 700 : 500,
                cursor: 'pointer',
                color: deviceView === 'mobile' ? 'var(--navy)' : '#64748b',
                boxShadow: deviceView === 'mobile' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              📱 Di động (390px)
            </button>
            <button
              type="button"
              onClick={() => setDeviceView('desktop')}
              style={{
                border: 'none',
                background: deviceView === 'desktop' ? '#ffffff' : 'transparent',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: deviceView === 'desktop' ? 700 : 500,
                cursor: 'pointer',
                color: deviceView === 'desktop' ? 'var(--navy)' : '#64748b',
                boxShadow: deviceView === 'desktop' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              💻 Máy tính (Desktop)
            </button>
          </div>
        </div>

        {/* Version Switcher: Published vs Draft */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Phiên bản:</span>
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
            <button
              type="button"
              onClick={() => setVersionView('published')}
              disabled={!card.publishedConfig}
              style={{
                border: 'none',
                background: versionView === 'published' ? '#ffffff' : 'transparent',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: versionView === 'published' ? 700 : 500,
                cursor: card.publishedConfig ? 'pointer' : 'not-allowed',
                opacity: card.publishedConfig ? 1 : 0.5,
                color: versionView === 'published' ? 'var(--navy)' : '#64748b',
                boxShadow: versionView === 'published' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Đã xuất bản (Published)
            </button>
            <button
              type="button"
              onClick={() => setVersionView('draft')}
              style={{
                border: 'none',
                background: versionView === 'draft' ? '#ffffff' : 'transparent',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: versionView === 'draft' ? 700 : 500,
                cursor: 'pointer',
                color: versionView === 'draft' ? 'var(--navy)' : '#64748b',
                boxShadow: versionView === 'draft' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Bản nháp (Draft)
            </button>
          </div>
        </div>

        {/* Persona Switcher: Preview as guest */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="preview-guest-dropdown" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
            Mô phỏng khách mời:
          </label>
          <select
            id="preview-guest-dropdown"
            value={selectedGuestId}
            onChange={(e) => setSelectedGuestId(e.target.value)}
            style={{ fontSize: '12px', padding: '5px 10px' }}
          >
            <option value="">(Bản gốc của mẫu)</option>
            {eventGuests.map((g) => (
              <option key={g.id} value={g.id}>
                {g.fullName} ({g.groupName || 'Khách mời'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Preview Frame */}
      <div
        style={{
          background: '#dbe1e8',
          padding: '40px 20px',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '600px',
        }}
      >
        <div
          style={{
            width: deviceView === 'mobile' ? '390px' : '100%',
            maxWidth: deviceView === 'mobile' ? '390px' : '560px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            borderRadius: '18px',
            overflow: 'hidden',
            transition: 'all 0.25s ease',
          }}
        >
          <InvitationCard
            card={previewCard}
            event={event}
            guest={selectedGuest}
            mode="HOST_PREVIEW"
          />
        </div>

        {selectedGuest && (
          <div
            style={{
              marginTop: '16px',
              padding: '8px 18px',
              background: '#ffffff',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'var(--navy)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            }}
          >
            Đang hiển thị cá nhân hóa cho khách: <strong>{selectedGuest.fullName}</strong>
            {selectedGuest.personalization.greeting && (
              <span> &quot;{selectedGuest.personalization.greeting}&quot;</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
