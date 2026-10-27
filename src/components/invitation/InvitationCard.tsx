'use client';

import React from 'react';
import type { CardDesign, CardConfig } from '@/features/cards/types';
import type { Event } from '@/features/events/types';
import type { EventGuest, GuestPersonalization } from '@/features/guests/types';
import { formatDateOnly, formatTimeOnly } from '@/lib/format-date';
import { CampusInvitationCard, type CampusRsvpControl } from './CampusInvitationCard';
export type CardRenderMode = 'PUBLIC_GUEST' | 'HOST_PREVIEW' | 'EDITOR_PREVIEW';

export interface InvitationCardProps {
  card: CardDesign;
  event: Event;
  mode: CardRenderMode;
  guest?: EventGuest;
  guestPersonalization?: GuestPersonalization;
  guestFullName?: string;
  className?: string;
  /** Campus theme: live RSVP wiring (public guest page). */
  rsvp?: CampusRsvpControl;
}

export function InvitationCard({
  card,
  event,
  mode,
  guest,
  guestPersonalization,
  guestFullName,
  className = '',
  rsvp,
}: InvitationCardProps) {
  const activePersonalization = guestPersonalization || guest?.personalization;
  const activeFullName = guestFullName || guest?.fullName;
  // 1. Determine active config according to mode
  let config: CardConfig | null = null;
  if (mode === 'PUBLIC_GUEST') {
    config = card.publishedConfig;
  } else if (mode === 'EDITOR_PREVIEW') {
    config = card.draftConfig;
  } else {
    // HOST_PREVIEW defaults to publishedConfig, falls back to draftConfig
    config = card.publishedConfig || card.draftConfig;
  }

  if (!config) {
    return (
      <div
        className="panel"
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: '#64748b',
          border: '1px dashed #cbd5e1',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
          Thiệp chưa có cấu hình công bố hợp lệ.
        </p>
        <small style={{ color: '#94a3b8' }}>
          {mode === 'PUBLIC_GUEST'
            ? 'Bản nháp chưa được chủ sự kiện xuất bản.'
            : 'Vui lòng chỉnh sửa và xuất bản thiệp.'}
        </small>
      </div>
    );
  }

  // 2. Personalization whitelist resolution
  const salutation = activePersonalization?.salutation;
  const greeting = activePersonalization?.greeting;
  const personalMessage = activePersonalization?.personalMessage;
  const customAccent = activePersonalization?.accentColor;

  const recipientLabel = greeting
    ? activeFullName
      ? `${greeting} ${salutation ? `${salutation} ` : ''}${activeFullName}`
      : greeting
    : activeFullName
    ? salutation
      ? `Kính gửi ${salutation} ${activeFullName}`
      : `Thân gửi ${activeFullName}`
    : null;

  if (config.theme === 'campus') {
    const campusRecipient =
      greeting ||
      (activeFullName
        ? `Kính gửi ${salutation ? `${salutation} ` : ''}${activeFullName}`
        : null);
    return (
      <CampusInvitationCard
        config={config}
        event={event}
        recipientLabel={campusRecipient}
        personalMessage={personalMessage}
        accentColor={customAccent}
        rsvp={rsvp}
        className={className}
      />
    );
  }

  const dateStr = formatDateOnly(event.startsAt);
  const timeStr = formatTimeOnly(event.startsAt);

  const themeClass =
    config.theme === 'rose'
      ? 'rose'
      : config.theme === 'night'
      ? 'night'
      : config.theme === 'modern'
      ? 'modern'
      : config.theme === 'minimal'
      ? 'minimal'
      : '';

  const dynamicStyles: React.CSSProperties = {
    ...(customAccent ? ({ '--highlight': customAccent } as React.CSSProperties) : {}),
  };

  return (
    <div className={`card-art ${themeClass} ${className}`} style={dynamicStyles}>
      <div className="card-border">
        {/* Top Kicker */}
        <div>
          <div className="card-kicker">YOU ARE WARMLY INVITED TO</div>

          {/* Optional Graduation Cap Icon */}
          {config.showCapArt !== false && (
            <svg
              className="cap"
              viewBox="0 0 120 85"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              aria-hidden="true"
            >
              <path d="M10 33 60 11l50 22-50 22-50-22Z" />
              <path d="M31 44v20c15 12 43 12 58 0V44M109 34v26" />
              <path d="M109 60c-8 5-3 13 0 15 3-2 8-10 0-15Z" />
            </svg>
          )}

          <div className="divider-art">✧</div>
        </div>

        {/* Content Area */}
        <div style={{ margin: 'auto 0' }}>
          <h2>{config.headline || event.title}</h2>

          {/* Personalized Salutation / Greeting */}
          {recipientLabel && (
            <div className="personal-greeting">
              ✦ {recipientLabel} ✦
            </div>
          )}

          {config.subHeadline && (
            <p className="graduate" style={{ margin: '6px 0 14px' }}>
              {config.subHeadline}
            </p>
          )}

          <p className="quote">{config.invitationCopy}</p>

          {/* Optional Guest Personal Message Box */}
          {personalMessage && (
            <div className="personal-message-box">
              &ldquo;{personalMessage}&rdquo;
            </div>
          )}

          <div className="divider-art">✦</div>

          {/* Canonical Event Information — ALWAYS FROM EVENT */}
          <div className="card-details">
            <div>
              <strong>{dateStr}</strong> • <strong>{timeStr}</strong>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--fg)', marginTop: '2px' }}>
              {event.locationName}
            </div>
            {event.locationAddress && (
              <small style={{ display: 'block', color: 'inherit', opacity: 0.8, fontSize: '11px' }}>
                {event.locationAddress}
              </small>
            )}
          </div>
        </div>

        {/* Bottom Signature */}
        <div>
          <p className="card-sign">{config.signature || 'With love & gratitude'}</p>
        </div>
      </div>
    </div>
  );
}
