'use client';

import React from 'react';
import Link from 'next/link';
import type { Event } from '@/features/events/types';
import { formatDateTime, formatEventStatus } from '@/lib/format-date';
import { useMockStore } from '@/mocks/mock-store';
import { selectEventStats } from '@/features/stats/selectors';

export function EventCard({ event }: { event: Event }) {
  const { db } = useMockStore();

  const eventCards = db.cardDesigns.filter((c) => c.eventId === event.id);
  const stats = selectEventStats(
    event.id,
    db.guests,
    db.invitations,
    db.rsvpResponses,
    db.checkIns
  );
  const statusBadge = formatEventStatus(event.status);

  return (
    <div
      className="panel"
      style={{
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {event.eventType}
          </span>
          <h3 style={{ margin: '4px 0 6px', fontSize: '18px', fontWeight: 700, color: 'var(--navy)' }}>
            <Link href={`/dashboard/events/${event.id}`} style={{ color: 'inherit' }}>
              {event.title}
            </Link>
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span>🕒 {formatDateTime(event.startsAt)}</span>
            <span>📍 {event.locationName}</span>
          </p>
        </div>
        <span className={statusBadge.tagClass}>{statusBadge.label}</span>
      </div>

      {event.description && (
        <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {event.description}
        </p>
      )}

      {/* Metrics Row */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#64748b' }}>
          <span>
            <strong style={{ color: 'var(--ink)' }}>{eventCards.length}</strong> mẫu thiệp
          </span>
          <span>
            <strong style={{ color: 'var(--ink)' }}>{stats.guestCount}</strong> khách
          </span>
          <span>
            <strong style={{ color: '#16a34a' }}>{stats.yesCount}</strong> đồng ý
          </span>
          <span>
            <strong style={{ color: '#b45309' }}>{stats.pendingCount}</strong> chờ phản hồi
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/dashboard/events/${event.id}/cards`} className="btn sm">
            Mẫu thiệp
          </Link>
          <Link href={`/dashboard/events/${event.id}`} className="btn sm dark">
            Vào sự kiện →
          </Link>
        </div>
      </div>
    </div>
  );
}
