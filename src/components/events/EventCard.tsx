'use client';

import React from 'react';
import Link from 'next/link';
import type { Event } from '@/features/events/types';
import { formatEventStatus, formatEventType, formatEventDateRange } from '@/lib/format-date';
import { useMockStore } from '@/mocks/mock-store';
import { selectEventStats } from '@/features/stats/selectors';
import {
  CalendarIcon,
  MapPinIcon,
  CardsIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';

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
  const categoryLabel = formatEventType(event.eventType).toUpperCase();
  const dateFormatted = formatEventDateRange(event.startsAt, event.endsAt);

  return (
    <article className="event-card" aria-labelledby={`event-title-${event.id}`}>
      {/* Top Header: Category & Status Badge */}
      <div className="event-card-top">
        <div className="event-card-category-group">
          <span className="event-category-badge">{categoryLabel}</span>
        </div>

        <span className={`event-status-pill ${statusBadge.tagClass}`}>
          <span className="status-dot" aria-hidden="true" />
          <span>{statusBadge.label}</span>
        </span>
      </div>

      {/* Main Content: Title, Date, Location, Description */}
      <div className="event-card-body">
        <h3 id={`event-title-${event.id}`} className="event-card-title">
          <Link
            href={`/dashboard/events/${event.id}`}
            className="event-card-title-link"
            title={`Xem chi tiết sự kiện: ${event.title}`}
          >
            {event.title}
          </Link>
        </h3>

        {/* Metadata list */}
        <div className="event-card-meta-list">
          <div className="event-meta-item" title={`Thời gian: ${dateFormatted}`}>
            <span className="event-meta-icon" aria-hidden="true">
              <CalendarIcon size={15} />
            </span>
            <span className="event-meta-text">{dateFormatted}</span>
          </div>

          <div
            className="event-meta-item"
            title={`Địa điểm: ${event.locationName}${event.locationAddress ? ` • ${event.locationAddress}` : ''}`}
          >
            <span className="event-meta-icon" aria-hidden="true">
              <MapPinIcon size={15} />
            </span>
            <span className="event-meta-text event-meta-location">
              {event.locationName}
            </span>
          </div>
        </div>

        {/* Short Description */}
        {event.description && (
          <p className="event-card-desc" title={event.description}>
            {event.description}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="event-card-divider" aria-hidden="true" />

      {/* Bottom Footer: Metrics Row & Action Buttons */}
      <div className="event-card-footer">
        {/* Aggregate Metrics */}
        <div className="event-card-stats" aria-label="Thống kê sự kiện">
          <div className="event-stat-chip" title="Số mẫu thiệp trong sự kiện">
            <span className="stat-chip-icon" aria-hidden="true">
              <CardsIcon size={14} />
            </span>
            <span className="stat-chip-content">
              <strong>{eventCards.length}</strong> mẫu thiệp
            </span>
          </div>

          <div className="event-stat-chip" title="Tổng số khách mời">
            <span className="stat-chip-icon" aria-hidden="true">
              <UsersIcon size={14} />
            </span>
            <span className="stat-chip-content">
              <strong>{stats.guestCount}</strong> khách
            </span>
          </div>

          <div className="event-stat-chip success" title="Số khách đã xác nhận tham gia">
            <span className="stat-chip-icon" aria-hidden="true">
              <CheckCircleIcon size={14} />
            </span>
            <span className="stat-chip-content">
              <strong>{stats.yesCount}</strong> đồng ý
            </span>
          </div>

          <div className="event-stat-chip warning" title="Số khách chưa phản hồi">
            <span className="stat-chip-icon" aria-hidden="true">
              <ClockIcon size={14} />
            </span>
            <span className="stat-chip-content">
              <strong>{stats.pendingCount}</strong> chờ phản hồi
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="event-card-actions">
          <Link
            href={`/dashboard/events/${event.id}/cards`}
            className="btn event-btn-secondary"
            aria-label={`Quản lý mẫu thiệp cho sự kiện ${event.title}`}
          >
            <span>Mẫu thiệp</span>
          </Link>
          <Link
            href={`/dashboard/events/${event.id}`}
            className="btn dark event-btn-primary"
            aria-label={`Vào không gian làm việc của sự kiện ${event.title}`}
          >
            <span>Vào sự kiện</span>
            <ArrowRightIcon size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
