'use client';

import React from 'react';

interface InvitationEnvelopeProps {
  recipientName: string;
  salutation?: string;
  eventTitle?: string;
  onOpen: () => void;
}

export function InvitationEnvelope({
  recipientName,
  salutation,
  eventTitle,
  onOpen,
}: InvitationEnvelopeProps) {
  const displayName = salutation ? `${salutation} ${recipientName}` : recipientName;

  return (
    <div className="envelope-stage">
      <div className="envelope-intro">
        <span className="goldline">
          Một lời mời đặc biệt dành cho {displayName}
        </span>
        <h1>You&apos;ve Got An Invitation</h1>
        <p>
          {eventTitle ? `Nhân dịp ${eventTitle}` : 'Một cột mốc đáng nhớ sắp đến.'}
          <br />
          Hãy chạm để mở phong bì và khám phá thông điệp nhé!
        </p>
      </div>

      <button
        type="button"
        className="envelope"
        onClick={onOpen}
        aria-label={`Mở phong bì thiệp mời dành cho ${displayName}`}
      >
        <span className="wax" aria-hidden="true">
          S
        </span>
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          className="btn gold"
          onClick={onOpen}
          style={{ minWidth: '220px', padding: '12px 24px', fontSize: '13px' }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          Chạm để mở thiệp &rarr;
        </button>
        <span className="hint">Made with love &amp; gratitude</span>
      </div>
    </div>
  );
}
