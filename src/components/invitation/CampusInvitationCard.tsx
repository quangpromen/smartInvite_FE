'use client';

import React, { useState } from 'react';
import type { CardConfig } from '@/features/cards/types';
import type { Event } from '@/features/events/types';
import { formatDateOnly, formatTimeOnly } from '@/lib/format-date';
import './campus-card.css';

export const CAMPUS_DEFAULTS = {
  brandLabel: 'ĐẠI HỌC FPT',
  kicker: 'TRÂN TRỌNG KÍNH MỜI',
  mapLabel: 'Xem chỉ đường',
  rsvpHeading: 'BẠN SẼ THAM DỰ CHỨ?',
  rsvpYesLabel: 'Tôi sẽ tham dự',
  rsvpNoLabel: 'Rất tiếc, tôi không thể',
  closingLine: 'Hẹn gặp bạn tại ngày đặc biệt này.',
  heroImageUrl: '/assets/campus/fpt-campus-hero.jpg',
  heroImageAlt: 'Toàn cảnh khuôn viên trường lúc hoàng hôn',
} as const;

export interface CampusRsvpControl {
  status?: 'YES' | 'NO' | null;
  disabled?: boolean;
  disabledReason?: string;
  /** When omitted (editor / host preview) buttons only toggle a local demo state. */
  onSelect?: (status: 'YES' | 'NO') => void;
}

interface CampusInvitationCardProps {
  config: CardConfig;
  event: Event;
  /** Final recipient line, e.g. "Kính gửi Bạn Minh Anh" (derived from Guest). */
  recipientLabel?: string | null;
  personalMessage?: string;
  accentColor?: string;
  rsvp?: CampusRsvpControl;
  className?: string;
}

const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

function formatCompactDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return formatDateOnly(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${WEEKDAYS[d.getDay()]} • ${dd}.${mm}.${d.getFullYear()}`;
}

/** Splits the headline so `headlineAccent` (e.g. "2026") can be highlighted. */
function renderHeadline(headline: string, accent?: string) {
  if (!accent) return headline;
  const idx = headline.lastIndexOf(accent);
  if (idx < 0) return headline;
  return (
    <>
      {headline.slice(0, idx)}
      <span className="cc-accent">{accent}</span>
      {headline.slice(idx + accent.length)}
    </>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="6" width="24" height="22" rx="4" />
      <path d="M4 13h24M10 3v6M22 3v6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" aria-hidden="true">
      <path d="M16 2a9.5 9.5 0 0 0-9.5 9.5C6.5 19 16 30 16 30s9.5-11 9.5-18.5A9.5 9.5 0 0 0 16 2Zm0 13a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9l8-3 8 3 8-3v17l-8 3-8-3-8 3Z" />
      <path d="M12 6v17M20 9v17" />
    </svg>
  );
}

/** Decorative crop from the approved FPT invitation art direction. */
function CampusFooterArtwork() {
  return (
    <div className="cc-campus-footer-art" aria-hidden="true" />
  );
}

export function CampusInvitationCard({
  config,
  event,
  recipientLabel,
  personalMessage,
  accentColor,
  rsvp,
  className = '',
}: CampusInvitationCardProps) {
  const [localStatus, setLocalStatus] = useState<'YES' | 'NO' | null>(null);

  const brand = config.brandLabel ?? CAMPUS_DEFAULTS.brandLabel;
  const kicker = config.kicker ?? CAMPUS_DEFAULTS.kicker;
  const heroUrl = config.heroImageUrl || CAMPUS_DEFAULTS.heroImageUrl;
  const heroAlt = config.heroImageAlt ?? CAMPUS_DEFAULTS.heroImageAlt;
  const mapLabel = config.mapLabel ?? CAMPUS_DEFAULTS.mapLabel;
  const rsvpHeading = config.rsvpHeading ?? CAMPUS_DEFAULTS.rsvpHeading;
  const yesLabel = config.rsvpYesLabel ?? CAMPUS_DEFAULTS.rsvpYesLabel;
  const noLabel = config.rsvpNoLabel ?? CAMPUS_DEFAULTS.rsvpNoLabel;
  const closing = config.closingLine ?? CAMPUS_DEFAULTS.closingLine;

  const interactive = !!rsvp?.onSelect;
  const status = interactive ? rsvp?.status ?? null : localStatus;
  const disabled = !!rsvp?.disabled;

  const select = (s: 'YES' | 'NO') => {
    if (disabled) return;
    if (rsvp?.onSelect) rsvp.onSelect(s);
    else setLocalStatus(s);
  };

  const style = accentColor ? ({ '--cc-accent': accentColor } as React.CSSProperties) : undefined;

  return (
    <article className={`cc-card ${className}`} style={style} aria-label={config.headline}>
      <header className="cc-hero">
        {/* Real campus asset, cropped by CSS — never the whole mockup. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cc-hero-img" src={heroUrl} alt={heroAlt} loading="eager" decoding="async" />
        <div className="cc-hero-fade" aria-hidden="true" />
        <p className="cc-brand">
          <span>{brand}</span>
        </p>
      </header>

      <div className="cc-body">
        <div className="cc-step cc-step-left" aria-hidden="true" />
        <div className="cc-step cc-step-right" aria-hidden="true" />

        <p className="cc-kicker">
          <span>{kicker}</span>
        </p>

        <div className="cc-ceremony-heading">
          <span className="cc-edition" aria-hidden="true">COMMENCEMENT • 2026</span>
          <h2 className="cc-title">
            <span className="cc-title-main">{renderHeadline(config.headline, config.headlineAccent)}</span>
            {config.subHeadline && <span className="cc-title-name">{config.subHeadline}</span>}
          </h2>
        </div>

        <hr className="cc-rule" />

        <section className="cc-greeting" aria-label="Lời chào">
          {recipientLabel && <p className="cc-recipient">{recipientLabel}</p>}
          <p className="cc-copy">{config.invitationCopy}</p>
          {personalMessage && <blockquote className="cc-personal">&ldquo;{personalMessage}&rdquo;</blockquote>}
        </section>

        <dl className="cc-info">
          <div className="cc-info-item">
            <dt className="sr-only">Thời gian</dt>
            <CalendarIcon />
            <dd>
              {formatCompactDate(event.startsAt)} • {formatTimeOnly(event.startsAt)}
            </dd>
          </div>
          <div className="cc-info-item">
            <dt className="sr-only">Địa điểm</dt>
            <PinIcon />
            <dd>
              <strong>{event.locationName}</strong>
              {event.locationAddress && <small>{event.locationAddress}</small>}
            </dd>
          </div>
        </dl>

        {event.mapUrl ? (
          <a className="cc-map" href={event.mapUrl} target="_blank" rel="noopener noreferrer">
            <MapIcon />
            <span>{mapLabel}</span>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </a>
        ) : null}

        <section className="cc-rsvp" aria-labelledby="cc-rsvp-heading">
          <h3 id="cc-rsvp-heading" className="cc-rsvp-title">
            <span>{rsvpHeading}</span>
          </h3>
          <div className="cc-rsvp-actions" role="group" aria-label={rsvpHeading}>
            <button
              type="button"
              className="cc-btn cc-btn-yes"
              aria-pressed={status === 'YES'}
              disabled={disabled}
              onClick={() => select('YES')}
            >
              {status === 'YES' ? '✓ ' : ''}
              {yesLabel}
            </button>
            <button
              type="button"
              className="cc-btn cc-btn-no"
              aria-pressed={status === 'NO'}
              disabled={disabled}
              onClick={() => select('NO')}
            >
              {noLabel}
            </button>
          </div>
          <p className="cc-rsvp-note" role="status">
            {disabled && rsvp?.disabledReason
              ? rsvp.disabledReason
              : status === 'YES'
              ? 'Cảm ơn bạn! Đã ghi nhận bạn sẽ tham dự.'
              : status === 'NO'
              ? 'Đã ghi nhận phản hồi. Rất tiếc không thể đón tiếp bạn.'
              : closing}
          </p>
          {!interactive && <p className="cc-demo-hint">Xem trước — nút RSVP chỉ hoạt động trên trang khách.</p>}
        </section>

        <div className="cc-closing">
          <span aria-hidden="true" />
          <p className="cc-signature">{config.signature}</p>
          <span aria-hidden="true" />
        </div>
        <CampusFooterArtwork />
      </div>
    </article>
  );
}
