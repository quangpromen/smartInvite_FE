'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { EventBreadcrumb } from '@/components/layout/EventBreadcrumb';
import { EventSwitcher } from '@/components/layout/EventSwitcher';
import { formatDateTime, formatEventStatus } from '@/lib/format-date';

export default function EventWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const { db } = useMockStore();

  const eventId = typeof params?.eventId === 'string' ? params.eventId : '';
  const event = db.events.find((e) => e.id === eventId);

  // If event not found, render safe not-found state without falling back to any other event!
  if (!event) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }} aria-hidden="true">
          ⚠️
        </div>
        <h2 style={{ font: '400 28px Georgia, serif', color: 'var(--navy)', margin: '0 0 10px' }}>
          Sự kiện không tồn tại
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '440px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          Mã sự kiện <code>&quot;{eventId}&quot;</code> không có trong hệ thống hoặc đã bị xóa. Vui lòng chọn một sự kiện hợp lệ từ danh sách.
        </p>
        <Link href="/dashboard/events" className="btn dark">
          Quay lại Danh sách sự kiện
        </Link>
      </div>
    );
  }

  const statusBadge = formatEventStatus(event.status);

  const tabs = [
    { label: 'Tổng quan', href: `/dashboard/events/${event.id}` },
    { label: 'Thiệp mời', href: `/dashboard/events/${event.id}/cards` },
    { label: 'Khách mời', href: `/dashboard/events/${event.id}/guests` },
    { label: 'RSVP', href: `/dashboard/events/${event.id}/rsvp` },
    { label: 'Check-in', href: `/dashboard/events/${event.id}/check-in` },
    { label: 'Báo cáo', href: `/dashboard/events/${event.id}/reports` },
    { label: 'Cài đặt', href: `/dashboard/events/${event.id}/settings` },
  ];

  return (
    <div>
      {/* Top Header & Breadcrumb & Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        <EventBreadcrumb
          items={[
            { label: 'Sự kiện', href: '/dashboard/events' },
            { label: event.title },
          ]}
        />
        <EventSwitcher currentEventId={event.id} />
      </div>

      {/* Event Header Banner */}
      <div
        className="panel"
        style={{
          padding: '24px 28px',
          marginBottom: '20px',
          background: 'linear-gradient(120deg, #182741, #253957 65%, #30445d)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '1.5px',
                color: 'var(--gold)',
                textTransform: 'uppercase',
              }}
            >
              {event.eventType}
            </span>
            <span className={statusBadge.tagClass} style={{ fontSize: '10px' }}>
              {statusBadge.label}
            </span>
          </div>

          <h1
            style={{
              font: '400 clamp(24px, 3vw, 34px) / 1.2 Georgia, serif',
              letterSpacing: '-0.5px',
              margin: '0 0 10px',
              color: '#ffffff',
            }}
          >
            {event.title}
          </h1>

          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#cbd5e1', flexWrap: 'wrap' }}>
            <span>🕒 {formatDateTime(event.startsAt)}</span>
            <span>📍 {event.locationName}</span>
            {event.rsvpDeadline && <span>⏳ Hạn RSVP: {formatDateTime(event.rsvpDeadline)}</span>}
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <nav
        aria-label="Các phân hệ sự kiện"
        style={{
          display: 'flex',
          gap: '6px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.href === `/dashboard/events/${event.id}`
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--navy)' : '#64748b',
                borderBottom: isActive ? '3px solid var(--navy)' : '3px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Tab Child Content */}
      {children}
    </div>
  );
}
