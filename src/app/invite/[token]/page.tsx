'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { InvitationEnvelope } from '@/components/invitation/InvitationEnvelope';
import { InvitationCard } from '@/components/invitation/InvitationCard';
import { RsvpForm } from '@/components/invitation/RsvpForm';
import { InvitationState } from '@/components/invitation/InvitationState';
import { formatDateOnly, formatTimeOnly } from '@/lib/format-date';
import type { AttendanceMode } from '@/features/invitations/types';

export default function GuestInvitationPage() {
  const params = useParams();
  const tokenParam = typeof params?.token === 'string' ? params.token : '';

  const { db, invitationsRepo, showToast } = useMockStore();
  const [isOpened, setIsOpened] = useState(false);

  // 1. Resolve invitation dynamically from shared store whenever db or token changes
  const resolution = useMemo(() => {
    return invitationsRepo.resolveByToken(tokenParam);
  }, [invitationsRepo, tokenParam, db]);

  // 2. Handle failure states strictly according to domain invariants
  if (!resolution.success) {
    return (
      <InvitationState
        reason={resolution.reason}
        message={resolution.message}
      />
    );
  }

  const { guest, event, card, invitation, rsvp, checkIn, isDeadlinePassed } = resolution;

  if (!guest || !event || !card || !invitation) {
    return <InvitationState reason="ERROR" message="Không thể tải đầy đủ thông tin thư mời." />;
  }

  // Handle RSVP Submission
  const handleRsvpSubmit = (input: {
    status: 'YES' | 'NO';
    plusOnes: number;
    attendanceMode?: AttendanceMode;
  }) => {
    try {
      invitationsRepo.upsertRsvp(tokenParam, input);
      showToast(
        input.status === 'YES'
          ? 'Đã ghi nhận phản hồi tham gia sự kiện (Demo)'
          : 'Đã ghi nhận phản hồi từ chối tham gia (Demo)',
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi phản hồi';
      showToast(msg, 'error');
    }
  };

  const recipientDisplayName = guest.personalization.salutation
    ? `${guest.personalization.salutation} ${guest.fullName}`
    : guest.fullName;

  const isCampus = card.publishedConfig?.theme === 'campus';
  const isEventClosed = event.status === 'CANCELLED' || event.status === 'FINISHED';
  const campusRsvpDisabledReason = isDeadlinePassed
    ? 'Đã quá hạn xác nhận tham dự.'
    : isEventClosed
    ? 'Sự kiện đã đóng phản hồi.'
    : checkIn && rsvp?.status === 'YES'
    ? 'Bạn đã check-in nên không thể đổi phản hồi.'
    : undefined;

  const handleCampusSelect = (status: 'YES' | 'NO') => {
    if (campusRsvpDisabledReason) return;
    handleRsvpSubmit({
      status,
      plusOnes: status === 'YES' ? rsvp?.plusOnes ?? 0 : 0,
      attendanceMode: event.attendanceOptionsEnabled ? rsvp?.attendanceMode ?? 'BOTH' : undefined,
    });
  };

  // 3. Stage 1: Envelope presentation
  if (!isOpened) {
    return (
      <div className="invite-view">
        <header className="invite-nav">
          <div className="invite-brand">
            Smart<span>Invite.</span>
          </div>
          <span className="tag" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
            Thư mời điện tử chính thức
          </span>
        </header>

        <InvitationEnvelope
          recipientName={guest.fullName}
          salutation={guest.personalization.salutation}
          eventTitle={event.title}
          onOpen={() => setIsOpened(true)}
        />

        <footer className="invite-footer">
          SmartInvite • Nền tảng thiệp mời cá nhân hóa &amp; Quản trị sự kiện
        </footer>
      </div>
    );
  }

  // 4. Stage 2: Opened personalized invitation
  const eventDateStr = formatDateOnly(event.startsAt);
  const eventTimeStr = formatTimeOnly(event.startsAt);

  return (
    <div className="invite-view">
      <header className="invite-nav">
        <div className="invite-brand">
          Smart<span>Invite.</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn sm"
            onClick={() => setIsOpened(false)}
            title="Đóng thiệp và quay lại phong bì"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Đóng phong bì
          </button>
        </div>
      </header>

      <main className="invite-layout">
        {/* Left Column: Greeting, Event canonical story, Meta details */}
        <section className="invite-copy">
          <span className="goldline">Thư mời trân trọng • {event.title}</span>

          <h1>
            Kính gửi <em>{recipientDisplayName}</em>
          </h1>

          <p className="lead">
            {guest.personalization.greeting ? (
              <strong>{guest.personalization.greeting}. </strong>
            ) : null}
            {card.publishedConfig?.invitationCopy || event.description}
          </p>

          {guest.personalization.personalMessage && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                borderLeft: '4px solid var(--gold)',
                padding: '12px 16px',
                borderRadius: '0 8px 8px 0',
                marginBottom: '24px',
                fontStyle: 'italic',
                color: '#334155',
                fontSize: '13.5px',
                lineHeight: 1.7,
              }}
            >
              &ldquo;{guest.personalization.personalMessage}&rdquo;
            </div>
          )}

          {/* Canonical Event Metadata */}
          <div className="invite-meta">
            <div className="invite-meta-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b18f61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <div>
                <strong>Thời gian diễn ra:</strong>
                <span>
                  {eventDateStr} • {eventTimeStr} ({event.timezone})
                </span>
                {event.endsAt && (
                  <small style={{ display: 'block', color: '#64748b' }}>
                    Dự kiến kết thúc lúc {formatTimeOnly(event.endsAt)}
                  </small>
                )}
              </div>
            </div>

            <div className="invite-meta-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b18f61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <strong>Địa điểm:</strong>
                <span>{event.locationName}</span>
                {event.locationAddress && (
                  <small style={{ display: 'block', color: '#64748b' }}>
                    {event.locationAddress}
                  </small>
                )}
                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#4f46e5',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      marginTop: '4px',
                      textDecoration: 'underline',
                    }}
                  >
                    Xem bản đồ chỉ đường &rarr;
                  </a>
                )}
              </div>
            </div>

            {event.rsvpDeadline && (
              <div className="invite-meta-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b18f61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div>
                  <strong>Hạn chót xác nhận tham dự:</strong>
                  <span>{formatDateOnly(event.rsvpDeadline)} • {formatTimeOnly(event.rsvpDeadline)}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Full Invitation Card & RSVP Form */}
        <section>
          <div className="full-invite">
            <InvitationCard
              card={card}
              event={event}
              mode="PUBLIC_GUEST"
              guestPersonalization={guest.personalization}
              guestFullName={guest.fullName}
              rsvp={
                isCampus
                  ? {
                      status: rsvp?.status === 'YES' || rsvp?.status === 'NO' ? rsvp.status : null,
                      disabled: !!campusRsvpDisabledReason,
                      disabledReason: campusRsvpDisabledReason,
                      onSelect: handleCampusSelect,
                    }
                  : undefined
              }
            />
          </div>

          {/* Interactive RSVP Mock Form (campus theme embeds RSVP in card; form only shows QR pass after YES) */}
          {(!isCampus || rsvp?.status === 'YES') && (
            <RsvpForm
              key={isCampus ? `${rsvp?.status ?? 'none'}` : 'rsvp'}
              guest={guest}
              event={event}
              invitationId={invitation.id}
              token={tokenParam}
              existingRsvp={rsvp}
              checkIn={checkIn}
              isDeadlinePassed={isDeadlinePassed}
              onSubmitRsvp={handleRsvpSubmit}
            />
          )}
        </section>
      </main>

      <footer className="invite-footer">
        Thư mời được phát hành qua nền tảng SmartInvite • Không hiển thị thông tin quản trị viên
      </footer>
    </div>
  );
}
