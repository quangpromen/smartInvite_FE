'use client';

import React, { useState } from 'react';
import type { CardDesign } from '@/features/cards/types';
import type { Event } from '@/features/events/types';
import type { EventGuest } from '@/features/guests/types';
import { InvitationCard, type CardRenderMode } from './InvitationCard';

interface PersonalizedCardPreviewProps {
  card: CardDesign;
  event: Event;
  guest?: EventGuest;
  mode?: CardRenderMode;
  allowToggleBase?: boolean;
}

export function PersonalizedCardPreview({
  card,
  event,
  guest,
  mode = 'HOST_PREVIEW',
  allowToggleBase = true,
}: PersonalizedCardPreviewProps) {
  const [viewType, setViewType] = useState<'personalized' | 'base'>('personalized');

  const showPersonalized = viewType === 'personalized' && !!guest;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {allowToggleBase && guest && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '6px 10px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
            Chế độ xem trước:
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className={`btn sm ${viewType === 'personalized' ? 'dark' : ''}`}
              onClick={() => setViewType('personalized')}
              style={{ fontSize: '11px', padding: '5px 10px' }}
            >
              Xem như khách: {guest.fullName}
            </button>
            <button
              type="button"
              className={`btn sm ${viewType === 'base' ? 'dark' : ''}`}
              onClick={() => setViewType('base')}
              style={{ fontSize: '11px', padding: '5px 10px' }}
            >
              Thiệp gốc của mẫu
            </button>
          </div>
        </div>
      )}

      <div className="full-invite">
        <InvitationCard
          card={card}
          event={event}
          mode={mode}
          guestPersonalization={showPersonalized ? guest?.personalization : undefined}
          guestFullName={showPersonalized ? guest?.fullName : undefined}
        />
      </div>
    </div>
  );
}
